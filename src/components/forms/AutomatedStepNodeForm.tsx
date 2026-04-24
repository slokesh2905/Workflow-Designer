/**
 * AutomatedStepNodeForm.tsx
 *
 * Fields: title, actionId select (fetched via useFetch from /api/automations),
 *         dynamic param inputs rendered from the selected action's params array.
 *
 * Loading / error states are handled gracefully.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useWorkflowStore } from '@/store';
import { useFetch } from '@/hooks/useFetch';
import type { AutomatedStepNodeData, AutomationAction } from '@/types';
import { inputCls, selectCls, labelCls, sectionCls } from './formStyles';

interface Props {
  id: string;
  data: AutomatedStepNodeData;
}

export const AutomatedStepNodeForm: React.FC<Props> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory    = useWorkflowStore((s) => s.pushHistory);

  const [title,        setTitle]        = useState(data.title);
  const [actionId,     setActionId]     = useState(data.actionId);
  const [actionParams, setActionParams] = useState<Record<string, string>>(data.actionParams);

  // Fetch the automation catalogue (served by MSW in dev)
  const {
    data: automations,
    loading,
    error,
    refetch,
  } = useFetch<AutomationAction[]>('/api/automations');

  useEffect(() => {
    setTitle(data.title);
    setActionId(data.actionId);
    setActionParams(data.actionParams);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive the currently selected action object
  const selectedAction = useMemo(
    () => automations?.find((a) => a.id === actionId) ?? null,
    [automations, actionId],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNodeData(id, { title: e.target.value });
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    const action = automations?.find((a) => a.id === newId) ?? null;

    // Preserve existing param values for keys that still exist; reset removed keys
    const newParams: Record<string, string> = {};
    if (action) {
      for (const param of action.params) {
        newParams[param] = actionParams[param] ?? '';
      }
    }

    setActionId(newId);
    setActionParams(newParams);
    pushHistory();
    updateNodeData(id, { actionId: newId, actionParams: newParams });
  };

  const handleParamChange = (param: string, value: string) => {
    const next = { ...actionParams, [param]: value };
    setActionParams(next);
    updateNodeData(id, { actionParams: next });
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
          placeholder="Step name"
        />
      </div>

      {/* Action selector */}
      <div>
        <label className={labelCls} htmlFor={`${id}-action`}>Automation Action</label>

        {loading && (
          <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border-2 border-indigo-400
                         border-t-transparent animate-spin"
              aria-hidden="true"
            />
            Loading automations…
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-rose-400">Failed to load automations</p>
            <button
              type="button"
              onClick={refetch}
              className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400
                         border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && automations && (
          <select
            id={`${id}-action`}
            className={selectCls}
            value={actionId}
            onChange={handleActionChange}
          >
            <option value="" disabled>Select an action…</option>
            {automations.map((action) => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dynamic param inputs — rendered from the selected action's params[] */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div>
          <label className={labelCls}>Action Parameters</label>
          <div className="space-y-3">
            {selectedAction.params.map((param) => (
              <div key={param}>
                <label
                  className="block text-xs text-gray-400 mb-1 capitalize"
                  htmlFor={`${id}-param-${param}`}
                >
                  {param}
                </label>
                <input
                  id={`${id}-param-${param}`}
                  type="text"
                  className={inputCls}
                  value={actionParams[param] ?? ''}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                  onBlur={pushHistory}
                  placeholder={`Enter ${param}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when action is set but has no params */}
      {selectedAction && selectedAction.params.length === 0 && (
        <p className="text-xs text-gray-500 italic">This action has no configurable parameters.</p>
      )}
    </div>
  );
};
