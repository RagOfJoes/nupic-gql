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

	enum MONTHS {
		JAN
		FEB
		MAR
		APR
		MAY
		JUN
		JUL
		AUG
		SEP
		OCT
		NOV
		DEC
	}

	# File Types
	type Image {
		url: String!
		name: String!
	}

	type Location {
		main: String!
		secondary: String

		placeId: ID!
		latitude: Float!
		longitude: Float!
	}

	type MetaDate {
		creation: Date!
		lastUpdate: Date
	}

	input CursorSortInput {
		name: SORT_ORDER

		creation: SORT_ORDER
	}

	type PageInfo {
		cursor: ID!
		hasNextPage: Boolean!
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
