import { RedisCache } from 'apollo-server-cache-redis';

export default async () => {
	const cache = new RedisCache({
		port: process.env.REDIS_PORT,
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PW,
		enableReadyCheck: true,
	});

	cache.client.on('ready', function () {
		console.log('Redis ready!');
	});

	return { cache };
};
