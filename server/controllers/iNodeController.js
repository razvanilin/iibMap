var restful = require('node-restful');
var async = require('async');
var request = require('request');
var config = require('./../config');

var chartData = {
    "name": "IIB",
    "children": []
};

module.exports = function(app, route) {
    // Setup controller for REST
    var INode = restful.model(
            'inode',
            app.models.inode
        ).methods(['get', 'put', 'post', 'delete'])
        .before('get', function(req, res, next) {
            // workaround for when ther user requests all the documents
            // should work without, but it doesn't - TODO: find out why
            if (!req.params.id || req.params.id.length < 1)
                INode.find().exec(function(err, users) {
                    res.send(users);
                });
            else
                next();
        })
        .before('post', checkNode)
        .before('put', checkNode);

    function checkNode(req, res, next) {
        // Make sure a connection can be made to the inode and get its name from the IIB API

        req.body.name = '';
        var options = getOptions(req.body, '/apiv1/', 'GET');
        request(options, function(error, resp, body) {
                if (error) return res.status(404).send('Integration node not found');

                var responseString = JSON.parse(body);

                req.body.name = responseString.name;

                // check if the inode details are already registered
                INode.find({
                    host: req.body.host,
                    port: req.body.port
                }).exec(function(err, inode) {
                    // if there's an error it means that the node is not regstered so the POST is OK
                    console.log(inode.length);
                    if (err || inode.length == 0) {
                        return next();
                    }

                    return res.status(400).send("The node is already registerd with the application.");
                });

            })
            .auth(req.body.username, req.body.password, false);

    }

    INode.register(app, route);

    /*
     * Change the status of the node (active or not)
     */
    app.put(config.apiRoute+'/inode/:id/status', function(req, res, next) {
        INode.findOne({
            _id: req.params.id
        }).exec(function(err, inode) {
            if (err) res.status(404).send('Integration node not found');

            inode.isActive = req.body.isActive;

            inode.save(function(err) {
                if(err) {
                    return res.status(400).send('The Integration Node was not updated');
                } 
                return res.status(200).send('The Integration Node was updated');
            });
        });
    });

    /*
     * GET the integration nodes topology
     */
    app.get(config.apiRoute+'/inode/topology', iibLayout);


    /*
     * GET the integration servers of a certain integration node :id
     */
    app.get(config.apiRoute+'/inode/:id/iservers', function(req, res, next) {

        // get the integration node data from the local api database
        INode.find({
            _id: req.params.id,
            isActive: true
        }).exec(function(err, inode) {
            if (err) return res.status(404).send('Integration node not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups";

            var options = getOptions(inode[0], apiPath, 'GET');
            // Make a request to the IIB API
            request(options, function(error, resp, body) {
                    if (error) res.status(404).send('Integration node not found');
                    else res.status(200).send(JSON.parse(body)['executionGroup']);
                })
                .auth(inode[0].username, inode[0].password, false);
        });
    });

    /*
     * GET a single integration server from the API
     */

    app.get(config.apiRoute+'/inode/:id/iservers/:iserver', function(req, res, next) {
        INode.find({
            _id : req.params.id,
            isActive: true
        }).exec(function(err, inode) {
            if (err) return res.status(404).send('Integration node not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups/" + req.params.iserver + "/?depth=2";

            var options = getOptions(inode[0], apiPath, 'GET');

            request(options, function(error, resp, body) {
                if (error) res.status(404).send('Integration server not found');
                else res.status(200).send(JSON.parse(body));
            })
            .auth(inode[0].username, inode[0].password, false);
        });
    });

    /*
     *  GET a single message flow from the API
     */

    app.get(config.apiRoute+'/inode/:id/iservers/:iserver/messageflows/:messageflow', function(req, res, next) {
        INode.find({
            _id: req.params.id,
            isActive: true
        }).exec(function(err, inode) {
            if (err) return res.status(404).send('Integration node not found');

            //build the IIB api url
            var apiPath = "/apiv1/executiongroups/" + req.params.iserver + "/messageflows/" + req.params.messageflow;
            var options = getOptions(inode[0], apiPath, 'GET');

            request(options, function(error, resp, body) {
                if (error) return status(404).send('Message flow not found');
                else res.status(200).send(JSON.parse(body));
            })
            .auth(inode[0].username, inode[0].password, false);
        });
    });

    /*
     * GET a single application from the API
     */

    app.get(config.apiRoute+'/inode/:id/iservers/:iserver/applications/:application', function(req, res, next) {
        INode.find({
            _id: req.params.id,
            isActive: true
        }).exec(function(err, inode) {
            if (err) res.status(404).send('Integration node not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups/" + req.params.iserver + "/applications/" + req.params.application + "/?depth=2";
            var options = getOptions(inode[0], apiPath, 'GET');

            request(options, function(error, resp, body) {
                if (error) res.status(404).send('Application not found');
                else res.status(200).send(JSON.parse(body));
            });
        });
    });

    /*
     * GET a single message flow from inside of an application
     */

    app.get(config.apiRoute+'/inode/:id/iservers/:iserver/applications/:application/messageflows/:messageflow', function(req, res, next) {
        INode.find({
            _id: req.params.id,
            isActive: true
        }).exec(function(err, inode) {
            if (err) return res.status(404).send('Integration node not found');

            // build the api url
            var apiPath = "/apiv1/executiongroups/" + req.params.iserver + "/applications/" + req.params.application + "/messageflows/" + req.params.messageflow;
            var options = getOptions(inode[0], apiPath, 'GET');

            request(options, function(error, resp, body) {
                if (error) res.status(404).send('Message flow not found');
                else res.status(200).send(JSON.parse(body));
            })
            .auth(inode[0].username, inode[0].password, false);
        });
    });

    /*
     * GET json data from IIB API
     */
    function iibLayout(req, res, next) {

        // get all the inodes from the database
        INode.find({
            isActive: true
        }).exec(function(err, inodes) {
            if (err) return res.status(400).send('Bad request');

            // path used on the external API
            var apiPath = "/apiv1/?depth=6";

            var index = 1;
            var validJson = false;

            async.map(inodes, function(inode) {
                var options = getOptions(inode, apiPath, 'GET');
                var inodeId = inode._id;

                // Make a request for each item and 
                request(getOptions(inode, apiPath, 'GET'), function(error, resp, body) {
                        //console.log(resp);
                        var responseString;
                        try {
                            responseString = JSON.parse(body);
                            validJson = true;
                            console.log(inode.name + " reached - " + validJson);
                        } catch (err) {
                            /*console.log(resp.headers);
                            console.log(body);*/
                            validJson = false;
                        }

                        if (validJson) {

                            var inodeData = {
                                "id": inodeId,
                                "type": "inode",
                                "name": responseString.name,
                                "size": Math.floor((Math.random() * 5000) + 100),
                                "children": []
                            };

                            // Go through all the execution groups 
                            for (var j = 0; j < responseString.executionGroups.executionGroup.length; j++) {
                                var iserverData = {
                                    'id': 'eg' + Math.floor((Math.random() * 1000) + 1),
                                    'type': "iserver",
                                    'name': responseString.executionGroups.executionGroup[j].name,
                                    'isRunning': responseString.executionGroups.executionGroup[j].isRunning,
                                    'size': Math.floor((Math.random() * 5000) + 100),
                                    'children': []
                                };
                                var chartIndex = 1;
                                for (var i = 0; i < responseString.executionGroups.executionGroup[j].messageFlows.messageFlow.length; i++) {
                                    var messageFlow = {
                                        "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                                        "type": "messageflow",
                                        "name": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].name,
                                        "isRunning": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].isRunning,
                                        "size": Math.floor((Math.random() * 5000) + 100),
                                    };
                                    console.log("      ---> " + "flow pushed");
                                    iserverData['children'].push(messageFlow);
                                    chartIndex++;
                                }

                                for (var i = 0; i < responseString.executionGroups.executionGroup[j].applications.application.length; i++) {
                                    //console.log("yo");
                                    var application = {
                                        "id": "application" + Math.floor((Math.random() * 1000) + 1),
                                        "type": "application",
                                        "name": responseString.executionGroups.executionGroup[j].applications.application[i].name,
                                        "isRunning": responseString.executionGroups.executionGroup[j].applications.application[i].isRunning,
                                        "size": Math.floor((Math.random() * 5000) + 100),
                                        "children": []
                                    };

                                    if (responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow) {
                                        for (var k = 0; k < responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow.length; k++) {
                                            var messageFlow = {
                                                "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                                                "type": "applicationflow",
                                                "name": responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow[k].name,
                                                "isRunning": responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow[k].isRunning,
                                                "size": Math.floor((Math.random() * 5000) + 100)
                                            };
                                            console.log("           --->> " + "flow pushed");
                                            application['children'].push(messageFlow);
                                        }
                                    }
                                    console.log("      --->> " + "application pushed");
                                    iserverData['children'].push(application);
                                }
                                console.log(" ---> " + "iservers pushed");
                                inodeData['children'].push(iserverData);
                            }
                            console.log(inode.name + " pushed");
                            chartData['children'].push(inodeData);
                        }

                        if (index == (inodes.length)) {
                            //console.log(chartData);
                            console.log(inode.name + " sent - " + validJson + "\n");
                            res.send(chartData);
                            index = 1;
                            chartData = {
                                "name": "IIB",
                                "children": []
                            };
                        }

                        index++;
                    })
                    // authenticate the request
                    .auth(inode.username, inode.password, false);
            });
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

    // Return middleware
    return function(req, res, next) {
        next();
    }
};
