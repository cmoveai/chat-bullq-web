'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Type as TypeIcon,
  Upload,
  FileText,
} from 'lucide-react';
import {
  knowledgeBasesService,
  formatBytes,
} from '@/features/knowledge-bases/services/knowledge-bases.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import {
  CreateTextDialog,
  UploadDialog,
} from '@/app/(dashboard)/knowledge-bases/page';
import type { WizardState } from './types';

interface StepKnowledgeProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

type Mode = 'list' | 'create-text' | 'create-upload';

/**
 * Step 4 do wizard: seleção de Bases de Conhecimento.
 * Replica EXATAMENTE a UX da página standalone /knowledge-bases (header
 * sóbrio com 2 CTAs · empty state minimalista). Reusa os mesmos dialogs
 * pra criar (CreateTextDialog · UploadDialog) — sem inventar componente
 * novo. Princípio: UI nativa CMOVE, não cópia AutomateFlow.
 */
export function StepKnowledge({ state, update }: StepKnowledgeProps) {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>('list');

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

  const handleDialogClose = () => {
    setMode('list');
    qc.invalidateQueries({ queryKey: ['knowledge-bases', orgId] });
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <BookOpen className="h-4 w-4 text-violet-600" />
            Bases de Conhecimento
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Documentos e textos que este agente consulta pra responder clientes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('create-text')}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <TypeIcon className="h-4 w-4" />
            Texto livre
          </button>
          <button
            type="button"
            onClick={() => setMode('create-upload')}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Upload arquivo
          </button>
        </div>
      </header>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando bases...
          </div>
        ) : bases.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <BookOpen className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Nenhuma base de conhecimento ainda
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Faça upload de PDF/DOCX/TXT ou adicione texto direto
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('create-text')}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <TypeIcon className="h-4 w-4" />
                Texto livre
              </button>
              <button
                type="button"
                onClick={() => setMode('create-upload')}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {bases.map((kb) => {
              const active = state.knowledgeBaseIds.includes(kb.id);
              const Icon = kb.sourceType === 'UPLOAD' ? Upload : FileText;
              return (
                <li
                  key={kb.id}
                  className="flex items-center gap-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggle(kb.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary"
                  />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {kb.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {kb.sourceType === 'UPLOAD'
                        ? `${kb.sourceFilename ?? 'arquivo'} · ${formatBytes(
                            kb.sourceSizeBytes,
                          )}`
                        : 'Texto livre'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {mode === 'create-text' && <CreateTextDialog onClose={handleDialogClose} />}
      {mode === 'create-upload' && <UploadDialog onClose={handleDialogClose} />}
    </div>
  );
}
