'use client';

import { useMemo, useState } from 'react';
import { X, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

interface BpmnSimulatorProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

type StepKind = 'info' | 'warn' | 'error' | 'ok';

interface Step {
  nodeId: string;
  nodeType: string;
  label: string;
  detail: string;
  kind: StepKind;
}

function validateFlow(nodes: Node[], edges: Edge[]): { steps: Step[]; valid: boolean } {
  const steps: Step[] = [];

  const triggers = nodes.filter((n) => n.type === 'TRIGGER');
  if (triggers.length === 0) {
    steps.push({
      nodeId: '',
      nodeType: 'TRIGGER',
      label: 'Sem gatilho',
      detail: 'O fluxo precisa de pelo menos 1 nó TRIGGER pra começar',
      kind: 'error',
    });
    return { steps, valid: false };
  }
  if (triggers.length > 1) {
    steps.push({
      nodeId: triggers[0].id,
      nodeType: 'TRIGGER',
      label: `${triggers.length} gatilhos`,
      detail: 'Mais de 1 gatilho · fluxo vai executar em paralelo',
      kind: 'warn',
    });
  }

  // Detecta nodes desconectados
  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.source);
    connected.add(e.target);
  }
  const orphans = nodes.filter((n) => !connected.has(n.id) && nodes.length > 1);
  for (const o of orphans) {
    steps.push({
      nodeId: o.id,
      nodeType: o.type ?? '',
      label: 'Nó isolado',
      detail: `${(o.data as any)?.label ?? o.id} não está conectado a nada`,
      kind: 'warn',
    });
  }

  // Detecta loops simples (A→B→A)
  const outgoing = new Map<string, string[]>();
  for (const e of edges) {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source)!.push(e.target);
  }

  // BFS a partir de cada trigger
  for (const trigger of triggers) {
    steps.push({
      nodeId: trigger.id,
      nodeType: 'TRIGGER',
      label: (trigger.data as any)?.label ?? `Gatilho ${(trigger.data as any)?.subtype ?? ''}`,
      detail: 'Início do fluxo',
      kind: 'info',
    });
    const visited = new Set<string>([trigger.id]);
    const queue: string[] = [...(outgoing.get(trigger.id) ?? [])];
    let depth = 0;
    while (queue.length > 0 && depth < 50) {
      depth++;
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const node = nodes.find((n) => n.id === current);
      if (!node) continue;
      const d = (node.data ?? {}) as any;
      steps.push({
        nodeId: node.id,
        nodeType: node.type ?? '',
        label: d.label ?? `${node.type} ${d.subtype ?? ''}`,
        detail: explainNode(node),
        kind: 'info',
      });
      for (const next of outgoing.get(current) ?? []) queue.push(next);
    }
  }

  // Final
  const endNodes = nodes.filter(
    (n) => n.type === 'UTIL' && (n.data as any)?.subtype === 'END',
  );
  if (endNodes.length === 0 && nodes.length > 1) {
    steps.push({
      nodeId: '',
      nodeType: 'UTIL',
      label: 'Sem nó de Fim',
      detail: 'Recomendado: adicionar 1 nó Fim explícito pra clareza',
      kind: 'warn',
    });
  }

  steps.push({
    nodeId: '',
    nodeType: '',
    label: 'Validação concluída',
    detail: `${nodes.length} nó${nodes.length === 1 ? '' : 's'} · ${edges.length} conexõ${
      edges.length === 1 ? 'es' : 'es'
    } · ${steps.filter((s) => s.kind === 'error').length} erro${
      steps.filter((s) => s.kind === 'error').length === 1 ? '' : 's'
    } · ${steps.filter((s) => s.kind === 'warn').length} aviso${
      steps.filter((s) => s.kind === 'warn').length === 1 ? '' : 's'
    }`,
    kind: steps.some((s) => s.kind === 'error') ? 'error' : 'ok',
  });

  return { steps, valid: !steps.some((s) => s.kind === 'error') };
}

function explainNode(node: Node): string {
  const d = (node.data ?? {}) as any;
  switch (node.type) {
    case 'TRIGGER':
      if (d.subtype === 'IG_COMMENT')
        return `Quando alguém comenta${d.postId ? ` no post ${d.postId}` : ''}`;
      if (d.subtype === 'IG_DM') return 'Quando chega uma DM nova no Instagram';
      if (d.subtype === 'WA_MESSAGE') return 'Quando chega mensagem nova no WhatsApp';
      if (d.subtype === 'SCHEDULE') return `Schedule cron: ${d.cron ?? '(sem cron)'}`;
      if (d.subtype === 'MANUAL') return 'Disparado manualmente do painel';
      return d.subtype ?? '?';
    case 'CONDITION':
      if (d.subtype === 'KEYWORD')
        return `Verifica palavras: ${(d.keywords ?? []).join(', ') || '(vazio)'}`;
      if (d.subtype === 'TIME_WINDOW') return 'Verifica horário comercial';
      if (d.subtype === 'TAG') return `Tem tag "${d.tag ?? ''}"?`;
      if (d.subtype === 'FIRST_TIME') return 'Primeira interação do contato?';
      return d.subtype ?? '?';
    case 'ACTION':
      if (d.subtype === 'SEND_DM' || d.subtype === 'SEND_WA') {
        const msg = (d.message ?? '').slice(0, 60);
        return `Envia "${msg}${msg.length === 60 ? '...' : ''}"`;
      }
      if (d.subtype === 'SEND_EMAIL') return `Envia e-mail "${d.subject ?? ''}"`;
      if (d.subtype === 'TRANSFER') return 'Passa pra atendente humano';
      if (d.subtype === 'TAG') return `Adiciona tag "${d.tag ?? ''}"`;
      if (d.subtype === 'RUN_AGENT') return `Delega pro agente ${d.agentId ?? ''}`;
      return d.subtype ?? '?';
    case 'UTIL':
      if (d.subtype === 'DELAY') return `Pausa ${d.minutes ?? 5} minutos`;
      if (d.subtype === 'END') return 'Encerra fluxo';
      return d.subtype ?? '?';
  }
  return '';
}

export function BpmnSimulator({ nodes, edges, onClose }: BpmnSimulatorProps) {
  const result = useMemo(() => validateFlow(nodes, edges), [nodes, edges]);

  return (
    <div className="absolute right-4 bottom-4 top-20 z-20 w-96 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Simulação</h3>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-3">
        {result.steps.map((step, i) => (
          <div
            key={i}
            className={`mb-2 rounded-lg border p-3 ${
              step.kind === 'error'
                ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
                : step.kind === 'warn'
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
                  : step.kind === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start gap-2">
              {step.kind === 'error' || step.kind === 'warn' ? (
                <AlertCircle
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    step.kind === 'error' ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
              ) : step.kind === 'ok' ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {step.label}
                  </span>
                  {step.nodeType && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                      {step.nodeType}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{step.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
