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

    app.get('/broker/getJson', iibLayout);

    app.get('/broker/:id/executiongroups', function(req, res, next) {

        // get the broker data from the local api database
        Broker.find({_id: req.params.id}).exec(function(err, broker) {
            if (err) return res.status(404).send('Broker not found');

            // build the IIB api url
            var apiPath = "/apiv1/executiongroups";
            var apiUrl = "http://"+broker[0].host+":"+broker[0].port+"/"+apiPath;

            var options = {
                url: apiUrl,
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }

            // Make a request to the IIB API
            request(options, function(error, resp, body) {
                res.status(200).send(JSON.parse(body)['executionGroup']);
            });
        });
    });

    // get json data from IIB API
    function iibLayout(req, res, next) {

        // get all the brokers from the database
        Broker.find().exec(function(err, brokers) {
            if (err) return res.status(400).send('Bad request');

            var calls = [];
            for (var i=0; i<brokers.length; i++) {
                var brokerHost = "http://"+brokers[i]['host']+":"+brokers[i]['port'];
                calls.push(brokerHost);
            }


            // path used on the external API
            var apiPath = "/apiv1/?depth=4";

            // options used when making the call
            var options = {
                url: "",
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }

            //var calls = ["http://localhost:4415", "http://localhost:4417"];
            var index = 1;
            var brokerIndex = 0;

            var callBack = function(error, resp, body) {
                var responseString = JSON.parse(body);

                var brokerData = {
                    "id": brokers[brokerIndex]['_id'],
                    "type": responseString['type'],
                    "name": responseString['name'],
                    "children": []
                };
                brokerIndex++;

                // Go through all the execution groups 
                for (var j = 0; j < responseString['executionGroups']['executionGroup'].length; j++) {
                    var tempData = {
                        'id': 'eg'+Math.floor((Math.random() * 1000) + 1),
                        'type': responseString['executionGroups']['type'],
                        'name': responseString['executionGroups']['executionGroup'][j]['name'],
                        'children': []
                    };
                    var chartIndex = 1;
                    for (var i = 0; i < responseString['executionGroups']['executionGroup'][j]['messageFlows']['messageFlow'].length; i++) {
                        var messageFlow = {
                            "id": "flow" + Math.floor((Math.random() * 1000) + 1),
                            "type": responseString['executionGroups']['executionGroup'][j]['messageFlows']['type'],
                            "name": responseString['executionGroups']['executionGroup'][j]['messageFlows']['messageFlow'][i]['name'],
                            "size": Math.floor((Math.random() * 5000) + 100)
                        };
                        tempData['children'].push(messageFlow);
                        chartIndex++;
                    }
                    brokerData['children'].push(tempData);
                }
                chartData['children'].push(brokerData);

                if (index == (calls.length)) {
                    res.send(chartData);
                    index = 1;
                    chartData = {
                        "name": "IIB",
                        "children": []
                    };
                }
                index++;
            }

            for (var i = 0; i < calls.length; i++) {
                options['url'] = calls[i] + apiPath;
                request(options, callBack);
            }
        });

    }

    // Return middleware
    return function(req, res, next) {
        next();
    }
};
