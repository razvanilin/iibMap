angular.module('iibHeatMapApp')
    .directive('tilfordChart', function($parse, $window, $compile) {
        return {
            restrict: 'A',
            scope: {
                datajson: '='
            },
            require: '^ngController',
            link: function(scope, elem, attrs, Ctrl) {

                var tilfordChart = new TilfordChart(scope.datajson);
                tilfordChart.initialise(scope.datajson, Ctrl);
                var svg = tilfordChart.generateGraph();
                svg = angular.element(svg);
                console.log("yo");
            }
        }
    });

var TilfordChart = Class.create({
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

        var tree = d3.layout.tree()
            .size([360, diameter / 2 - 70])
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

        var root = this.datajson;
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
            })
            .style("fill", fill)
            .on("click", click);

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
            })
            .style("fill", fill)
            .on("click", click);

        function fill(d) {
            if (d.isRunning == false) return "#e00000";
            return "white";
        }

        function click(d) {
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
        }

        d3.select(self.frameElement).style("height", diameter - 150 + "px");

    }
});
