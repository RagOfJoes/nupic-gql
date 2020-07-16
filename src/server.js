// DEVELOPMENT ONLY
process.env.NODE_ENV !== 'production' && require('dotenv/config');

import http from 'http';
import initAuth from './oidc';
import express from 'express';
import modules from 'graphql/modules';
import loaders from 'graphql/dataloader';
import cookieParser from 'cookie-parser';
import redisConnect from 'lib/redisConnect';
import mongoConnect from 'lib/mongoConnect';
import { ApolloServer } from 'apollo-server-express';

(async () => {
	// Connect to redis
	const redis = await redisConnect();
	const redisCache = redis.cache;

	// Connect to db
	const db = process.env.MONGO_URI;
	await mongoConnect(db);

	/**
	 * initilize Express and apply any required packages
	 */
	const app = express();
	app.use(cookieParser());

	// Initialize OIDC Client handlers
	const authClient = initAuth({
		issuer: process.env.ISSUER,
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		redisCache,
	});

	/**
	 * Checks header for access token
	 */
	app.use('/graphql', async (req, res, next) => await authClient.checkToken(req, res, next));

	const server = new ApolloServer({
		debug: false,
		tracing: false,
		modules: modules,
		cache: redisCache,
		plugins: [
			() => ({
				requestDidStart(requestContext) {
					const start = Date.now();
					let op;

					return {
						didResolveOperation(context) {
							op = context.operationName;
						},
						willSendResponse(context) {
							const stop = Date.now();
							const elapsed = stop - start;
							const size = JSON.stringify(context.response).length * 2;
							console.log(`Operation ${op} completed in ${elapsed} ms and returned ${size} bytes`);
						},
					};
				},
			}),
		],
		playground: process.env.NODE_ENV === 'development',
		introspection: process.env.NODE_ENV === 'development',
		cacheControl: { defaultMaxAge: 60 * 2 }, // 1hr max age for cache,
		// tracing: process.env.NODE_ENV === 'development', // Disable for prod as this is very resource intensive
		// Pass context
		context: ({ req, res, connection }) => ({
			req,
			res,
			loaders,
			redisCache,
			connection,
		}),
	});

	/**
	 * Connect ApolloServer to existing Express Server
	 */
	server.applyMiddleware({ app, path: '/graphql' });

	const httpServer = http.createServer(app);

	const PORT = process.env.PORT;

	httpServer.listen({ port: PORT }, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`));
})().catch(function (e) {
	console.error(e);
	process.exitCode = 1;
});
