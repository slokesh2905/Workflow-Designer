/**
 * BaseNode.tsx
 *
 * Redesigned shell for Task, Approval, and AutomatedStep node cards.
 * Layout:
 *   ┌──────────────────────────────────────┐
 *   │ 3px accent left border               │
 *   │  [icon] TYPE LABEL              [⚠]  │  ← tinted header
 *   ├──────────────────────────────────────┤
 *   │  children (title, desc, chips …)     │  ← card body
 *   └──────────────────────────────────────┘
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store';

export interface BaseNodeProps {
  id: string;
  /** Hex / CSS colour for the accent bar, icon tint and handle dots. */
  accentColor: string;
  /** Short label shown in the header, e.g. "Task", "Approval". */
  typeLabel: string;
  /** Small icon element rendered to the left of the type label. */
  icon?: React.ReactNode;
  selected?: boolean;
  hasTarget?: boolean;
  hasSource?: boolean;
  children: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  accentColor,
  typeLabel,
  icon = null,
  selected = false,
  hasTarget = true,
  hasSource = true,
  children,
}) => {
  const validationErrors = useWorkflowStore((s) => s.validationErrors);
  const hasError = validationErrors.some((e) => e.nodeId === id);

  const handleStyle: React.CSSProperties = {
    width: 10,
    height: 10,
    background: accentColor,
    border: '2px solid #0a0f1e',
    borderRadius: '50%',
    zIndex: 1,
  };

  return (
    <div
      style={{
        width: 240,
        borderLeft: `3px solid ${accentColor}`,
        transition: 'box-shadow 0.2s',
        ...(selected
          ? { boxShadow: `0 0 0 1.5px ${accentColor}, 0 8px 40px ${accentColor}30` }
          : hasError
          ? { boxShadow: '0 0 0 1px rgba(244,63,94,0.5)' }
          : { boxShadow: '0 4px 24px rgba(0,0,0,0.55)' }),
      }}
      className={`bg-[#111827] rounded-xl overflow-hidden border ${
        selected ? 'border-transparent' : hasError ? 'border-rose-500/30' : 'border-gray-700/40'
      }`}
    >
      {/* Target handle — top */}
      {hasTarget && (
        <Handle type="target" position={Position.Top} style={{ ...handleStyle, top: -5 }} />
      )}

      {/* Header row */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: `${accentColor}0C` }}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className="flex items-center justify-center w-5 h-5 rounded shrink-0"
              style={{ background: `${accentColor}22`, color: accentColor }}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span
            className="text-[9px] font-black uppercase tracking-[0.15em]"
            style={{ color: accentColor }}
          >
            {typeLabel}
          </span>
        </div>

        {hasError && (
          <span
            className="text-[11px] font-bold leading-none"
            style={{ color: '#f43f5e' }}
            title="This node has a validation error"
            aria-label="Validation error"
          >
            ⚠
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700/30" />

      {/* Node-specific content */}
      <div className="px-3 py-2.5">{children}</div>

      {/* Source handle — bottom */}
      {hasSource && (
        <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -5 }} />
      )}
    </div>
  );
};
