'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { Save, Play, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { nodeTypes, type BpmnNodeCategory, SUBTYPES } from './nodes/bpmn-nodes';
import { BpmnToolbar } from './bpmn-toolbar';
import { BpmnPropertiesPanel } from './bpmn-properties-panel';
import { BpmnSimulator } from './bpmn-simulator';

export interface BpmnFlowConfig {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    label?: string;
  }>;
}

interface BpmnBuilderProps {
  automationName: string;
  initialConfig: BpmnFlowConfig | null;
  onSave: (config: BpmnFlowConfig) => Promise<void>;
  backHref?: string;
}

function configToReactFlow(config: BpmnFlowConfig | null): {
  nodes: Node[];
  edges: Edge[];
} {
  if (!config?.nodes?.length) return { nodes: [], edges: [] };
  return {
    nodes: config.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: config.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      label: e.label,
      animated: true,
      style: { strokeWidth: 2 },
    })),
  };
}

function reactFlowToConfig(nodes: Node[], edges: Edge[]): BpmnFlowConfig {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'ACTION',
      position: n.position,
      data: (n.data ?? {}) as Record<string, any>,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      label: typeof e.label === 'string' ? e.label : undefined,
    })),
  };
}

export function BpmnBuilder({
  automationName,
  initialConfig,
  onSave,
  backHref = '/automations',
}: BpmnBuilderProps) {
  const initial = configToReactFlow(initialConfig);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const idCounter = useRef(Date.now());

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, eds),
      ),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const handleAddNode = useCallback(
    (category: BpmnNodeCategory, subtypeCode: string) => {
      idCounter.current++;
      const id = `n_${idCounter.current}`;
      const subtype = SUBTYPES[category].find((s) => s.code === subtypeCode);
      const newNode: Node = {
        id,
        type: category,
        position: {
          x: 200 + Math.random() * 200,
          y: 150 + Math.random() * 200,
        },
        data: {
          subtype: subtypeCode,
          label: subtype?.label ?? '',
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode);
    },
    [setNodes],
  );

  const handleUpdateNodeData = useCallback(
    (id: string, data: Record<string, any>) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
    },
    [setNodes],
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
    },
    [setNodes, setEdges],
  );

  const handleDuplicateNode = useCallback(
    (id: string) => {
      const original = nodes.find((n) => n.id === id);
      if (!original) return;
      idCounter.current++;
      const copy: Node = {
        ...original,
        id: `n_${idCounter.current}`,
        position: {
          x: original.position.x + 40,
          y: original.position.y + 40,
        },
        data: { ...((original.data ?? {}) as Record<string, any>) },
        selected: false,
      };
      setNodes((nds) => [...nds, copy]);
      setSelectedNode(copy);
    },
    [nodes, setNodes],
  );

  // Cmd/Ctrl + D pra duplicar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedNode) {
        e.preventDefault();
        handleDuplicateNode(selectedNode.id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedNode, handleDuplicateNode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(reactFlowToConfig(nodes, edges));
      toast.success('Fluxo salvo');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerCount = nodes.filter((n) => n.type === 'TRIGGER').length;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.4))] flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {automationName}
            </h1>
            <p className="text-[10px] text-zinc-400">
              {nodes.length} nó{nodes.length === 1 ? '' : 's'} · {edges.length} conexõ
              {edges.length === 1 ? 'es' : 'es'}
              {triggerCount === 0 && (
                <>
                  {' · '}
                  <span className="inline-flex items-center gap-0.5 text-red-500">
                    <AlertCircle className="h-3 w-3" /> sem gatilho
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Play className="h-3.5 w-3.5" /> Simular
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="relative flex flex-1">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView={nodes.length > 0}
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode="Delete"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              pannable
              zoomable
              className="!rounded-xl !border !border-zinc-200 dark:!border-zinc-700"
            />
          </ReactFlow>
          <BpmnToolbar onAddNode={handleAddNode} />
          {showSimulator && (
            <BpmnSimulator
              nodes={nodes}
              edges={edges}
              onClose={() => setShowSimulator(false)}
            />
          )}
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white/80 px-6 py-5 text-center backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Canvas vazio
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Comece adicionando um Gatilho na barra à esquerda
                </p>
              </div>
            </div>
          )}
        </div>
        {selectedNode && (
          <BpmnPropertiesPanel
            node={selectedNode}
            onUpdate={handleUpdateNodeData}
            onDelete={handleDeleteNode}
            onDuplicate={handleDuplicateNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
