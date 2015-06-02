'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:HealthCtrl
 * @description
 * # egCtrl
 * Controller of the iibHeatMapApp
 */

angular.module('iibHeatMapApp')
    .controller('HealthCtrl', function($scope, Service) {
        $scope.health = {};
        $scope.isLoading = true;
        $scope.searchquery = "";
        $scope.healthQuery = "";

        $scope.services = [];

         //used for the navbar active selection
        $scope.viewHealth = true;

        Service.one('health').get().then(function(services) {
            $scope.services = services;
            $scope.isLoading = false;
            console.log(services);
        });

        $scope.changeHealthQuery = function(value) {
            console.log($scope.healthQuery);
            // workaround on getting the All radio button selected first
            $scope.healthQuery = value - 1;

            if(value == 0) {
                $scope.healthQuery = "";
            }
        };

        /*$scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };

       

        INode.one('topology').get().then(function(inodes) {
            $scope.topology = inodes;
            $scope.isLoading = false;
            console.log($scope.topology);
        });*/
    });
