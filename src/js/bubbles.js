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
  var searchBar = d3v3.select('.SearchBar');

  var margin = {top: 20, bottom: 20, left: 50, right: 20};
  // var width = 1500 - margin.right;
  // var height = 1000 - margin.top - margin.bottom;
  // var boundingRect = d3.select('#vis').node().getBoundingClientRect();
  var width = window.innerWidth - margin.left - margin.right;
  var height = window.innerHeight + 10;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('bubble_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var selbubbles = [];

  var popScale = d3.scaleLinear()
                  .domain(['low', 'medium', 'high'])
                  .range([width/4, width/1.5]);


  var useCenters = {
    'low': { x: width / 4, y: height / 2 },
    'medium': { x: width / 2.75, y: height / 2 },
    'high': { x: width / 1.5, y: height / 2 }
  };

  // X locations of the year titles.
  var useTitleX = {
    'Low': width / 6,
    'Medium': width / 2.3,
    'High': width / 1.35
  };

  var genreCenters = {
    'Classic Rock': { x: width/4.7, y: height / 2.6},
    'Indie/Alternative': { x: width/4.65, y: height / 1.8 },
    'Hip Hop': { x: width/2.75, y: height / 2.6},
    'Electronic': { x: width/2.7, y: height / 1.8},
    'Punk': { x: width/1.9, y: height / 2.6},
    'Metal': { x: width/1.9, y: height / 1.8},
    'Other': { x: width/1.55, y: height / 2.75},
    'Jazz/Soul': { x: width/1.55, y: height / 1.8},
    'Rock': { x: width/1.55, y: height / 2.6}
  };

  // X locations of the year titles.
  var genreTitleX = {
    'Classic Rock': width/7 - 30 + 30,
    'Indie/Alternative': width/7 - 30 + 30,
    'Hip Hop': width/7*2.5 + 30,
    'Electronic': width/7 * 2.5 + 30,
    'Punk': width/7*4 + 10,
    'Metal': width/7 * 4 + 10,
    'Other': width/7 * 5.1 + 50,
    'Jazz/Soul': width/7 * 5.1 + 50

  };

  // Y locations of the year titles.
  var genreTitleY = {
    'Classic Rock': height / 12,
    'Indie/Alternative': height / 2,
    'Hip Hop': height / 12,
    'Electronic': height / 2,
    'Punk': height / 12,
    'Metal': height / 2,
    'Other': height / 12,
    'Jazz/Soul': height / 2,

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
    return -Math.pow(d.radius, 2.0) / 8;
  }

  var force = d3v3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);

    var fillColor2 = d3v3.scale.ordinal()
    .domain(['Classic Rock', 'Punk', 'Indie/Alternative', 'Metal', 'Hip Hop', 'Electronic', 'Jazz/Soul'])
    .range(['#fbb4ae', '#fddaec', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc','#b3cde3', '#f2f2f2']);

  // Nice looking colors - no reason to buck the trend
  var fillColor = d3v3.scale.ordinal()
    .domain(['low', 'medium', 'high'])
    .range(['red', 'red', '#b2e2e2']);

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3v3.scale.pow()
    .exponent(1.8)  // exponent makes the graph 'tighter'
    .range([9, 70]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3v3's loading functions like d3v3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
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
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3v3 loading function like d3v3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    var maxAmount = d3v3.max(rawData, function (d) { return +d.tote; });
    radiusScale.domain([0, maxAmount]);

    rawData.sort(function(a, b) { return b.value - a.value; });

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3v3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // bubble plot axis stuff
    svg.append('line')
      .attr('class', 'bubble-axis')
      .attr("x1", width / 7)
      .attr("y1", height / 11)
      .attr("x2", width / 7)
      .attr("y2", height / 11)
      .attr("stroke", "#000")
      .attr("stroke-width", 4)
      // .attr("marker-end", "url(#arrow)")
      .style('opacity', .5)
      .attr('visibility', 'hidden');


    svg.append('text')
      .attr('class', 'bubble-axis-text')
      .attr('x', width / 6.5)
      .attr('y', height / 12)
      .text('Artists Grouped By Popularity')
      .style('font-weight', 'bold')
      .style('font-size', 30)
      .style('opacity', 0);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter()
      .append('g')

    bubbles
      .append("circle")
      .classed('bubble', true)
      .attr('class', 'bubble-circle')
      .attr('r', function(d){
        return d.radius;
      })
      .attr('fill', function (d) { return fillColor2(d.genre); })
      .attr('stroke', function (d) { return d3v3.rgb(fillColor2(d.genre)).darker(); })
      .attr('stroke-width', 0.5)
      .attr('opacity', .75)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail)
      .call(force.drag);

    bubbles
      .append("text")
      .text(function(d){
        if(d.radius > 17 & d3.randomUniform(1, 10)() > 5){
          return d.name;
        } else if(d.radius > 5 & d3.randomUniform(1, 10)() > 9.5) {
          return d.name;
        }
      });

    // text = svg.selectAll("text.bubble-label")
    //  .data(nodes, function (d) { return d.id; })
    //     .enter()
    //     .append("text")
    //     .attr("class", "bubble-label")
    //     .text(function(d) {
    //       if (d.value < 17) {
    //         return "";
    //       } else {
    //         return d.name;
    //       }
    //     });

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(3000)
      .attr('r', function (d) {return d.radius; });

    // Set initial layout to single group.
    groupBubbles();
  };

  d3v3.select(".SearchBar")
    .append("input")
      .attr("class", "SearchBar")
      .attr("id", "search")
      .attr("type", "text")
      .attr("placeholder", "Find an artist...");

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
            .attr('stroke-width', 3.5)
            .attr('stroke', 'black');

        } else {
          d3v3.selectAll('.bubble-circle')
            .style("opacity", 1)
            .attr('stroke-width', .5)
            .attr('stroke', function (d) { return d3v3.rgb(fillColor2(d.genre)).darker(); });

        }

        selbubbles
        .exit()
            .style("opacity", .75)
            .attr('stroke-width', .5)
            .attr('stroke', function (d) { return d3v3.rgb(fillColor2(d.genre)).darker(); });



      });
  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYears();
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

    force.on('tick', function (e) {
      bubbles.each(moveToUse(e.alpha))
        .attr('transform', function (d) {
          return "translate("+d.x+","+d.y+")";
        })
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


  /*
   * Helper function for "split by year mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToYears(alpha) {
    return function (d) {
      var target = yearCenters[d.year];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideYears() {
    svg.selectAll('.year').remove();
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
      .text(function (d) { return d; });
  }


  function moveToUse(alpha) {
    return function (d) {
      var target = useCenters[d.group];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideUse() {
    svg.selectAll('.year').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showUse() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var useData = d3v3.keys(useTitleX);
    var use = svg.selectAll('.group')
      .data(useData);

    use.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return useTitleX[d]; })
      .attr('y', height / 5.5)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  function moveToGenre(alpha) {
    return function (d) {
      var target = genreCenters[d.genre];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideGenre() {
    svg.selectAll('.title').remove();
    svg.selectAll('.bubble-label')
        .attr('visibility', 'hidden');

    d3.selectAll('.bubble-axis-text')
        // .attr('visibility', 'hidden')
        .transition()
        .duration(3600)
        .style('opacity', .5);
    // show popularity axis
    d3.select('.bubble-axis')
        .attr('visibility', 'visible')
        .transition()
        .duration(3000)
        .attr("x2", width / 2)
        .attr("y2", height / 11)
        // .attr("marker-end", "url(#arrow)")
        .style('opacity', .5);
  }

  /*
   * Shows Year title displays.
   */
  function showGenre() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var genreData = d3v3.keys(genreTitleX);
    var genre = svg.selectAll('.genre')
      .data(genreData);


    genre.enter().append('text')
      .attr('class', 'title')
      .attr('x', function (d) { return genreTitleX[d]; })
      .attr('y', function (d) { return genreTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });

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
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3v3.select(this).attr('stroke', 'black')
                    .attr('stroke-width', 2.4)
                    .style('opacity', .75)
                    .attr('r', function (d) { return d.radius + 5; });

    var content = '<span class="name">Artist: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Number of Times Used: </span><span class="value">' +
                  d.value +
                  '</span><br/>' +
                  '<span class="name">Genre: </span><span class="value">' +
                  d.genre +
                  '</span><br/>';
    tooltip.showTooltip(content, d3v3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3v3.select(this)
      .attr('stroke', d3v3.rgb(fillColor2(d.genre)).darker())
      .attr('stroke-width', .5)
      .style('opacity', .75)
      .attr('fill', function (d) { return fillColor2(d.genre); })
      .attr('r', function (d) { return d.radius; });

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    } else if (displayName == 'use') {
      splitBubblesUse();
    } else if (displayName == 'genre') {
      splitBubblesGenre();
    } else {
      groupBubbles();
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
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


// Load the data.
d3v3.csv('assets/soundtrack_data.csv', display);

// setup the buttons.
setupButtons();

}

export default { init, resize };
