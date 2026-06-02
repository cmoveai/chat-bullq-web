'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, MessageCircle, Bot, Users, ArrowRight, CheckCircle2, Circle,
  Zap, BookOpen, BarChart3, Inbox,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useOrgId } from '@/hooks/use-org-query-key';
import { channelsService } from '@/features/channels/services/channels.service';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-zinc-500">{hint}</div>}
    </div>
  );
}

function ChecklistItem({
  done,
  step,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        done
          ? 'border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-900/10'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Passo {step}
            </span>
            {done && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                feito
              </span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h4>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
          {!done && (
            <Link
              href={href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {cta} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h4>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500" />
    </Link>
  );
}

export default function HomePage() {
  const orgId = useOrgId();
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Boas-vindas';

  const { data: channels } = useQuery({
    queryKey: ['home-channels', orgId],
    queryFn: () => channelsService.list(),
  });
  const { data: agents } = useQuery({
    queryKey: ['home-agents', orgId],
    queryFn: () => aiAgentsService.list(),
  });
  const { data: overview } = useQuery({
    queryKey: ['home-overview', orgId],
    queryFn: () => dashboardService.getOverview(),
  });

  const channelsCount = channels?.length ?? 0;
  const agentsCount = agents?.length ?? 0;
  const conversationsActive = overview?.activeConversations ?? 0;
  const conversationsTotal30d = overview?.totalConversations ?? 0;

  // Checklist: passos baseados em estado real da org
  const hasChannel = channelsCount > 0;
  const hasAgent = agentsCount > 0;
  const hasFirstConversation = conversationsTotal30d > 0;
  const stepsDone =
    Number(hasChannel) + Number(hasAgent) + Number(hasFirstConversation);

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl p-6">
        {/* HERO */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-7 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              CMOVE.AI · EIXXO
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            Olá, {firstName}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
            Atendimento omnichannel com IA que delega, cobra Pix sozinha e nunca dorme.
            Tudo num inbox só · WhatsApp · Instagram · DM.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={MessageCircle}
            label="Canais conectados"
            value={channelsCount}
            hint={
              channelsCount === 0
                ? 'Conecte o primeiro canal'
                : `${channelsCount === 1 ? '1 canal ativo' : channelsCount + ' canais ativos'}`
            }
            accent="#0891b2"
          />
          <StatCard
            icon={Bot}
            label="Agentes IA"
            value={agentsCount}
            hint={agentsCount === 0 ? 'Crie seu primeiro agente' : 'Configurados'}
            accent="#8b5cf6"
          />
          <StatCard
            icon={Inbox}
            label="Conversas ativas"
            value={conversationsActive}
            hint="Em andamento agora"
            accent="#3b82f6"
          />
          <StatCard
            icon={BarChart3}
            label="Conversas · 30 dias"
            value={conversationsTotal30d}
            hint="Total no período"
            accent="#16a34a"
          />
        </div>

        {/* CHECKLIST */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Próximos passos · ative sua operação
              </h2>
              <p className="text-xs text-zinc-500">
                {stepsDone} de 3 etapas concluídas
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(stepsDone / 3) * 100}%` }}
                />
              </div>
              <span className="tabular-nums">{Math.round((stepsDone / 3) * 100)}%</span>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <ChecklistItem
              done={hasChannel}
              step={1}
              title="Conectar canal"
              description="WhatsApp Cloud API ou Instagram Business · 3 minutos"
              href="/settings/channels"
              cta="Conectar"
            />
            <ChecklistItem
              done={hasAgent}
              step={2}
              title="Criar agente IA"
              description="Defina persona, modelo e ferramentas do seu primeiro agente"
              href="/ai-agents"
              cta="Criar agente"
            />
            <ChecklistItem
              done={hasFirstConversation}
              step={3}
              title="Receber primeira conversa"
              description="Mande mensagem pro número conectado e veja a IA responder"
              href="/inbox"
              cta="Abrir inbox"
            />
          </div>
        </div>

        {/* AÇÕES RÁPIDAS */}
        <div className="mt-8">
          <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
            Atalhos
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <ActionCard
              icon={Inbox}
              title="Abrir inbox"
              description="Conversas em andamento, fila e atribuições"
              href="/inbox"
              accent="#3b82f6"
            />
            <ActionCard
              icon={BarChart3}
              title="Dashboard analítico"
              description="KPIs detalhados · CSAT · SLA · performance dos agentes"
              href="/dashboard"
              accent="#16a34a"
            />
            <ActionCard
              icon={Zap}
              title="Pipelines"
              description="CRM kanban · cards drag-and-drop vinculados a conversas"
              href="/pipelines"
              accent="#f59e0b"
            />
            <ActionCard
              icon={Users}
              title="Gerenciar equipe"
              description="Membros, papéis, acesso por canal"
              href="/settings/members"
              accent="#8b5cf6"
            />
          </div>
        </div>

        {/* RECURSO */}
        <div className="mt-8 mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
          <BookOpen className="h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
              Precisa de ajuda?
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Fale comigo direto no WhatsApp pra destravar qualquer passo do onboarding.
            </p>
          </div>
          <a
            href="https://wa.me/5511943464000?text=Oi%20Cris%2C%20travei%20no%20onboarding%20da%20EIXXO"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Chamar Cris
          </a>
        </div>
      </div>
    </div>
  );
}
