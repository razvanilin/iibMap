/*
 * Service used to keep a reference of all the registered widgets in the application
 * Add new widgets to the charts variable
 */

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