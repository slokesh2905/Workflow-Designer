/**
 * ApprovalNode.tsx — Rich card node for approval/sign-off steps.
 *
 * Shows: title, approver role chip (amber), auto-approve threshold chip.
 * Uses the redesigned BaseNode shell with an amber accent.
 */

import React from 'react';
import type { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { ApprovalNodeData } from '@/types';

const ACCENT = '#f59e0b'; // amber-500

/** Person with checkmark approval icon */
const ApprovalIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
    <circle cx="7" cy="5" r="3" />
    <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
    <polyline points="5,5 6.5,6.5 9.5,3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ApprovalNode: React.FC<NodeProps<ApprovalNodeData>> = ({ id, data, selected }) => (
  <BaseNode
    id={id}
    accentColor={ACCENT}
    typeLabel="Approval"
    icon={<ApprovalIcon />}
    selected={selected}
    hasTarget
    hasSource
  >
    {/* Title */}
    <p className="text-sm font-semibold text-gray-100 leading-snug mb-2.5">
      {data.title}
    </p>

    {/* Info chips */}
    <div className="flex flex-wrap gap-1.5">
      {/* Approver role chip */}
      <span
        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
        style={{ background: `${ACCENT}1A`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
      >
        {/* Shield / role icon */}
        <svg viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2 shrink-0" aria-hidden="true">
          <path d="M5 1L1 3v3.5C1 8.5 2.9 9.8 5 10c2.1-.2 4-1.5 4-3.5V3L5 1Z" />
        </svg>
        {data.approverRole}
      </span>

      {/* Auto-approve threshold */}
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-700/40 text-gray-400 border border-gray-700/40">
        {/* Lightning icon — auto */}
        <svg viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2 shrink-0" aria-hidden="true">
          <path d="M5.5 1L1.5 5.5h3.5L4 9l5.5-5.5H5.5L5.5 1Z" />
        </svg>
        Auto @ {data.autoApproveThreshold}%
      </span>
    </div>
  </BaseNode>
);
