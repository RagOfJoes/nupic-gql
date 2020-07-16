import { gql } from 'apollo-server-express';

export default gql`
	# Custom Scalars
	scalar RGB
	scalar Date
	scalar Email
	scalar ObjectId

	enum SORT_ORDER {
		ASC
		DESC
	}

	enum MOODS {
		VERY_GOOD
		GOOD
		WELL
		BAD
		VERY_BAD
	}

	# File Types
	type Image {
		url: String!
		name: String!
	}

	type Location {
		main: String
		secondary: String

		placeId: ID
		latitude: Float
		longitude: Float
	}

	type MetaDate {
		creation: Date!
		lastUpdate: Date
	}

	type PageInfo {
		cursor: ID!
		hasNextPage: Boolean!
	}

	input ImageInput {
		url: String!
		name: String!
	}

	input LocationInput {
		main: String!
		secondary: String

		placeId: ID!
		latitude: Float!
		longitude: Float!
	}

	# These are to be extended for further useage
	type Query {
		_: String
	}
	type Mutation {
		_: String
	}
	type Subscription {
		_: String
	}
`;
