$(document).ready(function() {
    drawCircle(1);
});

var chartType = "";

function chartSize() {
    return (($(document).width() + $(document).height()) / 2) / 1.8
};

function getChartType() {
    return chartType;
}

function simulateClick(elem) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
        "click", /* type */
        true, /* canBubble */
        true, /* cancelable */
        window, /* view */
        0, /* detail */
        0, /* screenX */
        0, /* screenY */
        0, /* clientX */
        0, /* clientY */
        false, /* ctrlKey */
        false, /* altKey */
        false, /* shiftKey */
        false, /* metaKey */
        0, /* button */
        null); /* relatedTarget */
    elem.dispatchEvent(evt);
}


/**** DRAW CIRCLE CHART ****/

function drawCircle() {

    $("div#chart-content").html("");

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
        })

    var svg = d3.select("div#chart-content").append("svg")
        .attr("id", "circle")
        .attr("width", diameter)
        .attr("height", diameter)
        .style("border-radius", "50px")
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    console.log(svg.attr('id'));

    d3.json('http://localhost:8080/broker/getJson', function(error, root) {
        //console.log(root);
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

        chartEvents(chartType);

    });

    d3.select(self.frameElement).style("height", diameter + "px");

    chartType = "circle";
}




/***** SUNBURST CHART ******/


function drawSun() {

    $("div#chart-content").html("");
    var width = chartSize(),
        height = chartSize(),
        radius = Math.min(width, height) / 2.1;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .range([0, radius]);

    var color = d3.scale.category20c();

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

    d3.json("http://localhost:8080/broker/getJson", function(error, root) {

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
                return color((d.children ? d : d.parent).name);
            })
            .on("click", click);

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
        chartEvents(chartType);
    });

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

    chartType = "path";
}


/*** BILEVEL CHART ***/


function drawBilevel() {

    $("div#chart-content").html("");

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

    d3.json('http://localhost:8080/broker/getJson', function(error, root) {

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
            });

        function zoomIn(p) {
            if (p.depth > 1) p = p.parent;
            if (!p.children) return;
            zoom(p, p);
        }

        function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
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

        chartEvents(chartType);
    });

    function key(d) {
        var k = [],
            p = d;
        while (p.depth) k.push(p.name), p = p.parent;
        return k.reverse().join(".");
    }

    function fill(d) {
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


    chartType = "path";
}


/*** TILFORD CHART ***/


function drawTilford() {
    $("div#chart-content").html("");

    var diameter = chartSize();

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg = d3.select("div#chart-content").append("svg")
        .attr("id", "tilford")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    d3.json('http://localhost:8080/broker/getJson', function(error, root) {

        // check if there was an error response from the server
        if (root['code']) {
            $("div#chart-content").html("<h2>No active integration nodes</h2>");
            return console.log(root);
        }

        var nodes = tree.nodes(root),
            links = tree.links(nodes);

        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })

        node.append("circle")
            .attr("r", 7)
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
            });

        node.append("text")
            .attr("class", "tilford-label")
            .attr("dy", ".31em")
            .attr("text-anchor", function(d) {
                return d.x < 180 ? "start" : "end";
            })
            .attr("transform", function(d) {
                return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
            })
            .text(function(d) {
                return d.name;
            });

        chartEvents(chartType);
    });

    d3.select(self.frameElement).style("height", diameter - 150 + "px");

    chartType = "circle";
}
