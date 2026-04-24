/**
 * AutomatedStepNode.tsx — Rich card node for automated actions.
 *
 * Shows: title, action chip (violet), param count chip.
 * Uses the redesigned BaseNode shell with a violet accent.
 */

import React from 'react';
import type { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { AutomatedStepNodeData } from '@/types';

const ACCENT = '#8b5cf6'; // violet-500

/** Maps actionId → short display label for chip text */
const ACTION_LABELS: Record<string, string> = {
  send_email:   'Send Email',
  generate_doc: 'Generate Doc',
  notify_slack: 'Notify Slack',
  update_hris:  'Update HRIS',
};

/** Lightning-bolt icon */
const AutomationIcon = () => (
  <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M8 1.5 L2.5 7.5 h5 L6 12.5 l6.5-7 H8 L8 1.5 Z" />
  </svg>
);

export const AutomatedStepNode: React.FC<NodeProps<AutomatedStepNodeData>> = ({
  id,
  data,
  selected,
}) => {
  const actionLabel = data.actionId
    ? (ACTION_LABELS[data.actionId] ?? data.actionId)
    : null;

  const configuredParams = Object.entries(data.actionParams ?? {}).filter(
    ([, v]) => v.length > 0,
  ).length;

  return (
    <BaseNode
      id={id}
      accentColor={ACCENT}
      typeLabel="Automated"
      icon={<AutomationIcon />}
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
        {/* Action chip */}
        <span
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{
            background: actionLabel ? `${ACCENT}1A` : 'rgba(71,85,105,0.25)',
            color: actionLabel ? ACCENT : '#64748b',
            border: `1px solid ${actionLabel ? `${ACCENT}33` : 'transparent'}`,
          }}
        >
          {/* Mini bolt */}
          <svg viewBox="0 0 8 8" fill="currentColor" className="w-1.5 h-1.5 shrink-0" aria-hidden="true">
            <path d="M4.5 0.5L1 4.5h3L3 7.5l4.5-4.5H4.5L4.5 0.5Z" />
          </svg>
          {actionLabel ?? 'No action selected'}
        </span>

        {/* Param count chip */}
        {data.actionId && (
          <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-700/40 text-gray-400 border border-gray-700/40">
            {configuredParams} / {Object.keys(data.actionParams ?? {}).length} param
            {Object.keys(data.actionParams ?? {}).length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </BaseNode>
  );
};
