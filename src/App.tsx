/**
 * App.tsx
 *
 * Root layout: Sidebar | ReactFlow Canvas | NodeFormPanel (conditional)
 *
 * KEY FIX: onDragOver and onDrop are on the wrapper <div>, NOT on <ReactFlow>.
 * Browser drag events fire on the topmost DOM element under the cursor; since
 * ReactFlow's internal pane captures pointer events but not drag events,
 * the handlers must live on the outer div to fire reliably.
 */
import 'reactflow/dist/style.css';

import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
} from 'reactflow';
import type { Connection, NodeMouseHandler } from 'reactflow';
import { useReactFlow } from 'reactflow';

import { useWorkflowStore } from '@/store';
import { nodeTypes }        from '@/components/nodes';
import { NodeFormPanel }    from '@/components/forms';
import { Sidebar, Toolbar, SandboxPanel } from '@/components/panels';
import { createDefaultNode, applyDagreLayout } from '@/utils';
import { NodeType }         from '@/types';
import type { WorkflowEdge } from '@/types';

// ── Accent colour map used by MiniMap ────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  [NodeType.Start]:         '#10b981',
  [NodeType.Task]:          '#3b82f6',
  [NodeType.Approval]:      '#f59e0b',
  [NodeType.AutomatedStep]: '#8b5cf6',
  [NodeType.End]:           '#f43f5e',
};

const DEFAULT_EDGE_OPTIONS = {
  style: { stroke: '#6366f1', strokeWidth: 2 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Inner canvas — must be a child of ReactFlowProvider to use useReactFlow()
// ─────────────────────────────────────────────────────────────────────────────

interface FlowCanvasProps {
  onFitViewReady: (fn: () => void) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({ onFitViewReady }) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Expose fitView to AppInner once ReactFlow is mounted
  useEffect(() => {
    onFitViewReady(() => fitView({ duration: 400 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView]);

  // Store slices
  const nodes         = useWorkflowStore((s) => s.nodes);
  const edges         = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const setEdges      = useWorkflowStore((s) => s.setEdges);
  const addNode       = useWorkflowStore((s) => s.addNode);
  const selectNode    = useWorkflowStore((s) => s.selectNode);
  const pushHistory   = useWorkflowStore((s) => s.pushHistory);

  // ── Edge connect ──────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory();
      const edge = addEdge(params, [])[0];
      const newEdge: WorkflowEdge = {
        ...edge,
        id: `edge-${crypto.randomUUID()}`,
      } as WorkflowEdge;
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges, pushHistory],
  );

  // ── Node selection ────────────────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => selectNode(node.id),
    [selectNode],
  );
  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  // ── Drag-and-drop from sidebar ────────────────────────────────────────────
  // Handlers MUST be on the wrapper div, not on <ReactFlow>.
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const rawType = e.dataTransfer.getData('application/nodeType');
      if (!rawType || !Object.values(NodeType).includes(rawType as NodeType)) return;

      const type     = rawType as NodeType;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const node     = createDefaultNode(type, position);

      addNode(node);        // pushHistory called inside addNode
      selectNode(node.id);  // open properties panel
    },
    [screenToFlowPosition, addNode, selectNode],
  );

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e293b" />

        <Controls
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            overflow: 'hidden',
          }}
        />

        <MiniMap
          nodeColor={(n) => NODE_COLORS[n.type ?? ''] ?? '#6366f1'}
          maskColor="rgba(3,7,18,0.75)"
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root — wraps everything in ReactFlowProvider
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <ReactFlowProvider>
    <AppInner />
  </ReactFlowProvider>
);

// ─────────────────────────────────────────────────────────────────────────────
// AppInner — full layout shell (toolbar + sidebar + canvas + panels)
// ─────────────────────────────────────────────────────────────────────────────
const AppInner: React.FC = () => {
  const { nodes, edges, setNodes, pushHistory, undo, redo, selectedNodeId } =
    useWorkflowStore();

  const [isSandboxOpen, setIsSandboxOpen] = React.useState(false);

  // fitView is surfaced from FlowCanvas via this ref after the canvas mounts
  const fitViewRef = useRef<(() => void) | null>(null);
  const handleFitViewReady = useCallback((fn: () => void) => {
    fitViewRef.current = fn;
  }, []);

  const handleAutoLayout = useCallback(() => {
    const laid = applyDagreLayout(nodes, edges);
    pushHistory();
    setNodes(laid);
    window.requestAnimationFrame(() => fitViewRef.current?.());
  }, [nodes, edges, setNodes, pushHistory]);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl  = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-950">
      {/* Toolbar */}
      <Toolbar onOpenSandbox={() => setIsSandboxOpen(true)} onAutoLayout={handleAutoLayout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node palette */}
        <Sidebar />

        {/* Center: ReactFlow canvas */}
        <div className="flex-1 relative overflow-hidden">
          <FlowCanvas onFitViewReady={handleFitViewReady} />
        </div>

        {/* Right: Properties panel (conditional) */}
        {selectedNodeId && (
          <aside
            className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden shrink-0 animate-slide-in"
            aria-label="Node properties"
          >
            <div className="px-4 py-3 border-b border-gray-800 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Properties
              </h2>
            </div>
            <NodeFormPanel />
          </aside>
        )}
      </div>

      {/* Overlay: Simulation sandbox */}
      {isSandboxOpen && (
        <SandboxPanel onClose={() => setIsSandboxOpen(false)} />
      )}
    </div>
  );
};

export default App;
