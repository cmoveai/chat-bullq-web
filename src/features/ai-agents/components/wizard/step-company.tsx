'use client';

import { Building, Globe } from 'lucide-react';
import type { WizardState } from './types';

interface StepCompanyProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepCompany({ state, update }: StepCompanyProps) {
  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Building className="h-4 w-4 text-violet-600" />
          Informações da Empresa
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Forneça detalhes sobre sua empresa
        </p>
      </header>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Building className="h-3.5 w-3.5 text-violet-600" />
          Fornece suporte para:
        </label>
        <input
          type="text"
          value={state.companyName}
          onChange={(e) => update({ companyName: e.target.value })}
          placeholder="Ex: ABC Tecnologia Ltda"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500">Digite o nome da sua entidade</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Globe className="h-3.5 w-3.5 text-violet-600" />
          Site Oficial
        </label>
        <input
          type="url"
          value={state.companyWebsite}
          onChange={(e) => update({ companyWebsite: e.target.value })}
          placeholder="https://exemplo.com"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500">
          Site oficial da sua empresa ou produto
        </p>
      </div>
    </div>
  );
}
