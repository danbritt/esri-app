module.exports = {
	// comma separated list of referer URL's. Only requests from these urls will be proxied
	allowedReferers: '*',
	// When true, only sites matching serverUrls will be proxied
	mustMatch: true,
	// Log file
	// TODO: Not implemented
	logFile: '',
	serverUrls: [
		{
			url: '',
			// When true, if request begins with url string it is forwarded
			// false means it must match exactly
			matchAll: true,
			// un/pw to use when requesting a token - if needed for arcGIS Sever token based authentication
			username: null,
			password: null,
			// Used with clientSecret for OAuth to obtain a token - if needed for OAuth 2.0 authentication
			clientId: '',
			// Used with clientId
			clientSecret: '',
			// Default endpoint is http://arcgis.com/sharing/oauth2 (or https://www.arcgis.com/sharing/rest/oauth2/token/  ...?)
			oauth2Endpoint: '',
			// Max # of requests from a particular referer over rateLimitPeriod
			rateLimit: null,
			// Time period in minutes within which the specified number of requests will be tracked
			rateLimitPeriod: null,
			// The url to use instead of the "alias" one provided in the 'url' property and that should be redirected
			rateLimitRedirect: null,
			// The access token used for requests. Will be added by the proxy
			accessToken: null
		}
	]
};
