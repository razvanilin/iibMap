'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:HealthCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('HealthCtrl', function($scope, INode) {
 		$scope.health = {};
 		$scope.isLoading = true;

 		//used for the navbar active selection
 		$scope.viewHealth = true;

 		INode.one('topology').get().then(function(brokers) {
 			$scope.topology = brokers;
 			$scope.isLoading = false;
 			console.log($scope.topology);
 		});
 	});