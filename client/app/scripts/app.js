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
    'restangular'
  ])
  .constant("CONFIG", {
    "API_HOST": "http://localhost:3000"
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
