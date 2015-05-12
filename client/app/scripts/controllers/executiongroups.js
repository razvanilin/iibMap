'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:egCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('EgCtrl', function($scope, INode, ResourceDetails) {
 		$scope.egs = {};

 		// used for the navbar active selection
 		$scope.viewChart = true;

 		//$scope.details.eg = {};
 		$scope.getEgs = function(brokerId) {
 			INode.one(brokerId).customGET('executiongroups').then(function(data) {
 				if (data.status === 404) {
 					$scope.message = "Integration Node not found";
 				} else {
 					$scope.egs = data;
 					console.log($scope.egs);
 				}
 			});
 		};

 		this.getEgs = function(inodeId) {
 			INode.one(inodeId).customGET('executiongroups').then(function(data) {
 				if (data.status === 404) {
 					$scope.message = "Integration Node not found";
 				} else {
 					$scope.egs = data;
 					ResourceDetails.resource = $scope.egs;
 					console.log($scope.egs);
 				}
 			});
 		};

 	});