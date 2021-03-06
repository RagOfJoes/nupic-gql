import UserModel from 'db/models/User';
import authenticated from 'graphql/authResolvers';

export default {
	logout: async (_, __, { req, redisCache }) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			await redisCache.delete(`accessToken:${token}:user`);
		} catch {}
		return true;
	},
	editProfile: authenticated(async (_, { profile }, { req }) => {
		try {
			const findUser = await UserModel.findOne({ sub: req.user.sub }).lean();

			if (!findUser) {
				return await new UserModel({ ...req.user, ...profile }).save();
			}

			await UserModel.updateOne({ sub: req.user.sub }, profile);

			return findUser;
		} catch (e) {
			// throw new InvalidUsernameError('Invalid Username!');
			throw new Error('Invalid Username');
		}
	}),
};
