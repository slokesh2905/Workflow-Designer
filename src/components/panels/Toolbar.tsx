/**
 * components/panels/Toolbar.tsx
 *
 * Top toolbar for the HR Workflow Designer.
 * Contains:
 *   – Global actions (Undo/Redo)
 *   – Import/Export (JSON)
 *   – Test Workflow (Sandbox trigger)
 */
import React, { useRef } from 'react';
import { useWorkflowStore } from '@/store';
import { applyDagreLayout } from '@/utils/layout';

export interface ToolbarProps {
  onOpenSandbox: () => void;
  onAutoLayout: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenSandbox, onAutoLayout }) => {
  const { nodes, edges, setNodes, setEdges, pushHistory, undo, redo, history } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Import ──────────────────────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.nodes || !json.edges) throw new Error('Invalid format');

        pushHistory();
        // Automatically apply layout when importing
        const positionedNodes = applyDagreLayout(json.nodes, json.edges);
        setNodes(positionedNodes);
        setEdges(json.edges);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        alert('Malformed JSON: Please select a valid workflow file.');
      }
    };
    reader.readAsText(file);
  };

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left: Branding & History */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-sm font-bold text-gray-100 tracking-tight">HR Designer</h1>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-gray-800 pl-6">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
            title="Undo (Ctrl+Z)"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
            title="Redo (Ctrl+Y)"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Tools & Sandbox */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          accept=".json"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Import
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Export
        </button>

        <button
          onClick={onAutoLayout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all mr-2"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
          Auto Layout
        </button>

        <button
          onClick={onOpenSandbox}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Test Workflow
        </button>
      </div>
    </header>
  );
};
