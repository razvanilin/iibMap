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

 		//used for the navbar active selection
 		$scope.viewHealth = true;

 		Broker.one('topology').get().then(function(brokers) {
 			$scope.topology = brokers;
 			console.log($scope.topology);
 		});
 	});