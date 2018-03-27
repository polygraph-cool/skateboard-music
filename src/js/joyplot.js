function resize() {}

function testStoryCode(){
  var container = d3.select('#scroll');
  var graphic = container.select('.scroll__graphic');
  var chart = graphic.select('.chart');
  var text = container.select('.scroll__text');
  var step = text.selectAll('.step');
  var colors = ['coral', 'green', 'blue', 'red'];
  var width = d3.select('div.joyplot').node().offsetWidth;
  // var maskRange = [width/10, width, width/5, width/3, width/ 2, width, width];
  var maskScale = d3.scaleLinear()
    .domain([1, 4])
    .range([0, width]);


  var scroller = scrollama();

  // generic window resize listener event
  function handleResize() {
    // // Resize elements in step box
    // var stepHeight = Math.floor(window.innerHeight) * .75;
    // step.style('height', stepHeight + 'px');
    //
    // // 2. update width/height of graphic element
    // var bodyWidth = d3.select('body').node().offsetWidth ;
    // graphic.style('width', bodyWidth + 'px')
    //   .style('height', window.innerHeight + 'px');
    //
    // var chartMargin = 50;
    // var textWidth = text.node().offsetWidth;
    // var chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
    // chart
    //   .style('width', chartWidth + 'px')
    //   // idk why but dividing height by 1.05
    //   .style('height', Math.floor(window.innerHeight / 1.15 ) + 'px');
    // // 3. tell scrollama to update new element dimensions
    // scroller.resize();
  }

  // scrollama event handlers
  function handleStepEnter(response) {

    console.log('ENTERED STEP');
    d3.selectAll('rect#maskRect')
      .attr('x', function(d) {
        return maskScale(response.index);
      })
      .transition()
      .duration(2000)
      .delay(200)
      .attr('x', function(d) {
        return maskScale(response.index + 1);
      });
    // var mrWidth = d3.selectAll('#maskRect').attr('width');
    // d3.select('.maskRect').attr('width', mrWidth / 2);
  }
  function handleContainerEnter(response) {
    // response = { direction }
    // sticky the graphic (old school)
    console.log('just entered');
    graphic.classed('is-fixed', true);
    graphic.classed('is-bottom', false);
  }
  function handleContainerExit(response) {
    // response = { direction }
    // un-sticky the graphic, and pin to top/bottom of container
    graphic.classed('is-fixed', false);
    graphic.classed('is-bottom', response.direction === 'down');
  }

  function init() {
    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();
    // 2. setup the scroller passing options
    // this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller.setup({
        container: '#scroll',
        graphic: '.scroll__graphic',
        text: '.scroll__text',
        step: '.scroll__text .step',
        debug: false,  // uncomment to have interactive debug
        offset: .5,
      })
      .onStepEnter(handleStepEnter)
      .onContainerEnter(handleContainerEnter)
      .onContainerExit(handleContainerExit);
    // setup resize event
    window.addEventListener('resize', handleResize);
  }
  // kick things off
  init();
}

function init() {

  var windowHeight = Math.max(document.documentElement.clientHeight / 1.8, window.innerHeight / 1.8 || 0);

  var margin = { top: 0, right: 10, bottom: 50, left: 150 },
      width = d3.select('div.chart').node().offsetWidth - margin.left - margin.right,
      height = windowHeight - margin.top - margin.bottom;

  var svg = d3.selectAll('.joyplot').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // NEED TO FIGURE THIS OUT
  var formatTime = d3.timeFormat('%Y');

  // Function to return d.time
  var x = function(d) { return d.time; };

  // xScale
  var xScale = d3.scaleTime().range([0, width]);
  var xValue = function(d) { return xScale(x(d)); };
  var xAxis = d3.axisBottom(xScale)
              .tickFormat(formatTime).ticks(10);

  var y = function(d) { return d.value; };
  var yScale = d3.scaleLinear();
  var yValue = function(d) { return yScale(y(d)) + 10; };

  var genre = function(d) { return d.key; };
  var genreScale = d3.scaleBand().range([0, height]);
  var genreValue = function(d) { return genreScale(genre(d)); };

  var genreAxis = d3.axisLeft(genreScale);

  var area = d3.area()
      .x(xValue)
      .y1(yValue);

  var line = area.lineY1();

  var parseTime = d3.timeParse('%Y');

  function row(d) {
      return {
          activity: d.activity,
          time: parseTime(+d.time),
          value: +d.p_smooth
      };
  }

  d3.tsv('assets/cities.tsv', row, function(error, dataFlat) {

    if (error) throw error;
    // Sort x-axis by time
    dataFlat.sort(function(a, b) { return a.time - b.time; });

    var data = d3.nest()
        .key(function(d) { return d.activity; })
        .entries(dataFlat);

    // Place activities based in order of max peak time
    function peakTime(d) {
        var i = d3.scan(d.values, function(a, b) { return y(a) - y(b); });
        return d.values[i].time;
    };

    // Sort activities by use
    var genreDomain = ["Indie/Alternative", "Hip Hop", "Punk", "Classic Rock", "Jazz/Soul", "Other", "Electronic", "Metal", "Rock"];

    data.sort(function (a, b) {return genreDomain.indexOf(a.key) - genreDomain.indexOf(b.key)})

    // data.sort(function(a, b) { return peakTime(a) - peakTime(b); });

    xScale.domain(d3.extent(dataFlat, x));

    genreScale.domain(genreDomain);
    // genreScale.domain(data.map(function(d) { return d.key; }));

    var overlap = 3;
    var areaChartHeight = (1 + overlap) * (height / genreScale.domain().length);

    yScale
        .domain(d3.extent(dataFlat, y))
        .range([areaChartHeight, 0]);

    area.y0(yScale(0));

    // svg.append('g')
    //     .attr('class', 'axis axis--activity')
    //     .attr('transform', 'translate(0,' + 0 + ')')
    //     .call(genreAxis);

    // // set y-axis labels
    var gGenre = svg.append('g')
      .attr('class', 'activities')
      .selectAll('.activity').data(data)
      .enter()
      .append('g')
      .attr('class', function(d) { return 'activity activity--' + d.key; })
      .attr('transform', function(d) {
          // var ty = genreValue(d) - genreScale.bandwidth();
          var ty = genreValue(d) - Math.round(areaChartHeight);
          return 'translate(0,' + ty + ')';
      });


    gGenre
        .append('g')
        .attr('transform', function(d) {
          // var ty = 2 * genreScale.bandwidth();
          var ty = Math.round(areaChartHeight) + genreScale.domain().length * 1.5;
          return 'translate(0,' + ty + ')';
      })
        .append('text').html(function(d) { return d.key; }).attr('fill', 'white')
        .attr("text-anchor","end");


    gGenre.append('path')
        .attr('class', 'area')
        .datum(function(d) { return d.values; })
        .filter(function(d) {
                var tt = d.filter(function(d) {
                    return formatTime(d.time) < 1995;});
            return tt
        })
        .attr('d', area);

    gGenre.append('path')
        .attr('class', 'line')
        .datum(function(d) { return d.values; })
        .attr('d', line)
        .attr('stroke', 'white')
        .style('opacity', 1);

    //
    gGenre.append('rect')
        .attr('width', d3.select('div.joyplot').node().offsetWidth)
        .attr('height', d3.select('div.chart').node().offsetHeight) // was divided by 2.7 => bad
        .attr('fill', 'black')
        .attr('id', 'maskRect')
        .attr('opacity', 1);

    svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + (height) + ')') 
        .call(xAxis)
        .selectAll("text")
        .attr("y",13)
        ;

    // Remove years in x-axis for which no data actually exists
    d3.selectAll(".tick text")
        .each( function(d, i) {
            if (i == 9 | i == 10 | i == 18) {
                d3.select(this)
                    .attr('visibility', 'hidden');
            }
        });

    d3.selectAll('.tick')
        .each( function(d, i) {
            if (i == 9 | i == 10 | i == 18) {
                d3.select(this)
                    .attr('visibility', 'hidden');
            }
        });

    d3.select('svg')
        .append('text')
        .attr('class', 'joytitle')
        .attr('x', width / 2)
        .attr('y', 10)
        .attr('fill', 'white')
        .style('font-size', '40px')
        .text('title');

  });

  testStoryCode();
}

export default { init, resize };
