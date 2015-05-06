'use strict';

/**
 * @ngdoc function
 * @name iibHeatMapApp.controller:chartCtrl
 * @description
 * # chartCtrl
 * Controller of the iibHeatMapApp
 */

angular.module('iibHeatMapApp')
    .controller('chartCtrl', function($scope, Broker) {
        $scope.chart = {};
        $scope.chart.size = chartSize();

        var margin = 20;
        var color = d3.scale.linear()
            .domain([-1, 3])
            .range(["hsl(152,80%,0%)", "hsl(228,30%,70%)"])
            .interpolate(d3.interpolateHcl);

        var pack = d3.layout.pack()
            .padding(2)
            .size([$scope.chart.size - margin, $scope.chart.size - margin])
            .value(function(d) {
                return d.size;
            });

        var svg = d3.select("div#chart-content svg")
            .attr("id", "circle")
            .attr("width", $scope.chart.size)
            .attr("height", $scope.chart.size)
            .style("border-radius", "50px")
            .select("g")
            .attr("transform", "translate(" + $scope.chart.size / 2 + "," + $scope.chart.size / 2 + ")");
        console.log(svg.attr('id'));

        //$scope.chart.map = { name: "something", active: "true"};

        /*d3.json('http://localhost:8080/broker/getJson', function(error, root) {
            $scope.chart.map = root;
            console.log($scope.chart.map);
        });*/
        Broker.one('getJson').get().then(function(data) {
            $scope.chart.map = data;
            var root = data;

            var focus = data,
                nodes = pack.nodes(data),
                view;

            setTimeout(function() {
                var circle = svg.selectAll("circle")
                    .data(nodes)
                    .style({
                        "fill": function(d) {
                            return d.children ? color(d.depth) : null;
                        },
                        "display": "inline-block"
                    })
                    .on("click", function(d) {
                        if (focus !== d) zoom(d), d3.event.stopPropagation();
                    });

                var text = svg.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("class", "label")
                    .style("fill-opacity", function(d) {
                        return d.parent === root ? 1 : 0;
                    })
                    .style("display", function(d) {
                        return d.parent === root ? null : "none";
                    })
                    //.style("display", function(d) { if (d.attr('class')) })
                    .text(function(d) {
                        return d.name;
                    });

                var node = svg.selectAll("circle,text");

                d3.select("svg")
                    .style("background", color(-1))
                    .on("click", function() {
                        zoom(root);
                    });

                zoomTo([root.x, root.y, root.r * 2 + margin]);

                function zoom(d) {
                    var focus0 = focus;
                    focus = d;

                    var transition = d3.transition()
                        .duration(d3.event.altKey ? 7500 : 750)
                        .tween("zoom", function(d) {
                            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                            return function(t) {
                                zoomTo(i(t));
                            };
                        });

                    transition.selectAll("text")
                        .filter(function(d) {
                            return d.parent === focus || this.style.display === "inline";
                        })
                        .style("fill-opacity", function(d) {
                            return d.parent === focus ? 1 : 0;
                        })
                        .each("start", function(d) {
                            if (d.parent === focus) this.style.display = "inline";
                        })
                        .each("end", function(d) {
                            if (d.parent !== focus) this.style.display = "none";
                        });
                }

                function zoomTo(v) {
                    var k = $scope.chart.size / v[2];
                    view = v;
                    node.attr("transform", function(d) {
                        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                    });
                    circle.attr("r", function(d) {
                        return d.r * k;
                    }).attr("z-index", "-1");
                }
            }, 1000);
        });

    });


function chartSize() {
    return (($(document).width() + $(document).height()) / 2) / 1.8
};
