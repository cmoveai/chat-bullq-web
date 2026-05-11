'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plug, Plus, MessageCircle, ExternalLink } from 'lucide-react';
import {
  channelsService,
  type Channel,
} from '@/features/channels/services/channels.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { ZappfyIcon, MetaIcon, InstagramIcon } from '@/components/ui/icons';
import type { WizardState } from './types';

interface StepConnectionsProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const TYPE_LABEL: Record<Channel['type'], string> = {
  WHATSAPP_OFFICIAL: 'WhatsApp Oficial',
  WHATSAPP_ZAPPFY: 'WhatsApp (Zappfy)',
  INSTAGRAM: 'Instagram',
};

const TYPE_ICON: Record<Channel['type'], React.ElementType> = {
  WHATSAPP_OFFICIAL: MetaIcon,
  WHATSAPP_ZAPPFY: ZappfyIcon,
  INSTAGRAM: InstagramIcon,
};

export function StepConnections({ state, update }: StepConnectionsProps) {
  const orgId = useOrgId();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
  });

  const toggle = (id: string) => {
    const has = state.channelIds.includes(id);
    update({
      channelIds: has
        ? state.channelIds.filter((x) => x !== id)
        : [...state.channelIds, id],
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <Plug className="h-4 w-4 text-violet-600" />
            Conexões
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Conecte seu agente aos canais de atendimento
          </p>
        </div>
        <Link
          href="/settings/channels"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Canal
        </Link>
      </header>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
          Carregando canais...
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhum canal conectado
            </p>
            <p className="mt-1 max-w-md text-xs text-zinc-500">
              Para vincular este agente a um canal de atendimento, conecte
              primeiro um WhatsApp / Instagram em Configurações.
            </p>
          </div>
          <Link
            href="/settings/channels"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4" />
            Conectar canal
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((c) => {
            const active = state.channelIds.includes(c.id);
            const Icon = TYPE_ICON[c.type];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  active
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {TYPE_LABEL[c.type]}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  readOnly
                  className="h-4 w-4 rounded border-zinc-300 text-violet-600"
                />
              </button>
            );
          })}
          <p className="pt-2 text-xs text-zinc-500">
            {state.channelIds.length} de {channels.length} canal
            {channels.length === 1 ? '' : 'is'} selecionado
            {state.channelIds.length === 1 ? '' : 's'}.{' '}
            <Link
              href="/settings/channels"
              target="_blank"
              className="inline-flex items-center gap-1 text-violet-600 hover:underline dark:text-violet-400"
            >
              Gerenciar canais
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
