$(document).ready(function() {

// broker positioning
var numBrokers = 50;
var numFlow = 10;
var splitterX = numBrokers / 10;
var splitterY = numBrokers / splitterX;
var offsetX = 2;
var offsetY = 2;

var counterX = 0;
var counterY = 1;
var brokerCounter = 0;

// execution groups positioning
var numEg = 30;
var egCounter = 0;

var brokerPositions = "[";

var stopGraph = false;

  // place the brokers on the page and save their initial position in a json object
  for (var i=1; i<numBrokers/10 + 1; i++) {
    for (var j=1; j<numBrokers/5 + 1; j++) {
      brokerCounter++;
      var top = (100 / (splitterX+offsetX) * i);
      var left = (100 / (splitterY+offsetY) * j);


      var div = $("<div class='broker' id='broker"+brokerCounter+"'><p>Broker"+brokerCounter+"</p></div>");
     // var canvas = $("<canvas></canvas>");
     // canvas.attr({'id' : 'canvas'+brokerCounter});
      //canvas.css({'width': '100%', 'height': '100%', 'overflow': 'auto'});
      div.append("<ul class='broker-resources'>"+
          "<li class='cpu'>CPU Usage: </li>"+
          "<li class='memory'>Physical Memory: </li>"+
          "<li class='growth'>Memory Growth(byte/s): </li></ul>")
      div.append("<div class='eg-container'></div>");
      //div.append(canvas);
      div.css({"top" : top+"%" , "left" : left+"%"});
      $(".left-panel").append(div);

      var brokerName = "broker"+brokerCounter;
      brokerPositions += '{"top" : '+top+', "left" : '+left+', "egs" : []},';
    }
  }

    // make sure there is no coma at the end - messes up the JSON parse function
  brokerPositions = brokerPositions.substring(0, brokerPositions.length - 1);
  brokerPositions += "]";

  brokerPositions = JSON.parse(brokerPositions);

  var test = "[";
  //populate the dom with execution groups
  for (var i=0; i<numEg/10; i++) {
    for (var j=0; j<numEg/5; j++) {
        egCounter++;
        var top = (100 / (splitterX) * i) + 110;
        var left = (100 / (splitterY) * j);

        var div = $("<div class='eg'>eg"+egCounter+"</div>");
        div.append = $("<div class='flow-container'></div>");
        div.css({"top" : top+"%", "left" : left+"%"});
        $(".broker div.eg-container").append(div);
        test += '{"top": '+top+', "left" : '+left+'},';
        //test = JSON.parse(test);
    }
  }

  test = test.substring(0, test.length - 1);
  test += "]";
  test = JSON.parse(test);

  brokerPositions[0]["egs"] = test;

  // update the rest of the brokers with the egs positions
  for (var i=1; i<brokerPositions.length; i++) {
    brokerPositions[i]["egs"] = brokerPositions[0]["egs"];
  }


  for(var i=0; i<numFlow; i++) {
    $(".eg").find("div.flow-container").append("<div class='flow'>flow"+i+"</div>");
  }

 //brokerPositions = JSON.parse(brokerPositions);
  console.log(brokerPositions);
  console.log(brokerPositions[10]["egs"]);


  /********************
  Webpage Functionality
  ********************/

  $("div.broker").click(function () {
    var div = $(this);
    $(this).find("canvas").css({'width' : '300px', 'height' : '300px'});
    //$(this).find(".resources").addClass("display");

    // check if the item is active and remove its active class
    if ($(this).hasClass("active")) {
      if ($(this).hasClass("depth")) {
        $(this).removeClass("depth");
        resetExecutionGroups();
        $(".eg").removeClass("selected");
        $(".flow").removeClass("flow-expand");
        $(".eg-container").removeClass("minimize");

      } else {
        // the active item was clicked
        $(this).removeClass("active");
        $(".broker-resources").removeClass("broker-display");
        $(this).removeClass("depth");
        $(this).find("div").removeClass("expand");
        $("canvas").css("display", "none");

        $(".broker").each(function() {
          // make sure the item doesn't have the unfocus class attached to it
          $(this).removeClass("unfocus");
          // extract the key and the index from the selected item and use them to get the right values from the json object
          var key = $(this).attr('id');
          var index = parseInt(key.substring(6)) - 1;

          // reset the style attribute with the correct attributes extracted from the json object
          $(this).removeAttr("style");
          $(this).css({"top" : brokerPositions[index]["top"] + "%", "left" : brokerPositions[index]["left"] + "%"});
        });
      }

    } else if (!$(this).hasClass(".depth")) {
      // remove all active classes and the expansion classes for the execution groups
      $("canvas").css("display", "block");
      $(".broker").removeClass("active");
      $(".broker").removeClass("depth");
      $(".broker").find("div").removeClass("expand");
      $(".broker").find("div").removeClass("selected");
      $(".broker").find(".flow").removeClass("flow-expand");
      $(".broker-resources").removeClass("broker-display");
      $(this).find(".broker-resources").addClass("broker-display");

      // add the active class to the item that was clicked
      $(this).addClass("active");

      // place the unfocused items on the side of the page
      var posY = 0;
      $(".broker:not(.active)").each(function() {
        $(this).addClass("unfocus");
        $(this).removeAttr("style");
        $(this).css({"transform" : "translateY("+posY+"px)", "transition" : "all 2s ease"});

        posY += 20;
      });
      posY = 0;
      
      // prepare the styling of the active broker
      $(this).removeAttr("style");
      $(this).removeClass("unfocus");

      // search for eg children and expand them
      $(this).find(".eg").addClass("expand");
    }
  });

/***************
Execution Groups
***************/

  $(".eg").click(function(e) {
    // doesn't activate the trigger for the parent
    e.stopPropagation();

    if (!$(".active").hasClass("depth")) {
      $(".active").addClass("depth");
      $(".eg-container").addClass("minimize");
    }

    if ($(this).hasClass("selected")) {
      $(".active").removeClass("depth");
      $(".eg-container").removeClass("minimize");
      $(this).removeClass("selected");
      $(this).find(".flow").removeClass("flow-expand");

      resetExecutionGroups();
    } else {

      // remove all selected classes
      $(".eg").removeClass("selected");
      $(".flow").removeClass("flow-expand");
      resetExecutionGroups();
      $(this).removeAttr("style");
      $(this).addClass("selected");
      $(this).find(".flow").addClass("flow-expand");
    }
  });

  function resetExecutionGroups() {
    $(".eg").each(function() {
          // make sure the item doesn't have the unfocus class attached to it
          $(this).removeClass("selected");
          // extract the key and the index from the selected item and use them to get the right values from the json object
          var key = $(this).parent().parent().attr('id');
          var index = parseInt(key.substring(6)) - 1;

          var egIndex = parseInt($(this).text().substring(2)) - 1;
          //console.log(brokerPositions[index]["egs"][egIndex]);
          // reset the style attribute with the correct attributes extracted from the json object
          $(this).removeAttr("style");
          $(this).css({"top" : brokerPositions[index]["egs"][egIndex]["top"] + "%", "left" : brokerPositions[index]["egs"][egIndex]["left"] + "%"});
      });
  }

  // **************
  // Rocket Science
  // **************


  var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
    var lineChartData = {
      labels : ["30","25","20","15","10","5","0s"],
      datasets : [
        {
          label: "My Second dataset",
          fillColor : "rgba(151,187,205,0.2)",
          strokeColor : "rgba(151,187,205,1)",
          pointColor : "rgba(151,187,205,1)",
          pointStrokeColor : "#fff",
          pointHighlightFill : "#fff",
          pointHighlightStroke : "rgba(151,187,205,1)",
          data : [0,0,0,0,0,0,0]
        }
      ]
    }
  
  $(".broker").click(function(){
    var id = $(".right-panel").find("canvas").attr("id");
    console.log(id);
    var ctx = document.getElementById(id).getContext("2d");
    ctx.canvas.width = 30;
    ctx.canvas.height = 20;
    window.myLine = new Chart(ctx).Line(lineChartData, {
      responsive: true,
      scaleOverride: true,
      scaleStartValue: 0,
      scaleStepWidth: 10,
      scaleSteps: 10
    });

    //render();
  });

  // WEBSOCKETS YAY
  var socket = io();
  var lastMessage = "";
  var graphValue;
    //setTimeout(function() {
      //socket.emit('new log', "dummy");
    //}, 1000);
  socket.on('new log', function(msg) {
    if (lastMessage != msg && msg != "") {
      $(".active .cpu").text("CPU Usage: "+msg);
      lastMessage = msg;

      //get the cpu value as a float so it can be passed as a value to the graph
      graphValue = parseFloat(msg.substring(0,4))*100; 
      //console.log(graphValue);
      //check if the graph exists and then modify the values with the ones taken from the socket
      if (typeof myLine !== 'undefined') {
        for (var i=0; i<myLine.datasets[0].points.length-1; i++) {
          myLine.datasets[0].points[i].value = myLine.datasets[0].points[i+1].value;
        } 
          myLine.datasets[0].points[6].value = graphValue;
          myLine.update();
      }
    }
  });

  function render() {

    //if (stopGraph) {return;}

    for (var i=0; i<myLine.datasets[0].points.length-1; i++) {
      myLine.datasets[0].points[i].value = myLine.datasets[0].points[i+1].value;

    } 
    myLine.datasets[0].points[6].value = randomScalingFactor();
    myLine.update();
    //console.log(lineChartData.datasets[0].data[6].value);
    setTimeout(render, 5000);

    return 1;
  }
});