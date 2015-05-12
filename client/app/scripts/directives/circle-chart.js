angular.module('iibHeatMapApp')
    .directive('circleChart', function($parse, $window, $compile) {
        return {
            restrict: 'A',
            scope: {
                datajson: '='
            },
            require: '^ngController',
            link: function(scope, elem, attrs, ChartCtrl) {

                var circleChart = new CircleChart(scope.datajson);
                circleChart.initialise(scope.datajson, ChartCtrl);
                var svg = circleChart.generateGraph();
                svg = angular.element(svg);
                //scope.isLoading = true;

                //scope.$apply(function() {
                  //var content = $compile(svg)(scope);
                  //elem.append(svg);
                //});

                //$compile(elem.contents())(scope);
            }
        }
    });

var CircleChart = Class.create({
    initialise: function(datajson, ChartCtrl) {
        this.datajson = datajson;
        this.chartCtrl = ChartCtrl;
    },

    generateGraph: function() {

        console.log(this.datajson);
        var chartCtrl = this.chartCtrl;

        function chartSize() {
            return (($(document).width() + $(document).height()) / 2) / 1.8;
        };

        var margin = 20,
            diameter = chartSize();

        var color = d3.scale.linear()
            .domain([-1, 3])
            .range(["hsl(152,80%,0%)", "hsl(228,30%,70%)"])
            .interpolate(d3.interpolateHcl);

        var pack = d3.layout.pack()
            .padding(2)
            .size([diameter - margin, diameter - margin])
            .value(function(d) {
                return d.size;
            });

        var chartContent = d3.select("div#chart-content");

        var svg = chartContent.append("svg")
            .attr("id", "circle")
            .attr("width", diameter)
            .attr("height", diameter)
            .style("border-radius", "50px")
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        d3.json(this.datajson, function(error, root) {

            console.log(root);
            if (error) return console.error(error);

            // check if there was an error response from the server
            if (root['code']) {
                $("div#chart-content").html("<h2>No active integration nodes</h2>");
                return console.log(root);
            } else {
                $("div#chart-content").remove("h2");
            }

            var focus = root,
                nodes = pack.nodes(root),
                view;

            var circle = svg.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function(d) {
                    return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                })
                .attr("id", function(d) {
                    return d.id;
                })
                .attr("value", function(d) {
                    return d.name
                })
                .attr("parent", function(d) {
                    if (d.parent) return d.parent['id']
                })

            .style({
                    "fill": function(d) {
                        return d.type != 'messageFlows' ? color(d.depth) : null;
                    },
                    "display": "inline-block"
                })
                .on("click", function(d) {
                    chartCtrl.getEgs(d.id);
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

            /*d3.select("#flow1").style({
                "fill": "white"
            });*/


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
                var k = diameter / v[2];
                view = v;
                node.attr("transform", function(d) {
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                });
                circle.attr("r", function(d) {
                    return d.r * k;
                }).attr("z-index", "-1");
            }

            //chartEvents(chartType);
            $("#chart-content h1").remove();

            // compile the elements so the ng-click event fires properly
            return $("#chart-content").prop('outerHTML');

        });

        d3.select(self.frameElement).style("height", diameter + "px");
        return $('#chart-content').prop('outerHTML');
    }
});
