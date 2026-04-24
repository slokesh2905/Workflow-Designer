/**
 * EndNode.tsx
 *
 * Pill-shaped terminal node — mirrors StartNode aesthetics but in rose/red.
 * Consumes a single target connection handle at the top.
 */

import React from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store';
import type { EndNodeData } from '@/types';

const ACCENT = '#f43f5e'; // rose-500

export const EndNode: React.FC<NodeProps<EndNodeData>> = ({ id, data, selected }) => {
  const hasError = useWorkflowStore(
    (s) => s.validationErrors.some((e) => e.nodeId === id),
  );

  return (
    <div
      style={{
        border: `1.5px solid ${selected ? ACCENT : hasError ? '#f97316' : `${ACCENT}55`}`,
        boxShadow: selected
          ? `0 0 0 2px ${ACCENT}40, 0 4px 24px ${ACCENT}35`
          : `0 2px 16px rgba(0,0,0,0.45)`,
        background: `linear-gradient(135deg, ${ACCENT}18 0%, ${ACCENT}08 100%)`,
        minWidth: 150,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-sm"
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 9, height: 9,
          background: ACCENT,
          border: '2px solid #0a0f1e',
          top: -4,
          zIndex: 1,
        }}
      />

      {/* Stop icon */}
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
        style={{ background: `${ACCENT}28`, color: ACCENT }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
          <rect x="2" y="2" width="8" height="8" rx="1.5" />
        </svg>
      </span>

      <span className="text-sm font-semibold text-gray-100 whitespace-nowrap">
        {data.endMessage || 'End'}
      </span>
    </div>
  );
};
