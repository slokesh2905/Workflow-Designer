/**
 * NodeFormPanel.tsx
 *
 * Reads selectedNodeId from the Zustand store, finds the node in the nodes array,
 * then renders the correct form component based on NodeType.
 *
 * Renders a placeholder when nothing is selected.
 */
import React from 'react';
import { useWorkflowStore } from '@/store';
import { NodeType } from '@/types';
import type { StartNode, TaskNode, ApprovalNode, AutomatedStepNode, EndNode } from '@/types';
import { StartNodeForm }         from './StartNodeForm';
import { TaskNodeForm }          from './TaskNodeForm';
import { ApprovalNodeForm }      from './ApprovalNodeForm';
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm';
import { EndNodeForm }           from './EndNodeForm';

// ── Per-type form renderers (narrowed from discriminated union) ───────────────

function renderForm(node: StartNode | TaskNode | ApprovalNode | AutomatedStepNode | EndNode) {
  switch (node.type) {
    case NodeType.Start:
      return <StartNodeForm id={node.id} data={node.data} />;
    case NodeType.Task:
      return <TaskNodeForm id={node.id} data={node.data} />;
    case NodeType.Approval:
      return <ApprovalNodeForm id={node.id} data={node.data} />;
    case NodeType.AutomatedStep:
      return <AutomatedStepNodeForm id={node.id} data={node.data} />;
    case NodeType.End:
      return <EndNodeForm id={node.id} data={node.data} />;
  }
}

// ── NodeTypeLabel chip colors ─────────────────────────────────────────────────

const TYPE_META: Record<NodeType, { label: string; color: string }> = {
  [NodeType.Start]:         { label: 'Start',     color: '#10b981' },
  [NodeType.Task]:          { label: 'Task',      color: '#3b82f6' },
  [NodeType.Approval]:      { label: 'Approval',  color: '#f59e0b' },
  [NodeType.AutomatedStep]: { label: 'Automated', color: '#8b5cf6' },
  [NodeType.End]:           { label: 'End',       color: '#f43f5e' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const NodeFormPanel: React.FC = () => {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes          = useWorkflowStore((s) => s.nodes);

  const node = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <svg
          viewBox="0 0 32 32"
          className="w-10 h-10 text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="10" height="10" rx="2" />
          <rect x="18" y="4" width="10" height="10" rx="2" />
          <rect x="4" y="18" width="10" height="10" rx="2" />
          <rect x="18" y="18" width="10" height="10" rx="2" />
        </svg>
        <p className="text-sm text-gray-500">Select a node on the canvas to edit its properties.</p>
      </div>
    );
  }

  const meta = TYPE_META[node.type];

  // ── Form panel ──────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div
        className="shrink-0 px-4 py-3 border-b border-gray-700/60 flex items-center gap-2.5"
        style={{ borderBottomColor: `${meta.color}22` }}
      >
        {/* Color dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: meta.color }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: meta.color }}
          >
            {meta.label} Node
          </p>
          <p className="text-xs text-gray-500 truncate font-mono">{node.id}</p>
        </div>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderForm(node)}
      </div>
    </div>
  );
};
