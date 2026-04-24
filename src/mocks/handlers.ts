/**
 * src/mocks/handlers.ts
 *
 * MSW v2 request handlers for the HR Workflow Designer.
 *
 * Endpoints
 * ─────────────────────────────────────────────────────────────────────────────
 *  GET  /api/automations  – returns the automation action catalogue
 *  POST /api/simulate     – runs a mock workflow simulation over a WorkflowGraph
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  AutomationAction,
  SimulateResponse,
  SimulationStep,
  WorkflowGraph,
  WorkflowNode,
} from '@/types';
import { NodeType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Automation catalogue (static fixture)
// ─────────────────────────────────────────────────────────────────────────────

const AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email',    label: 'Send Email',          params: ['to', 'subject', 'body'] },
  { id: 'generate_doc',  label: 'Generate Document',   params: ['template', 'recipient'] },
  { id: 'notify_slack',  label: 'Notify Slack',        params: ['channel', 'message'] },
  { id: 'update_hris',   label: 'Update HRIS Record',  params: ['employeeId', 'field', 'value'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Topological sort (Kahn's algorithm)
// Returns nodes in dependency-resolved order, or falls back to array order
// if the graph contains a cycle.
// ─────────────────────────────────────────────────────────────────────────────

function topologicalSort(graph: WorkflowGraph): WorkflowNode[] {
  const { nodes, edges } = graph;

  // Build in-degree map and adjacency list
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adjacency = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Queue nodes with no incoming edges
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: WorkflowNode[] = [];
  const nodeById = new Map<string, WorkflowNode>(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeById.get(id);
    if (node) sorted.push(node);

    for (const neighbourId of (adjacency.get(id) ?? [])) {
      const newDeg = (inDegree.get(neighbourId) ?? 1) - 1;
      inDegree.set(neighbourId, newDeg);
      if (newDeg === 0) queue.push(neighbourId);
    }
  }

  // If topological sort didn't include all nodes (cycle present), fall back
  return sorted.length === nodes.length ? sorted : [...nodes];
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-node SimulationStep generator
// ─────────────────────────────────────────────────────────────────────────────

function buildStep(
  node: WorkflowNode,
  hasOutgoingEdge: boolean,
): SimulationStep {
  // Non-End nodes with no outgoing edge → error
  if (node.type !== NodeType.End && !hasOutgoingEdge) {
    const title = 'title' in node.data ? node.data.title : node.id;
    return {
      nodeId:   node.id,
      nodeType: node.type,
      status:   'error',
      message:  `Node '${title}' has no outgoing connection`,
    };
  }

  // Happy-path messages per node type
  switch (node.type) {
    case NodeType.Start:
      return {
        nodeId:   node.id,
        nodeType: node.type,
        status:   'success',
        message:  `Workflow started: '${node.data.title}'`,
      };

    case NodeType.Task:
      return {
        nodeId:   node.id,
        nodeType: node.type,
        status:   'success',
        message:  `Task '${node.data.title}' assigned to ${node.data.assignee}`,
      };

    case NodeType.Approval:
      return {
        nodeId:   node.id,
        nodeType: node.type,
        status:   'success',
        message:  `Approval step '${node.data.title}' sent to role: ${node.data.approverRole}`,
      };

    case NodeType.AutomatedStep:
      return {
        nodeId:   node.id,
        nodeType: node.type,
        status:   'success',
        message:  `Automated action '${node.data.actionId}' executed for step '${node.data.title}'`,
      };

    case NodeType.End:
      return {
        nodeId:   node.id,
        nodeType: node.type,
        status:   'success',
        message:  `Workflow completed: '${node.data.endMessage}'`,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────

export const handlers = [
  // ── GET /api/automations ────────────────────────────────────────────────
  http.get('/api/automations', async () => {
    await delay(150);
    return HttpResponse.json(AUTOMATIONS);
  }),

  // ── POST /api/simulate ──────────────────────────────────────────────────
  http.post('/api/simulate', async ({ request }) => {
    await delay(300);

    let body: WorkflowGraph;

    try {
      body = (await request.json()) as WorkflowGraph;
    } catch {
      return HttpResponse.json(
        { error: 'Invalid JSON body — expected a WorkflowGraph' },
        { status: 400 },
      );
    }

    if (!body?.nodes || !Array.isArray(body.nodes)) {
      return HttpResponse.json(
        { error: 'Body must contain a "nodes" array' },
        { status: 422 },
      );
    }

    // Build a set of node IDs that have at least one outgoing edge
    const nodesWithOutgoing = new Set<string>(
      (body.edges ?? []).map((e) => e.source),
    );

    const ordered = topologicalSort(body);

    const steps: SimulationStep[] = ordered.map((node) =>
      buildStep(node, nodesWithOutgoing.has(node.id)),
    );

    const response: SimulateResponse = { steps };
    return HttpResponse.json(response);
  }),
];
