import moment from 'moment';
import mongoose from 'mongoose';
import UserModel from 'db/models/User';
import isObjectId from 'lib/isObjectId';
import { MIN_YEAR } from 'lib/constants';
import EntryModel from 'db/models/Entry';
import authenticated from 'graphql/authResolvers';
import cursorPagination from 'lib/cursorPagination';
import InvalidEntry from 'graphql/errors/InvalidEntry';

export default {
	Entry: {
		id: async (parent) => {
			if (isObjectId(parent)) return parent;

			return parent.id || parent._id;
		},
		createdBy: async ({ createdBy }, _, { req, loaders: { UserLoader } }) => {
			try {
				const loadUser = await UserLoader.load(createdBy);

				return loadUser;
			} catch {}

			const findUser = await UserModel.findOne({ sub: createdBy });

			if (findUser) return findUser;

			const newUser = await new UserModel(req.user).save();
			return newUser;
		},
		location: {
			latitude: async (parent, _, {}) => {
				console.log(parent);
				if (parent && parent.latitude) return Number(parent.latitude);

				return null;
			},
			longitude: async (parent, _, {}) => {
				if (parent && parent.longitude) return Number(parent.longitude);

				return null;
			},
		},
	},
	Query: {
		getEntryDetail: async (_, { id }, { req }) => {
			try {
				return await EntryModel.findById(mongoose.Types.ObjectId(id));
			} catch (e) {
				console.log(e);
			}
		},
		getEntries: async (_, { month, year }, { req }) => {
			const currentDate = moment();

			if (month < 1 || month > 12) throw new InvalidEntry('Invalid Month Input Provided!');

			if (year < MIN_YEAR || year > currentDate.year()) {
				throw new InvalidEntry('Year must be between 1970 and ' + currentDate.year());
			}

			if (year > currentDate.year() && month > currentDate.month()) {
				throw new InvalidEntry("You cannot create an Entry that's in the future!");
			}

			try {
				const _month = moment(`${month}/${year}`, 'M/YYYY');

				const aggregateFn = async (match, sortKey, sortOrder, limitQuery) => {
					return EntryModel.aggregate()
						.match(match)
						.sort({ [sortKey]: sortOrder })
						.limit(limitQuery);
				};

				const entries = await cursorPagination(
					aggregateFn,
					_month.daysInMonth(),
					null,
					[],
					{ 'date.creation': 'ASC' },
					{
						'date.creation': { $gte: _month.startOf('month').toDate(), $lte: _month.endOf('month').toDate() },
					}
				);

				if (!entries) return { edges: [], pageInfo: { cursor: '', hasNextPage: false } };

				return entries;
			} catch (e) {
				console.log(e);
			}

			throw new InvalidEntry('Oops! Something went wrong! Please try again later.');
		},
	},
	Mutation: {
		createEntry: async (_, { entry }, { req }) => {
			const currentDate = moment();
			const validDate = moment(entry.date);

			if (validDate.year() < MIN_YEAR || validDate.year() > currentDate.year()) {
				throw new InvalidEntry('Year must be between 1970 and ' + currentDate.year());
			}

			if (validDate.isAfter(currentDate)) throw new InvalidEntry("You cannot create an Entry that's in the future!");

			// Make sure that the entry is unique in DAY for User
			const hasEntry = await EntryModel.findOne({
				createdBy: mongoose.Types.ObjectId('5ec087424105a008645be1cb'),
				'date.creation': { $eq: validDate.startOf('day') },
			});
			if (hasEntry) throw new InvalidEntry('Entry on that date already exists!');

			try {
				const newEntry = new EntryModel({
					...entry,
					'date.creation': validDate.startOf('day'),
					createdBy: mongoose.Types.ObjectId('5ec087424105a008645be1cb'),
				});
				await newEntry.save();

				return newEntry;
			} catch (e) {
				throw new InvalidEntry('Oops! Something went wrong when saving new Entry! Please try again later.');
			}
		},
	},
};
