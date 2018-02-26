function resize() {}

function init() {


var margin = { top: 100, right: 10, bottom: 100, left: 110 },
    width = 1000 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var svg = d3.selectAll('.joyplot').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Percent two area charts can overlap
var overlap = 0.75;

// NEED TO FIGURE THIS OUT
var formatTime = d3.timeFormat('%Y');

// Function to return d.time
var x = function(d) { return d.time; };

// xScale
var xScale = d3.scaleTime().range([0, width]);
var xValue = function(d) { return xScale(x(d)); };
var xAxis = d3.axisBottom(xScale)
            .tickFormat(formatTime).ticks(10);

// y
var y = function(d) { return d.value; };
var yScale = d3.scaleLinear();
var yValue = function(d) { return yScale(y(d)) + 10; };

//
var genre = function(d) { return d.key; };
var genreScale = d3.scaleBand().range([0, height - 600]);
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
    var genreDomain = ["Indie/Alternative", "Hip Hop", "Punk", "Classic Rock", "Other", "Jazz/Soul", "Electronic", "Metal", "Rock"];

    data.sort(function (a, b) {return genreDomain.indexOf(a.key) - genreDomain.indexOf(b.key)})

    // data.sort(function(a, b) { return peakTime(a) - peakTime(b); });

    xScale.domain(d3.extent(dataFlat, x));

    genreScale.domain(genreDomain); 
    // genreScale.domain(data.map(function(d) { return d.key; }));

    var areaChartHeight = (1 + overlap) * (height / genreScale.domain().length);

    yScale
        .domain(d3.extent(dataFlat, y))
        .range([areaChartHeight, 0]);
    
    area.y0(yScale(0));

    svg.append('g')
        .attr('class', 'axis axis--activity')
        .attr('transform', 'translate(0,' + 148 + ')')
        .call(genreAxis);

    // set y-axis labels
    var gGenre = svg.append('g')
            .attr('class', 'activities')
            .selectAll('.activity').data(data)
            .enter().append('g')
                .attr('class', function(d) { return 'activity activity--' + d.key; })
                .attr('transform', function(d) {
                    var ty = genreValue(d) - genreScale.bandwidth() + 5;
                    return 'translate(0,' + ty + ')';
                });



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

    gGenre.append('rect')
        .attr('width', d3.select('div.joyplot').node().offsetWidth)
        .attr('height', d3.select('div.joyplot').node().offsetHeight)
        .attr('fill', 'black')
        .attr('id', 'maskRect')
        .attr('opacity', 1);

    svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + (height / 2 + 50) + ')') // hard-coded => bad
        .call(xAxis);

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

}

export default { init, resize };