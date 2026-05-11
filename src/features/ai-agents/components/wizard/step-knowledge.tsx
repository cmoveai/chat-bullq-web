'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  Brain,
  Plus,
  FileText,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { knowledgeBasesService } from '@/features/knowledge-bases/services/knowledge-bases.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import type { WizardState } from './types';

interface StepKnowledgeProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepKnowledge({ state, update }: StepKnowledgeProps) {
  const orgId = useOrgId();

  const { data: bases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: () => knowledgeBasesService.list(),
  });

  const toggle = (id: string) => {
    const has = state.knowledgeBaseIds.includes(id);
    update({
      knowledgeBaseIds: has
        ? state.knowledgeBaseIds.filter((x) => x !== id)
        : [...state.knowledgeBaseIds, id],
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <Database className="h-4 w-4 text-violet-600" />
            Base de Conhecimento
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Selecione bases de conhecimento para seu agente
          </p>
        </div>
        <Link
          href="/knowledge-bases"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Criar Nova Base
        </Link>
      </header>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Selecione as bases de conhecimento que o agente pode usar
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
          Carregando bases...
        </div>
      ) : bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma base de conhecimento
            </p>
            <p className="mt-1 max-w-md text-xs text-zinc-500">
              Você ainda não tem nenhuma base de conhecimento. Crie sua
              primeira base para que o agente possa acessar informações
              relevantes.
            </p>
          </div>
          <Link
            href="/knowledge-bases"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4" />
            Criar primeira base
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bases.map((kb) => {
            const active = state.knowledgeBaseIds.includes(kb.id);
            const Icon = kb.sourceType === 'UPLOAD' ? Upload : FileText;
            return (
              <button
                key={kb.id}
                type="button"
                onClick={() => toggle(kb.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  active
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {kb.name}
                  </p>
                  {kb.description && (
                    <p className="truncate text-xs text-zinc-500">
                      {kb.description}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  readOnly
                  className="h-4 w-4 rounded border-zinc-300 text-violet-600"
                />
              </button>
            );
          })}
          <p className="pt-2 text-xs text-zinc-500">
            {state.knowledgeBaseIds.length} de {bases.length} base
            {bases.length === 1 ? '' : 's'} selecionada
            {state.knowledgeBaseIds.length === 1 ? '' : 's'}.{' '}
            <Link
              href="/knowledge-bases"
              target="_blank"
              className="inline-flex items-center gap-1 text-violet-600 hover:underline dark:text-violet-400"
            >
              Gerenciar bases
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
