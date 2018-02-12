// D3 is included by globally by default

function resize() {}

function init() {
	console.log('newtest.js found!');



function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3v3.select('#vis')
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
   * based on d3 mouse event.
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



function bubbleChart() {

  // var searchBar = d3v3.select('body').append("div").attr("class", "SearchBar");
  var searchBar = d3v3.select('.SearchBar');

  var margin = {top: 20, bottom: 20, left: 20, right: 20};
  var width = 1400 - margin.left - margin.right;
  var height = 1000 - margin.top - margin.bottom;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('bubble_tooltip', 240);

  // DEFINE CENTERS FOR TOGGLE OPTIONS
  var center = { x: width / 2, y: height / 2 };

  var selbubbles = [];

  var useCenters = {
    'lowest': {x: width / 3.8  , y:height /2},
    'low': { x: width / 3 , y: height / 2 },
    'medium-lower': { x: width / 2.4 , y: height / 2 },
    'medium-low': { x: width / 1.8 , y: height / 2 },
    'medium': { x: width / 1.4 , y: height / 2 },
    'high': { x: width / 1.4 , y: height / 2 }
  };

  var useTitleX = {
    '': 200 + 30,
    '': 375 + 30,
    '': 560 + 30,
    '': 600 + 30,
    '': 780 + 30
  };

  var genreCenters = {
    'Classic Rock': { x: width/7 + 80 + 30, y: height / 3.2},
    'Indie/Alternative': { x: width/7 + 80 + 30, y: height / 1.7 },
    'Hip Hop': { x: width/7*2.8 - 60 + 30, y: height / 3.2},
    'Electronic': { x: width/7*2.8 - 60 + 30, y: height / 1.8},
    'Punk': { x: width/7*4 - 30, y: height / 3.2},
    'Metal': { x: width/7*4 - 90 + 30, y: height / 1.75},
    'Other': { x: width/7*5 - 75 + 30, y: height / 3.2},
    'Jazz/Soul': { x: width/7*5 - 75 + 30, y: height / 1.68},
    'Rock': { x: width/7*5 - 75 + 30, y: height / 3.2}
  };

  var genreTitleX = {
    'Classic Rock': width/7 - 30 + 30,
    'Indie/Alternative': width/7 - 30 + 30,
    'Hip Hop': width/7*2.5 + 30,
    'Electronic': width/7 * 2.5 + 30,
    'Punk': width/7*4 + 10,
    'Metal': width/7 * 4 + 10,
    'Other': width/7 * 5.1 + 50,
    'Jazz/Soul': width/7 * 5.1 + 50,
    // 'Rock': width/7 * 5.1 + 70,

  };

  var genreTitleY = {
    'Classic Rock': 55,
    'Indie/Alternative': 430,
    'Hip Hop': 55,
    'Electronic': 430,
    'Punk': 55,
    'Metal': 430,
    'Other': 55,
    'Jazz/Soul': 430,
    // 'Rock': 55

  };

  // Used when setting up force and
  // moving around nodes
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  var label_array = [];
  var anchor_array = [];
  var text = [];

  // Function to repel nodes
  function charge(d) {
    return -Math.pow(d.radius, 2) / 8;
  }

  // Initialize and configure force layout
  console.log(d3v3.version);
  var force = d3v3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);

  // Scale for node colors
  var bubbleColor = d3v3.scale.ordinal()
    .domain(['Classic Rock', 'Punk', 'Indie/Alternative', 'Metal', 'Hip Hop', 'Electronic', 'Jazz/Soul', 'Rock'])
    .range(['#fbb4ae', '#fddaec', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc','#b3cde3', '#f2f2f2', '#f2f2f2']);

  // Scale for node sizes
  var radiusScale = d3v3.scale.pow()
    .exponent(1.9)  
    .range([9, 9]); //8 62

  
   // Functiont to convert csv data to array of node objects
  function createNodes(rawData) {

    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.artist_total),
        value: d.artist_total,
        name: d.artist,
        group: d.group,
        genre: d.genre,
        art: d.album_art_url,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort nodes prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

   // Function to prepare the rawData for visualization and add an svg element
   // to the provided selector and starts the visualization creation process.
  var chart = function chart(selector, rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    var maxAmount = d3v3.max(rawData, function (d) { return +d.artist_total; });
    radiusScale.domain([0, maxAmount]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3v3.select(selector)
      .append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom);

    svg.append('line')
      .attr('class', 'linetest')
      .attr("x1", width / 6)
      .attr("y1", height / 6.3)
      .attr("x2", width / 1.2)
      .attr("y2", height / 6.3)
      .attr("stroke", "#000")
      .attr("stroke-width", 8)
      .style('opacity', .5)
      .attr('visibility', 'hidden');

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles= svg.selectAll('bubble')
      .data(nodes, function (d) { return d.id; })
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', 0)
      .attr('fill', function (d) { return bubbleColor(d.genre); })
      .attr('stroke', function (d) { return d3v3.rgb(bubbleColor(d.genre)).darker(); })
      .attr('stroke-width', 0.5)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail)
      .call(force.drag);

     console.log(nodes);

    text = svg.selectAll("text.bubble-label")    
     .data(nodes, function (d) { return d.id; })
        .enter()
        .append("text")
        .attr("class", "bubble-label")
        .text(function(d) {
          if (d.value < 17) {
            return "";
          } else {
            return d.name;
          }
        });



    // Transition to fill bubblenodes
    bubbles.transition()
      .duration(4000)
      .attr('r', function (d) {return d.radius; });

    // Set initial layout to genre group.
    splitBubblesGenre();

// Search


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
          selbubbles = bubbles.data(searched_data, function(d){ return d.name});

          // Style select nodes
          selbubbles
            .style('opacity', .75)
            .attr('stroke-width', 3)
            .attr('stroke', 'black');

        } else {
          d3v3.selectAll('.bubble')
            .style("opacity", 1)
            .attr('stroke-width', .5)
            .attr('stroke', function (d) { return d3v3.rgb(bubbleColor(d.genre)).darker(); });
        }

        selbubbles
        .exit()
            .style("opacity", 1)
            .attr('stroke-width', .5)
            .attr('stroke', function (d) { return d3v3.rgb(bubbleColor(d.genre)).darker(); });
          
      

      });


  function splitBubblesUse() {
    hideGenre();
    showUse();

    force.on('tick', function (e) {
      bubbles.each(moveToUse(e.alpha))
        .attr('cx', function (d) {return d.x; })
        .attr('cy', function (d) {return d.y; });
      

      text.attr("transform", function(d){ 

      //   label_array.push({x: d.x, y: d.y, name: d.name, width: 0.0, height: 0.0});
      //   anchor_array.push({x: d.x+.1, y: d.y+5, r: d.radius});
        return "translate("+(d.x - 10)+","+d.y+")"; });

    });

    force.start();
  //   d3v3.labeler()
  //   .label(label_array)
  //   .anchor(anchor_array)
  //   .width(w)
  //   .height(h)
  //   .start(100);
  };

  function splitBubblesGenre() {
    hideUse();
    showGenre();

    force.on('tick', function (e) {
      bubbles.each(moveToGenre(e.alpha))
        .attr('cx', function (d) {return d.x; })
        .attr('cy', function (d) {return d.y; });
      

    text.attr("transform", function(d){ 

    //   label_array.push({x: d.x, y: d.y, name: d.name, width: 0.0, height: 0.0});
    //   anchor_array.push({x: d.x, y: d.y, r: d.radius});
      return "translate("+(d.x - 10) +","+d.y+")"; });

    });

    force.start();
    // d3v3.labeler()
    // .label(label_array)
    // .anchor(anchor_array)
    // .width(w)
    // .height(h)
    // .start(1);
  };


  // Stuff for popularity
  function moveToUse(alpha) {
    return function (d) {
      var target = useCenters[d.group];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  };

  
  function hideUse() {
    svg.selectAll('.title').remove();
  };

  function showUse() {

    var useData = d3v3.keys(useTitleX);
    var use = svg.selectAll('.group')
      .data(useData);
    

    use.enter().append('text')
      .attr('class', 'title')
      .attr('x', function (d) { return useTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  // Stuff for genre
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
    // show popularity axis
    d3.select('.linetest')
        .attr('visibility', 'visible');
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
    d3.select('.linetest')
        .attr('visibility', 'hidden');
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

    var content = '<div class="ttimg"><img class="tooltipimage" src=' + d.art + '></div>' +
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

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3v3.select(this)
      .attr('stroke', d3v3.rgb(bubbleColor(d.genre)).darker())
      .attr('stroke-width', .5)
      .style('opacity', 1)
      .attr('fill', function (d) { return bubbleColor(d.genre); })
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
    if (displayName == 'use') {
      splitBubblesUse();
    } else {
      splitBubblesGenre();
    };
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
d3v3.csv('assets/bubble_1.csv', display);

// setup the buttons.
setupButtons();


}

export default { init, resize };
