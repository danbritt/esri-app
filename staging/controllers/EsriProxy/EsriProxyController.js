'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EsriProxy = require('./EsriProxy.js');

var EsriProxyController = function EsriProxyController(configJSON) {
    _classCallCheck(this, EsriProxyController);

    return function (req, res) {
        var esriProxy = new EsriProxy(req, res, configJSON);
        esriProxy.attemptProxy();
    };
};

module.exports = EsriProxyController;