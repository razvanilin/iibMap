/*var fsCpu = require('fs');
var fsMem = require('fs');
var cpuFile = 'data.in';
var memFile = 'dataMem.in';
var broadcastCpu;
var broadcastMem;*/

var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

var app = express();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

//app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});*/

mongoose.connect('mongodb://localhost/heatmap');
mongoose.connection.once('open', function() {

        // Load the models
        app.models = require('./models/index');

        // Load the routes
        var routes = require('./routes');

        _.each(routes, function(controller, route) {
                app.use(route, controller(app, route));
        });

        console.log('Listening on port 8080...');
        app.listen(8080);
});


//module.exports = app;

//http.listen(8080);

// ACTIONS
/*fsMem.watch(memFile, function (event, filename) {
    if (filename) {
        fsMem.readFile(memFile, "utf-8", function(err, data) {
            if (err) throw err;
            //console.log(data);
            broadcastMem = data;
        });
        io.emit('mem', broadcastMem); 
    
    } else {
        console.log('filename not provided');
    }
});


fsCpu.watch(cpuFile, function (event, filename) {
    if (filename) {
        fsCpu.readFile(cpuFile, "utf-8", function(err, data) {
            if (err) throw err;
            //console.log(data);
            broadcastCpu = data;
        });
        io.emit('cpu', broadcastCpu); 
    
    } else {
        console.log('filename not provided');
    }
});*/