'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:AddNodeCtrl
 * @description
 * # AddNodeCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
  .controller('AddNodeCtrl', function ($scope, INode) {
    $scope.viewAddNode = true;
    $scope.inode = {
    	host: '',
    	port: '',
    	ssl: false,
    	password: '',
    	username: ''
    };

    $scope.addNode = function() {
    	console.log($scope.inode);
    	INode.post($scope.inode).then(function(data) {
    		console.log(data);
    	}, function(response) {
    		console.log(response);
    	});
    }
  });
