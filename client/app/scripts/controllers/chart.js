'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:ChartCtrl
 * @description
 * # ChartCtrl
 * Controller of the iibHeatMapApp
 */

 angular.module('iibHeatMapApp')
 	.controller('ChartCtrl', function($scope, INode, ResourceDetails, CONFIG) {
 		$scope.resource = {};
 		$scope.topology = CONFIG.TOPOLOGY;
 		$scope.selectedElement = "";
 		$scope.showResources = false;

 		// used for the navbar active selection
 		$scope.viewChart = true;

 		this.getResources = function(inodeId, iserver, application, messageflow, type, name) {
 			$scope.selectedElement = name;
 			$scope.resource.type = type;
 			var route = "iservers";

 			if (iserver !== null) {
 				route += "/" + iserver;
 			}
 			if (application !== null) {
 				route += "/applications/" + application;
 			}
 			if (messageflow !== null) {
 				route += "/messageflows/" + messageflow; 
 			}

 			INode.one(inodeId).customGET(route).then(function(data) {
 				if (data.status === 404) {
 					$scope.message = "Integration Node not found";
 				} else {
 					$scope.showResources = true;
 					$scope.resource = data;
 					$scope.resource.type = type;
 					console.log($scope.resource);
 				}
 			});
 		};

 	});