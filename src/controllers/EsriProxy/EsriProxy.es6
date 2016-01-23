var request = require('request');

class EsriProxy {
    constructor(req, res, configJSON) {
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

    getProxyURLParts() {
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

    getRequestVars() {
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

    convertQueryStringToHash() {
        var qsArr = this.queryString.split('&')
        var obj = {};
        for (var i = 0; i < qsArr.length; i++) {
            //console.log(urlQueryStringArr[i]);
            var paramArr = qsArr[i].split('=');
            obj[paramArr[0]] = paramArr[1];
        }
        return obj;
    }

    addAccessTokenToHash() {
        if (this.configJSON.serverUrls[0].accessToken) {
            this.requestVarHash['token'] = this.configJSON.serverUrls[0].accessToken;
        }
    }

    attemptProxy() {
        console.log(this.proxyUrl);
        console.log(this.requestVarHash);
        var self = this;
        // if (this.proxyMethod === 'GET') {
        //     console.log(self.proxyUrl);
        //     console.log(this.requestVarHash);
        // }
        request({
            url: self.proxyUrl,
            qs: self.requestVarHash,
            method: 'POST'
        }, function(error, response, body) {
            // if (self.proxyMethod === 'POST') {
            //     console.log(response);
            //     console.log(body);
            //     console.log(error);
            // }
            var parsedBody = {};
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {

            }

            if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 498 || parsedBody.error.code === 499) && !self.triedNewToken) {
                console.log('getting token');
                self.getToken(self.attemptProxy.bind(self));
            } else {
                console.log('returning body');
                self.res.send(body);
            }
        });
    }

    getToken(callback) {
        var self = this;
        self.triedNewToken = true;
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
        }, function(error, response, body) {
            self.configJSON.serverUrls[0].accessToken = body.access_token;
            self.addAccessTokenToHash();
            callback();
        });
    }
}

module.exports = EsriProxy;
