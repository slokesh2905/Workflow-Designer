/**
 * utils/validation.ts
 *
 * Implements graph validation rules for the HR Workflow Designer.
 * Enforces connectivity, cycle detection, and node-specific data requirements.
 */
import { NodeType } from '@/types';
import type { WorkflowNode, WorkflowEdge, ValidationError } from '@/types';

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ── 1. Global Count Rules ──────────────────────────────────────────────────

  const startNodes = nodes.filter((n) => n.type === NodeType.Start);
  if (startNodes.length === 0) {
    errors.push({ nodeId: 'global', message: 'Workflow must have a Start node' });
  } else if (startNodes.length > 1) {
    errors.push({ nodeId: 'global', message: 'Workflow can only have one Start node' });
  }

  const endNodes = nodes.filter((n) => n.type === NodeType.End);
  if (endNodes.length === 0) {
    errors.push({ nodeId: 'global', message: 'Workflow must have at least one End node' });
  }

  // ── 2. Connectivity Rules ──────────────────────────────────────────────────

  const outgoingCount = new Map<string, number>();
  const incomingCount = new Map<string, number>();

  nodes.forEach((n) => {
    outgoingCount.set(n.id, 0);
    incomingCount.set(n.id, 0);
  });

  edges.forEach((e) => {
    outgoingCount.set(e.source, (outgoingCount.get(e.source) || 0) + 1);
    incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1);
  });

  nodes.forEach((node) => {
    // Every node except EndNode must have at least one outgoing edge
    if (node.type !== NodeType.End && (outgoingCount.get(node.id) || 0) === 0) {
      errors.push({
        nodeId: node.id,
        message: 'Node must have an outgoing connection',
      });
    }

    // Every node except StartNode must have at least one incoming edge
    if (node.type !== NodeType.Start && (incomingCount.get(node.id) || 0) === 0) {
      errors.push({
        nodeId: node.id,
        message: 'Node must have an incoming connection',
      });
    }

    // ── 3. Node-specific Data Rules ──────────────────────────────────────────

    switch (node.type) {
      case NodeType.Task:
        if (!node.data.title.trim()) {
          errors.push({ nodeId: node.id, message: 'Task title is required' });
        }
        break;

      case NodeType.Approval:
        if (node.data.autoApproveThreshold <= 0) {
          errors.push({
            nodeId: node.id,
            message: 'Auto-approve threshold must be greater than 0',
          });
        }
        break;

      case NodeType.AutomatedStep:
        if (!node.data.actionId) {
          errors.push({ nodeId: node.id, message: 'Automation action must be selected' });
        }
        break;
      
      case NodeType.Start:
        if (!node.data.title.trim()) {
          errors.push({ nodeId: node.id, message: 'Workflow title is required' });
        }
        break;
    }
  });

  // ── 4. Cycle Detection (DFS) ───────────────────────────────────────────────

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const recStack = new Set<string>();
  let hasCycle = false;

  function isCyclic(id: string): boolean {
    if (recStack.has(id)) return true;
    if (visited.has(id)) return false;

    visited.add(id);
    recStack.add(id);

    const neighbors = adj.get(id) || [];
    for (const neighbor of neighbors) {
      if (isCyclic(neighbor)) return true;
    }

    recStack.delete(id);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (isCyclic(node.id)) {
        hasCycle = true;
        break;
      }
    }
  }

  if (hasCycle) {
    errors.push({ nodeId: 'global', message: 'Workflow contains a cycle (loops are not allowed)' });
  }

  return errors;
}
