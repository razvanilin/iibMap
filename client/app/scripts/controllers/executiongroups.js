'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:egCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('egCtrl', function($scope, Broker, ResourceDetails) {
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

 		this.getEgs = function(brokerId) {
 			Broker.one(brokerId).customGET('executiongroups').then(function(data) {
 				if (data.status === 404) {
 					$scope.message = "Broker Not Found";
 				} else {
 					$scope.egs = data;
 					ResourceDetails.resource = $scope.egs;
 					console.log($scope.egs);
 				}
 			});
 		};

 		this.test = function() {
 			$scope.testMsg = "something";
 			console.log($scope.testMsg);
 		};

 	});