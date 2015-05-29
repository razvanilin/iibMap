var async = require('async');
var request = require('request');
var restful = require('node-restful');
var config = require('./../config');

module.exports = function(app, route) {

    var Service = restful.model(
        'service',
        app.models.service
    ).methods(['get', 'put', 'post', 'delete']);

    var INode = restful.model('inode', app.models.inode);

    // register this endpoint with the application
    Service.register(app, route);

    /*
     *	GET a list with the services and their health
     *	The health is determined by the status (running or not) of the flows contained in the service
     */
    app.get(config.apiRoute + "/service/health", function(req, res, next) {
        Service.find({
            isActive: true
        }).exec(function(err, services) {
            if (err) return res.status(400).send("Bad request");

            // go through all the services and get the health
            for (var i = 0; i < services.length; i++) {
                getHealth(services[i], services.length, res);
            }
        });
    });

    var servicesChecked = 0;
    var servicesHealth = [];

    /*
     *	Function that takes a service and gets the health of each flow inside it
     *	To get the health, it's using an async map to make requests to the IIB API for each flow
     *
     *	The service is:
     * 		healthy 	- if all the flows are running
     *		problematic - if at least one flow is not running and the rest are
     *		not healthy - if all the flows are not running
     *
     */
    function getHealth(service, numberOfServices, res) {

    	var flowIndex = 1;
    	var validJson = false;
        var flowHealth = [];
        var apiBasePath = "/apiv1";

        // create an async map that iterates through all the flows inside the service
        async.each(service.flows, function(flow, callback) {
            // build the IIB API path used to get the flow status
            var apiPath = apiBasePath + "/executiongroups/" + flow.iserver;
            if (flow.application.length > 0) {
                apiPath += "/applications/" + flow.application;
            }
            apiPath += "/messageflows/" + flow.name;

            // query the database to get the node details (hostname, port, user, pw)
            // necessary for the request
            INode.findOne({
                isActive: true,
                _id: flow.inode
            }).exec(function(err, inode) {
                if (err) return res.status(400).send("Error when retrieving the Integration Node");
                var options = getOptions(inode, apiPath, 'GET');

                // Make a request to the IIB API the get the flow status
                request(options, function(error, resp, body) {
                        var responseString;
                        try {
                            responseString = JSON.parse(body);
                            validJson = true;
                        } catch (jsonErr) {
                            validJson = false;
                        }

                        if (validJson) {
                            flowHealth.push(responseString.isRunning);
                        }

                        if (flowIndex == service.flows.length) {
                            console.log("async test 2");
                            var badHealth = 0;
                            for (var j = 0; j < flowHealth.length; j++) {
                                if (!flowHealth[j]) badHealth++;
                            }

                            if (badHealth == 0 && flowHealth.length > 1) {
                                servicesHealth.push({
                                    name: service.name,
                                    health: 2
                                });
                            } else if (badHealth > 0 && badHealth < flowHealth.length) {
                                servicesHealth.push({
                                    name: service.name,
                                    health: 1
                                });
                            } else {
                                servicesHealth.push({
                                    name: service.name,
                                    health: 0
                                });
                            }
                            console.log(servicesHealth);
                            flowIndex = 1;
                            
                        }
                        callback();
                        flowIndex++;
                    })
                    // authenticate the request
                    .auth(inode.username, inode.password, false);
                console.log("async test 1");
            });
            console.log("end");
        }, function() {
            servicesChecked++;
            console.log(servicesChecked + " > " + numberOfServices);
            if (numberOfServices == servicesChecked) {
            	servicesChecked = 0;
            	var finalHealth = servicesHealth;
            	servicesHealth = [];
                return res.send(finalHealth);
            }
        });
    }


    function getOptions(node, path, method) {
        // check if the integration node uses ssl
        var ssl = "http://";
        if (node.ssl) {
            ssl = "https://";
        }

        // the IIB API url
        var apiUrl = ssl + node.host + ":" + node.port + path;

        // create the authorizaation string
        // Authentication doesn't work if placed in the options
        // var auth = 'Basic ' + new Buffer(node.username + '/' + node.password).toString('base64');
        //console.log(auth + " -  " + apiUrl);

        // create the request options
        var options = {
            url: apiUrl,
            method: method,
            headers: {
                'Accept': 'application/json'
            }
        }

        return options;
    }

    // return middleware
    return function(req, res, next) {
        next();
    }
};
