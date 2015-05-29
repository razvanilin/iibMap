'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:AddNodeCtrl
 * @description
 * # AddNodeCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
    .controller('AddNodeCtrl', function($scope, INode, $location) {

        // variables user for feedback messages
        $scope.viewAddNode = true;
        $scope.notFound = false;
        $scope.addLoading = false;
        $scope.addSuccess = false;
        $scope.nodeExists = false;
        // ----

        $scope.inode = {
            host: '',
            port: '',
            ssl: false,
            password: '',
            username: ''
        };

        $scope.addNode = function() {
            $scope.error = false;
            $scope.notFound = false;
            $scope.addSuccess = false;
            $scope.nodeExists = false;

            if ($scope.inode.host.length > 1 && $scope.inode.port.length > 1) {
                $scope.addLoading = true;
                INode.post($scope.inode).then(function(data) {
                    console.log(data);

                    $scope.inode = {
                        host: '',
                        port: '',
                        ssl: false,
                        password: '',
                        username: ''
                    };

                    $scope.addLoading = false;
                    $scope.addSuccess = "Node added successsfully.";

                }, function(response) {
                    if (response.status === 404) {
                        $scope.notFound = response.data;
                    } else if (response.status === 400) {
                        $scope.nodeExists = response.data;
                    }
                    $scope.addLoading = false;
                });
            } else {
                $scope.error = "Make sure the required fields are completed";
            }
        }

        $scope.goBack = function() {
            $location.path('inodes');
        }
    });
