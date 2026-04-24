/**
 * TaskNodeForm.tsx
 *
 * Fields: title, description textarea, assignee, dueDate,
 *         dynamic custom-fields key-value editor.
 */
import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store';
import type { TaskNodeData } from '@/types';
import { inputCls, textareaCls, labelCls, sectionCls } from './formStyles';

interface Props {
  id: string;
  data: TaskNodeData;
}

type Pair = { key: string; value: string };

function recordToPairs(r: Record<string, string>): Pair[] {
  return Object.entries(r).map(([key, value]) => ({ key, value }));
}
function pairsToRecord(pairs: Pair[]): Record<string, string> {
  return Object.fromEntries(
    pairs.filter((p) => p.key.trim()).map((p) => [p.key.trim(), p.value]),
  );
}

export const TaskNodeForm: React.FC<Props> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory    = useWorkflowStore((s) => s.pushHistory);

  const [title,       setTitle]       = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [assignee,    setAssignee]    = useState(data.assignee);
  const [dueDate,     setDueDate]     = useState(data.dueDate);
  const [pairs,       setPairs]       = useState<Pair[]>(() => recordToPairs(data.customFields));

  useEffect(() => {
    setTitle(data.title);
    setDescription(data.description);
    setAssignee(data.assignee);
    setDueDate(data.dueDate);
    setPairs(recordToPairs(data.customFields));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // simple field helper
  function makeHandler<K extends keyof TaskNodeData>(
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: K,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      updateNodeData(id, { [key]: e.target.value } as Partial<TaskNodeData>);
    };
  }

  // Custom fields
  const syncPairs = (newPairs: Pair[]) => {
    setPairs(newPairs);
    updateNodeData(id, { customFields: pairsToRecord(newPairs) });
  };
  const handlePairChange = (idx: number, field: 'key' | 'value', val: string) =>
    syncPairs(pairs.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  const addPair    = () => syncPairs([...pairs, { key: '', value: '' }]);
  const removePair = (idx: number) => syncPairs(pairs.filter((_, i) => i !== idx));

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
          onChange={makeHandler(setTitle, 'title')}
          onBlur={pushHistory}
          placeholder="Task name"
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls} htmlFor={`${id}-desc`}>Description</label>
        <textarea
          id={`${id}-desc`}
          rows={3}
          className={textareaCls}
          value={description}
          onChange={makeHandler(setDescription, 'description')}
          onBlur={pushHistory}
          placeholder="What needs to be done?"
        />
      </div>

      {/* Assignee */}
      <div>
        <label className={labelCls} htmlFor={`${id}-assignee`}>Assignee</label>
        <input
          id={`${id}-assignee`}
          type="text"
          className={inputCls}
          value={assignee}
          onChange={makeHandler(setAssignee, 'assignee')}
          onBlur={pushHistory}
          placeholder="email or username"
        />
      </div>

      {/* Due date */}
      <div>
        <label className={labelCls} htmlFor={`${id}-due`}>Due Date</label>
        <input
          id={`${id}-due`}
          type="date"
          className={inputCls}
          value={dueDate}
          onChange={makeHandler(setDueDate, 'dueDate')}
          onBlur={pushHistory}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Custom fields */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Custom Fields</label>
          <button
            type="button"
            onClick={addPair}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md
                       bg-indigo-500/10 text-indigo-400 border border-indigo-500/20
                       hover:bg-indigo-500/20 transition-colors"
          >
            + Add field
          </button>
        </div>
        {pairs.length === 0 && (
          <p className="text-xs text-gray-500 italic">No custom fields.</p>
        )}
        <div className="space-y-2">
          {pairs.map((pair, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                className={`${inputCls} flex-1`}
                value={pair.key}
                onChange={(e) => handlePairChange(idx, 'key', e.target.value)}
                onBlur={pushHistory}
                placeholder="key"
                aria-label={`Custom field key ${idx + 1}`}
              />
              <input
                type="text"
                className={`${inputCls} flex-1`}
                value={pair.value}
                onChange={(e) => handlePairChange(idx, 'value', e.target.value)}
                onBlur={pushHistory}
                placeholder="value"
                aria-label={`Custom field value ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => removePair(idx)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded
                           text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label={`Remove custom field ${idx + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
