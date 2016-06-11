'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');

require('dotenv').load();

var mongo_uri = process.env.MONGO_URI || 'mongodb://localhost/test';
mongoose.connect(mongo_uri);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
	app.use('/public', express.static(process.cwd() + '/public'));
	app.use('/views', express.static(process.cwd() + '/app/views'));

	routes(app, io);

	var port = process.env.PORT || 8080;
	http.listen(port,  function () {
		console.log('Node.js listening on port ' + port + '...');
	});

});
