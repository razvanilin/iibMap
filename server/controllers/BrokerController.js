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
    ).methods(['get', 'put', 'post', 'delete']
    ).before('get', function(req, res, next) {
        // workaround for when ther user requests all the documents
        // should work without, but it doesn't - TODO: find out why
        if (req.params.id.length < 1)
            Broker.find().exec(function(err, users) {
                res.send(users);
            });
        else 
            next();
    }
    ).route('/getJson', ['get'], iibAPI);

    Broker.register(app, route);

    app.get('/broker/getJson', iibAPI);

    // get json data from IIB API
    function iibAPI (req, res, next) {

        var path = "/apiv1/executiongroups/?depth=3";

        var options = {
            url: "",
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }

        var calls = ["http://localhost:4415", "http://localhost:4417"];
        var index = 1;

        var callBack = function(error, resp, body) {
            var responseString = JSON.parse(body);
            
            var brokerData = {
                "id": "broker" + Math.floor((Math.random() * 100) + 1),
                "name": "BrokerPrime" + Math.floor((Math.random() * 100) + 1),
                "children": []
            };

            for (var j = 0; j < responseString['executionGroup'].length; j++) {
                //var tempData = [];
                var tempData = {
                    'id': 'eg' + Math.floor((Math.random() * 100) + 1),
                    'name': responseString['executionGroup'][j]['name'] + Math.floor((Math.random() * 100) + 1),
                    'children': []
                };
                //tempData['children'] = [];
                var chartIndex = 1;
                for (var i = 0; i < responseString['executionGroup'][j]['messageFlows']['messageFlow'].length; i++) {
                    var messageFlow = {
                        "id": "flow" + chartIndex,
                        "name": responseString['executionGroup'][j]['messageFlows']['messageFlow'][i]['name'] + Math.floor((Math.random() * 100) + 1),
                        "size": 3000
                    };
                    tempData['children'].push(messageFlow);
                    //console.log(tempData);
                    chartIndex++;
                }
                brokerData['children'].push(tempData);
            }
            //console.log(index);
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
            options['url'] = calls[i] + path;
            request(options, callBack);
        }

    }

    // Return middleware
    return function(req, res, next) {
        next();
    }
};
