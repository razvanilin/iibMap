var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');
var cors = require('cors');

var app = express();
app.config = require('./config');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});*/
app.use(cors());

// routes for the production version after running grunt build in the front end app
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/bower_components", express.static(path.join(__dirname, 'public/bower_components')));
app.use("/images", express.static(path.join(__dirname, 'public/images')));
app.use("/scripts", express.static(path.join(__dirname, 'public/scripts')));
app.use("/styles", express.static(path.join(__dirname, 'public/styles')));
app.use("/views", express.static(path.join(__dirname, 'public/views')));

app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});


// For cloud deployment
var dbHost;
if (process.env.VCAP_SERVICES) {
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
    dbHost = vcapServices['mongodb'][0].credentials.url;
} else {
    dbHost = app.config.dbhost;
}

var port = process.env.VCAP_APP_PORT || 8080;

mongoose.connect(dbHost);
mongoose.connection.once('open', function() {

        // Load the models
        app.models = require('./models/index');

        // Load the routes
        var routes = require('./routes');

        _.each(routes, function(controller, route) {
                app.use(route, controller(app, route));
        });

        console.log('Listening on port ' + port);
        app.listen(port);
});