'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:TabsDetailsCtrl
 * @description
 * # TabsDetailsCtrl
 * Controller of the iibHeatMapApp
 */
angular.module('iibHeatMapApp')
  .controller('TabsDetailsCtrl', function ($scope) {
    $scope.tabs = [
    	{ title: 'Resources', content: '' },
    	{ title: 'Details 1', content: '' },
    	{ title: 'Details 2', content: '' }
    ];
  });
