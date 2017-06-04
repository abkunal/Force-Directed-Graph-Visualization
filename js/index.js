// inserting div as tooltip into out document
var tooltip = d3.select("body").append("div").attr("class", "tooltip");

// selecting svg for links between nodes
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// selecting div for nodes
var div = d3.select("#graphnodes");

// initializing the force directed graph using forceSimulation()
var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3.forceLink().id(function(d) {
      return d.country;
    })
  )
  .force("charge", d3.forceManyBody().strength(-15).distanceMax(200))
  .force("center", d3.forceCenter(width / 2, height / 2));

// requesting json data
d3.json(
  "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json",
  function(error, graph) {
    if (error) throw error;
    
    // data extracted format - {source: index, target: index}, 
    // converted data format - {source: target, target: source}
    // its easier to handle the converted data
    var glinks = [];
    for (var i = 0; i < graph.links.length; i++) {
      glinks.push({
        source: graph.nodes[graph.links[i].source].country,
        target: graph.nodes[graph.links[i].target].country
      });
    }

    // initializing links of the graph
    var link = svg.selectAll("line").data(glinks).enter().append("line");
    
    // initializing nodes as images
    var node = div
      .selectAll("img")
      .data(graph.nodes)
      .enter()
      .append("img")
      .attr("class", function(d) {
        return "flag flag-" + d.code;
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("mouseover", function(d) {
        tooltip.style("display", "block");
        tooltip
          .html(d.country)
          .style("opacity", 0.9)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      });
    
    // sets the position of nodes and links on a tick event
    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(glinks);

    function ticked() {
      link
        .attr("x1", function(d) {
          return d.source.x + "px";
        })
        .attr("y1", function(d) {
          return d.source.y + "px";
        })
        .attr("x2", function(d) {
          return d.target.x + "px";
        })
        .attr("y2", function(d) {
          return d.target.y + "px";
        });

      node
        .style("left", function(d) {
          return d.x + "px";
        })
        .style("top", function(d) {
          return d.y + "px";
        });
    }
  }
);

// event handlers for drag behavior
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}