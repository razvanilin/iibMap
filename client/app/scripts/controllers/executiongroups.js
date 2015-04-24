'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:egCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('egCtrl', function($scope, Broker) {

 		$scope.egs = {};

 		//$scope.details.eg = {};
 		$scope.getEgs = function(brokerId) {
 			Broker.one(brokerId).customGET('executiongroups').then(function(data) {
 				if (data.status === 404) {
 					$scope.message = "Broker Not Found";
 				} else {
 					$scope.egs = data;
 					console.log($scope.egs);
 				}
 			});
 		};

 	});