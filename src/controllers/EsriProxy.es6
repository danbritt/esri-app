class EsriProxy {
    constructor(req, res, configJSON, request) {
        this.triedNewToken = false;
        this.req = req;
        this.res = res;
        this.request = request;
        this.configJSON = configJSON;

        this.proxyUrl = null;
        this.proxyQueryStringHash = null;
        // this.clientReqHeaders = this.req.headers;
        this.proxyMethod = req.method;
        if (this.proxyMethod === 'GET') {
            this.processURL(this.req.url);
        } else if (this.proxyMethod === 'POST') {
            this.processURLPOST(this.req.url);
        }

        this.addAccessTokenToQuery();
    }

    processURLPOST(url) {
        // Removes /? from beginning of url (which is the query string part
        // of the URL in this case)
        var proxyQueryString = this.req.url.substring(2);
        var proxyQueryStringArr = proxyQueryString.split('?');
        // Remove url from querystring
        this.proxyUrl = proxyQueryStringArr[0];

        // var urlQueryString = proxyQueryStringArr[1];
        // var urlQueryString = unescape(urlQueryString);
        // var urlQueryStringArr = urlQueryString.split('&');
        //
        this.proxyQueryStringHash = this.req.body;
    }

    processURL(url) {
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

    convertQueryStringArrToObj(queryStringArr) {
        var obj = {};
        for (var i = 0; i < queryStringArr.length; i++) {
            //console.log(urlQueryStringArr[i]);
            var paramArr = queryStringArr[i].split('=');
            obj[paramArr[0]] = paramArr[1];
        }
        return obj;
    }

    addAccessTokenToQuery() {
        if (this.configJSON.serverUrls[0].accessToken) {
            this.proxyQueryStringHash['token'] = this.configJSON.serverUrls[0].accessToken;
        }
        //this.proxyQueryStringHash.f = 'json';
    }

    attemptProxy() {
        var self = this;
        if (this.proxyMethod === 'POST') {
            console.log(self.proxyUrl);
            console.log(this.proxyQueryStringHash);
        }
        this.request({
            url: self.proxyUrl,
            qs: self.proxyQueryStringHash,
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

            if (parsedBody.error && (parsedBody.error.code === 403 || parsedBody.error.code === 489 || parsedBody.error.code === 499) && !self.triedNewToken) {
                //console.log('getting token');
                self.getToken(self.attemptProxy.bind(self));
            } else {
                self.res.send(body);
            }
        });
    }

    getToken(callback) {
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
        }, function(error, response, body) {
            self.configJSON.serverUrls[0].accessToken = body.access_token;
            self.addAccessTokenToQuery();
            callback();
        });
    }
}


class EsriProxyMW {
    constructor(configJSON, requestModule) {
        return (req, res, next) => {
            var esriProxy = new EsriProxy(req, res, configJSON, requestModule);
            esriProxy.attemptProxy();
        }
    }
}

module.exports = EsriProxyMW;
