'use client';

import { Info, Tag, Cpu, ChevronDown } from 'lucide-react';
import { CURATED_MODELS } from '../../services/ai-agents.service';
import type { WizardState } from './types';

interface StepBasicInfoProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepBasicInfo({ state, update }: StepBasicInfoProps) {
  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Info className="h-4 w-4 text-violet-600" />
          Informações Básicas
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Preencha as informações básicas do seu agente
        </p>
      </header>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Tag className="h-3.5 w-3.5 text-violet-600" />
          Nome do Agente
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ex: Assistente de Vendas"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500">Digite um nome para seu agente</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Cpu className="h-3.5 w-3.5 text-violet-600" />
          Modelo
        </label>
        <p className="text-xs text-zinc-500">
          Selecione o modelo de IA que será usado pelo seu agente
        </p>
        <div className="relative">
          <select
            value={state.modelId}
            onChange={(e) => update({ modelId: e.target.value })}
            className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {CURATED_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.badge}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
