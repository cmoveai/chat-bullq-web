export type PlanTier = 'starter' | 'growth' | 'pro';

export type Plan = {
  id: PlanTier;
  name: string;
  tagline: string;
  monthly: number;
  quarterly: number;
  quarterlyOff: number;
  highlight?: boolean;
  features: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pra começar com 1 WhatsApp e 1 agente IA',
    monthly: 167,
    quarterly: 449,
    quarterlyOff: 10,
    features: [
      '1 Agente IA (wizard guiado)',
      '1 WhatsApp Cloud API',
      '2 atendentes humanos',
      '1 fluxo / robô',
      '2.500 mensagens IA / mês',
      '5.000 contatos no CRM',
      'CRM básico (1 pipeline)',
      '1 campanha / mês · WhatsApp',
      'Dashboard básico',
      'Suporte por e-mail · 24h',
    ],
    cta: 'Assinar agora',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Pra agências e operações em crescimento',
    monthly: 347,
    quarterly: 697,
    quarterlyOff: 33,
    highlight: true,
    features: [
      '3 Agentes IA (wizard + editor)',
      '2 WhatsApps + Instagram DM',
      '8 atendentes humanos',
      '5 fluxos / robôs',
      '7.500 mensagens IA / mês',
      '25.000 contatos no CRM',
      'CRM completo (multi pipeline)',
      'E-mail · 5.000 envios / mês',
      '20 campanhas multi-canal / mês',
      'Dashboard completo · funil + ROI + NPS',
      'Transcrição de áudio ilimitada',
      'Suporte · 8h',
    ],
    cta: 'Assinar agora',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pra operações com time e múltiplas marcas',
    monthly: 897,
    quarterly: 1797,
    quarterlyOff: 33,
    features: [
      'Agentes IA ilimitados (BPMN visual)',
      '5 WhatsApps + Instagram + Webchat',
      '25 atendentes humanos',
      'Fluxos / robôs ilimitados',
      '20.000 mensagens IA / mês',
      '100.000 contatos no CRM',
      'CRM avançado · forecast + multi-time',
      'E-mail · 50.000 envios / mês · caixa unificada @seudominio',
      'Campanhas ilimitadas · todos canais',
      'Dashboard avançado · cohort · LTV · API',
      'API webhook',
      'Suporte prioritário · 2h',
    ],
    cta: 'Assinar agora',
  },
];
