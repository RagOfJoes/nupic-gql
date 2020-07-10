import mongoose from 'mongoose';

/**
 * Requires String Mongo DB URI
 */
export default async (db) => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB Successfully Connected');
	} catch (e) {
		console.log('Mongo Connection Error: ', e);
	}
	mongoose.Promise = global.Promise;
};
