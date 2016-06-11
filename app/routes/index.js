'use strict';

var path = process.cwd();
var IoStock = require(path + '/app/controllers/ioStock.server.js');

module.exports = function (app, io) {

	var ioStock = new IoStock();

	// Sockets.io in real time
	io.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
		socket.on('push', function(data){
			console.log('push:', data)
			data.code = data.code.toUpperCase();
			ioStock.saveCode(data);
			io.emit('push', data);
		});
		socket.on('pop', function(data){
			console.log('pop:', data)
			data.code = data.code.toUpperCase();
			ioStock.removeCode(data);
			io.emit('pop', data);
		});
	});

	app.get('/', function(req, res) {
		res.sendFile(path + '/app/views/index.html');
	});

	app.get('/api/code/:code', ioStock.getCode);

	app.get('/api/stock/:code', ioStock.getData);

	app.get('/api/code', ioStock.getCodes);

};
