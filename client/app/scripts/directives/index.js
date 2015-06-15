angular.module('iibHeatMapApp')
	.factory('Charts', function() {
		var charts = {
			circle: new CircleChart(),
			sunburst: new SunburstChart(),
			bilevel: new BilevelChart(),
			tilford: new TilfordChart()
		};

		return charts;
	});