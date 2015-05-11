var restful = require('node-restful');
var request = require('request');

var chartData = {
    "name": "IIB",
    "children": []
};

module.exports = function(app, route) {
    // Setup controller for REST
    var Broker = restful.model(
        'broker',
        app.models.broker
    ).methods(['get', 'put', 'post', 'delete']).before('get', function(req, res, next) {
        // workaround for when ther user requests all the documents
        // should work without, but it doesn't - TODO: find out why
        if (!req.params.id || req.params.id.length < 1)
            Broker.find().exec(function(err, users) {
                res.send(users);
            });
        else
            next();
    });

    Broker.register(app, route);


    /*
     * GET the brokers topology
     */
    app.get('/broker/topology', iibLayout);


    /*
     * GET the execution group of a certain broker :id
     */
    app.get('/broker/:id/executiongroups', function(req, res, next) {

        // get the broker data from the local api database
        Broker.find({
            _id: req.params.id
        }).exec(function(err, broker) {
            if (err) return res.status(404).send('Integration node not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups";

            var options = getOptions(broker[0], apiPath, 'GET');
            // Make a request to the IIB API
            request(options, function(error, resp, body) {
                if (error) res.status(404).send('Integration server not found');
                else res.status(200).send(JSON.parse(body)['executionGroup']);
            })
            .auth(broker[0].username, broker[0].password, false);
        });
    });

    /*
     * GET json data from IIB API
     */
    function iibLayout(req, res, next) {

        // get all the brokers from the database
        Broker.find().exec(function(err, brokers) {
            if (err) return res.status(400).send('Bad request');

            // path used on the external API
            var apiPath = "/apiv1/?depth=4";

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

                    var brokerData = {
                        "id": brokers[brokerIndex]['_id'],
                        "type": responseString.type,
                        "name": responseString.name,
                        "children": []
                    };
                    brokerIndex++;

                    // Go through all the execution groups 
                    for (var j = 0; j < responseString.executionGroups.executionGroup.length; j++) {
                        var tempData = {
                            'id': 'eg' + Math.floor((Math.random() * 1000) + 1),
                            'type': responseString.executionGroups.type,
                            'name': responseString.executionGroups.executionGroup[j].name,
                            'isRunning': responseString.executionGroups.executionGroup[j].isRunning,
                            'children': []
                        };
                        var chartIndex = 1;
                        for (var i = 0; i < responseString.executionGroups.executionGroup[j].messageFlows.messageFlow.length; i++) {
                            var messageFlow = {
                                "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                                "type": responseString.executionGroups.executionGroup[j].messageFlows.type,
                                "name": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].name,
                                "isRunning": responseString.executionGroups.executionGroup[j].messageFlows.messageFlow[i].isRunning,
                                "size": Math.floor((Math.random() * 5000) + 100)
                            };
                            tempData['children'].push(messageFlow);
                            chartIndex++;
                        }
                        brokerData['children'].push(tempData);
                    }
                    chartData['children'].push(brokerData);

                    if (index == (brokers.length)) {
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

            // call the iib API for each broker in the database
            for (var i = 0; i < brokers.length; i++) {
                var options = getOptions(brokers[i], apiPath, 'GET');

                console.log(options.headers);
                // send a request using the options and using the auth() method for authentication
                request(getOptions(brokers[i], apiPath, 'GET'), callBack)
                    .auth(brokers[i].username, brokers[i].password, false);
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
