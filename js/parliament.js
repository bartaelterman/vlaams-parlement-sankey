var margin = {top: 1, right: 1, bottom: 20, left: 1};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var pointlength = 0;

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
   .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data = d3.json("data/parliament.json", function(data) {
    var xdomain = getXdomain(data);
    var ydomain = getYdomain(data);
    var xScale = d3.scale.linear().domain(xdomain).range([margin.left, width-margin.right]);
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(6);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height) + ")")
        .call(xAxis);
    var yScale = d3.scale.linear().domain(ydomain).range([margin.top, height-margin.bottom]);
    var sdata = convertToSankeyData(data, xScale, yScale);
    console.log(sdata);
    _.each(sdata, function(obj, category) {
        console.log("category: " + category);
        console.log("color: " + obj.color);
        var moveto = drawRibbon(obj.data, height, pointlength);
        svg.append("g").append("path")
            .attr("fill", obj.color)
            .attr("d", moveto);
    });
    console.log("data read");
});
