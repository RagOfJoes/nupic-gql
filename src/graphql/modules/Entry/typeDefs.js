import { gql } from 'apollo-server-express';

export default gql`
	type Entry {
		mood: MOODS!
		id: ObjectId!
		title: String!
		images: [Image]
		description: String

		date: MetaDate!
		createdBy: User!
		location: Location
	}

	type EntryConnection { # Cursor Pagination Payload
		edges: [Entry]
		pageInfo: PageInfo!
	}

	extend type Query {
		getEntryDetail(id: ObjectId!): Entry
		getEntries(month: MONTHS!, year: Int!): EntryConnection!
	}
`;
