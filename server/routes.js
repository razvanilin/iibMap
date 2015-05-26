var config = require('./config');

var routes = {};
routes[config.apiRoute+'/inode'] = require('./controllers/iNodeController');

module.exports = routes;