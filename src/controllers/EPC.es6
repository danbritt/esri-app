var request = require('request');


module.exports = class EPC {
    constructor(req, res, next, configJSON) {
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

        this.attemptProxy();
    }

    attemptProxy() {
        var self = this;
        request({
            url: self.proxyUrl,
            qs: self.queryStringObj,
            method: 'GET'
        }, function(error, response, body) {
            var parsedBody = {};
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {

            }

            if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 489 || parsedBody.error.code === 499) && !self.triedNewToken) {
                console.log('getting token');
                self.getToken(self.attemptProxy.bind(self));
            } else {
                self.res.send(body);
            }
        });
    }

    getToken(callback) {
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
        }, function(error, response, body) {
            self.configJSON.accessToken = body.access_token;
            self.queryStringObj['token'] = self.configJSON.accessToken;
            callback();
        });
    }
}
