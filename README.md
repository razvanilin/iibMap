# IIB Heat Map App #

A heat map App for IIB built using MEAN stack: MongoDB, ExpressJS, AngularJS and Node.js. The app is split into two, the server API and the Angular app.

## Dev Environment Set-Up ##

### Dependencies ###
* Node.js and NPM

```
#!bash

sudo apt-get install nodejs
sudo apt-get install npm
```
or

```
#!bash

sudo yum install nodejs
sudo yum install npm
```
* Install MongoDB v2.6 or below

```
#!bash

sudo apt-get install mongodb-org
or
sudo yum install mongodb-org
```
* Install Grunt, bower and yeoman

```
#!bash

sudo npm install -g grunt-cli
sudo npm install -g bower
sudo npm install -g yo
```
* Install compass gem
```
#!bash

gem install compass
```

### Getting and setting up the project

* Clone the repository on your machine
```
#!bash

git clone https://git.hursley.ibm.com/razvanilin/iibHeatMapApp.git
```
* Navigate to the project folder and begin setup

```
#!bash

cd iibHeatMapApp/
cd server/
npm install

cd ../client/
npm install
bower install
```
* Edit API port, db host and name (server/index.js)

```
#!javascript

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
```
* Edit the IP address and port for the front-end application (client/Gruntfile.js)

```
#!javascript

connect: {
      options: {
        port: your-port,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'your-ip-address',
        livereload: 35729
      },
```
* Connect the Angular app to the server API (client/app/app.js)

```
#!javascript

.constant("CONFIG", {
        "API_HOST" : "your-api-host:port",
    })
```

# Starting the project #
* Create and start the database

```
#!bash

mongod

mongo
use heatmap
exit
```

* Start the API

```
#!bash

cd server/
node index
```
* Start the Angular app

```
#!bash

cd client/
grunt serve
```