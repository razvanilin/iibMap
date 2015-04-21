$(document).ready(function() {
    // Start the websocket
    var socket = io();
    var lastChartType = "";

    $(".chart-switcher").click(function() {
        lastChartType = "";
    });

    $("#chart-type li").click(function() {
        lastChartType = "";
    });


    // Getting CPU data
    $("#data-type").change(function() {

        /*$.ajax({
            type: "GET",
            url: '/monitor/cpuMonitor',
            dataType: "json",
            success: function() {
                console.log("success");
            },
            error: function() {
                console.log("error");
            }
        });*/

        console.log("yo");
        socket.removeAllListeners("cpu");
        socket.removeAllListeners("mem");

        if ($(this).val() == "cpu") {
            socket.connect();
            socket.on('cpu', function(msg) {
                var chartType = getChartType();

                $(".bilevel").click(function() {
                    lastChartType = "";
                    console.log("yo");
                });

                if ($("div svg.chart-area").is("deactivate")) {
                    console.log("yo");
                    $(".chart-area").removeClass("deactivate");
                    $(".chart-area").addClass("active");
                }

                if (lastChartType != chartType) {
                    /*$("svg").ready(function() {
                         chartEvents(chartType);
                         console.log("events");
                    });*/
                    lastChartType = chartType;
                }

                if (msg) {
                    msg = msg.substring(0, msg.length - 3);
                    msg += "}";
                    msg = JSON.parse(msg);
                    //console.log(msg);

                    var avgCpu = 0;
                    var counter = 0;
                    for (var k in msg) {
                        var cpuValue = parseFloat(msg[k]);
                        heatUp(chartType, k, cpuValue);
                    }
                }
            });

        } else if ($(this).val() == "mem") {
            socket.connect();
            socket.on('mem', function(msg) {
                var chartType = getChartType();

                if ($("div svg.chart-area").is("deactivate")) {
                    console.log("yo");
                    $(".chart-area").removeClass("deactivate");
                    $(".chart-area").addClass("active");
                }

                if (lastChartType != chartType) {
                    chartEvents(chartType);
                    lastChartType = chartType;
                }
                //chartEvents(chartType);
                if (msg) {
                    msg = msg.substring(0, msg.length - 3);
                    msg += "}";
                    msg = JSON.parse(msg);

                    for (var k in msg) {
                        var memTotal = parseFloat(msg[k]["totalMemory"]);
                        var memUsed = parseFloat(msg[k]["usedMemory"]);
                        var value = (100 * memUsed) / memTotal;
                        heatUp(chartType, k, value);
                    }
                }
            });
        }
    });

    $("#data-type").trigger("change");
});

function heatUp(chartType, id, value) {
    value = parseInt(value);
    if (value <= 50) {
        $(chartType + "#" + id).css({
            "fill": "rgb(" + parseInt(value * 5.1) + ", 255, 0)",
            "transition": "all 1s ease"
        });
        $("span#" + id).text(value + "%").css({
            "color": "rgb(" + parseInt(value * 5.1) + ", 255, 0)",
            "transition": "all 1s ease"
        });

        //console.log("rgb("+parseInt(cpuValue*5.1)+", 255, 0)");
    } else {
        $(chartType + "#" + id).css({
            "fill": "rgb(255, " + parseInt(255 - ((value * 5.1) - 255)) + ", 0)",
            "transition": "all 1s ease"
        });
        $("span#" + id).text(value + "%").css({
            "color": "rgb(255, " + parseInt(255 - ((value * 5.1) - 255)) + ", 0)",
            "transition": "all 1s ease"
        });;
        //console.log("rgb(255, "+parseInt(255 - ((cpuValue*5.1) - 255))+", 0)");
    }
}
