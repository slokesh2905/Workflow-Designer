/**
 * components/panels/Sidebar.tsx
 *
 * Left-side node palette. Each card is draggable — onDragStart sets
 * 'application/nodeType' in the dataTransfer, which the canvas onDrop reads.
 *
 * Additions vs original:
 *   – Canvas Stats bar (nodes / edges / errors count) above the footer
 */
import React from 'react';
import { NodeType } from '@/types';
import { useWorkflowStore } from '@/store';

// ── Palette definition ────────────────────────────────────────────────────────

interface PaletteItem {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const PALETTE: PaletteItem[] = [
  {
    type: NodeType.Start,
    label: 'Start',
    description: 'Workflow entry point',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <polygon points="5,3 17,10 5,17" />
      </svg>
    ),
  },
  {
    type: NodeType.Task,
    label: 'Task',
    description: 'Human assignee step',
    color: '#3b82f6',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <rect x="3" y="4" width="14" height="14" rx="2" />
        <line x1="7" y1="8" x2="13" y2="8" />
        <line x1="7" y1="12" x2="11" y2="12" />
      </svg>
    ),
  },
  {
    type: NodeType.Approval,
    label: 'Approval',
    description: 'Requires sign-off',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <circle cx="10" cy="7" r="3" />
        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
        <polyline points="7,7 9.5,9.5 13.5,5.5" />
      </svg>
    ),
  },
  {
    type: NodeType.AutomatedStep,
    label: 'Automated',
    description: 'Runs an action',
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M11 2L4 11h7l-2 7 9-10h-7l2-6z" />
      </svg>
    ),
  },
  {
    type: NodeType.End,
    label: 'End',
    description: 'Workflow terminus',
    color: '#f43f5e',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" rx="2" />
      </svg>
    ),
  },
];

// ── Draggable palette card ────────────────────────────────────────────────────

interface PaletteCardProps {
  item: PaletteItem;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ item }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/nodeType', item.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      aria-label={`Drag to add ${item.label} node`}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg
                 border border-gray-700/40 bg-gray-800/40
                 hover:border-gray-600/60 hover:bg-gray-800/70
                 cursor-grab active:cursor-grabbing
                 transition-all duration-150 select-none"
      style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
    >
      {/* Icon bubble */}
      <span
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: `${item.color}18`,
          color: item.color,
          border: `1px solid ${item.color}30`,
        }}
      >
        {item.icon}
      </span>

      {/* Labels */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 leading-tight">{item.label}</p>
        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{item.description}</p>
      </div>

      {/* Drag hint */}
      <svg
        viewBox="0 0 16 16"
        className="w-3.5 h-3.5 ml-auto shrink-0 text-gray-600
                   group-hover:text-gray-400 transition-colors"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="5" cy="4" r="1.2" />
        <circle cx="5" cy="8" r="1.2" />
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="11" cy="4" r="1.2" />
        <circle cx="11" cy="8" r="1.2" />
        <circle cx="11" cy="12" r="1.2" />
      </svg>
    </div>
  );
};

// ── Canvas Stats bar ──────────────────────────────────────────────────────────

const CanvasStats: React.FC = () => {
  const nodeCount  = useWorkflowStore((s) => s.nodes.length);
  const edgeCount  = useWorkflowStore((s) => s.edges.length);
  const errorCount = useWorkflowStore((s) => s.validationErrors.length);

  const stats = [
    { label: 'Nodes', value: nodeCount, color: '#6366f1' },
    { label: 'Edges', value: edgeCount, color: '#38bdf8' },
    { label: 'Errors', value: errorCount, color: errorCount > 0 ? '#f43f5e' : '#10b981' },
  ];

  return (
    <div className="px-3 py-3 border-t border-gray-800">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-2 px-1">
        Canvas
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center py-2 rounded-lg bg-gray-800/50 border border-gray-700/30"
          >
            <span
              className="text-lg font-black leading-none"
              style={{ color: s.color }}
            >
              {s.value}
            </span>
            <span className="text-[9px] text-gray-600 mt-0.5 uppercase tracking-wide">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  return (
    <aside
      className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 shrink-0 overflow-hidden"
      aria-label="Node palette"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="6" height="6" rx="1.5" />
              <rect x="12" y="2" width="6" height="6" rx="1.5" />
              <rect x="2" y="12" width="6" height="6" rx="1.5" />
              <rect x="12" y="12" width="6" height="6" rx="1.5" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Node Palette
            </h2>
          </div>

          {/* Validation Status Badge */}
          <ValidationBadge />
        </div>
        <p className="text-[10px] text-gray-600">Drag nodes onto the canvas</p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {PALETTE.map((item) => (
          <PaletteCard key={item.type} item={item} />
        ))}
      </div>

      {/* Canvas stats */}
      <CanvasStats />

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-500 font-mono text-[9px]">Ctrl+Z</kbd>
          {' '}undo &nbsp;
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-500 font-mono text-[9px]">Ctrl+Y</kbd>
          {' '}redo &nbsp;
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-500 font-mono text-[9px]">Del</kbd>
          {' '}delete
        </p>
      </div>
    </aside>
  );
};

// ── Validation Status Badge ───────────────────────────────────────────────────

const ValidationBadge: React.FC = () => {
  const errors = useWorkflowStore((s) => s.validationErrors);
  const count = errors.length;

  if (count === 0) {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-bold border border-emerald-500/20">
        VALID ✓
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[9px] font-bold border border-rose-500/20">
      {count} error{count !== 1 ? 's' : ''}
    </span>
  );
};
