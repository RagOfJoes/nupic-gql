import { Kind } from 'graphql/language';
import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
	name: 'Date',

	description: 'Date fields to JS Date Object',

	parseValue(value) {
		return new Date(value);
	},

	serialize(value) {
		return value;
	},

	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return new Date(ast.value);
		}
		return null;
	},
});
