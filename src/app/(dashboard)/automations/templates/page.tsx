'use client';

import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Instagram,
  ShoppingCart,
  CreditCard,
  Phone,
  Mail,
  Slack,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Info,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

type Template = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  features: string[];
  creditsPerRun?: number;
  status: 'available' | 'coming_soon';
  templateSlug?: string;
};

const templates: Template[] = [
  {
    id: 'instagram-dm-comment',
    title: 'Automação de DM do Instagram',
    description:
      'Envie automaticamente mensagens diretas para usuários que comentam com uma palavra-chave específica em suas publicações do Instagram',
    icon: Instagram,
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    features: [
      'Gatilho baseado em palavra-chave',
      'Respostas automáticas a comentários',
      'Envio de mensagens diretas',
      'Processamento de webhook em tempo real',
    ],
    creditsPerRun: 1.0,
    status: 'available',
    templateSlug: 'instagram-dm-comment',
  },
  {
    id: 'kiwify-purchase',
    title: 'Automação de Compras Kiwify',
    description:
      'Envie automaticamente notificações por email e WhatsApp quando uma compra é realizada na sua loja Kiwify',
    icon: ShoppingCart,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    features: [
      'Processamento de webhook de compras',
      'Notificações por email',
      'Notificações por WhatsApp',
      'Modelos de mensagem personalizáveis',
    ],
    creditsPerRun: 5.0,
    status: 'coming_soon',
  },
  {
    id: 'kirvano-purchase',
    title: 'Automação de Compras Kirvano',
    description:
      'Receba notificações automáticas de cada venda Kirvano, dispare onboarding via WhatsApp e atualize o CRM em tempo real',
    icon: CreditCard,
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-rose-600',
    features: [
      'Webhook de vendas em tempo real',
      'Onboarding pós-compra no WhatsApp',
      'Atualização automática do contato no CRM',
      'Suporte a split de comissões',
    ],
    creditsPerRun: 5.0,
    status: 'coming_soon',
  },
  {
    id: 'whatsapp',
    title: 'Automação de WhatsApp',
    description: 'Automatize mensagens do WhatsApp com base em gatilhos e condições',
    icon: Phone,
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    features: [
      'Mensagens agendadas',
      'Respostas automáticas',
      'Gerenciamento de grupos',
      'Compartilhamento de mídia',
    ],
    status: 'coming_soon',
  },
  {
    id: 'email',
    title: 'Automação de E-mail',
    description: 'Crie campanhas e sequências de e-mail automatizadas',
    icon: Mail,
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    features: [
      'Campanhas de gotejamento',
      'Personalização',
      'Testes A/B',
      'Análises',
    ],
    status: 'coming_soon',
  },
  {
    id: 'slack',
    title: 'Automação de Slack',
    description: 'Automatize notificações do Slack e comunicações da equipe',
    icon: Slack,
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    features: [
      'Notificações de canal',
      'Mensagens diretas',
      'Respostas de comandos',
      'Integrações',
    ],
    status: 'coming_soon',
  },
  {
    id: 'messenger',
    title: 'Automação de Messenger',
    description: 'Automatize conversas e respostas do Facebook Messenger',
    icon: MessageCircle,
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    features: [
      'Fluxos de chatbot',
      'Respostas rápidas',
      'Mensagens de mídia',
      'Segmentação de usuários',
    ],
    status: 'coming_soon',
  },
  {
    id: 'scheduling',
    title: 'Automação de Agendamento',
    description: 'Agende tarefas e ações com base em gatilhos de tempo',
    icon: Calendar,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    features: [
      'Tarefas recorrentes',
      'Agendamentos únicos',
      'Suporte a fuso horário',
      'Integração de calendário',
    ],
    status: 'coming_soon',
  },
];

export default function AutomationTemplatesPage() {
  const router = useRouter();

  const handleUse = (template: Template) => {
    if (template.status !== 'available') return;
    const query = template.templateSlug
      ? `?template=${template.templateSlug}`
      : '';
    router.push(`/automations/new${query}`);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={LayoutGrid}
        title="Modelos de Automação"
        description="Escolha um modelo para começar a automatizar seu fluxo de trabalho"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            onUse={() => handleUse(tpl)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          Mais templates de automação serão adicionados em breve. Fique atento
          para atualizações!
        </span>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
}: {
  template: Template;
  onUse: () => void;
}) {
  const Icon = template.icon;
  const isAvailable = template.status === 'available';

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm transition dark:bg-zinc-900 ${
        isAvailable
          ? 'border-zinc-200 dark:border-zinc-800'
          : 'border-zinc-200 opacity-60 dark:border-zinc-800'
      }`}
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-white ${template.iconBg}`}
      >
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {template.title}
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {template.description}
      </p>

      <div className="mt-4">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Recursos:
        </p>
        <ul className="mt-2 space-y-1.5">
          {template.features.map((feat) => (
            <li
              key={feat}
              className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
            >
              {isAvailable ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              )}
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-5">
        {template.creditsPerRun !== undefined && (
          <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
            <Coins className="h-3.5 w-3.5" />
            <span>
              Créditos por Execução:{' '}
              <strong>{template.creditsPerRun.toFixed(2)}</strong>
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onUse}
          disabled={!isAvailable}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
            isAvailable
              ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:from-violet-700 hover:to-purple-800'
              : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
          }`}
        >
          {isAvailable ? (
            <>
              <Plus className="h-4 w-4" />
              Usar Modelo
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Em Breve
            </>
          )}
        </button>
      </div>
    </div>
  );
}
