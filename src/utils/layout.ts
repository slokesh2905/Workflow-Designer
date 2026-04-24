/**
 * utils/layout.ts
 *
 * Implements auto-layout using the dagre library.
 * This positions nodes in a top-to-bottom hierarchy based on edge connections.
 */
import dagre from 'dagre';
import type { WorkflowNode, WorkflowEdge } from '@/types';

/**
 * Applies dagre layout to the provided nodes and edges.
 * Returns a new array of nodes with updated positions.
 * 
 * Config:
 *  - rankdir: 'TB' (Top to Bottom)
 *  - nodesep: 80 (Horizontal spacing)
 *  - ranksep: 120 (Vertical spacing)
 *  - node size: 224x80 (w-56 is 14rem/224px, typical height ~80-100px)
 */
export function applyDagreLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): WorkflowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure layout
  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 224, height: 80 });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run layout
  dagre.layout(dagreGraph);

  // Map positioned results back to WorkflowNodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        // Dagre positions are centered, ReactFlow positions are top-left
        x: nodeWithPosition.x - 224 / 2,
        y: nodeWithPosition.y - 80 / 2,
      },
    };
  });
}
