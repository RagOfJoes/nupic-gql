import mongoose from 'mongoose';

/**
 *
 * @param {String} str String to encode
 * @param {('ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'binary'|'hex')} encoding
 */
export const encode = (str, encoding) => Buffer.from(str, encoding || 'utf8').toString('base64');

/**
 *
 * @param {String} str String to decode
 * @param {('ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'binary'|'hex')} encoding
 */
export const decode = (str, encoding) => Buffer.from(str, 'base64').toString(encoding || 'utf8');

/**
 * Retrieve Object Value from a "." seperated String
 * @param {String} path Example: "date.creation"
 * @param {Object} obj Source Object
 */
export const objKeyFromString = (path, obj) => {
	return path.split('.').reduce(function (prev, curr) {
		return prev ? prev[curr] : null;
	}, obj);
};

/**
 * Decode base64 encoded cursor
 * @param {String} toDecode
 * @param {String} sortKey
 */
export const getDecoded = (toDecode, sortKey) => {
	if (!toDecode || typeof toDecode !== 'string') return new Date();

	if (sortKey === 'date.creation' || sortKey === 'date.lastUpdate') return new Date(decode(toDecode));

	return decode(toDecode);
};

/**
 * Encode value to base64
 * @param {Array} arr
 * @param {String} sortKey
 */
export const getCursor = (arr, sortKey) => {
	const parsed = parseSortKey(sortKey);
	const d = objKeyFromString(parsed, arr[arr.length - 1]);
	try {
		if (parsed === 'date.creation') {
			return encode(new Date(d).toJSON());
		}
	} catch (e) {}
	return encode(d || '');
};

/**
 * Default Sort Key Parser
 * @param {String} key
 */
export const parseSortKey = (key) => {
	switch (key) {
		case 'title':
		case 'slug':
			return 'slug';
		case 'creation':
			return 'date.' + key;
		case 'lastUpdate':
			return 'date.' + key;
		default:
			return 'date.creation';
	}
};

/**
 * Create an aggregate pipeline based on filters
 * selected
 * @param {Object} match
 * @param {Array} filters
 */
export const filterMatch = (match, filters) => {
	let clone = match;
	filters.forEach((filter) => {
		const filterKey = Object.keys(filter)[0];
		const filterQuery = Object.values(filter)[0];

		if (filterQuery.contains) clone = { $text: { $search: `"${filterQuery.contains}"` }, ...clone };
		// For Dates
		else if (filterQuery.after) {
			clone = { [parseSortKey(filterKey)]: { $gt: new Date(filterQuery.after) }, ...clone };
		} else if (filterQuery.before) {
			clone = { [parseSortKey(filterKey)]: { $lt: new Date(filterQuery.before) }, ...clone };
		} else if (filterQuery.equals) {
			clone = { [parseSortKey(filterKey)]: { $eq: new Date(filterQuery.before) }, ...clone };
		} else if (filterQuery.between) {
			const toDate = new Date(filterQuery.between[1]);
			const fromDate = new Date(filterQuery.between[0]);
			clone = {
				$and: [
					{ ...clone[[parseSortKey(filterKey)]] },
					{ [parseSortKey(filterKey)]: { $gte: fromDate } },
					{ [parseSortKey(filterKey)]: { $lte: toDate } },
				],
			};
		} else if (filterQuery.is) {
			clone = { [filterKey]: { $eq: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
		} else if (filterQuery.notIs) {
			clone = { [filterKey]: { $ne: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
		} else if (filterQuery.has) {
			const op = filterQuery.has.map((v) => ({ [filterKey]: { $eq: mongoose.Types.ObjectId(v) } }));
			if (!clone.$and) Object.assign(clone, { $and: [{ $or: op }] });
			else clone.$and.push({ $or: op });
		} else if (filterQuery.notHas) {
			const op = filterQuery.notHas.map((v) => ({ [filterKey]: { $ne: mongoose.Types.ObjectId(v) } }));
			if (!clone.$and) Object.assign(clone, { $and: [{ $or: op }] });
			else clone.$and.push({ $or: op });
		}
	});
	return clone;
};
