import DataLoader from 'dataloader';
import UserModel from 'db/models/User';

/**
 * Batch lookup
 * @param {Array} ids
 */
const batchUsers = async (ids) => {
	const users = await UserModel.find({ sub: { $in: ids } }).lean();

	const mapUsers = {};
	users.map((user) => {
		const { sub } = user;

		if (mapUsers[sub]) return;

		mapUsers[sub] = user;
	});

	return ids.map((id) => mapUsers[id]);
};

export default () => new DataLoader(batchUsers);
