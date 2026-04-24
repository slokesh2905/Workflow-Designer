/**
 * StartNode.tsx
 *
 * Pill-shaped trigger node — inspired by the rounded "Initialize Data" /
 * "Setup Automation" pills in the design reference. Emits a single
 * source connection handle at the bottom.
 */

import React from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store';
import type { StartNodeData } from '@/types';

const ACCENT = '#10b981'; // emerald-500

export const StartNode: React.FC<NodeProps<StartNodeData>> = ({ id, data, selected }) => {
  const hasError = useWorkflowStore(
    (s) => s.validationErrors.some((e) => e.nodeId === id),
  );

  return (
    <div
      style={{
        border: `1.5px solid ${selected ? ACCENT : hasError ? '#f43f5e' : `${ACCENT}55`}`,
        boxShadow: selected
          ? `0 0 0 2px ${ACCENT}40, 0 4px 24px ${ACCENT}35`
          : hasError
          ? '0 0 0 1px rgba(244,63,94,0.4)'
          : `0 2px 16px rgba(0,0,0,0.45)`,
        background: `linear-gradient(135deg, ${ACCENT}18 0%, ${ACCENT}08 100%)`,
        minWidth: 150,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-sm"
    >
      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 9, height: 9,
          background: ACCENT,
          border: '2px solid #0a0f1e',
          bottom: -4,
          zIndex: 1,
        }}
      />

      {/* Play icon */}
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
        style={{ background: `${ACCENT}28`, color: ACCENT }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" style={{ marginLeft: '1px' }}>
          <polygon points="2,1.5 10.5,6 2,10.5" />
        </svg>
      </span>

      <span className="text-sm font-semibold text-gray-100 whitespace-nowrap">
        {data.title || 'Start'}
      </span>

      {hasError && (
        <span className="text-xs text-rose-400 ml-0.5" title="Validation error" aria-label="Validation error">⚠</span>
      )}
    </div>
  );
};
