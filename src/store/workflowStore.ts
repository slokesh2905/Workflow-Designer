/**
 * store/workflowStore.ts
 *
 * Zustand store for the HR Workflow Designer.
 * Uses the immer middleware so actions can be written in a mutation style
 * while still producing immutable state updates.
 *
 * History strategy
 * ─────────────────
 * pushHistory() snapshots (nodes, edges) → past[]. It uses immer's `current()`
 * to capture a plain deep-copy of the draft proxies, avoiding reference leaks.
 * undo/redo swap the current state with the top of the respective stack.
 *
 * Keyboard shortcuts (Ctrl+Z / Ctrl+Y) are wired in App.tsx via useEffect, not here.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { current } from 'immer';
import type { NodeChange, EdgeChange } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { validateWorkflow } from '@/utils/validation';

import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowGraph,
  NodeData,
  ValidationError,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────────────────────

interface HistoryStack {
  past: WorkflowGraph[];
  future: WorkflowGraph[];
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  history: HistoryStack;
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions shape
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowActions {
  // ── ReactFlow change handlers ────────────────────────────────────────────
  /**
   * Accepts the NodeChange[] array emitted by ReactFlow's onNodesChange event.
   * Does NOT snapshot history — positional drags are too noisy.
   */
  onNodesChange: (changes: NodeChange[]) => void;
  /**
   * Accepts the EdgeChange[] array emitted by ReactFlow's onEdgesChange event.
   */
  onEdgesChange: (changes: EdgeChange[]) => void;
  /** Direct replacement (e.g. loading a saved workflow). */
  setNodes: (nodes: WorkflowNode[]) => void;
  /** Direct replacement (e.g. loading a saved workflow). */
  setEdges: (edges: WorkflowEdge[]) => void;

  // ── Node operations (each calls pushHistory first) ────────────────────────
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;

  // ── Selection ─────────────────────────────────────────────────────────────
  selectNode: (id: string | null) => void;

  // ── Validation ────────────────────────────────────────────────────────────
  setValidationErrors: (errors: ValidationError[]) => void;

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  /** Snapshots the current nodes + edges onto past[], clears future[]. */
  pushHistory: () => void;
  /** Restores the previous state from past[]; pushes current to future[]. */
  undo: () => void;
  /** Restores the next state from future[]; pushes current to past[]. */
  redo: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  immer((set, get) => ({
    // ── Initial state ──────────────────────────────────────────────────────
    nodes: [],
    edges: [],
    selectedNodeId: null,
    validationErrors: [],
    history: { past: [], future: [] },

    // ── ReactFlow change handlers ──────────────────────────────────────────
    onNodesChange: (changes) =>
      set((draft) => {
        const plain = current(draft.nodes) as Parameters<typeof applyNodeChanges>[1];
        draft.nodes = applyNodeChanges(changes, plain) as WorkflowNode[];
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    onEdgesChange: (changes) =>
      set((draft) => {
        const plain = current(draft.edges) as Parameters<typeof applyEdgeChanges>[1];
        draft.edges = applyEdgeChanges(changes, plain) as WorkflowEdge[];
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    setNodes: (nodes) =>
      set((draft) => {
        draft.nodes = nodes;
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    setEdges: (edges) =>
      set((draft) => {
        draft.edges = edges;
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    // ── pushHistory ────────────────────────────────────────────────────────
    pushHistory: () =>
      set((draft) => {
        // current() extracts a plain deep copy from an immer draft proxy.
        const snapshot: WorkflowGraph = {
          nodes: current(draft.nodes),
          edges: current(draft.edges),
        };
        draft.history.past.push(snapshot);
        draft.history.future = [];
      }),

    // ── undo ──────────────────────────────────────────────────────────────
    undo: () =>
      set((draft) => {
        const previous = draft.history.past.pop();
        if (!previous) return;
        draft.history.future.push({
          nodes: current(draft.nodes),
          edges: current(draft.edges),
        });
        draft.nodes = previous.nodes as WorkflowNode[];
        draft.edges = previous.edges as WorkflowEdge[];
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    // ── redo ──────────────────────────────────────────────────────────────
    redo: () =>
      set((draft) => {
        const next = draft.history.future.pop();
        if (!next) return;
        draft.history.past.push({
          nodes: current(draft.nodes),
          edges: current(draft.edges),
        });
        draft.nodes = next.nodes as WorkflowNode[];
        draft.edges = next.edges as WorkflowEdge[];
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      }),

    // ── addNode ───────────────────────────────────────────────────────────
    addNode: (node) => {
      get().pushHistory();
      set((draft) => {
        draft.nodes.push(node);
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      });
    },

    // ── updateNodeData ────────────────────────────────────────────────────
    updateNodeData: (id, data) => {
      get().pushHistory();
      set((draft) => {
        const target = draft.nodes.find((n) => n.id === id);
        if (!target) return;
        Object.assign(target.data, data);
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      });
    },

    // ── deleteNode ────────────────────────────────────────────────────────
    deleteNode: (id) => {
      get().pushHistory();
      set((draft) => {
        draft.nodes = draft.nodes.filter((n) => n.id !== id);
        draft.edges = draft.edges.filter(
          (e) => e.source !== id && e.target !== id,
        );
        if (draft.selectedNodeId === id) {
          draft.selectedNodeId = null;
        }
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      });
    },

    // ── deleteEdge ────────────────────────────────────────────────────────
    deleteEdge: (id) => {
      get().pushHistory();
      set((draft) => {
        draft.edges = draft.edges.filter((e) => e.id !== id);
        draft.validationErrors = validateWorkflow(draft.nodes, draft.edges);
      });
    },

    // ── selectNode ────────────────────────────────────────────────────────
    selectNode: (id) =>
      set((draft) => {
        draft.selectedNodeId = id;
      }),

    // ── setValidationErrors ──────────────────────────────────────────────
    setValidationErrors: (errors) =>
      set((draft) => {
        draft.validationErrors = errors;
      }),
  })),
);
