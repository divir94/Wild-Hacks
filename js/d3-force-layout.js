// custom functions
function edge_index_to_id(graph) {
  var edges = [];
  graph.links.forEach(function(e) {
      var sourceNode = graph.nodes.filter(function(n) {
          return n.id === e.source;
      })[0],
          targetNode = graph.nodes.filter(function(n) {
              return n.id === e.target;
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

function threshold(thresh) {
    link.attr('visibility', function(d){
        return (d.value >= thresh) ? 'visible' : 'hidden';
    });
}

function update_slider_range(edges) {
    min_link_value = Math.min.apply(Math,edges.map(function(o){return o.value;}))
    max_link_value = Math.max.apply(Math,edges.map(function(o){return o.value;}))
    $( "#thersholdSlider" ).attr( "max", max_link_value );
    $( "#sliderMin" ).html( min_link_value );
    $( "#sliderMax" ).html( max_link_value );
}

function add_label(d) {
  //Update the tooltip position and value
  d3.select("#tooltip")
    .style("left", d.x + "px")
    .style("top", d.y + "px")
    .select("#tooltip-value").text(d.name);

  //Show the tooltip
  d3.select("#tooltip").classed("hidden", false);
}

function hide_label() {
  d3.select("#tooltip").classed("hidden", true);
}

d3.json("../json/fb.json", function(error, graph) {
    window.graph = graph

    // initialize graph
    var width = 1024,
        height = 768;

    var color = d3.scale.category20();

    window.force = d3.layout.force()
        .charge(-10)
        .linkDistance(200)
        .size([width, height]);

    var svg = d3.select("#svg-grab").append("svg")
        .attr("width", width)
        .attr("height", height);

    // add links and nodes
    edges = edge_index_to_id(graph);
    update_slider_range(edges);

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
      .style("stroke-width", function(d) { return Math.log(d.value); });

    // make nodes
    window.node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return (d.size > 0) ? Math.log(d.size) : 1; })
      .style("fill", function(d) { return color(d.size); })
      //.call(force.drag)
      .on("mouseover", function(d) { add_label(d) })
      .on("mouseout", function(d) { hide_label() });


    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

});
