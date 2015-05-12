'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:AddNodeCtrl
 * @description
 * # AddNodeCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
    .controller('AddNodeCtrl', function($scope, INode) {
        $scope.viewAddNode = true;
        $scope.inode = {
            host: '',
            port: '',
            ssl: false,
            password: '',
            username: ''
        };

        $scope.addNode = function() {

            if ($scope.inode.host.length > 1 && $scope.inode.port.length > 1) {
                INode.post($scope.inode).then(function(data) {
                    console.log(data);

                    $scope.inode = {
                        host: '',
                        port: '',
                        ssl: false,
                        password: '',
                        username: ''
                    };

                }, function(response) {
                    console.log(response);
                });
            } else {
                $scope.error = "Make sure the required fields are completed";
            }
        }
    });
