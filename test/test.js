var rewire = require("rewire");
var assert = require('chai').assert;
var sinon = require('sinon');
var request = require('request');
var EsriProxy = rewire('../staging/controllers/EsriProxy/EsriProxy.js');

describe('EsriProxy Controller', function() {
    describe('EsriProxy', function () {
        var config = null;
        before(function() {
            // General config to use. Will be modified for certain tests
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
        after(function() {
            config = null;
        })
        describe('#getRequestVars', function() {
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

            it('Unesapes escaped keys/values', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl?test%20var=test%20Val'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                var hash = esriProxy.getRequestVars();

                assert.isDefined(hash['test var']);
                assert.equal(hash['test var'], 'test Val');
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
            beforeEach(function () {
                config.serverUrls[0].accessToken = 'TESTTOKEN';
            });
            afterEach(function () {
                config.serverUrls[0].accessToken = '';
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

        describe('#processProxyURLResponse', function() {
            beforeEach(function () {
                config.serverUrls[0].accessToken = '';
            });
            afterEach(function () {

            });

            it('Calls getToken if not authorized Code: 403', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                var getTokenStub = sinon.stub(esriProxy, 'getToken');

                var methodError = null;
                var methodResponse = null;
                var methodBody = JSON.stringify({
                    error: {
                        code: 403
                    }
                });
                esriProxy.processProxyURLResponse(methodError, methodResponse, methodBody);

                assert(getTokenStub.calledOnce);


            });

            it('Calls getToken if invalid token Code: 498', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                var getTokenStub = sinon.stub(esriProxy, 'getToken');

                var methodError = null;
                var methodResponse = null;
                var methodBody = JSON.stringify({
                    error: {
                        code: 498
                    }
                });
                esriProxy.processProxyURLResponse(methodError, methodResponse, methodBody);

                assert(getTokenStub.calledOnce);


            });

            it('Calls getToken if invalid token Code: 499', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                var getTokenStub = sinon.stub(esriProxy, 'getToken');

                var methodError = null;
                var methodResponse = null;
                var methodBody = JSON.stringify({
                    error: {
                        code: 499
                    }
                });
                esriProxy.processProxyURLResponse(methodError, methodResponse, methodBody);

                assert(getTokenStub.calledOnce);


            });

            it('Calls node response.send() if authorized', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {
                    send: sinon.spy()
                };
                var esriProxy = new EsriProxy(req, res, config);

                var methodError = null;
                var methodResponse = null;
                var methodBody = JSON.stringify({});
                esriProxy.processProxyURLResponse(methodError, methodResponse, methodBody);

                assert(res.send.calledOnce);


            });
        });

        describe('#processAuthURLResponse', function() {
            beforeEach(function () {
                config.serverUrls[0].accessToken = '';
            });
            afterEach(function () {

            });

            it('Sets access token in config', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                var attemptProxyStub = sinon.stub(esriProxy, 'attemptProxy');
                var addAccessTokenToHashStub = sinon.stub(esriProxy, 'addAccessTokenToHash');

                var methodError = null;
                var methodResponse = null;
                var methodBody = {
                    'access_token': 'TESTTOKEN'
                };
                esriProxy.processAuthURLResponse(methodError, methodResponse, methodBody);

                assert.equal(config.serverUrls[0].accessToken, 'TESTTOKEN');
            });
        });

        describe('#getToken', function() {
            beforeEach(function () {
                config.serverUrls[0].accessToken = '';
            });
            afterEach(function () {

            });

            it('Sends proper request and calls success callback', function () {
                // Stub request module:
                var reqWrapper = {
                    req: request
                }
                EsriProxy.__set__("request", sinon.stub(reqWrapper, 'req', function(options, callback) {
                    // Verify options
                    assert.equal(options.url, config.serverUrls[0].oauth2Endpoint);
                    assert.equal(options.method, 'POST');
                    assert.equal(options.json, true);
                    assert.equal(options.form['f'], 'json');
                    assert.equal(options.form['client_id'], config.serverUrls[0].clientId);
                    assert.equal(options.form['client_secret'], config.serverUrls[0].clientSecret);
                    assert.equal(options.form['grant_type'], 'client_credentials');

                    callback();
                }));

                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);

                var processAuthURLResponseStub = sinon.stub(esriProxy, 'processAuthURLResponse');

                esriProxy.getToken();

                assert(processAuthURLResponseStub.calledOnce);

            });
        });

        describe('#attemptProxy', function() {
            beforeEach(function () {
                config.serverUrls[0].accessToken = '';
            });
            afterEach(function () {

            });

            it('Sends proper request and calls success callback', function () {
                var req = {
                    method: 'GET',
                    url: '/?http://proxyurl'
                };
                var res = {};
                var esriProxy = new EsriProxy(req, res, config);
                // Stub request module:
                var reqWrapper = {
                    req: request
                }
                EsriProxy.__set__("request", sinon.stub(reqWrapper, 'req', function(options, callback) {
                    // Verify options
                    assert.equal(options.url, esriProxy.proxyUrl);
                    assert.equal(options.method, esriProxy.proxyMethod);
                    assert.equal(options.qs, esriProxy.requestVarHash);


                    callback();
                }));



                var processProxyURLResponseStub = sinon.stub(esriProxy, 'processProxyURLResponse');

                esriProxy.attemptProxy();

                assert(processProxyURLResponseStub.calledOnce);

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
