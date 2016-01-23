var rewire = require("rewire");
var assert = require('chai').assert;
var sinon = require('sinon');
var request = require('request');
var EsriProxy = rewire('../staging/controllers/EsriProxy/EsriProxy.js');

describe('EsriProxy Controller', function() {
    describe('EsriProxy', function () {
        describe('#getRequestVars', function() {
            var config = null;
            beforeEach(function () {
                config = {
                	// comma separated list of referer URL's. Only requests from these urls will be proxied
                	allowedReferers: '*',
                	// When true, only sites matching serverUrls will be proxied
                	mustMatch: true,
                	// Log file
                	// TODO: Not implemented
                	// logFile: 'esriproxylog.txt',
                	serverUrls: [
                		{
                			url: 'http://serviceurl',
                			// When true, if request begins with url string it is forwarded
                			// false means it must match exactly
                			matchAll: true,
                			// un/pw to use when requesting a token - if needed for arcGIS Sever token based authentication
                			username: null,
                			password: null,
                			// Used with clientSecret for OAuth to obtain a token - if needed for OAuth 2.0 authentication
                			clientId: 'validclientid',
                			// Used with clientId
                			clientSecret: 'validclientsecret',
                			// Default endpoint is http://arcgis.com/sharing/oauth2
                			oauth2Endpoint: 'https://authurl',
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
            });
            afterEach(function () {
                config = null;
            });

            it('Generates hash from POST vars', function () {
                var req = {
                    method: 'POST',
                    url: '/?http://proxyurl',
                    body: {
                        test: 'testVal'
                    }
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);

                assert.equal(esriProxy.getRequestVars(), req.body);
            });

            it('Generates hash from GET query string', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl?test=testVal'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);

                assert.equal(esriProxy.getRequestVars().test, 'testVal');
            });

            it('Generates empty hash when there is no GET query string', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);

                assert.equal(Object.keys(esriProxy.getRequestVars()).length, 0);
            });
        });

        describe('#addAccessTokenToHash', function() {
            var config = null;
            beforeEach(function () {
                config = {
                	// comma separated list of referer URL's. Only requests from these urls will be proxied
                	allowedReferers: '*',
                	// When true, only sites matching serverUrls will be proxied
                	mustMatch: true,
                	// Log file
                	// TODO: Not implemented
                	// logFile: 'esriproxylog.txt',
                	serverUrls: [
                		{
                			url: 'http://serviceurl',
                			// When true, if request begins with url string it is forwarded
                			// false means it must match exactly
                			matchAll: true,
                			// un/pw to use when requesting a token - if needed for arcGIS Sever token based authentication
                			username: null,
                			password: null,
                			// Used with clientSecret for OAuth to obtain a token - if needed for OAuth 2.0 authentication
                			clientId: 'validclientid',
                			// Used with clientId
                			clientSecret: 'validclientsecret',
                			// Default endpoint is http://arcgis.com/sharing/oauth2
                			oauth2Endpoint: 'https://authurl',
                			// Max # of requests from a particular referer over rateLimitPeriod
                			rateLimit: null,
                			// Time period in minutes within which the specified number of requests will be tracked
                			rateLimitPeriod: null,
                			// The url to use instead of the "alias" one provided in the 'url' property and that should be redirected
                			rateLimitRedirect: null,
                            // The access token used for requests. Will be added by the proxy
                			accessToken: 'TESTTOKEN'
                		}
                	]
                };
            });
            afterEach(function () {
                config = null;
            });

            it('Adds token to request var when it exists in the serverURL entry', function () {
                var req = {
                    method: 'POST',
                    url: '/?http://proxyurl',
                    body: {
                        test: 'testVal'
                    }
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                esriProxy.addAccessTokenToHash();

                assert.equal(esriProxy.requestVarHash.token, 'TESTTOKEN');
            });

            it('Does not add token to request var hash when it does not exist in serverURL entry', function () {
                var req = {
                    method: 'POST',
                    url: '/?http://proxyurl',
                    body: {
                        test: 'testVal'
                    }
                };
                var res = {};
                config.serverUrls[0].accessToken = null;
                var esriProxy = new EsriProxy(req, res, config);
                esriProxy.addAccessTokenToHash();

                assert.isUndefined(esriProxy.requestVarHash.token);
            });
        });

        describe('#getToken', function() {
            var config = null;
            beforeEach(function () {
                config = {
                	// comma separated list of referer URL's. Only requests from these urls will be proxied
                	allowedReferers: '*',
                	// When true, only sites matching serverUrls will be proxied
                	mustMatch: true,
                	// Log file
                	// TODO: Not implemented
                	// logFile: 'esriproxylog.txt',
                	serverUrls: [
                		{
                			url: 'http://serviceurl',
                			// When true, if request begins with url string it is forwarded
                			// false means it must match exactly
                			matchAll: true,
                			// un/pw to use when requesting a token - if needed for arcGIS Sever token based authentication
                			username: null,
                			password: null,
                			// Used with clientSecret for OAuth to obtain a token - if needed for OAuth 2.0 authentication
                			clientId: 'validclientid',
                			// Used with clientId
                			clientSecret: 'validclientsecret',
                			// Default endpoint is http://arcgis.com/sharing/oauth2
                			oauth2Endpoint: 'https://authurl',
                			// Max # of requests from a particular referer over rateLimitPeriod
                			rateLimit: null,
                			// Time period in minutes within which the specified number of requests will be tracked
                			rateLimitPeriod: null,
                			// The url to use instead of the "alias" one provided in the 'url' property and that should be redirected
                			rateLimitRedirect: null,
                            // The access token used for requests. Will be added by the proxy
                			accessToken: ''
                		}
                	]
                };
            });
            afterEach(function () {
                config = null;
            });

            it('Retrieves token from auth endpoint', function () {
                var reqWrapper = {
                    req: request
                }
                EsriProxy.__set__("request", sinon.stub(reqWrapper, 'req', function(options, callback) {
                    var error = null;
                    var response = null;
                    var body = null;

                    var bodyObj = {};
                    if (options.form.client_secret && options.form.client_id) {
                        bodyObj = {
                            'access_token': 'TESTTOKEN'
                        };
                    }

                    body = bodyObj;

                    callback(error, response, body);
                }));
                // request.get = {};
                // console.log(request);
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                esriProxy.getToken(function() {});

                assert.equal(esriProxy.requestVarHash.token, 'TESTTOKEN');
            });
        });

        describe('#attemptProxy', function() {
            var config = null;
            beforeEach(function () {
                config = {
                	// comma separated list of referer URL's. Only requests from these urls will be proxied
                	allowedReferers: '*',
                	// When true, only sites matching serverUrls will be proxied
                	mustMatch: true,
                	// Log file
                	// TODO: Not implemented
                	// logFile: 'esriproxylog.txt',
                	serverUrls: [
                		{
                			url: 'http://serviceurl',
                			// When true, if request begins with url string it is forwarded
                			// false means it must match exactly
                			matchAll: true,
                			// un/pw to use when requesting a token - if needed for arcGIS Sever token based authentication
                			username: null,
                			password: null,
                			// Used with clientSecret for OAuth to obtain a token - if needed for OAuth 2.0 authentication
                			clientId: 'validclientid',
                			// Used with clientId
                			clientSecret: 'validclientsecret',
                			// Default endpoint is http://arcgis.com/sharing/oauth2
                			oauth2Endpoint: 'https://authurl',
                			// Max # of requests from a particular referer over rateLimitPeriod
                			rateLimit: null,
                			// Time period in minutes within which the specified number of requests will be tracked
                			rateLimitPeriod: null,
                			// The url to use instead of the "alias" one provided in the 'url' property and that should be redirected
                			rateLimitRedirect: null,
                            // The access token used for requests. Will be added by the proxy
                			accessToken: ''
                		}
                	]
                };
            });
            afterEach(function () {
                config = null;
            });

            it('If not authorized, gets token and re-tries', function () {
                var reqWrapper = {
                    req: request
                }
                EsriProxy.__set__("request", sinon.stub(reqWrapper, 'req', function(options, callback) {
                    var error = null;
                    var response = null;
                    var body = null;

                    var bodyObj = {};
                    if (options.url === config.serverUrls[0].oauth2Endpoint && options.form.client_secret && options.form.client_id) {
                        bodyObj = {
                            'access_token': 'TESTTOKEN'
                        };
                        callback(error, response, bodyObj);
                        return;
                    }

                    if (options.url === config.serverUrls[0].url && !options.qs.token) {
                        bodyObj = {
                            error: {
                                code: 403
                            }
                        };
                    }

                    if (options.url === config.serverUrls[0].url && options.qs.token) {
                        bodyObj = {
                            success: 'SUCCESS'
                        };
                    }

                    body = JSON.stringify(bodyObj);

                    callback(error, response, body);
                }));
                // request.get = {};
                // console.log(request);
                var req = {
                    method: 'GET',
                    url: '/?' + config.serverUrls[0].url
                };
                var res = {
                    send: function() {}
                };
                var esriProxy = new EsriProxy(req, res, config);
                esriProxy.attemptProxy();

                assert.equal(esriProxy.requestVarHash.token, 'TESTTOKEN');
            });
        });
    });
});

// TODO Check for unescaped query strings
// TODO Break into smaller test cases
