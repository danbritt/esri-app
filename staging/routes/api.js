'use strict';

var express = require('express');
// var request = require('request');
//var JWT = require('jsonwebtoken');
var bodyParser = require('body-parser');
//var sequelize = require('sequelize');
//var request = require('request');
var esriProxyController = require('../controllers/EsriProxy/EsriProxyController.js');
var esriProxyConfig = require('../config.js');

// Sequelize example
/*var sequelizeObj = new sequelize('hg3_shannon_3', 'root', 'l00per', {
	// Don't output to console
	logging: false,
    dialect: 'mysql',
    pool: {
        min: 0,
        max: 40,
		// 10sec idle before connection is released
        idle: 10000
    },
	// Default model options
    define: {
        timestamps: true,
        underscored: true
    }
});*/

var router = new express.Router();

// Secret key used for JWT. Also should be in settings file
//var secret = 'RJE%WUI%$dfhfdhfq3$^2362347yerudfjdfsHSDYY#$&^%7457457ywer';

// Set routes to expect json requests
//router.use(bodyParser.json());

// This is for form-data requests
router.use(bodyParser.urlencoded({
	extended: true
}));

// Any api routes that start with /api/s will process the JWT
// Ex: /api/s/route1
/*router.use('/s', function(req, res, next) {
	try {
		// Get token from Auth Bearer header
		var abHeader = req.headers.authorization;
		console.log(abHeader);
		if (abHeader) {
			var abHeaderParts = abHeader.split(' ');
			// Verify token, throws error if invalid
			// Add to req.jwtPayload
			req.jwtPayload = JWT.verify(abHeaderParts[1], secret);
		} else {
			throw 'Missing or Invalid Token';
		}
		next();
	} catch (err) {
		res.status(401).send('Unauthorized');
		// Return unauthorized on failure
	}
});*/

// For reference purposes. How to set JWT
/*router.post('/login', function(req, res) {
	var jwt = JWT.sign({test: 'yep'}, secret);
	//console.log(new Buffer(jwt, 'base64').toString());
	console.log('header: ' + req.headers.authorization);
	res.json({token: jwt});
});*/

// Simple proxy example, returns base64 encoded response
/*router.get('/proxy', function(req, res) {
	var newurl = req.query.url;

	request({
		uri: newurl,
		encoding: 'base64'
	}, function(error, response, body) {
		res.send(body);
	});
});*/

// router.use('/esriProxy', function(req, res) {
// 	var esriProxyObj = new esriProxy(esriProxyConfig, req, res);
//
// });

router.use('/esriProxy', new esriProxyController(esriProxyConfig));

// router.get('/test', function(req,res) {
// 	var responseObj = {
// 		prop: 'test'
// 	};
// 	// return json response
// 	res.json(responseObj);
// });

module.exports = router;