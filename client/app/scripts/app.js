'use strict';

/**
 * @ngdoc overview
 * @name iibHeatMapApp
 * @description
 * # iibHeatMapApp
 *
 * Main module of the application.
 */
angular
    .module('iibHeatMapApp', [
        'ngResource',
        'ngRoute',
        'restangular',
        'ui.bootstrap'
    ])
    .constant("CONFIG", {
        "API_HOST": "http://localhost:8080"
    })
    .config(function($routeProvider, RestangularProvider, CONFIG) {
        RestangularProvider.setBaseUrl(CONFIG.API_HOST);
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/chart', {
                templateUrl: 'views/chart.html',
                controller: 'EgCtrl'
            })
            .when('/health', {
                templateUrl: 'views/health.html',
                controller: 'HealthCtrl'
            })
            .when('/addNode', {
              templateUrl: 'views/add-node.html',
              controller: 'AddNodeCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .factory('BrokerRestangular', function(Restangular) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setRestangularFields({
                id: '_id'
            });
        });
    })
    .factory('Broker', function(BrokerRestangular) {
        return BrokerRestangular.service('broker');
    })
    .factory('ResourceDetails', function() {
        var resource = {
            resource: {}
        };  

        return resource;
    });
    