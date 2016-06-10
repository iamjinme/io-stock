'use strict';

var path = process.cwd();
var IoStock = require(path + '/app/controllers/ioStock.server.js');

module.exports = function (app) {

	var ioStock = new IoStock();

	app.get('/', function(req, res) {
		res.sendFile(path + '/app/views/index.html');
	});

};
