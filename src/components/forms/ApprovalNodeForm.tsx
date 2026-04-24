/**
 * ApprovalNodeForm.tsx
 *
 * Fields: title, approverRole select, autoApproveThreshold number slider.
 */
import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store';
import type { ApprovalNodeData } from '@/types';
import { inputCls, selectCls, labelCls, sectionCls } from './formStyles';

interface Props {
  id: string;
  data: ApprovalNodeData;
}

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP'] as const;

export const ApprovalNodeForm: React.FC<Props> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory    = useWorkflowStore((s) => s.pushHistory);

  const [title,                 setTitle]                 = useState(data.title);
  const [approverRole,          setApproverRole]          = useState(data.approverRole);
  const [autoApproveThreshold,  setAutoApproveThreshold]  = useState(data.autoApproveThreshold);

  useEffect(() => {
    setTitle(data.title);
    setApproverRole(data.approverRole);
    setAutoApproveThreshold(data.autoApproveThreshold);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNodeData(id, { title: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setApproverRole(role);
    pushHistory();
    updateNodeData(id, { approverRole: role });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(100, Math.max(0, Number(e.target.value)));
    setAutoApproveThreshold(val);
    updateNodeData(id, { autoApproveThreshold: val });
  };

  return (
    <div className={sectionCls}>
      {/* Title */}
      <div>
        <label className={labelCls} htmlFor={`${id}-title`}>Title</label>
        <input
          id={`${id}-title`}
          type="text"
          className={inputCls}
          value={title}
          onChange={handleTitleChange}
          onBlur={pushHistory}
          placeholder="Approval step name"
        />
      </div>

      {/* Approver role select */}
      <div>
        <label className={labelCls} htmlFor={`${id}-role`}>Approver Role</label>
        <select
          id={`${id}-role`}
          className={selectCls}
          value={approverRole}
          onChange={handleRoleChange}
        >
          <option value="" disabled>Select a role…</option>
          {APPROVER_ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Auto-approve threshold */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls} htmlFor={`${id}-threshold`}>
            Auto-Approve Threshold
          </label>
          {/* Numeric input alongside label */}
          <input
            type="number"
            min={0}
            max={100}
            className="w-16 px-2 py-1 rounded-md bg-gray-800 border border-gray-600
                       text-white text-xs text-right focus:outline-none focus:ring-1
                       focus:ring-indigo-500 transition-colors"
            value={autoApproveThreshold}
            onChange={handleThresholdChange}
            onBlur={pushHistory}
            aria-label="Auto-approve threshold value"
          />
        </div>

        {/* Range slider */}
        <input
          id={`${id}-threshold`}
          type="range"
          min={0}
          max={100}
          step={5}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#f59e0b' }}
          value={autoApproveThreshold}
          onChange={handleThresholdChange}
          onMouseUp={pushHistory}
          onKeyUp={pushHistory}
        />

        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-600">0% — manual</span>
          <span className="text-[10px] text-gray-600">100% — always</span>
        </div>
      </div>
    </div>
  );
};
