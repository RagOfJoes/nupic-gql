// import UserModel from '../../../../db/User';
import UserModel from 'db/models/User';
import authenticated from 'graphql/authResolvers';

export default {
	me: authenticated(async (_, __, { req }) => {
		const findMe = await UserModel.findOne({ sub: req.user.sub });

		return findMe;
	}),
};
