angular.module('iibHeatMapApp')
    .directive('bilevelChart', function($parse, $window, $compile) {
        return {
            restrict: 'A',
            scope: {
                datajson: '='
            },
            require: '^ngController',
            link: function(scope, elem, attrs, Ctrl) {

                var bilevelChart = new BilevelChart(scope.datajson);
                bilevelChart.initialise(scope.datajson, Ctrl);
                var svg = bilevelChart.generateGraph();
                svg = angular.element(svg);
                console.log("yo");
            }
        }
    });

var BilevelChart = Class.create({
    initialise: function(datajson, ChartCtrl) {
        this.datajson = datajson;
        this.chartCtrl = ChartCtrl;
    },

    generateGraph: function() {

        var chartCtrl = this.chartCtrl;

        function chartSize() {
            return (($(document).width() + $(document).height()) / 2) / 1.8;
        };

        var diameter = chartSize();
        var margin = {
                top: diameter,
                right: diameter,
                bottom: diameter,
                left: diameter
            },
            radius = Math.min(margin.top, margin.right) / 2.1;

        var hue = d3.scale.category10();

        var luminance = d3.scale.sqrt()
            .domain([0, 1e6])
            .clamp(true)
            .range([90, 20]);

        var svg = d3.select("div#chart-content").append("svg")
            .attr("id", "bilevel")
            .attr("width", margin.left)
            .attr("height", margin.top)
            .append("g")
            .attr("transform", "translate(" + margin.left / 2 + "," + margin.top / 2 + ")");

        var partition = d3.layout.partition()
            .sort(function(a, b) {
                return d3.ascending(a.name, b.name);
            })
            .size([2 * Math.PI, radius]);

        var arc = d3.svg.arc()
            .startAngle(function(d) {
                return d.x;
            })
            .endAngle(function(d) {
                return d.x + d.dx - .01 / (d.depth + .5);
            })
            .innerRadius(function(d) {
                return radius / 3 * d.depth;
            })
            .outerRadius(function(d) {
                return radius / 3 * (d.depth + 1) - 1;
            });

        var root = this.datajson;

        // check if there was an error response from the server
        if (root['code']) {
            $("div#chart-content").html("<h2>No active integration nodes</h2>");
            return console.log(root);
        } else {
            $("div#chart-content").remove("h2");
        }

        // Compute the initial layout on the entire tree to sum sizes.
        // Also compute the full name and fill color for each node,
        // and stash the children so they can be restored as we descend.
        partition
            .value(function(d) {
                return d.size;
            })
            .nodes(root)
            .forEach(function(d) {
                d._children = d.children;
                d.sum = d.value;
                d.key = key(d);
                d.fill = fill(d);
            });

        // Now redefine the value function to use the previously-computed sum.
        partition
            .children(function(d, depth) {
                return depth < 2 ? d._children : null;
            })
            .value(function(d) {
                return d.sum;
            });

        var center = svg.append("circle")
            .attr("r", radius / 3)
            .attr("class", "node node--root bilevel")
            .on("click", zoomOut);

        center.append("title")
            .text("zoom out");

        var path = svg.selectAll("path")
            .data(partition.nodes(root).slice(1))
            .enter().append("path")
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
            .attr("d", arc)
            .style("fill", function(d) {
                return d.fill;
            })
            .each(function(d) {
                this._current = updateArc(d);
            })
            .on("click", zoomIn);

        var text = svg.selectAll("text")
            .data(partition.nodes(root).slice(1))
            .enter().append("text")
            .attr("class", "sun-label")
            .attr("transform", function(d) {
                return "rotate(" + computeTextRotation(d) + ")";
            })
            .attr("x", function(d) {
                return radius / 3 * d.depth;
            })
            .attr("dx", "6") // margin
            .attr("dy", ".35em") // vertical-align
            .html(function(d) {
                return d.name;
            })
            .on('click', zoomIn);

        function zoomIn(d) {
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

            if (d.depth > 1) d = d.parent;
            if (!d.children) return;
            zoom(d, d);
        }

        function zoomOut(p) {
            if (!p.parent) return;

            var d = p.parent
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

            zoom(d, d);
        }

        // Zoom to the specified new root.
        function zoom(root, p) {
            if (document.documentElement.__transition__) return;

            // Rescale outside angles to match the new layout.
            var enterArc,
                exitArc,
                outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

            function insideArc(d) {
                return p.key > d.key ? {
                    depth: d.depth - 1,
                    x: 0,
                    dx: 0
                } : p.key < d.key ? {
                    depth: d.depth - 1,
                    x: 2 * Math.PI,
                    dx: 0
                } : {
                    depth: 0,
                    x: 0,
                    dx: 2 * Math.PI
                };
            }

            function outsideArc(d) {
                return {
                    depth: d.depth + 1,
                    x: outsideAngle(d.x),
                    dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)
                };
            }

            center.datum(root);

            // When zooming in, arcs enter from the outside and exit to the inside.
            // Entering outside arcs start from the old layout.
            if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

            path = path.data(partition.nodes(root).slice(1), function(d) {
                return d.key;
            });

            // When zooming out, arcs enter from the inside and exit to the outside.
            // Exiting outside arcs transition to the new layout.
            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

            d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
                path.exit().transition()
                    .style("fill-opacity", function(d) {
                        return d.depth === 1 + (root === p) ? 1 : 0;
                    })
                    .attrTween("d", function(d) {
                        return arcTween.call(this, exitArc(d));
                    })
                    .remove();

                path.enter().append("path")
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
                    .style("fill-opacity", function(d) {
                        return d.depth === 2 - (root === p) ? 1 : 0;
                    })
                    .style("fill", function(d) {
                        return d.fill;
                    })
                    .on("click", zoomIn)
                    .each(function(d) {
                        this._current = enterArc(d);
                    });

                path.transition()
                    .style("fill-opacity", 1)
                    .attrTween("d", function(d) {
                        return arcTween.call(this, updateArc(d));
                    });
            });

            text = text.data(partition.nodes(root).slice(1), function(d) {
                return d.key;
            });

            text.transition().duration(750).attr("opacity", 0);

            text.enter().append("text")
                .on('click', zoomIn)
                .attr("class", "sun-label")
                .transition().duration(750)
                .attr("transform", function(d) {
                    return "rotate(" + computeTextRotation(d) + ")";
                })
                .attr("x", function(d) {
                    return radius / 3 * d.depth;
                })
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(function(d) {
                    return d.name;
                });


            text.exit().transition().duration(750)
                .attr("opacity", 0);
            //.remove();
            text.transition().duration(750)
                .attr("opacity", 1)
                .attr("transform", function(d) {
                    return "rotate(" + computeTextRotation(d) + ")";
                })
                .attr("x", function(d) {
                    return radius / 3 * d.depth;
                })
                .attr("dx", "6") // margin
                .attr("dy", ".35em"); // vertical-align
        }

        function key(d) {
            var k = [],
                p = d;
            while (p.depth) k.push(p.name), p = p.parent;
            return k.reverse().join(".");
        }

        function fill(d) {
            if (d.isRunning == false) return "#e00000";
            var p = d;
            while (p.depth > 1) p = p.parent;
            var c = d3.lab(hue(p.name));
            c.l = luminance(d.sum);
            return c;
        }

        function arcTween(b) {
            var i = d3.interpolate(this._current, b);
            this._current = i(0);
            return function(t) {
                return arc(i(t));
            };
        }

        function updateArc(d) {
            return {
                depth: d.depth,
                x: d.x,
                dx: d.dx
            };
        }

        d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

        function computeTextRotation(d) {
            return (d.x + (d.dx) / 2) * 180 / Math.PI - 90;
        }

    }
});
