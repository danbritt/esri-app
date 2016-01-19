'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');

var EsriProxy = function () {
    function EsriProxy(req, res, next, configJSON) {
        _classCallCheck(this, EsriProxy);

        this.req = req;
        this.res = res;
        this.configJSON = configJSON;

        var self = this;
        // this.clientReqHeaders = this.req.headers;
        // this.proxyMethod = req.method;

        // Removes /? from beginning of url (which is the query string part
        // of the URL in this case)
        var proxyQueryString = req.url.substring(2);
        var proxyQueryStringArr = proxyQueryString.split('?');
        // Remove url from querystring
        this.proxyUrl = proxyQueryStringArr[0];

        var urlQueryString = proxyQueryStringArr[1];
        var urlQueryString = unescape(urlQueryString);
        var urlQueryStringArr = urlQueryString.split('&');

        // Convert query string params to obj
        this.queryStringObj = {};
        for (var i = 0; i < urlQueryStringArr.length; i++) {
            //console.log(urlQueryStringArr[i]);
            var paramArr = urlQueryStringArr[i].split('=');
            this.queryStringObj[paramArr[0]] = paramArr[1];
        }

        if (this.configJSON.accessToken) {
            this.queryStringObj['token'] = this.configJSON.accessToken;
        }
    }

    _createClass(EsriProxy, [{
        key: 'attemptProxy',
        value: function attemptProxy() {
            var self = this;
            request({
                url: self.proxyUrl,
                qs: self.queryStringObj,
                method: 'GET'
            }, function (error, response, body) {
                var parsedBody = {};
                try {
                    parsedBody = JSON.parse(body);
                } catch (err) {}

                if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 489 || parsedBody.error.code === 499) && !self.triedNewToken) {
                    console.log('getting token');
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
            request.post({
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
                self.configJSON.accessToken = body.access_token;
                self.queryStringObj['token'] = self.configJSON.accessToken;
                callback();
            });
        }
    }]);

    return EsriProxy;
}();

var EsriProxyMW = function EsriProxyMW(configJSON) {
    _classCallCheck(this, EsriProxyMW);

    return function (req, res, next) {
        var esriProxy = new EsriProxy(req, res, next, configJSON);
        esriProxy.attemptProxy();
    };
};

module.exports = EsriProxyMW;