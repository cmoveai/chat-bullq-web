'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Radio,
  Inbox,
  History,
  Tags,
  Bot,
  UserCheck,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { channelsService, type Channel } from '../services/channels.service';
import { ChannelCard } from './channel-card';
import { CreateChannelDialog } from './create-channel-dialog';
import { ConnectionsGrid } from './connections-grid';
import { useOrgId } from '@/hooks/use-org-query-key';
import { ActivationConnect } from '@/features/onboarding/components/activation-connect';
import { isRealConnectedChannel } from '@/features/onboarding/components/first-run-channels';

const FEATURES = [
  { icon: Inbox, title: 'Inbox unificado', desc: 'WhatsApp e Instagram no mesmo painel.' },
  { icon: History, title: 'Histórico completo', desc: 'Toda a jornada do cliente em um lugar.' },
  { icon: Tags, title: 'Tags, status e responsáveis', desc: 'Organize e distribua o atendimento.' },
  { icon: MessagesSquare, title: 'Respostas automáticas', desc: 'Automação supervisionada, sem perder o controle.' },
  { icon: Bot, title: 'Qualificação com IA', desc: 'A IA qualifica seus leads enquanto você dorme.' },
  { icon: UserCheck, title: 'Follow-up e handoff', desc: 'Retoma leads parados e passa pro humano na hora certa.' },
];

function isDemoChannel(ch: Channel) {
  return ch.config?.demo === true || ch.connectionStatus === 'demo';
}

export function ChannelsList() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const orgId = useOrgId();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['channels'] });

  const realChannels = (channels ?? []).filter((c) => !isDemoChannel(c));
  const demoChannels = (channels ?? []).filter(isDemoChannel);

  // Activation Mode: sem canal real conectado, a área de canais mostra só a
  // experiência guiada de 1º canal — nada de tela técnica (Novo Canal, recursos,
  // canais demo, grid completo).
  const hasRealChannel = (channels ?? []).some(isRealConnectedChannel);
  if (!isLoading && channels !== undefined && !hasRealChannel) {
    return <ActivationConnect variant="page" />;
  }

  return (
    <div className="space-y-8">
      {/* Header do módulo */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              EIXXO Atendimento com IA
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Atendimento com IA
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Inbox unificado, automação de mensagens e qualificação de leads — tudo num
              painel só, com a IA trabalhando por você.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Canal
          </button>
        </div>
      </div>

      {/* Recursos EIXXO Atendimento */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recursos EIXXO Atendimento
          </h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Tudo incluso no módulo
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Canais conectados */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Canais conectados
          </h2>
          {realChannels.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {realChannels.length} {realChannels.length === 1 ? 'canal' : 'canais'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : realChannels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {realChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onUpdate={refresh} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-14 dark:border-zinc-800">
            <Radio className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Nenhum canal conectado
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Conecte seu primeiro canal para começar a receber mensagens
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Conectar Canal
            </button>
          </div>
        )}

        {/* Canais demo — separados dos reais */}
        {demoChannels.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Canais demo
              </h3>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-300">
                Sandbox · sem envio real
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {demoChannels.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} onUpdate={refresh} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Minhas conexões — cards com modal educativo antes de qualquer fluxo externo */}
      <ConnectionsGrid onConnect={() => setShowCreate(true)} />

      <CreateChannelDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </div>
  );
}
