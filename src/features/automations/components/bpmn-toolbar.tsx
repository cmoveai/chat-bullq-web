'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  SUBTYPES,
  type BpmnNodeCategory,
} from './nodes/bpmn-nodes';

const CATEGORY_ORDER: BpmnNodeCategory[] = ['TRIGGER', 'CONDITION', 'ACTION', 'UTIL'];

const CATEGORY_TITLE: Record<BpmnNodeCategory, string> = {
  TRIGGER: 'Gatilhos',
  CONDITION: 'Condições',
  ACTION: 'Ações',
  UTIL: 'Utilidades',
};

const CATEGORY_HINT: Record<BpmnNodeCategory, string> = {
  TRIGGER: 'O que dispara o fluxo',
  CONDITION: 'Decisões binárias (sim/não)',
  ACTION: 'O que o fluxo faz',
  UTIL: 'Esperar, encerrar, agrupar',
};

const DOT: Record<BpmnNodeCategory, string> = {
  TRIGGER: 'bg-emerald-500',
  CONDITION: 'bg-amber-500',
  ACTION: 'bg-blue-500',
  UTIL: 'bg-zinc-500',
};

interface BpmnToolbarProps {
  onAddNode: (category: BpmnNodeCategory, subtypeCode: string) => void;
}

export function BpmnToolbar({ onAddNode }: BpmnToolbarProps) {
  const [open, setOpen] = useState<Record<BpmnNodeCategory, boolean>>({
    TRIGGER: true,
    CONDITION: false,
    ACTION: false,
    UTIL: false,
  });

  return (
    <div className="absolute left-4 top-4 z-10 w-[224px] rounded-xl border border-zinc-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Blocos BPMN
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-400">Clique pra adicionar ao canvas</p>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2">
        {CATEGORY_ORDER.map((cat) => {
          const isOpen = open[cat];
          const items = SUBTYPES[cat];
          return (
            <div key={cat} className="mb-1">
              <button
                onClick={() => setOpen((s) => ({ ...s, [cat]: !s[cat] }))}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-zinc-400" />
                )}
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[cat]}`} />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {CATEGORY_TITLE[cat]}
                </span>
                <span className="ml-auto text-[10px] text-zinc-400">{items.length}</span>
              </button>

              {isOpen && (
                <div className="mt-1 space-y-0.5">
                  <p className="px-3 pb-1 text-[10px] italic text-zinc-400">{CATEGORY_HINT[cat]}</p>
                  {items.map((sub) => (
                    <button
                      key={sub.code}
                      onClick={() => onAddNode(cat, sub.code)}
                      title={sub.description}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <span className="inline-flex h-5 w-7 shrink-0 items-center justify-center rounded font-mono text-[9px] tracking-tight text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                        {sub.icon}
                      </span>
                      <span className="truncate">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
