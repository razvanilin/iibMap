var async = require('async');
var request = require('request');
var restful = require('node-restful');

module.exports = function(app, route) {

	var Service = restful.model(
		'service',
		app.models.service
	).methods(['get', 'put', 'post', 'delete']);

	// register this endpoint with the application
	Service.register(app, route);	

    // return middleware
    return function(req, res, next) {
        next();
    }
};
