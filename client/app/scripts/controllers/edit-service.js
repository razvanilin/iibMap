'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:EditServiceCtrl
 * @description
 * # EditServiceCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
    .controller('EditServiceCtrl', function($scope, INode, Service) {
        $scope.loading = true;
        $scope.flows = [];
        $scope.flowsLoading = true;
        INode.one('topology').get().then(function(topology) {
            var inodes = topology.children;
            var flowIndex = 0;
            // go through the topology and extract all the flows
            for (var i = 0; i < inodes.length; i++) {
                // console.log(inodes[i]);
                for (var iserver = 0; iserver < inodes[i].children.length; iserver++) {
                    for (var flow = 0; flow < inodes[i].children[iserver].children.length; flow++) {
                        if (inodes[i].children[iserver].children[flow].type == "messageflow") {
                            $scope.flows.push({
                                id: flowIndex,
                                name: inodes[i].children[iserver].children[flow].name,
                                isRunning: inodes[i].children[iserver].children[flow].isRunning,
                                iserver: inodes[i].children[iserver].name,
                                inode: inodes[i].id,
                                inodeName: inodes[i].name,
                                application: "",
                                selected: false
                            });
                            flowIndex++;
                        } else {
                            for (var app = 0; app < inodes[i].children[iserver].children[flow].children.length; app++) {
                                $scope.flows.push({
                                    id: flowIndex,
                                    name: inodes[i].children[iserver].children[flow].children[app].name,
                                    isRunning: inodes[i].children[iserver].children[flow].children[app].isRunning,
                                    iserver: inodes[i].children[iserver].name,
                                    inode: inodes[i].id,
                                    inodeName: inodes[i].name,
                                    application: inodes[i].children[iserver].children[flow].name,
                                    selected: false
                                });
                                flowIndex++;
                            }
                        }
                    }
                }
            }
            $scope.flowsLoading = false;
            // console.log($scope.flows);
        });
    });
