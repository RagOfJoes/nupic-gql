/**
 * Check if a string is a valid ObjectId
 * @param {String} str String to check if ObjectId
 */
export default (str) => {
	try {
		const objectidPattern = /^[0-9a-fA-F]{24}$/;
		return objectidPattern.test(str);
	} catch (e) {}
	return false;
};
