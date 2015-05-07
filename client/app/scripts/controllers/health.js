'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:HealthCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('HealthCtrl', function($scope, Broker) {
 		$scope.health = {};

 		Broker.getList().then(function(brokers) {
 			$scope.health = brokers;
 			console.log($scope.health);
 		});
 	});