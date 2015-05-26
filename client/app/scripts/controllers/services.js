'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:ServicesCtrl
 * @description
 * # ServicesCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
  .controller('ServicesCtrl', function ($scope, Service) {
    $scope.viewServices = true;

    $scope.services = {};

    Service.one().getList().then(function(data) {
    	console.info(data);
    	$scope.services = data;
    }, function(response) {
    	console.error(response);
    });
  });
