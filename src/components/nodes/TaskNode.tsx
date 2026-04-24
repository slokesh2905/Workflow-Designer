/**
 * TaskNode.tsx — Rich card node for human-assigned tasks.
 *
 * Shows: title, description (trimmed), assignee chip, due-date chip.
 * Uses the redesigned BaseNode shell with a blue accent.
 */

import React from 'react';
import type { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { TaskNodeData } from '@/types';

const ACCENT = '#3b82f6'; // blue-500

/** Clipboard / checklist icon */
const TaskIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
    <rect x="2" y="2.5" width="10" height="10" rx="1.5" />
    <path d="M5 6h4M5 8.5h2.5" strokeLinecap="round" />
    <path d="M5 3.5V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5" strokeLinecap="round" />
  </svg>
);

export const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ id, data, selected }) => (
  <BaseNode
    id={id}
    accentColor={ACCENT}
    typeLabel="Task"
    icon={<TaskIcon />}
    selected={selected}
    hasTarget
    hasSource
  >
    {/* Title */}
    <p className="text-sm font-semibold text-gray-100 leading-snug mb-1">
      {data.title}
    </p>

    {/* Description */}
    {data.description && (
      <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">
        {data.description}
      </p>
    )}

    {/* Info chips */}
    <div className="flex flex-wrap gap-1.5 mt-2">
      {data.assignee ? (
        <span
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: `${ACCENT}1A`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
        >
          {/* Person icon */}
          <svg viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2 shrink-0" aria-hidden="true">
            <circle cx="5" cy="3.5" r="2" />
            <path d="M1 9.5c0-2.21 1.79-4 4-4s4 1.79 4 4" />
          </svg>
          {data.assignee}
        </span>
      ) : (
        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-700/40 text-gray-500 border border-gray-700/40">
          Unassigned
        </span>
      )}

      {data.dueDate && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-700/40 text-gray-400 border border-gray-700/40">
          {/* Calendar icon */}
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-2 h-2 shrink-0" aria-hidden="true">
            <rect x="1" y="2" width="8" height="7" rx="1" />
            <path d="M3.5 1v2M6.5 1v2M1 4.5h8" strokeLinecap="round" />
          </svg>
          {data.dueDate}
        </span>
      )}
    </div>
  </BaseNode>
);
