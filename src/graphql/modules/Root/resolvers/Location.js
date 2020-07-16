export default {
	latitude: async (parent, _, {}) => {
		if (parent && parent.latitude) return Number(parent.latitude);

		return null;
	},
	longitude: async (parent, _, {}) => {
		if (parent && parent.longitude) return Number(parent.longitude);

		return null;
	},
};
