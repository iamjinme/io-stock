'use strict';

var request = require('request');

var Users = require('../models/users.js');

function IoStock () {

	var quandl_path = 'https://www.quandl.com/api/v3/datasets/WIKI/';

	this.getCode = function(req, res) {
		var code = req.params.code.toUpperCase();
		var api_url = quandl_path + code + '/metadata.json'
		request(api_url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
				var code = JSON.parse(body).dataset;
				res.json({ 'code': code.dataset_code, 'name': code.name });
			} else {
        res.json({'error': true, 'message': 'You have submitted an incorrect Stock code'})
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
