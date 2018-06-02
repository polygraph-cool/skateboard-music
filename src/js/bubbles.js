var svgContainer;
var genreLabels;
var use;
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

function resize() {}

function init() {
/* bubbleChart creation function.
 *
 */



function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3v3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  // Set a width if it is provided.
  if (width) {
    tt.style('width', width);
  }

  // Initially it is hidden.
  hideTooltip();

  /*
   * Display tooltip with provided content.
   *
   * content is expected to be HTML string.
   *
   * event is d3v3.event for positioning.
   */
  function showTooltip(content, event) {
    tt.style('opacity', 1.0)
      .html(content);

    updatePosition(event);
  }

  /*
   * Hide the tooltip div.
   */
  function hideTooltip() {
    tt.style('opacity', 0.0);
  }

  /*
   * Figure out where to place the tooltip
   * based on d3v3 mouse event.
   */
  function updatePosition(event) {
    var xOffset = 20;
    var yOffset = 10;

    var ttw = tt.style('width');
    var tth = tt.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;

    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                 curX - ttw - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                curY - tth - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tt.style({ top: tttop + 'px', left: ttleft + 'px' });
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}



/* bubbleChart creation function.
 *
 */
function bubbleChart() {
  // Constants for sizing

  var margin = {top: 50, bottom: 20, left: 0, right: 0};
  // var width = 1500 - margin.right;
  // var height = 1000 - margin.top - margin.bottom;
  // var boundingRect = d3.select('#vis').node().getBoundingClientRect();
  var width = Math.min(viewportWidth,950);
  var height = 1050;
  if(viewportWidth < 500){
    height = 2500;
  }
  // var width = 1100;
  // var height = 1050;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('bubble_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var selbubbles = [];

  var popScaleRange = [width / 3.5, width / 2, width / 1.4];
  if(viewportWidth < 500){
    popScaleRange= [width / 2, width / 2, width / 2]
  }

  var popScale = d3.scaleOrdinal()
    .domain(['low', 'medium', 'high'])
    .range(popScaleRange);

  var genreXRange = [width/3,width/1.25];
  if(viewportWidth < 500){
    genreXRange = [width/2,width/2]
  }

  var genereXScale = d3.scaleBand()
    .domain(['4', '2','3','1'])
    // .range([width, width, (width / 2.75), (width / 2.7), (width / 1.9), (width / 1.9), (width / 1.55), (width / 1.55), (width / 1.55)]);
    .range(genreXRange)

  var useCenters = {
    'low': { x: popScale('low'), y: 1050/3.5 }, //width / 4
    'medium': { x: popScale('medium'), y: 1050/3.5 }, //width / 2.75
    'high': { x: popScale('high'), y: 1050/3.5 } //width / 1.5
  };

  if(viewportWidth < 500){
    useCenters = {
      'low': { x: popScale('low'), y: 1050 / 3.5 + 1050/2}, //width / 4
      'medium': { x: popScale('medium'), y: 1050 / 2 }, //width / 2.75
      'high': { x: popScale('high'), y: 1050 / 3.5 } //width / 1.5
    };
  }

  // X locations of the year titles.
  var useTitleX = {
    'Low':  popScale('low'), //width / 6,
    'Medium': popScale('medium'),//width / 2.3,
    'High': popScale('high') //width / 1.35
  };

  var genreCenters = {
    'Classic Rock': { x: genereXScale('1'), y: height / 3.5},
    'Indie/Alternative': { x: genereXScale('1'), y: height / 2 },
    'Hip Hop': { x: genereXScale('2'), y: height / 3.5},
    'Electronic': { x: genereXScale('2'), y: height / 2},
    'Punk': { x: genereXScale('3'), y: height / 3.5},
    'Metal': { x: genereXScale('3'), y: height / 2},
    'Other': { x: genereXScale('4'), y: height / 3.5},
    'Jazz/Soul': { x: genereXScale('4'), y: height / 2},
    'Rock': { x: genereXScale('4'), y: height / 2}
  };

  if(viewportWidth < 500){
    genreCenters = {
      'Classic Rock': { x: genereXScale('1'), y: 1050 / 3.5},
      'Indie/Alternative': { x: genereXScale('1'), y: 1050 / 2 },
      'Hip Hop': { x: genereXScale('2'), y:  1050 / 3.5 + 1050 / 2},
      'Electronic': { x: genereXScale('2'), y: 1050 / 2 + 1050 / 2},
      'Punk': { x: genereXScale('3'), y: 1050 / 3.5 + 1050},
      'Metal': { x: genereXScale('3'), y: 1050 / 2 + 1050},
      'Other': { x: genereXScale('4'), y: 1050 / 3.5 + 1050 + 1050/2},
      'Jazz/Soul': { x: genereXScale('4'), y:1050 / 2 + 1050 + 1050/2},
      'Rock': { x: genereXScale('4'), y: 1050 / 3.5 + 1050 + 1050/2}
    };
  }

  // X locations of the year titles.
  var genreTitleX = {
    'Classic Rock': genereXScale('1'),
    'Indie/Alternative': genereXScale('1'),
    'Hip Hop': genereXScale('2'),
    'Electronic': genereXScale('2'),
    'Punk': genereXScale('3'),
    'Metal': genereXScale('3'),
    'Other': genereXScale('4'),
    'Jazz/Soul': genereXScale('4')

  };

  // Y locations of the year titles.
  var genreTitleY = {
    'Classic Rock': 0,
    'Indie/Alternative': height / 2.4,
    'Hip Hop': 0,
    'Electronic': height / 2.4,
    'Punk': 0,
    'Metal': height / 2.4,
    'Other': 0,
    'Jazz/Soul': height / 2.4,

  };

  // Used when setting up force and
  // moving around nodes
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  var text = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 7.7;
  }

  var force = d3v3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.011)
    .friction(0.9);

    var fillColor2 = d3v3.scale.ordinal()
    .domain(['Classic Rock', 'Punk', 'Indie/Alternative', 'Metal', 'Hip Hop', 'Electronic', 'Jazz/Soul'])
    .range(['#fbb4ae', '#fddaec', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc','#b3cde3', '#f2f2f2']);

  // Nice looking colors - no reason to buck the trend
  var fillColor = d3v3.scale.ordinal()
    .domain(['low', 'medium', 'high'])
    .range(['red', 'red', '#b2e2e2']);


  var radiusRange = [8, 70];
  if(viewportWidth < 950){
    radiusRange = [6, 50];
  }
  if(viewportWidth < 400){
    radiusRange = [5, 40];
  }

  var radiusScale = d3v3.scale.pow()
    .exponent(2.1)
    .range(radiusRange);

  function createNodes(rawData) {
    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.tote),
        value: d.tote,
        name: d.artist,
        org: d.organization,
        group: d.group,
        genre: d.genre,
        year: d.year,
        x: Math.random() * +genreCenters[d.genre].x,//900,
        y: Math.random() * +genreCenters[d.genre].y
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  var chart = function chart(selector, rawData) {

    var maxAmount = d3v3.max(rawData, function (d) { return +d.tote; });
    radiusScale.domain([0, maxAmount]);

    rawData.sort(function(a, b) { return b.value - a.value; });

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svgContainer = d3v3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    svg = svgContainer
      .append("g")
      .attr("transform","translate("+0+","+margin.top+")")
      ;

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.append("g").selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter()
      .append('g')
      .sort(function(a,b){
        return a.radius - b.radius;
      })
      ; // new below

    bubbles
      .append("circle")
      .classed('bubble', true)
      .attr('class', 'bubble-circle')
      .attr('r', function(d){
        return d.radius-2;
      })
      .attr('fill', function (d) { return fillColor2(d.genre); })
      .attr('stroke', function (d) { return d3v3.rgb(fillColor2(d.genre)).darker(); })
      .attr('stroke-width', function(d){
        if(d.radius > 17){
          return 1.5;
        }
        return .75
      })
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail)
      // .call(force.drag);

    bubbles
      .filter(function(d){
        return d.radius > 17;
      })
      .append("text")
      .text(function(d){
        return d.name;
      })
      ;

    var genreData = d3v3.keys(genreTitleX);

    genreLabels = svg.append("g").selectAll('.genre')
      .data(genreData)
      .enter()
      .append("g")
      .attr("transform",function(d){
        return "translate("+genreTitleX[d]+","+genreTitleY[d]+")"
      })
      ;

    genreLabels.append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; })
      .style("fill",function(d){
        return d3v3.rgb(fillColor2(d)).darker(1.5);
      })
      ;

    genreLabels.append('rect')
      .attr('class', 'title-bar')
      .attr("width",50)
      .attr("height",2)
      .attr("x",-25)
      .attr("y",10)
      .style("fill",function(d){
        return d3v3.rgb(fillColor2(d)).darker();
      })
      ;

    var useData = d3v3.keys(useTitleX);

    use = svg.selectAll('.group')
      .data(useData)
      .enter().append('text')
      .attr('class', 'year')
      .attr("transform",function(d){
        return "translate("+useTitleX[d]+","+100+")"
      })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; })
      ;

    svg.selectAll('.bubble-label')
        .attr('visibility', 'visible');
    // hide popularity axis
    d3.select('.bubble-axis')
        .attr("x2", width / 7)
        .attr("y2", height / 11)
        .attr('visibility', 'hidden')
        ;

    d3.selectAll('.bubble-axis-text')
        .style('opacity', 0);


    groupBubbles();
  };

  d3v3.select("#search")
      .on("keyup", function(event) {

        var searched_data = nodes,
            text = this.value.trim();
        if (text != "" & text != "none") {

            var searchResults = searched_data.map(function(r) {
            var regex = new RegExp("^" + text + ".*", "i");
            if (regex.test(r.name)) { // if there are any results
              return regex.exec(r.name)[0]; // return them to searchResults
            };
          });

          // filter blank entries from searchResults
          searchResults = searchResults.filter(function(r){
            return r != undefined;
          });
          // filter dataset with searchResults
          searched_data = searchResults.map(function(r) {
             return nodes.filter(function(p) {
              return p.name.indexOf(r) != -1;
            });
          });

          // flatten array
          searched_data = [].concat.apply([], searched_data); // This finds the data we want
            // data bind with new data
          selbubbles = bubbles.selectAll('.bubble-circle').data(searched_data, function(d){ return d.name});
          // Style select nodes
          selbubbles
            .style('opacity', .75)
            .style('stroke-width', 3.5)
            .style('stroke', 'black');

        } else {
          d3v3.selectAll('.bubble-circle')
            .style("opacity", null)
            .style('stroke-width', null)
            .style('stroke', null);

        }

        selbubbles
        .exit()
            .style("opacity", null)
            .style('stroke-width', null)
            .style('stroke', null);



      });

  function groupBubbles() {
    hideYears();
    hideUse();
    showGenre();

    var minYUse = {
      'high': 100000000,
      'medium': 100000000,
      'low': 100000000
    }

    var minXUse = {
      'high': 100000000,
      'medium': 100000000,
      'low': 100000000
    }

    var maxXUse = {
      'high': -100000000,
      'medium': -100000000,
      'low': -100000000
    }


    var minY = {
      'Classic Rock': 100000000,
      'Indie/Alternative': 100000000,
      'Hip Hop': 100000000,
      'Electronic': 100000000,
      'Punk': 100000000,
      'Metal': 100000000,
      'Other': 100000000,
      'Jazz/Soul': 100000000,
    }

    var minX = {
      'Classic Rock': 100000000,
      'Indie/Alternative': 100000000,
      'Hip Hop': 100000000,
      'Electronic': 100000000,
      'Punk': 100000000,
      'Metal': 100000000,
      'Other': 100000000,
      'Jazz/Soul': 100000000,
    }

    var maxX = {
      'Classic Rock': -100000000,
      'Indie/Alternative': -100000000,
      'Hip Hop': -100000000,
      'Electronic': -100000000,
      'Punk': -100000000,
      'Metal': -100000000,
      'Other': -100000000,
      'Jazz/Soul': -100000000,
    }

    force.on('tick', function (e) {

      if (e.alpha >= .03) {

        bubbles
          .each(moveToGenre(1.05*e.alpha))

        bubbles
          .attr('transform', function (d) {
            return "translate("+d.x+","+d.y+")";
          })

        } else {

          force.stop();

          bubbles.each(function(d,i){
            if(d.y < minYUse[d["group"]]){
              minYUse[d["group"]] = d.y
            }
            if(d.y < minY[d["genre"]]){
              minY[d["genre"]] = d.y
            }
            if(d.x < minXUse[d["group"]]){
              minXUse[d["group"]] = d.x
            }
            if(d.x < minX[d["genre"]]){
              minX[d["genre"]] = d.x
            }
            if(d.x > maxX[d["genre"]]){
              maxX[d["genre"]] = d.x
            }
            if(d.x > maxXUse[d["group"]]){
              maxXUse[d["group"]] = d.x
            }
          })

          genreLabels
            .transition()
            .duration(500)
            .attr("transform",function(d){
              console.log("here");
              return "translate("+((maxX[d]-minX[d])/2+minX[d])+","+(minY[d] - 50)+")"
            });

          // use.attr("transform",function(d){
          //   var group = d.toLowerCase();
          //   return "translate("+((maxXUse[group]-minXUse[group])/2+minXUse[group])+","+(minYUse[group] - 50)+")"
          // });

        }

    });

    force.start();


  }

  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  function splitBubbles() {
    showYears();

    force.on('tick', function (e) {
      bubbles.each(moveToYears(e.alpha))
        .attr('cx', function (d) {return d.x; })
        .attr('cy', function (d) {return d.y; });
    });


    force.start();
  }

  function splitBubblesUse() {
    hideGenre();
    showUse();

    var minYUse = {
      'high': 100000000,
      'medium': 100000000,
      'low': 100000000
    }

    var minXUse = {
      'high': 100000000,
      'medium': 100000000,
      'low': 100000000
    }

    var maxXUse = {
      'high': -100000000,
      'medium': -100000000,
      'low': -100000000
    }


    var minY = {
      'Classic Rock': 100000000,
      'Indie/Alternative': 100000000,
      'Hip Hop': 100000000,
      'Electronic': 100000000,
      'Punk': 100000000,
      'Metal': 100000000,
      'Other': 100000000,
      'Jazz/Soul': 100000000,
    }

    var minX = {
      'Classic Rock': 100000000,
      'Indie/Alternative': 100000000,
      'Hip Hop': 100000000,
      'Electronic': 100000000,
      'Punk': 100000000,
      'Metal': 100000000,
      'Other': 100000000,
      'Jazz/Soul': 100000000,
    }

    var maxX = {
      'Classic Rock': -100000000,
      'Indie/Alternative': -100000000,
      'Hip Hop': -100000000,
      'Electronic': -100000000,
      'Punk': -100000000,
      'Metal': -100000000,
      'Other': -100000000,
      'Jazz/Soul': -100000000,
    }


    force.on('tick', function (e) {

      // bubbles.each(moveToUse(e.alpha))
      //   .attr('transform', function (d) {
      //     return "translate("+d.x+","+d.y+")";
      //   })

      if (e.alpha >= .03) {

        bubbles
          .each(moveToUse(1.05*e.alpha))

        bubbles
          .attr('transform', function (d) {
            return "translate("+d.x+","+d.y+")";
          })

        } else {

          force.stop();

          bubbles.each(function(d,i){
            if(d.y < minYUse[d["group"]]){
              minYUse[d["group"]] = d.y
            }
            if(d.y < minY[d["genre"]]){
              minY[d["genre"]] = d.y
            }
            if(d.x < minXUse[d["group"]]){
              minXUse[d["group"]] = d.x
            }
            if(d.x < minX[d["genre"]]){
              minX[d["genre"]] = d.x
            }
            if(d.x > maxX[d["genre"]]){
              maxX[d["genre"]] = d.x
            }
            if(d.x > maxXUse[d["group"]]){
              maxXUse[d["group"]] = d.x
            }
          })

          // genreLabels.attr("transform",function(d){
          //   return "translate("+((maxX[d]-minX[d])/2+minX[d])+","+(minY[d] - 50)+")"
          // });

          use
            .transition()
            .duration(500)
            .attr("transform",function(d){
              var group = d.toLowerCase();
              return "translate("+((maxXUse[group]-minXUse[group])/2+minXUse[group])+","+(minYUse[group] - 50)+")"
            });

        }

    });

    force.start();
  }


  function splitBubblesGenre() {
    hideUse();
    showGenre();

    force.on('tick', function (e) {
      bubbles.each(moveToGenre(e.alpha))
        .attr('transform', function (d) {
          return "translate("+d.x+","+d.y+")";
        })
    });

    force.start();
  }

  function moveToYears(alpha) {
    return function (d) {
      var target = yearCenters[d.year];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideYears() {
    svg.selectAll('.year').style("visibility","hidden")
  }

  /*
   * Shows Year title displays.
   */
  function showYears() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var yearsData = d3v3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; })
      ;
  }


  function moveToUse(alpha) {
    return function (d) {
      var target = useCenters[d.group];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideUse() {
    svg.selectAll('.year').style("visibility","hidden")
  }

  function showUse() {
    svg.selectAll('.year').style("visibility","visible")
  }

  function moveToGenre(alpha) {
    return function (d) {
      var target = genreCenters[d.genre];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideGenre() {
    svg.selectAll('.title').style("visibility","hidden")
    svg.selectAll('.title-bar').style("visibility","hidden")
    svg.selectAll('.bubble-label').attr('visibility', 'hidden');
  }

  function showGenre() {
    svg.selectAll('.title').style("visibility","visible")
    svg.selectAll('.title-bar').style("visibility","visible")
    svg.selectAll('.bubble-label').attr('visibility', 'visible');
    // Another way to do this would be to create
    // the year texts once and then just hide them.
  }

  function showDetail(d) {
    var content =
                  '<div class="tttext"><span class="name">Artist: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Amount Used: </span><span class="value">' +
                  d.value +
                  '</span><br/>' +
                  '<span class="name">Genre: </span><span class="value">' +
                  d.genre +
                  '</span><br/></div>';
    tooltip.showTooltip(content, d3v3.event);
  }

  function hideDetail(d) {
    tooltip.hideTooltip();
  }

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    } else if (displayName == 'use') {
      splitBubblesUse();
      if(viewportWidth < 500){
        svgContainer.attr("height",1050)
      }
      else{
        svgContainer.attr("height",700)
      }
    } else if (displayName == 'genre') {
      groupBubbles();
      if(viewportWidth < 500){
        svgContainer.attr("height",2500)
      }
      else{
        svgContainer.attr("height",900)
      }
    } else {
      groupBubbles();
    }
  };

  return chart;
}

var myBubbleChart = bubbleChart();

function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

function setupButtons() {
  d3v3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3v3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3v3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

d3v3.csv('assets/soundtrack_data.csv', display);

// setup the buttons.
setupButtons();

}

export default { init, resize };
