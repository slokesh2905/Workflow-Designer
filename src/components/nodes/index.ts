/**
 * components/nodes/index.ts
 *
 * Barrel export for all custom React Flow node components.
 * Also exports `nodeTypes` — the map object to pass directly to <ReactFlow nodeTypes={...} />.
 */

export { BaseNode } from './BaseNode';
export type { BaseNodeProps } from './BaseNode';

export { StartNode }        from './StartNode';
export { TaskNode }         from './TaskNode';
export { ApprovalNode }     from './ApprovalNode';
export { AutomatedStepNode } from './AutomatedStepNode';
export { EndNode }          from './EndNode';

import { StartNode }         from './StartNode';
import { TaskNode }          from './TaskNode';
import { ApprovalNode }      from './ApprovalNode';
import { AutomatedStepNode } from './AutomatedStepNode';
import { EndNode }           from './EndNode';
import { NodeType }          from '@/types';

/**
 * Pass this object to <ReactFlow nodeTypes={nodeTypes} />.
 * Keys correspond to the NodeType enum string values.
 */
export const nodeTypes = {
  [NodeType.Start]:         StartNode,
  [NodeType.Task]:          TaskNode,
  [NodeType.Approval]:      ApprovalNode,
  [NodeType.AutomatedStep]: AutomatedStepNode,
  [NodeType.End]:           EndNode,
} as const;
