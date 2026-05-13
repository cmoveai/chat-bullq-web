'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Bot, Workflow, ShieldCheck, ArrowRight } from 'lucide-react';
import { PLANS, type Plan } from '../lib/plans-data';
import { TrialModal } from './trial-modal';

type Cycle = 'monthly' | 'quarterly';

export function LandingPage() {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            CMOVE<span className="text-cyan-400">.AI</span>{' '}
            <span className="text-emerald-400">ZAP</span>
          </div>
          <nav className="hidden gap-8 text-sm text-zinc-400 md:flex">
            <a href="#funcionalidades" className="hover:text-white">Funcionalidades</a>
            <a href="#planos" className="hover:text-white">Planos</a>
            <a href="#empresas" className="hover:text-white">Empresas</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-zinc-400 hover:text-white sm:inline"
            >
              Entrar
            </Link>
            <button
              onClick={() => setModalPlan(PLANS[1])}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Testar 30 dias
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[700px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
            <Sparkles className="h-3 w-3" /> Plataforma omnichannel de relacionamento
          </span>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
            Automatização e agentes IA para WhatsApp, Instagram, e-mail e webchat.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            Não é só chatbot. É plataforma de relacionamento omnichannel com CRM nativo,
            agentes IA personalizados, campanhas multi-canal e métricas em tempo real.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setModalPlan(PLANS[1])}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Testar 30 dias
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="#planos"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white hover:bg-white/10"
            >
              Ver planos
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Garantia de 30 dias
            </span>
            <span className="inline-flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" /> Agente IA personalizado
            </span>
            <span className="inline-flex items-center gap-2">
              <Workflow className="h-4 w-4 text-emerald-400" /> Workflow visual BPMN
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="border-y border-white/5 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Tudo que sua operação precisa em um lugar só
            </h2>
            <p className="mt-3 text-zinc-400">
              WhatsApp, Instagram, e-mail, webchat, CRM, agentes IA e campanhas. Sem
              cinco SaaS pra integrar.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-emerald-400/30 hover:bg-white/[0.04]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <f.Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Escolha o plano ideal para seu negócio
            </h2>
            <p className="mt-3 text-zinc-400">
              Potencialize seu atendimento com automatização e agentes IA.
            </p>

            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setCycle('monthly')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  cycle === 'monthly'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setCycle('quarterly')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  cycle === 'quarterly'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
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
                      ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-[0_0_40px_-12px_rgba(16,185,129,0.4)]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-950">
                      Mais escolhido
                    </span>
                  )}

                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>

                  <div className="my-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tight">
                        R$ {price}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {cycle === 'monthly' ? '/mês' : '/trimestre'}
                      </span>
                    </div>
                    {cycle === 'quarterly' && (
                      <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                        Economize {plan.quarterlyOff}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setModalPlan(plan)}
                    className={`mb-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold ${
                      plan.highlight
                        ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-zinc-500">
            Todos os planos com{' '}
            <span className="text-emerald-400">trial de 30 dias</span> · garantia de
            satisfação · cartão ou Pix
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/5 bg-gradient-to-b from-zinc-950 to-zinc-900 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            Comece em minutos. Cancele quando quiser.
          </h2>
          <p className="mt-4 text-zinc-400">
            Trial de 30 dias com garantia de devolução. Sem fidelidade.
          </p>
          <button
            onClick={() => setModalPlan(PLANS[1])}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-zinc-950 hover:bg-emerald-400"
          >
            Testar 30 dias grátis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-6">
          CMOVE.AI · CNPJ 66.432.401/0001-29 · contato@crismagalhaesia.com
        </div>
      </footer>

      {/* MODAL TRIAL */}
      {modalPlan && (
        <TrialModal plan={modalPlan} cycle={cycle} onClose={() => setModalPlan(null)} />
      )}
    </div>
  );
}

const FEATURES = [
  {
    Icon: Bot,
    title: 'Agentes IA personalizados',
    desc: 'Crie agentes com persona própria · wizard guiado pro Starter · editor avançado pro Growth · BPMN visual pro Pro.',
  },
  {
    Icon: Workflow,
    title: 'Automatização sem código',
    desc: 'Fluxos visuais com intent classifier, RAG e gatilhos condicionais. Sem precisar de dev.',
  },
  {
    Icon: Sparkles,
    title: 'Omnichannel real',
    desc: 'WhatsApp + Instagram + e-mail + webchat numa caixa unificada · cliente acha o canal, você responde uma vez.',
  },
  {
    Icon: ShieldCheck,
    title: 'CRM nativo',
    desc: 'Pipeline visual · campos customizáveis · automações de status · funil de conversão. Sem RD Station por fora.',
  },
  {
    Icon: Sparkles,
    title: 'Campanhas multi-canal',
    desc: 'Dispare campanhas segmentadas por WhatsApp e e-mail · agendamento · transcrição de áudio · métricas em tempo real.',
  },
  {
    Icon: Bot,
    title: 'Métricas que importam',
    desc: 'Dashboard com funil, ROI por campanha, NPS, LTV por canal, cohort de retenção. Decisão baseada em número.',
  },
];
