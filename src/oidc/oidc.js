import handlers from 'oidc/handlers';
import getClient from 'oidc/lib/getClient';

export default (settings) => {
	/**
	 * Ensure that the necessary setting values are set
	 */
	if (!settings.issuer) throw new Error('A valid Issuer must be provided');

	if (!settings.clientId) throw new Error('A valid Client ID must be provided');

	if (!settings.clientSecret) throw new Error('A valid Client Secret must be provided');

	if (!settings.redisCache) throw new Error('A valid redis client must be provided');

	const client = getClient(settings);
	const cache = settings.redisCache;

	return {
		checkToken: handlers.CheckToken(client, cache),
	};
};
