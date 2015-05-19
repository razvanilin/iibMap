'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:ManageCtrl
 * @description
 * # ManageCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
  .controller('ManageCtrl', function ($scope, INode, $location) {
    $scope.viewManage = true;
    $scope.confirmDelete = false;

    $scope.inodes = {};

    INode.one().getList().then(function(inodes) {
    	$scope.inodes = inodes;
    	for (var k in inodes) {
    		if (k == "route") {
    			break;
    		}
    		console.log(k);
    		$scope.inodes[k].confirmDelete = false;
    	}
    	console.log($scope.inodes);

    });

    $scope.confirm = function(id) {
    	var index = getNode(id).index;

    	$scope.inodes[index].confirmDelete = !$scope.inodes[index].confirmDelete
    	/*for (var k in $scope.inodes) {
    		if (k == "route") {
    			break;
    		}
    		if ($scope.inodes[k]._id == id) {
    			$scope.inodes[k].confirmDelete = !$scope.inodes[k].confirmDelete;
    			console.log($scope.inodes[k].confirmDelete);
    			break;
    		}
    	}*/
    };

    $scope.delete = function(id) {
    	INode.one(id).remove().then(function(data) {
    		var index = getNode(id).index;

    		$scope.inodes.splice(index, 1);

    		console.log(data);
    	}, function(response) {
    		console.log(response);
    	});
    };

    $scope.changeStatus = function(id) {
    	var index = getNode(id).index;

    	//$scope.inodes[index].isActive = !$scope.inodes[index].isActive;

    	INode.one(id).customPUT($scope.inodes[index], 'status').then(function(data) {
    		console.log(data);
    	}, function(response) {
    		console.log(response);
    	});
    };

    $scope.editNode = function(id) {
        $location.path('manage/editNode/'+id);
    }

    /*
     *	Get the node and its index into an array: [index, node]
     */
    function getNode(id) {
    	var node, index;

    	for (var k in $scope.inodes) {
    		if (k == "route") break;
    		if ($scope.inodes[k]._id == id) {
    			node = $scope.inodes[k];
    			index = k;
    			break;
    		}
    	}

    	return {
    		index: index,
    		node: node
    	};
    }
  });
