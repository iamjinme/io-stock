'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app) {

	var clickHandler = new ClickHandler();

	app.get('/', function(req, res) {
		res.sendFile(path + '/public/index.html');
	});

};
