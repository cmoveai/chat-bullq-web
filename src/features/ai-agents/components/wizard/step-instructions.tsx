'use client';

import { useState } from 'react';
import { Code2, Sparkles, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { WizardState } from './types';

interface StepInstructionsProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const PROMPT_QUESTIONS = [
  {
    id: 'context',
    label: 'Qual é o contexto da tarefa?',
    placeholder:
      'Explique a situação, cenário, problema, objetivo maior ou por que isso está sendo feito.',
  },
  {
    id: 'objective',
    label: 'Qual é o objetivo exato do conteúdo que você deseja gerar?',
    placeholder:
      'O que você quer que o modelo produza? (ex.: texto, e-mail, roteiro, copy, análise, código, estratégia, etc.)',
  },
  {
    id: 'style',
    label: 'Qual é o estilo desejado?',
    placeholder:
      'Como você quer que o conteúdo seja escrito? (ex.: profissional, técnico, simples, storytelling, criativo, acadêmico, etc.)',
  },
  {
    id: 'audience',
    label: 'Quem é o público-alvo?',
    placeholder:
      'Para quem este conteúdo será direcionado? (ex.: clientes, estudantes, programadores, líderes, RH, público geral...)',
  },
  {
    id: 'format',
    label: 'Qual deve ser o formato da resposta?',
    placeholder:
      'Como o resultado deve vir? (ex.: lista, texto corrido, tabela, código, passo a passo, tópicos, estrutura pronta...)',
  },
  {
    id: 'example',
    label: 'Existe um exemplo (few-shot) que você deseja usar como referência?',
    placeholder: 'Se sim, cole aqui (texto, template, roteiro, trecho...).',
  },
  {
    id: 'rules',
    label: 'Existem regras específicas que o modelo deve seguir?',
    placeholder:
      '(ex.: evitar certos termos, seguir diretrizes, manter limite de palavras, usar tags, etc.)',
  },
  {
    id: 'critical',
    label: 'Existe um ponto crítico que absolutamente não pode ser esquecido?',
    placeholder: 'Itens obrigatórios, observações importantes, restrições rígidas.',
  },
] as const;

type PromptAnswers = Record<(typeof PROMPT_QUESTIONS)[number]['id'], string>;

export function StepInstructions({ state, update }: StepInstructionsProps) {
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Code2 className="h-4 w-4 text-violet-600" />
          Instruções Extras
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Adicione instruções extras para personalizar o comportamento do seu
          agente
        </p>
      </header>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Code2 className="h-3.5 w-3.5 text-violet-600" />
          Instruções Extras
        </label>
        <button
          type="button"
          onClick={() => setShowGenerator(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Gerar com IA
        </button>
      </div>

      <textarea
        value={state.extraInstructions}
        onChange={(e) => update({ extraInstructions: e.target.value })}
        rows={12}
        placeholder="### Identidade e Objetivo&#10;Você é o(a) assistente especialista..."
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <p className="text-xs text-zinc-500">
        Adicionar instruções extras para personalizar o comportamento do agente.
      </p>

      {showGenerator && (
        <PromptGeneratorModal
          onClose={() => setShowGenerator(false)}
          onGenerate={(answers) => {
            const generated = buildPromptFromAnswers(answers);
            update({ extraInstructions: generated });
            setShowGenerator(false);
            toast.success('Prompt gerado · ajuste no editor se quiser');
          }}
        />
      )}
    </div>
  );
}

function buildPromptFromAnswers(answers: Partial<PromptAnswers>): string {
  const blocks: string[] = [];
  if (answers.context) blocks.push(`### Contexto\n${answers.context}`);
  if (answers.objective) blocks.push(`### Objetivo\n${answers.objective}`);
  if (answers.style) blocks.push(`### Estilo\n${answers.style}`);
  if (answers.audience) blocks.push(`### Público-alvo\n${answers.audience}`);
  if (answers.format) blocks.push(`### Formato da resposta\n${answers.format}`);
  if (answers.example) blocks.push(`### Exemplo de referência\n${answers.example}`);
  if (answers.rules) blocks.push(`### Regras\n${answers.rules}`);
  if (answers.critical) blocks.push(`### Pontos críticos\n${answers.critical}`);
  return blocks.join('\n\n');
}

function PromptGeneratorModal({
  onClose,
  onGenerate,
}: {
  onClose: () => void;
  onGenerate: (answers: Partial<PromptAnswers>) => void;
}) {
  const [answers, setAnswers] = useState<Partial<PromptAnswers>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-start justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <Sparkles className="h-4 w-4 text-violet-600" />
              Gerador de Prompts com IA
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Responda as perguntas abaixo · o sistema monta o prompt
              estruturado para você
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {PROMPT_QUESTIONS.map((q, idx) => (
            <div key={q.id} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {idx + 1}
                </span>
                {q.label}
              </label>
              <textarea
                rows={2}
                value={answers[q.id] ?? ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder={q.placeholder}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              Esta versão monta o prompt localmente. A chamada de LLM pra
              refinar entra nas próximas iterações.
            </span>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onGenerate(answers)}
            disabled={Object.values(answers).every((v) => !v?.trim())}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            Gerar Prompt
          </button>
        </footer>
      </div>
    </div>
  );
}
