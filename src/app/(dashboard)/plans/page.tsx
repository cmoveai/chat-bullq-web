'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { PLANS, type Plan } from '@/features/landing/lib/plans-data';

type Cycle = 'monthly' | 'quarterly';

export default function PlansPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle>('monthly');

  const handleSelect = (plan: Plan) => {
    const params = new URLSearchParams({ plan: plan.id, cycle });
    router.push(`/plans/manage?${params.toString()}`);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={CreditCard}
        title="Escolha o plano ideal para seu negócio"
        description="Potencialize seu atendimento com automatização e agentes IA."
      />

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={() => setCycle('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              cycle === 'monthly'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setCycle('quarterly')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              cycle === 'quarterly'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Trimestral · até 33% OFF
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = cycle === 'monthly' ? plan.monthly : plan.quarterly;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                plan.highlight
                  ? 'border-emerald-400 bg-gradient-to-b from-emerald-50/60 to-transparent shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)] dark:border-emerald-400/60 dark:from-emerald-500/10'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-950">
                  Mais escolhido
                </span>
              )}

              <h3 className="text-2xl font-black text-zinc-950 dark:text-white">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {plan.tagline}
              </p>

              <div className="my-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
                    R$ {price}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {cycle === 'monthly' ? '/mês' : '/trimestre'}
                  </span>
                </div>
                {cycle === 'quarterly' && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    Economize {plan.quarterlyOff}%
                  </span>
                )}
              </div>

              <button
                onClick={() => handleSelect(plan)}
                className={`mb-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold ${
                  plan.highlight
                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
                }`}
              >
                Assinar agora
              </button>

              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-zinc-500">
        Todos os planos com{' '}
        <span className="font-semibold text-emerald-500">trial de 30 dias</span> · garantia
        de satisfação · cartão ou Pix
      </p>
    </div>
  );
}
