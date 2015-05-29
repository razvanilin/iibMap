'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:AddserviceCtrl
 * @description
 * # AddserviceCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
    .controller('AddserviceCtrl', function($scope, $location, INode, Service) {
        $scope.viewServices = true;
        $scope.error = false;
        $scope.searchquery = "";
        $scope.service = {
            name: "",
            flows: [],
            isActive: true
        };

        $scope.flows = [];

        $scope.selectFlows = function() {
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
        };

        $scope.makeSelection = function(id) {
            $scope.flows[id].selected = !$scope.flows[id].selected;
            console.log($scope.flows[id].selected);
        };

        $scope.addService = function() {
            $scope.addLoading = true;
            $scope.error = false;

            $scope.service.flows = [];
            // go through all the flows and add the selected flows to the service flows array
            for (var i = 0; i < $scope.flows.length; i++) {
                if ($scope.flows[i].selected) {
                    $scope.service.flows.push($scope.flows[i]);
                }
            }

            if ($scope.service.flows.length < 1) {
            	$scope.error = "Please select at least one Message Flow";
            } else {
            	// REST
            	Service.post($scope.service).then(function(data) {
            		console.log(data);
            		$location.path("services");
            	}, function(response) {
            		console.error(response);
            	});
            }

            $scope.addLoading = false;
            console.log($scope.service.flows);
            
        };

        $scope.goBack = function() {
            $location.path('services');
        };
    });
