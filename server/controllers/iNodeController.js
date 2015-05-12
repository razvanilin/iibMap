var restful = require('node-restful');
var request = require('request');

var chartData = {
    "name": "IIB",
    "children": []
};

module.exports = function(app, route) {
    // Setup controller for REST
    var INode = restful.model(
        'inode',
        app.models.inode
    ).methods(['get', 'put', 'post', 'delete']).before('get', function(req, res, next) {
        // workaround for when ther user requests all the documents
        // should work without, but it doesn't - TODO: find out why
        if (!req.params.id || req.params.id.length < 1)
            INode.find().exec(function(err, users) {
                res.send(users);
            });
        else
            next();
    });

    INode.register(app, route);


    /*
     * GET the integration nodes topology
     */
    app.get('/inode/topology', iibLayout);


    /*
     * GET the integration servers of a certain integration node :id
     */
    app.get('/inode/:id/iservers', function(req, res, next) {

        // get the integration node data from the local api database
        INode.find({
            _id: req.params.id
        }).exec(function(err, inode) {
            if (err) return res.status(404).send('Integration node not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups";

            var options = getOptions(inode[0], apiPath, 'GET');
            // Make a request to the IIB API
            request(options, function(error, resp, body) {
                    if (error) res.status(404).send('Integration server not found');
                    else res.status(200).send(JSON.parse(body)['executionGroup']);
                })
                .auth(inode[0].username, inode[0].password, false);
        });
    });

    /*
     * GET the message flows of a certain integration server
     */

    /*app.get('broker/:id/executiongroups/:executiongroup', function() {
        Broker.find({
            _id : req.params.id
        }).exec(function(err, iNode) {

        });
    });*/

    /*
     * GET json data from IIB API
     */
    function iibLayout(req, res, next) {

        // get all the inodes from the database
        INode.find().exec(function(err, inodes) {
            if (err) return res.status(400).send('Bad request');

            // path used on the external API
            var apiPath = "/apiv1/?depth=6";

            var index = 1;
            var brokerIndex = 0;
            var validJson = false;

            var callBack = function(error, resp, body) {
                // console.log(body);
                var responseString;
                try {
                    responseString = JSON.parse(body);
                    validJson = true
                } catch (err) {
                    /*console.log(resp.headers);
                    console.log(body);*/
                    validJson = false;
                }

                if (validJson) {

                    var inodeData = {
                        "id": inodes[brokerIndex]['_id'],
                        "type": responseString.type,
                        "name": responseString.name,
                        "size": Math.floor((Math.random() * 5000) + 100),
                        "children": []
                    };
                    brokerIndex++;

                    // Go through all the execution groups 
                    for (var j = 0; j < responseString.executionGroups.executionGroup.length; j++) {
                        var iserverData = {
                            'id': 'eg' + Math.floor((Math.random() * 1000) + 1),
                            'type': responseString.executionGroups.type,
                            'name': responseString.executionGroups.executionGroup[j].name,
                            'isRunning': responseString.executionGroups.executionGroup[j].isRunning,
                            'size': Math.floor((Math.random() * 5000) + 100),
                            'children': []
                        };
                        var chartIndex = 1;
                        for (var i = 0; i < responseString.executionGroups.executionGroup[j].messageFlows.messageFlow.length; i++) {
                            var messageFlow = {
                                "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                                "type": responseString.executionGroups.executionGroup[j].messageFlows.type,
                                "name": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].name,
                                "isRunning": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].isRunning,
                                "size": Math.floor((Math.random() * 5000) + 100),
                            };
                            iserverData['children'].push(messageFlow);
                            chartIndex++;
                        }

                        for (var i = 0; i < responseString.executionGroups.executionGroup[j].applications.application.length; i++) {
                            //console.log("yo");
                            var application = {
                                "id": "application" + Math.floor((Math.random() * 1000) + 1),
                                "type": responseString.executionGroups.executionGroup[j].applications.type,
                                "name": responseString.executionGroups.executionGroup[j].applications.application[i].name,
                                "isRunning": responseString.executionGroups.executionGroup[j].applications.application[i].isRunning,
                                "size": Math.floor((Math.random() * 5000) + 100),
                                "children": []
                            };

                            console.log(responseString.executionGroups.executionGroup[j].applications.application[i]);

                            if (responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow) {
                                for (var k = 0; k < responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow.length; k++) {
                                    var messageFlow = {
                                        "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                                        "type": responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.type,
                                        "name": responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow[k].name,
                                        "isRunning": responseString.executionGroups.executionGroup[j].applications.application[i].messageFlows.messageFlow[k].isRunning,
                                        "size": Math.floor((Math.random() * 5000) + 100)
                                    };
                                    application['children'].push(messageFlow);
                                }
                            }

                            iserverData['children'].push(application);
                        }

                        inodeData['children'].push(iserverData);
                    }
                    chartData['children'].push(inodeData);

                    if (index == (inodes.length)) {
                        //console.log(chartData);
                        res.send(chartData);
                        index = 1;
                        chartData = {
                            "name": "IIB",
                            "children": []
                        };
                    }

                }
                index++;
            }

            // call the iib API for each integration node in the database
            for (var i = 0; i < inodes.length; i++) {
                var options = getOptions(inodes[i], apiPath, 'GET');

                console.log(options.headers);
                // send a request using the options and using the auth() method for authentication
                request(getOptions(inodes[i], apiPath, 'GET'), callBack)
                    .auth(inodes[i].username, inodes[i].password, false);
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

    // Return middleware
    return function(req, res, next) {
        next();
    }
};
