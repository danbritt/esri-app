var EsriProxy = require('./EsriProxy.js');

class EsriProxyController {
    constructor(configJSON) {
        return (req, res) => {
            var esriProxy = new EsriProxy(req, res, configJSON);
            esriProxy.attemptProxy();
        }
    }
}

module.exports = EsriProxyController;
