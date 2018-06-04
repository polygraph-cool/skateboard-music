function resize() {}

function init() {

var WaffleChart = function() {

  var $_selector,
      $_title,
      $_data,
      $_label,
      $_cellSize,
      $_cellGap,
      $_rows,
      $_columns,
      $_rounded,
      $_keys,
      $_useWidth,
      $_useLegend;

  var defaults = {
    size: 3,
    rows: 25,
    columns: 50,
    rounded: false,
    gap: 2,
    useLegend: false
  };

  function generatedWaffleChart() {

    $_keys = d3v3.keys($_data[0]);

    var obj = {
      selector: $_selector,
      title: $_title,
      data: $_data,
      label: $_label,
      size: $_cellSize,
      gap: $_cellGap,
      rows: $_rows,
      columns: $_columns,
      rounded: $_rounded
    };

    drawWaffleChart(obj);

  }

  function drawWaffleChart(_obj) {

    if (!_obj.size) { _obj.size = defaults.size; }
    if (!_obj.rows) { _obj.rows = defaults.rows; }
    if (!_obj.columns) { _obj.columns = defaults.columns; }
    if (_obj.gap === undefined) { _obj.gap = defaults.gap; }
    if (_obj.rounded === undefined) { _obj.columns = defaults.rounded; }

    var formattedData = [];
    var domain = [];
    var value = $_keys[$_keys.length - 1];
    var total = d3v3.sum(_obj.data, function(d) { return d[value]; });

    if ($_useWidth) {
      var forcedWidth = d3v3.select(_obj.selector).node().getBoundingClientRect().width;
      _obj.columns = Math.floor(forcedWidth / (_obj.size + _obj.gap));
    }

    var squareVal = total / (_obj.rows * _obj.columns);

    _obj.data.forEach(function(d, i) {
      d[value] = +d[value];
      d.units = Math.floor(d[value] / squareVal);
      Array(d.units + 1).join(1).split('').map(function() {
        formattedData.push({
          squareVal: squareVal,
          units: d.units,
          value: d[value],
          groupIndex: i
        });
      });
      domain.push(d[$_keys[0]]);
    });

    var red = "#CE2A23";

    var colorMap = {
      'Indie/Alternative': 0,
      'Classic Rock': 1,
      'Hip Hop': 2, //3th
      'Punk': 3, //4th
      'Metal': 4, //5th
      'Electronic': 5,
      'Jazz/Soul': 6,
      'Other': 7 //1
    };

    var color = d3v3.scale.ordinal()
      // .domain([0, _obj.data.length - 1]) >> changed this
      .domain([0, 1, 2, 3, 4, 5, 6, 7])
      .range(['#ccebc5', '#f2f2f2', '#fbb4ae','#fed9a6','#fddaec','#decbe4', '#f9f9bb','#b3cde3']);

    //if (_obj.label) {
      d3v3.select(_obj.selector)
        .append("div")
        .attr("class", "label")
        .text(_obj.label);
    //}

    // set up title
    var title = d3v3.select($_selector)
      .append("div");

    // add legend
    if ($_useLegend) {
        var legend = d3v3.select('.waffle_legend')
        .append("div")
        .attr("class", "legend");

      var legendItem = legend.selectAll("div")
        .data(_obj.data);

      legendItem.enter()
        .append("div")
        .attr("class", function(d, i) {
          return "legend_item legend_item_" + (i + 1);
        });

      var legendIcon = legendItem.append("div")
        .attr("class", "legend_item_icon")
        .style("background-color", function(d, i) {
            return color(i);
         // }
        });

      if (_obj.rounded) {
        legendIcon.style("border-radius", "100%"); // circles
      }

      legendItem.append("span")
        .attr("class", "legend_item_text")
        .text(function(d) { return d[$_keys[0]]; });
    }

    var width = (_obj.size * _obj.columns) + (_obj.columns * _obj.gap) - _obj.gap;
    var height = (_obj.size * _obj.rows) + (_obj.rows * _obj.gap) - _obj.gap;

    if ($_useWidth) {
      width = d3v3.select(_obj.selector).node().getBoundingClientRect().width;
    }

    var svg = d3v3.selectAll(_obj.selector)
      .append("div")
      .attr("class", "waffle-wrapper")
      .append("svg")
      .attr("class", "waffle")
      .attr("width", width)
      .attr("height", height);


    var g = svg.append("g")
      .attr("transform", "translate(0,0)");


    // insert dem items

    var item = g.selectAll(".unit")
      .data(formattedData);

    item.enter()
      .append("rect")
      .attr("class", "unit")
      .attr("width", _obj.size)
      .attr("height", _obj.size)
      .attr("fill", function (d) { return color(d.groupIndex); })
      // .on('mouseover', mouseover)
      .attr("x", function(d, i) {
        var col = Math.floor(i / _obj.rows);
        return (col * (_obj.size)) + (col * _obj.gap);
      })
      .attr("y", function(d, i) {
        var row = i % _obj.rows;
        return (_obj.rows * (_obj.size + _obj.gap)) - ((row * _obj.size) + (row * _obj.gap)) - _obj.size - _obj.gap;
      })
      .append("title")
      .text(function (d, i) {
        // console.log(d);
        return _obj.data[d.groupIndex][$_keys[0]] + ": " + Math.round((d.units / formattedData.length) * 100) + "%";
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // tooltip
    var tooltip = d3.select($_selector).append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // d3v3.selectAll('.unit')
    //   .on('mouseover', function(d) {
    //     console.log(Math.round((d.units / formattedData.length) * 100) + "%");
    //     tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9);
    //             console.log(_obj.data[d.groupIndex]);
    //     tooltip.html(_obj.data[d.groupIndex][$_keys[0]] + ": " + Math.round((d.units / formattedData.length) * 100) + "%")
    //       .style("left", (d3v3.event.pageX) + "px")
    //       .style("top", (d3v3.event.pageY - 10) + "px");
    //   })
    //   .on("mouseout", function(d) {
    //         tooltip.transition()
    //             .style("opacity", 0);
    //     });;



    if (_obj.rounded) {
      item
        .attr("rx", (_obj.size / 2))
        .attr("ry", (_obj.size / 2));
    }

    title.append('div')
      .append("p")
      .attr('class', 'waffle_title')
      .text($_title);

  }

  generatedWaffleChart.selector = function(value){
    if (!arguments.length) { return $_selector; }
    $_selector = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.title = function(value){
    if (!arguments.length) { return $_title; }
    $_title = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.data = function(value){
    if (!arguments.length) { return $_data; }
    $_data = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.useWidth = function(value){
    if (!arguments.length) { return $_useWidth; }
    $_useWidth = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.useLegend = function(value){
    if (!arguments.length) { return $_useLegend; }
    $_useLegend = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.label = function(value){
    if (!arguments.length) { return $_label; }
    $_label = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.size = function(value){
    if (!arguments.length) { return $_cellSize; }
    $_cellSize = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.gap = function(value){
    if (!arguments.length) { return $_cellGap; }
    $_cellGap = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.rows = function(value){
    if (!arguments.length) { return $_rows; }
    $_rows = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.columns = function(value){
    if (!arguments.length) { return $_columns; }
    $_columns = value;
    return generatedWaffleChart;
  }

  generatedWaffleChart.rounded = function(value){
    if (!arguments.length) { return $_rounded; }
    $_rounded = value;
    return generatedWaffleChart;
  }

  return generatedWaffleChart;

};


d3v3.csv("assets/waffle.csv", function(err, data) {
      if (err) {
        console.error(err);
      } else {
        var companyNest = d3.nest().key(function(d){
          return d.company;
        })
        .entries(data)

        // var waffleCompany = d3.select(".waffle_new")
        //   .selectAll("div")
        //   .data(companyNest)
        //   .enter()
        //   .append("div")
        //   .attr("class","waffle-company")
        //   ;

        // waffleCompany.append("p")
        //   .attr("class","waffle-company-name")
        //   .text(function(d){
        //     return d.key;
        //   })

        // var boxesPerColumn = 34;
        // var columnWidth = 4;
        //
        // waffleCompany
        //   .style("width",function(d){
        //     var numberOfBoxes = d3.sum(d.values,function(d){return +d.value});
        //     var columns = numberOfBoxes/boxesPerColumn;
        //     return columns*columnWidth+"px"
        //   })
        //   .style("height",function(d){
        //     return boxesPerColumn*columnWidth+"px"
        //   })
        //   // .append("div")
        //   // .attr("class","waffle-company-box-container")
        //   .selectAll("div")
        //   .data(function(d){
        //     console.log(d.values);
        //     var boxes = d3.range(d3.sum(d.values,function(d){return +d.value}));
        //     console.log(boxes);
        //     return boxes;
        //     // boxes.map(function(d){
        //     //
        //     // })
        //   })
        //   .enter()
        //   .append("div")
        //   .attr("class","waffle-company-box")
        //   .style("transform",function(d,i){
        //     var xPos = Math.floor(i/boxesPerColumn) * 4;
        //     var yPos = i % boxesPerColumn * 4;
        //     return "translate("+xPos+"px,"+yPos+"px)"
        //   })
        //   ;

        for (var company in companyNest){
          var dataPoints = companyNest[company].values;
          dataPoints = dataPoints.map(function(d){
            return {source:d.source,value:d.value}
          })

          var companyName = companyNest[company].key;
          var string = ".waffle_row_"+(+company+1);
          var legendUse = false;
          if(company == 0){
            legendUse = true;
          }

          var waffle = new WaffleChart()
            .selector(string)
            .title(companyName)
            .data(dataPoints)
            .useWidth(false).useLegend(legendUse)
            .size(5)
            .gap(0)
            .rows(10)
            .columns(25)
            .rounded(false)();
        }

        // var waffle = new WaffleChart()
        //   .selector(".waffle_row_1")
        //   .title('411')
        //   .data(data)
        //   .useWidth(false).useLegend(false)
        //   .size(5)
        //   .gap(0)
        //   .rows(20)
        //   .columns(50)
        //   .rounded(false)();
      }
    });


}

export default { init, resize };
