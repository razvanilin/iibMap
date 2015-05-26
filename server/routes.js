var config = require('./config');

var routes = {};

// add routes to the object 'key is route' and 'value is the path to the controller' 
routes[config.apiRoute+'/inode'] = require('./controllers/iNodeController');
routes[config.apiRoute+'/service'] = require('./controllers/ServiceController');

module.exports = routes;