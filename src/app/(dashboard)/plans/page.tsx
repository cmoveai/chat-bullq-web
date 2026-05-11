'use client';

import { CreditCard, Check, Send, MessageCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

type Tier = {
  id: string;
  name: string;
  priceBrl: number | null;
  description: string;
  monthlyCredits: number | null;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
};

const TIERS: Tier[] = [
  {
    id: 'basic',
    name: 'Básico',
    priceBrl: 247,
    description: 'Perfeito para começar sua jornada de automação',
    monthlyCredits: 4000,
    features: [
      '1 agente',
      '1 base de conhecimento',
      '1 integração de agente',
      '1 automação',
      'Conexões API Não Oficial do WhatsApp ilimitadas (R$ 47,00/mês cada)',
      '1 conexão Uazapi',
      '1 conexão WhatsApp Cloud',
      '1 conexão Webchat',
      '1 conexão Instagram',
      '1 membro do time',
      'Acesso total ao dashboard',
      'Acesso total ao CRM',
      'Leads ilimitados',
    ],
  },
  {
    id: 'standard',
    name: 'Padrão',
    priceBrl: 397,
    description: 'Plano mais popular para equipes em crescimento',
    monthlyCredits: 12000,
    popular: true,
    features: [
      '2 agentes',
      '2 bases de conhecimento',
      '2 integrações de agente',
      '2 automações',
      'Conexões API Não Oficial do WhatsApp ilimitadas (R$ 47,00/mês cada)',
      '2 conexões Uazapi',
      '2 conexões WhatsApp Cloud',
      '2 conexões Webchat',
      '2 conexões Instagram',
      '2 membros do time',
      'Acesso total ao dashboard',
      'Acesso total ao CRM',
      'Leads ilimitados',
    ],
  },
  {
    id: 'corporate',
    name: 'Corporativo',
    priceBrl: 997,
    description: 'Solução completa com IA e automações avançadas',
    monthlyCredits: 30000,
    features: [
      '3 agentes',
      '3 bases de conhecimento',
      'Integrações de agente ilimitadas',
      '3 automações',
      'Conexões API Não Oficial do WhatsApp ilimitadas (R$ 47,00/mês cada)',
      '3 conexões Uazapi',
      '3 conexões WhatsApp Cloud',
      '3 conexões Webchat',
      '3 conexões Instagram',
      'Membros do time ilimitados',
      'Acesso total ao dashboard',
      'Acesso total ao CRM',
      'Leads ilimitados',
      'Pipelines de automação no CRM',
      'Qualificação de leads por IA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceBrl: null,
    description: 'Solução sob medida para empresas que precisam de escala, segurança e suporte dedicado.',
    monthlyCredits: null,
    enterprise: true,
    features: [
      'Recursos sob medida',
      'Volume personalizado de créditos',
      'Gerente de conta dedicado',
      'Onboarding personalizado',
      'SLA e suporte prioritário',
    ],
  },
];

export default function PlansPage() {
  const handleSubscribe = (tier: Tier) => {
    if (tier.enterprise) {
      toast('Vamos conversar', {
        description: 'Em breve um consultor entra em contato.',
      });
      return;
    }
    toast('Checkout em construção', {
      description:
        'A integração Kirvano de assinatura entra na próxima iteração',
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-12 text-center text-white shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
          <CreditCard className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Escolha Seu Plano</h1>
        <p className="mt-1 text-sm text-white/80">
          Selecione o plano perfeito para suas necessidades de automação
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} onSubscribe={() => handleSubscribe(t)} />
        ))}
      </div>
    </div>
  );
}

function TierCard({ tier, onSubscribe }: { tier: Tier; onSubscribe: () => void }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition dark:bg-zinc-900 ${
        tier.popular
          ? 'border-violet-600 ring-2 ring-violet-200 dark:ring-violet-900/40'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <Star className="h-3 w-3" />
          Mais Popular
        </span>
      )}
      {tier.enterprise && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow dark:bg-zinc-100 dark:text-zinc-900">
          Enterprise
        </span>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {tier.name}
        </h3>
        {tier.priceBrl !== null ? (
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-sm font-medium text-zinc-500">R$</span>
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {tier.priceBrl}
            </span>
            <span className="text-sm text-zinc-500">/mensal</span>
          </div>
        ) : (
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Sob Medida
          </div>
        )}
        <p className="mt-2 text-xs text-zinc-500">{tier.description}</p>
      </div>

      {tier.monthlyCredits !== null && (
        <div className="mt-5 rounded-lg bg-violet-50 px-3 py-2 text-center text-sm font-semibold text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
          {tier.monthlyCredits.toLocaleString('pt-BR')} créditos por mês
        </div>
      )}

      <ul className="mt-5 space-y-2">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onSubscribe}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            tier.enterprise
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:from-violet-700 hover:to-purple-800'
          }`}
        >
          {tier.enterprise ? (
            <>
              <MessageCircle className="h-4 w-4" />
              Falar com um Consultor
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Assinar Agora
            </>
          )}
        </button>
      </div>
    </div>
  );
}
