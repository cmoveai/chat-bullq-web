'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Lock } from 'lucide-react';
import { isPlanError, type PlanError } from '@/lib/api';

/**
 * Toast premium pra erros de plano. Mostra contexto (usado/limite ou orçamento)
 * + CTA "Fazer upgrade" → /plans com query param do motivo do bloqueio (deep-link
 * pra UX downstream poder destacar o plano sugerido).
 */
export function showPlanErrorToast(err: PlanError) {
  const upgradeHref = buildUpgradeHref(err);
  const description = buildDescription(err);

  toast.custom(
    (t) => (
      <div className="flex w-full max-w-md items-start gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow-lg dark:border-amber-900 dark:bg-zinc-950">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
          <Lock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {titleFor(err.code)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
          <div className="mt-2 flex items-center gap-3">
            <Link
              href={upgradeHref}
              onClick={() => toast.dismiss(t)}
              className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Fazer upgrade <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    ),
    { duration: 8000 },
  );
}

function titleFor(code: PlanError['code']): string {
  switch (code) {
    case 'PLAN_LIMIT_REACHED':
      return 'Limite do plano atingido';
    case 'PLAN_LIMIT_MONTHLY_REACHED':
      return 'Limite mensal do plano atingido';
    case 'PLAN_LLM_BUDGET_REACHED':
      return 'Orçamento de IA esgotado este mês';
  }
}

function buildDescription(err: PlanError): string {
  if (err.code === 'PLAN_LLM_BUDGET_REACHED') {
    const budget = err.budgetCents ? `R$ ${(err.budgetCents / 100).toFixed(2)}` : '—';
    const spent = err.spentCents ? `R$ ${(err.spentCents / 100).toFixed(2)}` : '—';
    return `Plano ${err.planName ?? '—'} · orçamento ${budget} · gasto ${spent}`;
  }
  const kind = labelForKind(err.kind);
  if (typeof err.limit === 'number' && typeof err.used === 'number') {
    return `Plano ${err.planName ?? '—'} · ${err.used}/${err.limit} ${kind}${err.limit === 1 ? '' : 's'} usados`;
  }
  return `Plano ${err.planName ?? '—'} · faça upgrade pra desbloquear`;
}

function labelForKind(kind?: string): string {
  switch (kind) {
    case 'member':
      return 'membro';
    case 'channel':
      return 'canal';
    case 'agent':
      return 'agente IA';
    case 'tool':
      return 'ferramenta';
    case 'conversation':
      return 'conversa no mês';
    case 'llm_credit':
      return 'crédito de IA';
    default:
      return kind ?? 'recurso';
  }
}

function buildUpgradeHref(err: PlanError): string {
  const params = new URLSearchParams();
  params.set('from', err.code);
  if (err.kind) params.set('kind', err.kind);
  return `/plans?${params.toString()}`;
}

/**
 * Helper genérico · checa se é PlanError e mostra toast premium · senão
 * mostra toast de erro padrão. Use no catch de mutations · evita repetir
 * detecção em cada lugar.
 */
export function handleApiError(err: unknown, fallback = 'Erro inesperado') {
  if (isPlanError(err)) {
    showPlanErrorToast(err);
    return;
  }
  const message = err instanceof Error ? err.message : fallback;
  toast.error(message);
}
