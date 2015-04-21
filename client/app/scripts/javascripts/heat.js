  var lastMessage = "";
  var graphValue;
  var currentFocus;
  var col = 0;

  $(document).ready(function() {
    if ($("div svg.chart-area").is("deactivate")) {
                    console.log("yo");
                    $(".chart-area").removeClass("deactivate");
                    $(".chart-area").addClass("active");
                }
    //setTimeout(chartEvents(circle), 1000);
  });

  function chartEvents(chartType) {

      if ($("svg").attr("class") == "chart-area deactivate") {
          $("svg").removeAttr("class");
          $(".chart-area").attr("class", "chart-area active");
      }

      $("svg circle, svg path").click(function() {
          var circle = $(this);
          currentFocus = circle;
          $("div#resources").find("p, h2").remove();
          if (circle.attr('class') != "node node--root")
              $("div#resources").append("<h2>" + circle.attr("value") + "<span></span></h2>");
          else
              $("div#resources").append("<h2></h2>");


          //if (circle.attr('parent'))
          $(chartType + "[parent='" + circle.attr('id') + "']").each(function() {
              $("div#resources").append("<p>" + $(this).attr('value') + "<span id='" + $(this).attr('id') + "'></span></p>");
          });

          if (circle.attr('class') == "node node--leaf") {
              $("div#resources").find("h2").attr('id', $(this).attr('id'));
          }

          if (!$("div.details").hasClass("active")) {
              $("div.details").removeClass("deactivate");
              $("div.details").addClass("active");
              $(".toolbar").removeClass("deactivate");
              $(".toolbar").addClass("active");
          }

          if (circle.attr('class') == "node node--root") {
              if ($("div.details").hasClass("active")) {
                  $("div.details").removeClass("active");
                  $("div.details").addClass("deactivate");
                  $(".toolbar").removeClass("active");
                  $(".toolbar").addClass("deactivate");
                  $(".welcome-message").removeClass("deactivate");
                  $(".welcome-message").addClass("active");
                  //drawChart(2);
              }
          }
          //chartEvents(chartType);
      });

      // change the sun chart's text size based on how deep the chart is
      $(".node").click(function() {
          if ($(this).is(".node--leaf")) {
              $("text.sun-label").css("font-size", "20px");
          } else if ($(this).is(".node--root")) {
              $("text.sun-label").css("font-size", "13px");
          } else if ($(this).attr("id").indexOf("eg") > -1) {
              $("text.sun-label").css("font-size", "15px");
          } else {
              $("text.sun-label").css("font-size", "13px");
          }
      });

      if ($(".welcome-message").hasClass("active")) {
          $(".node").click(function() {
            if ($(this).attr("class") != "node node--root") {
              console.log("yo");
              $(".welcome-message").removeClass("active");
              $(".welcome-message").addClass("deactivate");
            }
          });
      }
  }

  /*$(".node.node--root").click(function() {
    if ($("div.details").hasClass("active")) {
      $("div.details").removeClass("active");
      $("div.details").addClass("deactivate");
      //drawChart(2);
    }
  });*/

  $(document).ready(function() {

      $("#chart-type li").click(function() {
          if ($(this).attr("id") == "circle") {
              drawCircle();
          } else if ($(this).attr("id") == "bilevel") {
              drawBilevel();
          } else if ($(this).attr("id") == "sunburst") {
              drawSun();
          } else if ($(this).attr("id") == "tilford") {
              drawTilford();
          }

          // restart the welcoming message
          if ($(".welcome-message").hasClass("deactivate")) {
              $(".welcome-message").removeClass("deactivate");
              $(".welcome-message").addClass("active");
          }

          // check if the details panel is active and if so, deactivate it
          if ($("div.details").hasClass("active")) {
              $("div.details").removeClass("active");
              $("div.details").addClass("deactivate");
              $(".toolbar").removeClass("active");
              $(".toolbar").addClass("deactivate");
          }
      });

      $(".chart-switcher").click(function() {
          var switcher = $(this);
          switcher.css({
              "animation": "rotate-switcher 1s ease"
          });
          if ($("svg").attr("id") == "circle")
              drawCircle();
          else if ($("svg").attr("id") == "bilevel")
              drawBilevel();
          else if ($("svg").attr("id") == "sunburst")
              drawSun();
          else if ($("svg").attr("id") == "tilford")
              drawTilford();

          // restart the welcoming message
          if ($(".welcome-message").hasClass("deactivate")) {
              $(".welcome-message").removeClass("deactivate");
              $(".welcome-message").addClass("active");
          }

          // check if the details panel is active and if so, deactivate it
          if ($("div.details").hasClass("active")) {
              $("div.details").removeClass("active");
              $("div.details").addClass("deactivate");
              $(".toolbar").removeClass("active");
              $(".toolbar").addClass("deactivate");
          }

          //remove the styling animation so it can be run again on the next click
          setTimeout(function() {
              switcher.removeAttr("style");
          }, 1000);
      });
      $(".chart-switcher").tooltip('toggle');
      $(".chart-switcher").tooltip('hide');

      /*** ADMIN FUNCTIONS ***/
      $("#admin-monitor-start li").click(function() {
        var reqType = "";
        if ($(this).attr("id") == "admin-cpu") {
          reqType = "cpu"
        } else if ($(this).attr("id") == "admin-mem") {
          reqType = "mem";
        } else {
          return;
        }

        $.ajax({
          type: "GET",
          url: "monitor/"+ reqType + "Stop",
          cache: false,
          dataType: "json",
          success: function(data) {
            console.log(data);
          },
          error: function(data) {
            console.log(data['responseText']);
          },
          complete: function() {
            $.ajax({
                type: "GET",
                url: "monitor/"+reqType+"Start",
                cache: false,
                dataType: "json",
                success: function(data) {
                  console.log(data['responseText']);
                },
                error: function(data) {
                  console.log(data['responseText']);
                }
            });
          }
        });
      });

      $("#admin-monitor-stop li").click(function() {
        var reqType = "";
        if ($(this).attr("id") == "admin-cpu") {
          reqType = "cpu"
        } else if ($(this).attr("id") == "admin-mem") {
          reqType = "mem";
        } else {
          return;
        }

        $.ajax({
          type: "GET",
          url: "monitor/"+reqType+"Stop",
          cache: false,
          dataType: "json",
          success: function(data) {
            console.log(data['responseText']);
          },
          error: function(data) {
            console.log(data['responseText']);
          }
        });
      });

      /*** TOOLBAR ***/

      $("button#goto-parent").click(function() {
          // chart rules towards hierarchy

          //in case the chart is bilevel simulate a click on the middle circle in order to return to the parent
          if ($("svg").attr("id") == "bilevel") {
              simulateClick(d3.selectAll("circle")[0][0]);
          } else {

              var parentIndex;
              var parent = $("svg").find("#" + currentFocus.attr("parent"));

              if (currentFocus.attr("parent")) {
                  // check to see if the element is not place directly into the big "g" element
                  if (parent.parent().parent().is("g")) {
                      parent = parent.parent();
                      parentIndex = parent.index("g") - 1;
                  } else {
                      parentIndex = parent.index();
                  }
              } else {
                  parentIndex = 0;
              }

              simulateClick(d3.selectAll(getChartType())[0][parentIndex]); // works
          }
      });

      $("button#goto-child").click(function() {
          var focusIndex = currentFocus.index();
          var childIndex;
          var children = $("svg").find("[parent='" + currentFocus.attr("id") + "']");

          if (children.length > 1) {
              childIndex = focusIndex;
          } else {
              // check to see if the children element is not directly inside the big "g" element
              if (children.parent().parent().is("g")) {
                  children = children.parent();
              }
              childIndex = children.index();
              simulateClick(d3.selectAll(getChartType())[0][childIndex]);
          }

      });

  });
