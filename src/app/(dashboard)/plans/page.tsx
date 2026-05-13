'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { PLANS, type Plan } from '@/features/landing/lib/plans-data';

type Cycle = 'monthly' | 'quarterly';

const PLAN_HIGHLIGHT_FEATURES: Record<string, string> = {
  starter: '2.500 mensagens IA / mês',
  growth: '7.500 mensagens IA / mês',
  pro: '20.000 mensagens IA / mês',
};

export default function PlansPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle>('monthly');

  const handleSelect = (plan: Plan) => {
    const params = new URLSearchParams({ plan: plan.id, cycle });
    router.push(`/plans/manage?${params.toString()}`);
  };

  return (
    <div className="min-h-full bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        {/* HEADER · editorial */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Planos
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Escolha o ritmo do seu crescimento
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Plataforma omnichannel com agentes IA · WhatsApp, Instagram, e-mail
            e webchat. CRM nativo · campanhas multi-canal · métricas em tempo
            real.
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
            <button
              onClick={() => setCycle('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                cycle === 'monthly'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCycle('quarterly')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                cycle === 'quarterly'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trimestral
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  cycle === 'quarterly'
                    ? 'bg-emerald-500/15 text-emerald-700'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                −33%
              </span>
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-zinc-800 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = cycle === 'monthly' ? plan.monthly : plan.quarterly;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 transition ${
                  plan.highlight
                    ? 'bg-zinc-900 ring-1 ring-emerald-500/40 ring-inset'
                    : 'bg-zinc-950 hover:bg-zinc-900/40'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                    Mais escolhido
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {plan.tagline}
                </p>

                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-sm font-medium text-zinc-500">R$</span>
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {price}
                  </span>
                  <span className="ml-1 text-sm text-zinc-500">
                    /{cycle === 'monthly' ? 'mês' : 'trimestre'}
                  </span>
                </div>
                {cycle === 'quarterly' && (
                  <p className="mt-2 text-xs text-emerald-400">
                    Economia de {plan.quarterlyOff}% vs mensal
                  </p>
                )}

                <button
                  onClick={() => handleSelect(plan)}
                  className={`mt-7 inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                      : 'border border-zinc-700 bg-transparent text-white hover:border-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  Assinar agora
                </button>

                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  O que está incluso
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span className="font-medium text-white">
                      {PLAN_HIGHLIGHT_FEATURES[plan.id]}
                    </span>
                  </li>
                  {plan.features
                    .filter((f) => !PLAN_HIGHLIGHT_FEATURES[plan.id].includes(f.split(' ')[0]))
                    .map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500" />
                        <span className="text-zinc-400">{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-sm text-zinc-500">
            Trial de 30 dias · garantia de satisfação · cartão de crédito ou Pix
            · cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
