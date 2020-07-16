import { getCursor, getDecoded, parseSortKey } from './helpers';

/**
 * Cursor paginate data
 * @param {Function} aggregate Aggregate Function to run. Params passed: match, sortKey, sortOrder, limitQuery
 * @param {Number} limit Limit the number of results returned
 * @param {String} cursor Cursor to mark where previous Query left off
 * @param {Array} filters (Optional) Filters
 * @param {Object} sort (Optional) Sort Key/Value Pair
 * @param {Object} initMatch (Optional) Initial Match ie. { $eq: user._id }
 * @param {Function} customParseSortKeys (Optional) Custom Sort Key Parser
 */
const cursorPagination = async (
	aggregate,

	limit,
	cursor,
	filters = [],
	sort = { creation: 'DESC' },

	// Custom Params
	initMatch = {},
	customParseSortKeys
) => {
	if (!limit || limit < 0) throw new Error('Invalid Limit Provided!');
	if (typeof aggregate !== 'function') throw new Error('Aggregate Function must be provided!');

	try {
		const sortKey =
			typeof customParseSortKeys === 'function'
				? customParseSortKeys(Object.keys(sort)[0])
				: parseSortKey(Object.keys(sort)[0]);

		let sortOrder = Object.values(sort)[0];
		if (sortOrder !== 'ASC' && sortOrder !== 'DESC') sortOrder = 'DESC';

		// Decode encoded Cursor
		const decoded = getDecoded(cursor, sortKey);
		const op = sortOrder === 'ASC' ? '$gt' : '$lt';
		const cursorQuery = { [op]: decoded };
		const limitQuery = limit + 1;

		let match = initMatch;

		// Create a Query for the Filters provided
		if (filters && filters.length > 0) match = filterMatch(match, filters);

		// If Cursor is provided then add to match
		if (cursor) match = { [sortKey]: cursorQuery, ...match };

		// Run Query
		const agg = await aggregate(match, sortKey, sortOrder, limitQuery);
		if (!agg) throw new Error('Something went wrong when running Aggregate Query Provided!');

		// Create an Array from Agg result
		const arr = Array.from(agg);

		// Determine if we have a next page
		const hasNextPage = arr.length > limit;
		if (hasNextPage) arr.pop();

		// Create Payload
		const newCursor = getCursor(arr, sortKey);
		const newPageInfo = { hasNextPage, cursor: newCursor };
		const payload = {
			edges: arr || [],
			pageInfo: newPageInfo,
		};
		return payload;
	} catch (e) {
		throw new Error(e);
	}
};

export default cursorPagination;
