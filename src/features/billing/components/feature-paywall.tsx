'use client';

import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { useFeatures, type PlanFeatures } from '../hooks/use-features';

interface FeaturePaywallProps {
  /** Nome da feature flag exigida (ex: 'bpmnBuilder', 'emailSend'). */
  feature: keyof PlanFeatures;
  /** Título mostrado no paywall (ex: "Construtor BPMN"). */
  title: string;
  /** Descrição curta explicando o que a feature faz. */
  description: string;
  /** Plano mínimo necessário (Growth / Pro). */
  requiredPlan: 'Growth' | 'Pro';
  /** O conteúdo a renderizar quando a feature está liberada. */
  children: React.ReactNode;
}

/**
 * Wrapper que mostra paywall quando a feature não está liberada no plano atual.
 * Backend continua sendo fonte de verdade (LimitEnforcer bloqueia ações reais),
 * isso é só uma camada de UX pra deixar claro o motivo do bloqueio.
 */
export function FeaturePaywall({
  feature,
  title,
  description,
  requiredPlan,
  children,
}: FeaturePaywallProps) {
  const { features, planName, isLoading } = useFeatures();

  // Otimista: enquanto carrega features, mostra o conteúdo (default features = tudo true)
  if (isLoading || features[feature]) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full items-center justify-center px-6 py-12">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 text-center shadow-sm dark:border-amber-900 dark:from-amber-950/40 dark:to-zinc-950">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Lock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        <div className="mt-5 space-y-1 text-xs text-zinc-500 dark:text-zinc-500">
          <p>
            Plano atual: <span className="font-medium text-zinc-700 dark:text-zinc-300">{planName ?? '—'}</span>
          </p>
          <p>
            Requer: <span className="font-medium text-amber-700 dark:text-amber-400">{requiredPlan}</span> ou superior
          </p>
        </div>
        <Link
          href="/plans"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Fazer upgrade <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
