'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Send } from 'lucide-react';
import { PLANS, type Plan } from '@/features/landing/lib/plans-data';

type Cycle = 'monthly' | 'quarterly';

const CREDITS_BY_PLAN: Record<string, string> = {
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
    <div className="flex h-full flex-col gap-6 p-6">
      {/* HERO GRADIENT */}
      <div className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 px-8 py-12 text-center text-white shadow-lg">
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <CreditCard className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight">Escolha seu plano</h1>
        <p className="mt-2 text-sm text-white/80">
          Plataforma omnichannel · WhatsApp, Instagram, e-mail e webchat com agentes IA
        </p>

        <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
          <button
            onClick={() => setCycle('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              cycle === 'monthly'
                ? 'bg-white text-emerald-700'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setCycle('quarterly')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              cycle === 'quarterly'
                ? 'bg-white text-emerald-700'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Trimestral · até 33% OFF
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = cycle === 'monthly' ? plan.monthly : plan.quarterly;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 p-6 transition ${
                plan.highlight
                  ? 'border-emerald-500 bg-white shadow-[0_0_40px_-12px_rgba(16,185,129,0.4)] dark:bg-zinc-900'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow">
                  ★ Mais escolhido
                </span>
              )}

              <div className="text-center">
                <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-500">R$</span>
                  <span className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
                    {price}
                  </span>
                  <span className="text-sm text-zinc-500">
                    /{cycle === 'monthly' ? 'mês' : 'trim'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {plan.tagline}
                </p>
                {cycle === 'quarterly' && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Economize {plan.quarterlyOff}%
                  </span>
                )}
              </div>

              {/* Pílula de créditos */}
              <div className="my-5 rounded-xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-500/10">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {CREDITS_BY_PLAN[plan.id]}
                </span>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 text-sm">
                {plan.features
                  .filter((f) => !f.toLowerCase().startsWith(CREDITS_BY_PLAN[plan.id].toLowerCase().split(' ')[0]))
                  .map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelect(plan)}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  plan.highlight
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
                }`}
              >
                <Send className="h-4 w-4" />
                Assinar agora
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-zinc-500">
        Trial de 30 dias · garantia de satisfação · cartão ou Pix
      </p>
    </div>
  );
}
