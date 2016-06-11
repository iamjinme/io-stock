'use strict';

var request = require('request');

var Stock = require('../models/stock.js');

function IoStock () {

	var quandl_path = 'https://www.quandl.com/api/v3/datasets/WIKI/';
	var quandl_api_key = process.env.QUANDL_API_KEY;
	var format = '.json';

	this.saveCode = function(stock) {
		var options = { upsert: true, new: true, setDefaultsOnInsert: true };
		Stock.findOneAndUpdate({ 'code': stock.code }, stock, options, function(err, result) {
    	if (err) throw err;
			console.log(result);
    });
	}

	this.removeCode = function(stock) {
		Stock.findOne({ 'code': stock.code }, function(err, result) {
    	if (err) throw err;
			if (result) {
				result.remove();
			}
    });
	}

	this.getCodes = function(req, res) {
		Stock.find({}, { _id: false, __v: false }, function(err, codes) {
			if (err) throw err;
			res.json(codes);
		});
	}

	this.getCode = function(req, res) {
		var code = req.params.code.toUpperCase();
		var api_url  = quandl_path + code + '/metadata' + format;
		    api_url += '?api_key=' + quandl_api_key;
		// Request to Quandl
		request(api_url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
				var code = JSON.parse(body).dataset;
				res.json({ 'code': code.dataset_code, 'name': code.name });
			} else {
        res.json({'error': true, 'message': 'You have submitted an incorrect Stock code'})
      };
		});
  };

	this.getData = function(req, res) {
		var pad = function(s) { return (s < 10) ? '0' + s : s; }
		var start_date = function() {
			var date = new Date();
			return (date.getFullYear() - 1) + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDay());
		}
		var code = req.params.code.toUpperCase();
		var api_url  = quandl_path + code + format;
		    api_url += '?api_key=' + quandl_api_key;
				api_url += '&start_date=' + start_date();
				api_url += '&column_index=4'; // Only Close Monthly
		// Request to Quandl
		var graph_data = [];
		request(api_url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
				var data = JSON.parse(body).dataset.data;
				for (var i in data) {
					graph_data.push({ 'period': data[i][0], 'close': data[i][1] });
				}
				res.json(graph_data);
			} else {
        res.json({'error': true, 'message': 'The data its not begin processed' })
      };
		});
  };

	this.getClicks = function (req, res) {
		Users
			.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result.nbrClicks);
			});
	};

	this.addClick = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { $inc: { 'nbrClicks.clicks': 1 } })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

	this.resetClicks = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

}

module.exports = IoStock;
