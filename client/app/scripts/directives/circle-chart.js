angular.module('iibHeatMapApp')
    .directive('circleChart', function($parse, $window, $timeout) {
        return {
            restrict: 'A',
            scope: {
                datajson: '=',
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

                var circleChart = new CircleChart(scope.datajson);
                circleChart.initialise(scope.datajson);
                var svg = circleChart.generateGraph(getResources);
                svg = angular.element(svg);

            }
        }
    });



var CircleChart = Class.create({
    initialise: function(datajson) {
        this.datajson = datajson;
        this.inodeId = null;
    },

    generateGraph: function(getResources) {
        var chart = this;

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

        var root = this.datajson;

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
                    if (d.type == 'messageflow') {
                        if (!d.isRunning)
                            return "#ffd6d6";
                        return 'white';
                    } else if (d.type == 'applicationflow') {
                        if (!d.isRunning)
                            return "#ff9307";
                        return 'yellow';
                    } else {
                        return color(d.depth);
                    }
                    //return ((d.type != 'messageflow') || (d.type != 'applicationflow')) ? color(d.depth) : 'white' : 'yellow';
                },
                "display": "inline-block"
            })
            .on("click", function(d) {
                // check the type of the clicked element and call the getResources() method inside the chart controller
                if (d.type == "inode") {
                    //console.log(this.getResources);
                    getResources(d.id, null, null, null, d.type, d.name);
                } else if (d.type == "iserver") {
                    getResources(d.parent.id, d.name, null, null, d.type, d.name);
                } else if (d.type == "messageflow") {
                    getResources(d.parent.parent.id, d.parent.name, null, d.name, d.type, d.name);
                } else if (d.type == "application") {
                    getResources(d.parent.parent.id, d.parent.name, d.name, null, d.type, d.name);
                } else if (d.type == "applicationflow") {
                    getResources(d.parent.parent.parent.id, d.parent.parent.name, d.parent.name, d.name, d.type, d.name);
                }
                if (focus !== d) zoom(d), d3.event.stopPropagation();
            });


        var text = svg.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "chart-label")
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

        //});

        d3.select(self.frameElement).style("height", diameter + "px");
        return $('#chart-content').prop('outerHTML');

        function setAttr(inode, iserver, application, messageflow, type, name) {
            this.inode = inode;
            this.iserver = iserver;
            this.application = application;
            this.messageflow = messageflow;
            this.type = type;
            this.name = name;
        }
    }
});
