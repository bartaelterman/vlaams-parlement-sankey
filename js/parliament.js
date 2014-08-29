var data = {
    "nodes": [
        {"name": "CD&V/N-VA"},
        {"name": "CD&V"},
        {"name": "N-VA"}
        ],
    "links": [
    {
        "source": 0,
        "target": 1,
        "value": 700
    },
    {
        "source": 0,
        "target": 2,
        "value": 500
    }
    ]
};


var format = d3.format(",.0f");
var color = d3.scale.category20();
var margin = {top: 1, right: 1, bottom: 6, left: 1};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
   .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var s = d3.sankey()
    .size([width, height])
    .nodeWidth(15)
    .nodePadding(10)
    .nodes(data.nodes)
    .links(data.links)
    .layout(32);

var path = s.link();

var link = svg.append("g").selectAll(".link")
    .data(data.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy);})
    .style("color", "#000")
    //.style("fill", "none")
    .sort(function(a, b) {return b.dy - a.dy;});

var node = svg.append("g").selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
    .call(d3.behavior.drag()
            .origin(function(d) {return d;})
            .on("dragstart", function() {this.parentNode.appendChild(this);})
            .on("drag", dragmove));

node.append("rect")
    .attr("height", function(d) {return d.dy;})
    .attr("width", s.nodeWidth())
    .style("fill", function(d) {return d.color = color(d.name.replace(/ .*/, "")); })
    .append("title")
    .text(function(d) {return d.name + "\n" + format(d.value); });

    node.append("text")
    .attr("x", -6)
    .attr("y", function(d) {return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) {return d.name; })
    .filter(function(d) {return d.x < width / 2;})
    .attr("x", 6 + s.nodeWidth())
    .attr("text-anchor", "start");

function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.evnet.y))) + ")");
    s.relayout();
    link.attr("d", path);
}

console.log(s);

