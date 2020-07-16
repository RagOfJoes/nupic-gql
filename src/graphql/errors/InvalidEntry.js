import { ApolloError } from 'apollo-server-express';

class InvalidEntryError extends ApolloError {
	constructor(message) {
		super(message, 'INVALID_ENTRY');

		Object.defineProperty(this, 'name', { value: 'InvalidEntryError' });
	}
}

export default InvalidEntryError;
