var http = require('http');
var express = require('express');
var compression = require('compression');
var apirouter = require('./routes/api.js');


var app = new express();

// Compress responses
app.use(new compression());

// Can serve two directories under same name
// Sometimes not all libs are on bower, also serve from vendor directory
app.use('/vendor', new express.static('../vendor'));
app.use('/vendor', new express.static('../bower_components'));

// Serve from public directory
app.use(new express.static('public'));


app.use('/api', apirouter);

// TESTING
/*app.get('/', function(req, res) {
	res.send('home page');
});*/
/*app.use(function(req, res,next) {
	console.log(req.headers.host);
	next();
});*/

// Start up http server
var server = app.listen(process.argv[2] || 3100, function() {
	//var host = server.address().address;
	var port = server.address().port;
	console.log('App listening on port: ' + port);
});
