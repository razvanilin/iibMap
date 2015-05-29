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

    $scope.changeStatus = function(id) {
        var index = getService(id).index;

        //$scope.inodes[index].isActive = !$scope.inodes[index].isActive;

        Service.one(id).customPUT($scope.services[index], 'status').then(function(data) {
            console.log(data);
        }, function(response) {
            console.log(response);
        });
    }

    $scope.deleteService = function(id) {
        Service.one(id).remove().then(function(data) {
            var index = getService(id).index;

            $scope.services.splice(index, 1);

            console.log(data);
        }, function(response) {
            console.log(response);
        });
    };

    function getService(id) {
        var service, index;

        for (var k in $scope.services) {
            if (k == "route") break;
            if ($scope.services[k]._id == id) {
                service = $scope.services[k];
                index = k;
                break;
            }
        }

        return {
            index: index,
            service: service
        };
    }
  });
