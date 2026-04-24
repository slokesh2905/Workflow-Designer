/**
 * types/index.ts
 * Central barrel for all HR Workflow Designer TypeScript interfaces and types.
 * No `any` — every shape is strictly typed.
 */

import type { Edge } from 'reactflow';

// ─────────────────────────────────────────────────────────────────────────────
// Enum: NodeType
// ─────────────────────────────────────────────────────────────────────────────

export enum NodeType {
  Start         = 'start',
  Task          = 'task',
  Approval      = 'approval',
  AutomatedStep = 'automatedStep',
  End           = 'end',
}

// ─────────────────────────────────────────────────────────────────────────────
// Node data shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface StartNodeData {
  title: string;
  /** Arbitrary workflow-level metadata key/value pairs (e.g. department, region). */
  metadata: Record<string, string>;
}

export interface TaskNodeData {
  title: string;
  description: string;
  /** Email or role identifier of the assigned user. */
  assignee: string;
  /** ISO 8601 date string, e.g. "2025-06-30". */
  dueDate: string;
  /** Extensible set of user-defined fields attached to this task. */
  customFields: Record<string, string>;
}

export interface ApprovalNodeData {
  title: string;
  /** Role that must approve this step, e.g. "hiring_manager" | "legal". */
  approverRole: string;
  /**
   * When the approval score/confidence from an upstream step exceeds this
   * threshold (0–100), the approval is granted automatically.
   */
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData {
  title: string;
  /** References an AutomationAction.id in the action catalogue. */
  actionId: string;
  /** Key/value params forwarded to the automation runtime. */
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  endMessage: string;
  /** When true, the workflow runtime generates a completion summary report. */
  summaryFlag: boolean;
}

/**
 * Union of all node-specific data shapes.
 * Used as the constraint for updateNodeData in the Zustand store.
 */
export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// ─────────────────────────────────────────────────────────────────────────────
// Base WorkflowNode + discriminated union per node type
// ─────────────────────────────────────────────────────────────────────────────

/** Shared fields present on every node in the workflow graph. */
interface WorkflowNodeBase {
  id: string;
  position: { x: number; y: number };
}

export interface StartNode extends WorkflowNodeBase {
  type: NodeType.Start;
  data: StartNodeData;
}

export interface TaskNode extends WorkflowNodeBase {
  type: NodeType.Task;
  data: TaskNodeData;
}

export interface ApprovalNode extends WorkflowNodeBase {
  type: NodeType.Approval;
  data: ApprovalNodeData;
}

export interface AutomatedStepNode extends WorkflowNodeBase {
  type: NodeType.AutomatedStep;
  data: AutomatedStepNodeData;
}

export interface EndNode extends WorkflowNodeBase {
  type: NodeType.End;
  data: EndNodeData;
}

/**
 * Discriminated union of all node variants.
 * Use `node.type` to narrow to the specific interface.
 */
export type WorkflowNode =
  | StartNode
  | TaskNode
  | ApprovalNode
  | AutomatedStepNode
  | EndNode;

// ─────────────────────────────────────────────────────────────────────────────
// Edge
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extends React Flow's Edge with optional HR-specific metadata.
 * `label` is inherited from Edge and can carry condition text (e.g. "Approved").
 *
 * Note: Edge is a generic type alias in React Flow, so we use a type intersection
 * rather than interface extension.
 */
export type WorkflowEdge = Edge & {
  /** Optional condition expression evaluated at runtime to follow this edge. */
  condition?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Graph
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Automation action catalogue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Describes a registered automation action that can be assigned to an
 * AutomatedStepNode. `params` lists the required param keys.
 */
export interface AutomationAction {
  id: string;
  label: string;
  /** Ordered list of required actionParams keys for this action. */
  params: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation
// ─────────────────────────────────────────────────────────────────────────────

export type SimulationStepStatus = 'success' | 'error' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  /** Raw string matching NodeType enum values (kept as string for API flexibility). */
  nodeType: string;
  status: SimulationStepStatus;
  /** Human-readable explanation of the step outcome. */
  message: string;
}

export interface SimulateResponse {
  steps: SimulationStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId: string;
  message: string;
}
