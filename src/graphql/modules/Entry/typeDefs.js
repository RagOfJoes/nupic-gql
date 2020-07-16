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

	input EntryInput {
		mood: MOODS!
		title: String!
		images: [ImageInput]
		description: String
		location: LocationInput

		date: Date!
	}

	extend type Query {
		getEntryDetail(id: ObjectId!): Entry
		getEntries(month: Int!, year: Int!): EntryConnection!
	}

	extend type Mutation {
		createEntry(entry: EntryInput!): Entry!
	}
`;
