'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  MoreVertical,
  HelpCircle,
  Facebook as FacebookIcon,
  Music2 as TikTokIcon,
} from 'lucide-react';
import { channelsService, type Channel, type ChannelType } from '../services/channels.service';
import { MetaIcon, InstagramIcon } from '@/components/ui/icons';
import { useOrgId } from '@/hooks/use-org-query-key';
import { ChannelConnectModal, type ConnectVariant } from './channel-connect-modal';

type StatusKind = 'connected' | 'demo' | 'needs_review' | 'disconnected' | 'soon';

const STATUS_META: Record<StatusKind, { label: string; cls: string }> = {
  connected: { label: 'Conectado', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300' },
  demo: { label: 'Demo', cls: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-300' },
  needs_review: { label: 'Precisa revisão', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300' },
  disconnected: { label: 'Desconectado', cls: 'bg-zinc-100 text-zinc-500 ring-zinc-400/20 dark:bg-zinc-800 dark:text-zinc-400' },
  soon: { label: 'Em breve', cls: 'bg-zinc-100 text-zinc-400 ring-zinc-300/30 dark:bg-zinc-800 dark:text-zinc-500' },
};

function statusFor(channels: Channel[], types: ChannelType[]): StatusKind {
  const mine = channels.filter((c) => types.includes(c.type));
  const isDemo = (c: Channel) => c.config?.demo === true || c.connectionStatus === 'demo';
  if (mine.some((c) => !isDemo(c) && c.isActive && (c.connectionStatus ? c.connectionStatus === 'connected' : true)))
    return 'connected';
  if (mine.some((c) => !isDemo(c) && c.connectionStatus === 'needs_review')) return 'needs_review';
  if (mine.some(isDemo)) return 'demo';
  return 'disconnected';
}

interface Props {
  /** abre o fluxo de novo canal existente (CreateChannelDialog) — não conecta nada sozinho */
  onConnect: () => void;
}

export function ConnectionsGrid({ onConnect }: Props) {
  const orgId = useOrgId();
  const [modal, setModal] = useState<ConnectVariant | null>(null);
  const [igOpen, setIgOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  const { data: channels } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
    enabled: !!orgId,
  });
  const list = channels ?? [];

  const cards = [
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      icon: MetaIcon,
      desc: 'API Oficial da Meta para atendimento e automação.',
      status: statusFor(list, ['WHATSAPP_OFFICIAL', 'WHATSAPP_ZAPPFY', 'WHATSAPP_ZAPI']),
      modal: 'whatsapp' as ConnectVariant,
    },
    {
      key: 'instagram',
      name: 'Instagram',
      icon: InstagramIcon,
      desc: 'Directs, comentários e menções em um só inbox.',
      status: statusFor(list, ['INSTAGRAM']),
      modal: 'instagram' as ConnectVariant,
      dropdown: true,
    },
    {
      key: 'facebook',
      name: 'Facebook',
      icon: FacebookIcon,
      desc: 'Comentários, mensagens e interações da sua página.',
      status: 'disconnected' as StatusKind,
      modal: 'facebook' as ConnectVariant,
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      icon: TikTokIcon,
      desc: 'Comentários, mensagens e interações do TikTok.',
      status: 'soon' as StatusKind,
      modal: 'tiktok' as ConnectVariant,
      soon: true,
    },
  ];

  const continueToFlow = () => {
    setModal(null);
    onConnect();
  };

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Minhas conexões</h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Escolha um canal para conectar</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const st = STATUS_META[c.status];
          return (
            <div
              key={c.key}
              className="relative flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/60 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800">
                <c.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{c.desc}</p>

                <div className="mt-3">
                  {c.soon ? (
                    <button
                      onClick={() => setModal('tiktok')}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                    >
                      Em breve
                    </button>
                  ) : c.dropdown ? (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setIgOpen((v) => !v)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Conectar
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {igOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIgOpen(false)} />
                          <div className="absolute left-0 top-full z-20 mt-1 w-60 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                              onClick={() => { setIgOpen(false); setModal('instagram'); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            >
                              <InstagramIcon className="h-4 w-4" />
                              Conectar com Instagram
                            </button>
                            <button
                              onClick={() => { setIgOpen(false); setModal('meta-business'); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            >
                              <MetaIcon className="h-4 w-4" />
                              Conectar via Meta Business Suite
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setModal(c.modal)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>

              {/* menu secundário */}
              <div className="relative">
                <button
                  onClick={() => setMenu(menu === c.key ? null : c.key)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menu === c.key && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        onClick={() => { setMenu(null); setModal(c.modal); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Como funciona
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ChannelConnectModal variant={modal} onClose={() => setModal(null)} onContinue={continueToFlow} />
    </section>
  );
}
