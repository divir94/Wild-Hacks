// custom functions
function edge_index_to_id(graph) {
  var edges = [];
  graph.links.forEach(function(e) {
      var sourceNode = graph.nodes.filter(function(n) {
          return n.name === e.source;
      })[0],
          targetNode = graph.nodes.filter(function(n) {
              return n.name === e.target;
          })[0];

      edges.push({
          source: sourceNode,
          target: targetNode,
          value: e.value
      });
  });
  return edges;
}

function to_string(obj) {
    return JSON.stringify(obj, null, 2);
}

//adjust threshold
function threshold(thresh) {
    link.attr('visibility', function(d){
        return (d.value >= thresh) ? 'visible' : 'hidden';
    });

    force.nodes().filter(function(d){console.log(d)});
}

d3.json("test.json", function(error, graph) {
    window.graph = graph

    // initialize graph
    var width = 960,
        height = 500;

    var color = d3.scale.category20();

    window.force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // add links and nodes

    edges = edge_index_to_id(graph)
    // window.graphRec = JSON.parse(JSON.stringify(graph));

    force
      .nodes(graph.nodes)
      .links(edges)
      .start();

    // make links
    window.link = svg.selectAll(".link")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    // make nodes
    window.node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

    node.append("title")
      .text(function(d) { return d.name; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

});
