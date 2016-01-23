'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');

var EsriProxy = function () {
    function EsriProxy(req, res, configJSON) {
        _classCallCheck(this, EsriProxy);

        this.triedNewToken = false;
        this.req = req;
        this.res = res;
        this.configJSON = configJSON;
        this.proxyUrl = null;
        this.queryString = null;
        this.requestVarHash = null;
        this.proxyMethod = req.method;
        // this.clientReqHeaders = this.req.headers;
        var proxyUrlParts = this.getProxyURLParts();
        this.proxyUrl = proxyUrlParts[0];
        this.queryString = proxyUrlParts[1];
        this.requestVarHash = this.getRequestVars();
        this.addAccessTokenToHash();
    }

    _createClass(EsriProxy, [{
        key: 'getProxyURLParts',
        value: function getProxyURLParts() {
            // Removes /? from beginning of request url
            var reqQueryString = this.req.url.substring(2);
            var proxyUrlParts = reqQueryString.split('?');

            var proxyUrl = proxyUrlParts[0];

            var queryString = null;
            if (this.proxyMethod == 'GET') {
                queryString = proxyUrlParts[1] ? unescape(proxyUrlParts[1]) : null;
            }
            return [proxyUrl, queryString];
        }
    }, {
        key: 'getRequestVars',
        value: function getRequestVars() {
            var hash = {};
            if (this.proxyMethod === 'GET') {
                if (this.queryString) {
                    hash = this.convertQueryStringToHash();
                }
            } else if (this.proxyMethod === 'POST') {
                hash = this.req.body;
            }
            return hash;
        }
    }, {
        key: 'convertQueryStringToHash',
        value: function convertQueryStringToHash() {
            var qsArr = this.queryString.split('&');
            var obj = {};
            for (var i = 0; i < qsArr.length; i++) {
                //console.log(urlQueryStringArr[i]);
                var paramArr = qsArr[i].split('=');
                obj[paramArr[0]] = paramArr[1];
            }
            return obj;
        }
    }, {
        key: 'addAccessTokenToHash',
        value: function addAccessTokenToHash() {
            if (this.configJSON.serverUrls[0].accessToken) {
                this.requestVarHash['token'] = this.configJSON.serverUrls[0].accessToken;
            }
        }
    }, {
        key: 'attemptProxy',
        value: function attemptProxy() {
            request({
                url: this.proxyUrl,
                qs: this.requestVarHash,
                method: this.proxyMethod
            }, this.processProxyURLResponse.bind(this));
        }
    }, {
        key: 'processProxyURLResponse',
        value: function processProxyURLResponse(error, response, body) {
            var parsedBody = null;
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {
                parsedBody = {};
            }

            if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 498 || parsedBody.error.code === 499) && !this.triedNewToken) {
                this.getToken();
            } else {
                this.res.send(body);
            }
        }
    }, {
        key: 'processAuthURLResponse',
        value: function processAuthURLResponse(error, response, body) {
            this.configJSON.serverUrls[0].accessToken = body.access_token;
            this.addAccessTokenToHash();
            this.attemptProxy();
        }
    }, {
        key: 'getToken',
        value: function getToken() {
            var self = this;
            this.triedNewToken = true;
            request({
                url: this.configJSON.serverUrls[0].oauth2Endpoint,
                method: 'POST',
                json: true,
                form: {
                    'f': 'json',
                    'client_id': this.configJSON.serverUrls[0].clientId,
                    'client_secret': this.configJSON.serverUrls[0].clientSecret,
                    'grant_type': 'client_credentials',
                    'expiration': '1440'
                }
            }, this.processAuthURLResponse.bind(this));
        }
    }]);

    return EsriProxy;
}();

module.exports = EsriProxy;