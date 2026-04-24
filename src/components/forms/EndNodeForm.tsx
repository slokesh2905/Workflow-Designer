/**
 * EndNodeForm.tsx
 *
 * Form for editing an EndNode's data.
 * Fields: endMessage text input, summaryFlag styled toggle.
 */
import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store';
import type { EndNodeData } from '@/types';
import { inputCls, labelCls, sectionCls } from './formStyles';

interface Props {
  id: string;
  data: EndNodeData;
}

export const EndNodeForm: React.FC<Props> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory    = useWorkflowStore((s) => s.pushHistory);

  const [endMessage,   setEndMessage]   = useState(data.endMessage);
  const [summaryFlag,  setSummaryFlag]  = useState(data.summaryFlag);

  useEffect(() => {
    setEndMessage(data.endMessage);
    setSummaryFlag(data.summaryFlag);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndMessage(e.target.value);
    updateNodeData(id, { endMessage: e.target.value });
  };

  const handleToggle = () => {
    const next = !summaryFlag;
    setSummaryFlag(next);
    pushHistory();                            // toggle is its own complete action
    updateNodeData(id, { summaryFlag: next });
  };

  return (
    <div className={sectionCls}>
      {/* End message */}
      <div>
        <label className={labelCls} htmlFor={`${id}-endMessage`}>End Message</label>
        <input
          id={`${id}-endMessage`}
          type="text"
          className={inputCls}
          value={endMessage}
          onChange={handleMessageChange}
          onBlur={pushHistory}
          placeholder="e.g. Hiring process complete"
        />
      </div>

      {/* Summary flag toggle */}
      <div>
        <label className={labelCls}>Summary Report</label>
        <button
          type="button"
          role="switch"
          aria-checked={summaryFlag}
          onClick={handleToggle}
          className="flex items-center gap-3 group focus:outline-none"
        >
          {/* Track */}
          <span
            className="relative inline-flex h-5 w-9 shrink-0 rounded-full
                       border-2 border-transparent transition-colors duration-200
                       focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{ backgroundColor: summaryFlag ? '#10b981' : '#374151' }}
          >
            {/* Thumb */}
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow
                         transition-transform duration-200"
              style={{ transform: summaryFlag ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </span>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {summaryFlag ? 'Enabled — generate completion report' : 'Disabled'}
          </span>
        </button>
      </div>
    </div>
  );
};
