'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:AddNodeCtrl
 * @description
 * # AddNodeCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
  .controller('AddNodeCtrl', function ($scope) {
    $scope.viewAddNode = true;
    $scope.node = {
    	host: '',
    	port: '',
    	ssl: false,
    	password: '',
    	username: ''
    };

    $scope.addNode = function() {
    	console.log($scope.node);
    }
  });
