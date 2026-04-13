import dagre from "dagre";
import type { Edge, Node } from "@xyflow/react";

const NODE_W = 220;
const NODE_H = 80;

export function layoutWithDagre(nodes: Node[], edges: Edge[], direction: "TB" | "LR" = "TB"): Node[] {
  if (nodes.length === 0) return nodes;
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 64, ranksep: 96, marginx: 20, marginy: 20 });
  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  });
  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    if (!pos) return n;
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
    };
  });
}
