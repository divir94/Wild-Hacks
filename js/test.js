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