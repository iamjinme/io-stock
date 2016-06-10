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

	routes(app);

	var port = process.env.PORT || 8080;
	app.listen(port,  function () {
		console.log('Node.js listening on port ' + port + '...');
	});

	io.on('connection', function (socket) {
	  socket.emit('news', { hello: 'world' });
	  socket.on('my other event', function (data) {
	    console.log(data);
	  });
	});

});
