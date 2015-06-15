angular.module('iibHeatMapApp')
    .directive('chart', function($parse, $window, $timeout, Charts) {
        return {
            restrict: 'A',
            scope: {
                datajson: '=',
                chartType: '=',
                getResources: '&getResources'
            },
            link: function(scope, elem, attrs, Ctrl) {

                /* Callback used to get the properties of the clicked elements
                 * This is called on the D3 click event
                 */
                var getResources = function(inodeId, iserver, application, messageflow, type, name) {
                    scope.getResources({
                        inodeId: inodeId,
                        iserver: iserver,
                        application: application,
                        messageflow: messageflow,
                        type: type,
                        name: name
                    });
                };

                var circleChart = Charts[scope.chartType];

                circleChart.initialise(scope.datajson);
                var svg = circleChart.generateGraph(getResources);
                svg = angular.element(svg);

            }
        }
    });