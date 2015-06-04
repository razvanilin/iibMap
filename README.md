# IBM Integration Bus Map App #

A map app for IIB built using the MEAN stack: MongoDB, ExpressJS, AngularJS and Node.js. The app is split into two, the server API and the Angular app.

![alt tag](https://github.com/razvanilin/iibMap/blob/develop/demo.JPG)

## Dev Environment Set-Up ##

### Dependencies ###

* Node.js and NPM

```

sudo apt-get install nodejs
sudo apt-get install npm
```
or

```

sudo yum install nodejs
sudo yum install npm
```

* Install MongoDB v2.6 or below

```
sudo apt-get install mongodb-org
or
sudo yum install mongodb-org
```

* Install Grunt, bower and yeoman

```
sudo npm install -g grunt-cli
sudo npm install -g bower
sudo npm install -g yo
```

* Install compass gem

```
gem install compass
```

### Getting and setting up the project

* Clone the repository on your machine

```
git clone https://github.com/razvanilin/iibMap.git
```

* Navigate to the project folder and begin setup

```
cd iibHeatMapApp/
cd server/
npm install

cd ../client/
npm install
bower install
```

* Edit API port, db host and other config (server/config.js)

```
module.exports = {
    dbhost: 'mongodb://localhost/heatmap',
    port: 8080,
    secret: 'place-your-key-here',
    apiRoute: '/apiv0'
};
```

* Edit the IP address and port for the front-end application (client/Gruntfile.js)

```
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
.constant("CONFIG", {
        "API_HOST": "http://localhost:8080",
        "TOPOLOGY": "http://localhost:8080/apiv0/inode/topology",
        "API_ROUTE": "apiv0"
    })
```

# Starting the project #

* Create and start the database

```
mongod

mongo
use heatmap
exit
```

* Start the API

```
cd server/
node index
```

* Start the Angular app

```
cd client/
grunt serve
```

# Play with it #
You can access the application at the address you placed in Gruntfile.js 

# Deploy it #
Not quite ready for production but, hey, it can be done!

* You need a webserver for this - I use Apache
* You have to build the front end application
```
cd client/
grunt build
```
* A `dist` folder was created in the `client/` and we need to point Apache to it. Below is an example of the Apache configuration
```
<VirtualHost *:80>
        ServerAdmin webmaster@localhost

        DocumentRoot /var/www/iibMap/client/dist

        <Directory /var/www/iibMap/client/dist>
                Options Indexes FollowSymLinks MultiViews
                AllowOverride None
                Order allow,deny
                allow from all
        </Directory>
</VirtualHost>
```
* After doing this make sure you restart Apache with `service apache2 restart` or `systemctl restart httpd`
* And the last bit is to start your Node API
```
cd server/
node index
```
### That's it, you should be able to go to yourawesomewebsite.com and play with the applicaiton ###
