function to_string(obj) {
    return JSON.stringify(obj, null, 2);
}

function threshold(thresh) {
    link.attr('visibility', function(d){
        return (d.value >= thresh) ? 'visible' : 'hidden';
    });
}

//adjust threshold
// function threshold(thresh) {
//     debugger;
//     graphRec = JSON.parse(JSON.stringify(graph));
//     graph.links.splice(0, graph.links.length);
//     for (var i = 0; i < graphRec.links.length; i++) {
//       if (graphRec.links[i].value > thresh) {graph.links.push(graphRec.links[i]);}
//     }
//     restart();
// }

//Restart the visualisation after any node and link changes
function restart() {
  link = link.data(graph.links);
  link.exit().remove();
  link.enter().insert("line", ".node").attr("class", "link");
  node = node.data(graph.nodes);
  node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
  force.start();
}

function update_slider_range(edges) {
  min_link_value = Math.min.apply(Math,edges.map(function(o){return o.value;}));
  max_link_value = Math.max.apply(Math,edges.map(function(o){return o.value;}));
  $( "#thersholdSlider" ).attr( "max", max_link_value );
  $( "#sliderMin" ).html( min_link_value );
  $( "#sliderMax" ).html( max_link_value );
}


d3.json("../json/fb-4.json", function(error, graph) {
  window.graph = graph

  // initialize graph
  var width = 1024,
      height = 650;

  var color = d3.scale.category20();

  window.force = d3.layout.force()
      .charge(-10)
      .linkDistance(200)
      .size([width, height]);

  var svg = d3.select("#svg-grab").append("svg")
      .attr("width", width)
      .attr("height", height);

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

  var findNode = function (name) {
      for (var i in graph.nodes) if (graph.nodes[i]["name"] === name) return graph["nodes"][i];
  }

  // search node
  function searchNode() {
    console.log("search")
    //find the node
    var selectedVal = $('#search').val();

    if (selectedVal == "") {
      // show nodes
      d3.selectAll(".node, .link")
        .transition()
        .duration(2000)
        .style("opacity", 1);
    } else {
      connectedNodes(findNode(selectedVal));
    }
  };

  $("#search-button").on('click', searchNode);

  function add_label(d) {
    //Update the tooltip position and value
    d3.select("#tooltip")
      .style("left", d.x + "px")
      .style("top", d.y + "px")
      .select("#tooltip-value").html("Name: " + d.name + "<p>Category: " + d.category + "</p>");

    //Show the tooltip
    d3.select("#tooltip").classed("hidden", false);
  }

  function hide_label() {
    d3.select("#tooltip").classed("hidden", true);
  }

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
    .call(force.drag)
    .on("mouseover", function(d) { add_label(d) })
    .on("mouseout", function(d) { hide_label() })
    .on('dblclick', function(d) { connectedNodes(d3.select(this).node().__data__) });


  // show only neighbors
  var toggle = 0;
  // create an array logging what is connected to what
  var linkedByIndex = {};

  for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[graph.nodes[i].id + "," + graph.nodes[i].id] = 1;
  };

  graph.links.forEach(function (d) {
      linkedByIndex[d.source + "," + d.target] = 1;
  });

  // this function looks up whether a pair are neighbours
  function neighboring(a, b) {
    return linkedByIndex[a.id + "," + b.id];
  }

  function connectedNodes(n) {
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        node.style("opacity", function (o) {
            return neighboring(n, o) | neighboring(o, n) ? 1 : 0;
        });
        link.style("opacity", function (o) {
            return n.id==o.source.id | n.id==o.target.id ? 1 : 0;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
      }
  }

  // search autocomplete
  var optArray = [];
  for (var i = 0; i < graph.nodes.length - 1; i++) {
      optArray.push(graph.nodes[i].name);
  }

  optArray = optArray.sort();
  $(function () {
    $("#search").autocomplete({
        source: optArray
    });
  });

  force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  });

});



// SWITCHES

var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

elems.forEach(function(html) {
  var switchery = new Switchery(html, { color: '#41b7f1' });
});
