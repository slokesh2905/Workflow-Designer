/**
 * components/panels/SandboxPanel.tsx
 *
 * Slide-over panel for simulating the workflow.
 * Validates the graph, then calls /api/simulate to get step-by-step results.
 */
import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store';
import { validateWorkflow } from '@/utils/validation';
import type { SimulateResponse, SimulationStep, ValidationError } from '@/types';

interface SandboxPanelProps {
  onClose: () => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({ onClose }) => {
  const { nodes, edges } = useWorkflowStore();
  const [simulation, setSimulation] = useState<{
    steps: SimulationStep[];
    loading: boolean;
    error: string | null;
    validationErrors: ValidationError[];
  }>({
    steps: [],
    loading: false,
    error: null,
    validationErrors: [],
  });

  // ── Run Simulation ────────────────────────────────────────────────────────
  const runSimulation = async () => {
    // 1. Validate
    const vErrors = validateWorkflow(nodes, edges);
    if (vErrors.length > 0) {
      setSimulation((s) => ({ ...s, validationErrors: vErrors, loading: false }));
      return;
    }

    setSimulation({ steps: [], loading: true, error: null, validationErrors: [] });

    // 2. Call API
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) throw new Error('Simulation failed');
      const data: SimulateResponse = await response.json();
      setSimulation((s) => ({ ...s, steps: data.steps, loading: false }));
    } catch (err) {
      setSimulation((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  useEffect(() => {
    runSimulation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const successCount = simulation.steps.filter((s) => s.status === 'success').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <aside className="relative w-96 bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Simulation Sandbox</h2>
            <p className="text-xs text-gray-500 mt-0.5">Testing workflow logic & steps</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          
          {/* Validation Errors State */}
          {simulation.validationErrors.length > 0 && (
            <div className="space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <span className="text-lg">⚠</span>
                  <p className="text-sm font-bold">Validation Required</p>
                </div>
                <p className="text-xs text-rose-400/80 leading-relaxed">
                  The workflow must be valid before it can be simulated. Please address the following issues:
                </p>
              </div>
              <ul className="space-y-2">
                {simulation.validationErrors.map((err, i) => (
                  <li key={i} className="flex gap-2 text-xs p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-rose-500 shrink-0">•</span>
                    <span className="text-gray-400">
                      <strong className="text-gray-300 font-medium">
                        {err.nodeId === 'global' ? 'Workflow' : `Node ${err.nodeId}`}
                      </strong>: {err.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Loading State */}
          {simulation.loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500 font-medium animate-pulse">Running simulation engine...</p>
            </div>
          )}

          {/* Steps Timeline */}
          {!simulation.loading && simulation.steps.length > 0 && (
            <div className="space-y-6">
              <div className="relative space-y-4">
                {/* Vertical Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-800" />

                {simulation.steps.map((step, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    {/* Status Dot */}
                    <div
                      className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2"
                      style={{
                        backgroundColor: '#030712', // gray-950
                        borderColor: step.status === 'success' ? '#10b981' : step.status === 'error' ? '#f43f5e' : '#334155',
                        color: step.status === 'success' ? '#10b981' : step.status === 'error' ? '#f43f5e' : '#94a3b8',
                      }}
                    >
                      {/* Placeholder generic icon logic */}
                      <span className="text-[10px] font-bold uppercase">{step.nodeType.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-200 truncate capitalize">
                          {step.nodeType} node
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            step.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : step.status === 'error'
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              : 'bg-gray-800 text-gray-500 border-gray-700'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed italic">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Summary */}
          {!simulation.loading && simulation.steps.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Execution Result</span>
                <span className={`text-sm font-bold ${successCount === simulation.steps.length ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {successCount} / {simulation.steps.length} succeeded
                </span>
              </div>
              <button
                onClick={runSimulation}
                className="w-full mt-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-colors"
              >
                Re-run Simulation
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
