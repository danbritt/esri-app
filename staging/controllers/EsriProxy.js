'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EsriProxy = function () {
    function EsriProxy(req, res, configJSON, request) {
        _classCallCheck(this, EsriProxy);

        this.triedNewToken = false;
        this.req = req;
        this.res = res;
        this.request = request;
        this.configJSON = configJSON;

        this.proxyUrl = null;
        this.proxyQueryStringHash = null;
        // this.clientReqHeaders = this.req.headers;
        // this.proxyMethod = req.method;

        this.processURL(this.req.url);
        this.addAccessTokenToQuery();
    }

    _createClass(EsriProxy, [{
        key: 'processURL',
        value: function processURL(url) {
            // Removes /? from beginning of url (which is the query string part
            // of the URL in this case)
            var proxyQueryString = this.req.url.substring(2);
            var proxyQueryStringArr = proxyQueryString.split('?');
            // Remove url from querystring
            this.proxyUrl = proxyQueryStringArr[0];

            var urlQueryString = proxyQueryStringArr[1];
            var urlQueryString = unescape(urlQueryString);
            var urlQueryStringArr = urlQueryString.split('&');

            this.proxyQueryStringHash = this.convertQueryStringArrToObj(urlQueryStringArr);
        }
    }, {
        key: 'convertQueryStringArrToObj',
        value: function convertQueryStringArrToObj(queryStringArr) {
            var obj = {};
            for (var i = 0; i < queryStringArr.length; i++) {
                //console.log(urlQueryStringArr[i]);
                var paramArr = queryStringArr[i].split('=');
                obj[paramArr[0]] = paramArr[1];
            }
            return obj;
        }
    }, {
        key: 'addAccessTokenToQuery',
        value: function addAccessTokenToQuery() {
            if (this.configJSON.serverUrls[0].accessToken) {
                this.proxyQueryStringHash['token'] = this.configJSON.serverUrls[0].accessToken;
            }
        }
    }, {
        key: 'attemptProxy',
        value: function attemptProxy() {
            var self = this;
            this.request({
                url: self.proxyUrl,
                qs: self.proxyQueryStringHash,
                method: 'GET'
            }, function (error, response, body) {
                var parsedBody = {};
                try {
                    parsedBody = JSON.parse(body);
                } catch (err) {}

                if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 489 || parsedBody.error.code === 499) && !self.triedNewToken) {
                    //console.log('getting token');
                    self.getToken(self.attemptProxy.bind(self));
                } else {
                    self.res.send(body);
                }
            });
        }
    }, {
        key: 'getToken',
        value: function getToken(callback) {
            var self = this;
            self.triedNewToken = true;
            this.request.post({
                url: this.configJSON.serverUrls[0].oauth2Endpoint,
                json: true,
                form: {
                    'f': 'json',
                    'client_id': this.configJSON.serverUrls[0].clientId,
                    'client_secret': this.configJSON.serverUrls[0].clientSecret,
                    'grant_type': 'client_credentials',
                    'expiration': '1440'
                }
            }, function (error, response, body) {
                self.configJSON.serverUrls[0].accessToken = body.access_token;
                self.addAccessTokenToQuery();
                callback();
            });
        }
    }]);

    return EsriProxy;
}();

var EsriProxyMW = function EsriProxyMW(configJSON, requestModule) {
    _classCallCheck(this, EsriProxyMW);

    return function (req, res, next) {
        var esriProxy = new EsriProxy(req, res, configJSON, requestModule);
        esriProxy.attemptProxy();
    };
};

module.exports = EsriProxyMW;