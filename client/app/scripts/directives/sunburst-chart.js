angular.module('iibHeatMapApp')
    .directive('sunburstChart', function($parse, $window, $compile) {
        return {
            restrict: 'A',
            scope: {
                datajson: '='
            },
            require: '^ngController',
            link: function(scope, elem, attrs, Ctrl) {

                var sunburstChart = new SunburstChart(scope.datajson);
                sunburstChart.initialise(scope.datajson, Ctrl);
                var svg = sunburstChart.generateGraph();
                svg = angular.element(svg);

            }
        }
    });

var SunburstChart = Class.create({
    initialise: function(datajson, ChartCtrl) {
        this.datajson = datajson;
        this.chartCtrl = ChartCtrl;
    },

    generateGraph: function() {

        var chartCtrl = this.chartCtrl;

        function chartSize() {
            return (($(document).width() + $(document).height()) / 2) / 1.8;
        };

        var width = chartSize(),
            height = chartSize(),
            radius = Math.min(width, height) / 2.1;

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.linear()
            .range([0, radius]);

        var color = d3.scale.category20b();

        var svg = d3.select("div#chart-content").append("svg")
            .attr("id", "sunburst")
            .attr("width", width)
            .attr("height", height)
            //.attr("class", "chart-area deactivate")
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

        var partition = d3.layout.partition()
            .value(function(d) {
                return d.size;
            });

        var arc = d3.svg.arc()
            .startAngle(function(d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
            })
            .endAngle(function(d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
            })
            .innerRadius(function(d) {
                return Math.max(0, y(d.y));
            })
            .outerRadius(function(d) {
                return Math.max(0, y(d.y + d.dy));
            });

        var root = this.datajson;

        // check if there was an error response from the server
        if (root['code']) {
            $("div#chart-content").html("<h2>No active integration nodes</h2>");
            return console.log(root);
        } else {
            $("div#chart-content").remove("h2");
        }

        var g = svg.selectAll("g")
            .data(partition.nodes(root))
            .enter().append("g");

        var path = g.append("path")
            .attr("d", arc)
            .attr("id", function(d) {
                return d.id;
            })
            .attr("class", function(d) {
                return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            })
            .attr("value", function(d) {
                return d.name
            })
            .attr("parent", function(d) {
                if (d.parent) return d.parent['id']
            })
            .style("fill", function(d) {
                if (d.type == 'messageflow') {
                    if (!d.isRunning)
                        return "#e00000";
                    return 'white';
                } else if (d.type == 'applicationflow' && !d.isRunning) {
                    return "#e00000";
                } else if (d.type == 'iserver' && !d.isRunning) {
                    return "#e00000";
                } else if (d.type == 'application' && !d.isRunning) {
                    return "#e00000";
                } else {
                    return color((d.children ? d : d.parent).name);
                }
            })
            .on("click", function(d) {
                // check the type of the clicked element and call the getResources() method inside the chart controller
                if (d.type == "inode") {
                    chartCtrl.getResources(d.id, null, null, null, d.type, d.name);
                } else if (d.type == "iserver") {
                    chartCtrl.getResources(d.parent.id, d.name, null, null, d.type, d.name);
                } else if (d.type == "messageflow") {
                    chartCtrl.getResources(d.parent.parent.id, d.parent.name, null, d.name, d.type, d.name);
                } else if (d.type == "application") {
                    chartCtrl.getResources(d.parent.parent.id, d.parent.name, d.name, null, d.type, d.name);
                } else if (d.type == "applicationflow") {
                    chartCtrl.getResources(d.parent.parent.parent.id, d.parent.parent.name, d.parent.name, d.name, d.type, d.name);
                }
                click(d);
            });

        var text = g.append("text")
            .attr("class", "sun-label")
            .attr("transform", function(d) {
                return "rotate(" + computeTextRotation(d) + ")";
            })
            .attr("x", function(d) {
                return y(d.y);
            })
            .attr("dx", "6") // margin
            .attr("dy", ".35em") // vertical-align
            .text(function(d) {
                return d.name;
            })
            .on("click", function(d) {
                // check the type of the clicked element and call the getResources() method inside the chart controller
                if (d.type == "inode") {
                    chartCtrl.getResources(d.id, null, null, null, d.type, d.name);
                } else if (d.type == "iserver") {
                    chartCtrl.getResources(d.parent.id, d.name, null, null, d.type, d.name);
                } else if (d.type == "messageflow") {
                    chartCtrl.getResources(d.parent.parent.id, d.parent.name, null, d.name, d.type, d.name);
                } else if (d.type == "application") {
                    chartCtrl.getResources(d.parent.parent.id, d.parent.name, d.name, null, d.type, d.name);
                } else if (d.type == "applicationflow") {
                    chartCtrl.getResources(d.parent.parent.parent.id, d.parent.parent.name, d.parent.name, d.name, d.type, d.name);
                }
                click(d);
            });

        function click(d) {
            // fade out all text elements
            text.attr("opacity", 0);

            path.transition()
                .duration(750)
                .attrTween("d", arcTween(d))
                .each("end", function(e, i) {
                    // check if the animated element's data e lies within the visible angle span given in d
                    if (e.x >= d.x && e.x < (d.x + d.dx)) {
                        // get a selection of the associated text element
                        var arcText = d3.select(this.parentNode).select("text");
                        // fade in the text element and recalculate positions
                        arcText.transition().duration(750)
                            .attr("opacity", 1)
                            .attr("transform", function() {
                                return "rotate(" + computeTextRotation(e) + ")"
                            })
                            .attr("x", function(d) {
                                return y(d.y);
                            });
                    }
                });
        }

        d3.select(self.frameElement).style("height", height + "px");

        // Interpolate the scales!
        function arcTween(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, 1]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function(d, i) {
                return i ? function(t) {
                    return arc(d);
                } : function(t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
            };
        }

        function computeTextRotation(d) {
            return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
        }

    }
});
