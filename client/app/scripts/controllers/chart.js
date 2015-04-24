'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:chartCtrl
 * @description
 * # chartCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('chartCtrl', function($scope, Broker) {
 		$scope.chart = {};

 		Broker.one('getJson').get().then(function(data) {
 			$scope.chart = data;
 			console.log($scope.chart);
 		});
 	});