/**
 * StartNodeForm.tsx
 *
 * Form for editing a StartNode's data.
 * Fields: title input + dynamic key-value metadata editor.
 *
 * Pattern:
 *   onChange  → updateNodeData (live preview, no history stamp)
 *   onBlur    → pushHistory()  (one checkpoint per field-edit session)
 */
import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store';
import type { StartNodeData } from '@/types';
import { inputCls, labelCls, sectionCls } from './formStyles';

interface Props {
  id: string;
  data: StartNodeData;
}

type Pair = { key: string; value: string };

function recordToPairs(record: Record<string, string>): Pair[] {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

function pairsToRecord(pairs: Pair[]): Record<string, string> {
  return Object.fromEntries(
    pairs.filter((p) => p.key.trim()).map((p) => [p.key.trim(), p.value]),
  );
}

export const StartNodeForm: React.FC<Props> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const pushHistory   = useWorkflowStore((s) => s.pushHistory);

  const [title, setTitle]   = useState(data.title);
  const [pairs, setPairs]   = useState<Pair[]>(() => recordToPairs(data.metadata));

  // Reset when selected node changes
  useEffect(() => {
    setTitle(data.title);
    setPairs(recordToPairs(data.metadata));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Title ────────────────────────────────────────────────────────────────
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNodeData(id, { title: e.target.value });
  };

  // ── Metadata pairs ────────────────────────────────────────────────────────
  const syncPairs = (newPairs: Pair[]) => {
    setPairs(newPairs);
    updateNodeData(id, { metadata: pairsToRecord(newPairs) });
  };

  const handlePairChange = (
    idx: number,
    field: 'key' | 'value',
    val: string,
  ) => syncPairs(pairs.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));

  const addPair   = () => syncPairs([...pairs, { key: '', value: '' }]);
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
          onChange={handleTitleChange}
          onBlur={pushHistory}
          placeholder="Workflow title"
        />
      </div>

      {/* Metadata editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Metadata</label>
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
          <p className="text-xs text-gray-500 italic">No metadata fields yet.</p>
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
                aria-label={`Metadata key ${idx + 1}`}
              />
              <input
                type="text"
                className={`${inputCls} flex-1`}
                value={pair.value}
                onChange={(e) => handlePairChange(idx, 'value', e.target.value)}
                onBlur={pushHistory}
                placeholder="value"
                aria-label={`Metadata value ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => removePair(idx)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded
                           text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label={`Remove metadata field ${idx + 1}`}
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
