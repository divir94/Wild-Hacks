function to_string(obj) {
    return JSON.stringify(obj, null, 2);
}


function threshold(thresh) {
    link.attr('visibility', function(d){
        return (d.value >= thresh) ? 'visible' : 'hidden';
    });
}

// JSON filtering functions

function exclude_categories_nodes(json_data, exclude_categories) {
    var trash_list = []
    var filtered_json = _.filter(json_data, function(e) {
      // console.log(exclude_categories);
      if (_.contains(exclude_categories, e.category)) {
        return e;
      } else {
        trash_list.push(e);
        // this is just IM sports right now
      }
    });


    return filtered_json;
}

// maybe combine these two functions

function exclude_categories_links(json_data, exclude_categories) {
    var trash_list = [];
    var filtered_json = _.filter(json_data, function(e) {
      if (_.contains(json_data, e.source.category) | _.contains(json_data, e.target.category)) {
        trash_list.push(e);
      } else {
        return e;
      }
    });

    return filtered_json;
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
  link = d3.selectAll(".link").data(graph.links);
  link.enter().append("line", ".node").attr("class", "link");
  node = d3.selectAll(".node").data(graph.nodes);
  node.enter().append("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
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
      height = 800;

  var color = d3.scale.category20();

  window.force = d3.layout.force()
      .charge(-15)
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

  function update_edge_index_to_id(nodes, links) {
    var edges = [];

    // nodes.forEach(function(n) {
    //   var sourceNode = links.filter(function(e) {
    //     return e.source === n.id;
    //   })[0],
    //   targetNode = links.filter(function(e) {
    //     return e.target === n.id;
    //   });

    //   if (sourceNode && targetNode) {
    //     edges.push({
    //       source: sourceNode,
    //       target: targetNode,
    //       value:
    //     })
    //   };
    // })
    links.forEach(function(e) {
      var sourceNode = nodes.filter(function(n) {
          return n.id === e.source;
      })[0],
          targetNode = nodes.filter(function(n) {
              return n.id === e.target;
      })[0];

      if (sourceNode && targetNode) {
        edges.push({
            source: sourceNode,
            target: targetNode,
            value: e.value
        });
      }
    });

    console.log(edges);
    return edges;
  }

  var findNode = function (name) {
      for (var i in graph.nodes) if (graph.nodes[i]["name"] === name) return graph["nodes"][i];
  }

  // search node
  function searchNode() {
    //find the node
    var selectedVal = $('#search').val();

    if (selectedVal == "") {
      restart();
      top_group();
    } else {
      connectedNodes(findNode(selectedVal));
    }
  };

  $("#search-button").on('click', searchNode);

  function add_label(d) {
    //Update the tooltip position and value
    categories_on = [];
    for ( var i = 0; i < changeCheckboxes.length; i++ ) {
      if (changeCheckboxes[i].checked) {
        categories_on.push(changeCheckboxes[i].parentNode.querySelector('.check-text').innerHTML);
      }
    }
    d3.select("#tooltip")
      .style("left", d.x + "px")
      .style("top", d.y + "px")
      .select("#tooltip-value").html("Name: " + d.name + "<p>Category: " + d.category + "</p>");

    if (categories_on.indexOf(d.category) > -1) {
      d3.select("#tooltip").classed("hidden", false);
    } 

    var visible_nodes = d3.select(".node")[0];
    var tooltips = d3.select("#tooltip")
    console.log(tooltips);


    // else {
    // //Not in the array
    // }
    // if ([d.category] in categories_on){
    //   console.log('in here')
    //   d3.select("#tooltip").classed("hidden", false);
    // }
  }

  function hide_label() {
    d3.select("#tooltip").classed("hidden", true);
  }

  // add links and nodes
  edges = edge_index_to_id(graph);
  update_slider_range(edges);

  console.log(edges);

  force
    .nodes(graph.nodes)
    .links(edges)
    .start();

  // make links
  var link = svg.selectAll(".link")
                .data(edges)
    
  link.enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.log(d.value); });

  // make nodes
  var node = svg.selectAll(".node")
    .data(graph.nodes)

  node.enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return (d.size > 0) ? Math.log(d.size)*4 : 1; })
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



  function top_group() {
    var arr = svg.selectAll(".node")[0].map(function(o){return o.__data__.size;});
    var max = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]>arr[max]) {max=i};
    };

    $('#top-node').text("The largest group is "+ node[0][max].__data__.name + " with " + node[0][max].__data__.size + " members.");
  }

  top_group();

  // this function looks up whether a pair are neighbours
  function neighboring(a, b) {
    return linkedByIndex[a.id + "," + b.id];
  }

  function connectedNodes(n) {
    var neighbors = [];
    var a_nodes = graph.nodes;
    console.log(a_nodes);
    if (toggle == 0) {
      a_nodes.forEach(function(o) {
        if (neighboring(n, o) | neighboring(o, n)) {
          neighbors.push(o);
        };
      })
      toggle=1;
    } else {
      restart()
    }

    console.log(neighbors);

    var edges = update_edge_index_to_id(neighbors, graph.links);

    update_graph(neighbors, edges);
    
    top_group();
  };

  function update_nodes(nodes_array) {
    console.log(nodes_array);
    var filtered_nodes = exclude_categories_nodes(graph.nodes, nodes_array);
    var filtered_links = exclude_categories_links(graph.links, filtered_nodes);
    console.log(filtered_links);
 
    var edges = update_edge_index_to_id(filtered_nodes, graph.links);
    update_graph(filtered_nodes, edges);


    top_group();
  }

  function update_graph (node_json, link_json) {
    var node = svg.selectAll(".node").data(node_json)
    var link = svg.selectAll(".link").data(link_json)
    link.exit().remove();
    node.exit().remove();

    link.enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.log(d.value); });
    // remove exit nodes


    // append enter nodes
    node.enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return (d.size > 0) ? Math.log(d.size)*4 : 1; })
        .style("fill", function(d) { return color(d.size); })
        .call(force.drag)
        .on("mouseover", function(d) { add_label(d) })
        .on("mouseout", function(d) { hide_label() })
        .on('dblclick', function(d) { connectedNodes(d3.select(this).node().__data__) });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
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

  // SWITCHES
  var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

  elems.forEach(function(html) {
    var switchery = new Switchery(html, { color: '#41b7f1' });
  });

  var changeCheckboxes = $('.js-check-change');

  for ( var i = 0; i < changeCheckboxes.length; i++ ) {
    changeCheckboxes[i].onchange = categories_changed;
  };

  function categories_changed() {
    // node.style("opacity", 1);
    // link.style("opacity", 1);

    categories_on = [];
    for ( var i = 0; i < changeCheckboxes.length; i++ ) {
      if (changeCheckboxes[i].checked) {
        categories_on.push(changeCheckboxes[i].parentNode.querySelector('.check-text').innerHTML);
      }
    }

    if (toggle==1) {restart()};
    update_nodes(categories_on);

    return;
  }

});



