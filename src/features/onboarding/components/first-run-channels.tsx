'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  Bot,
  MessageCircle,
  ArrowLeft,
  LifeBuoy,
  LogOut,
  Check,
} from 'lucide-react';
import { channelsService, type Channel } from '@/features/channels/services/channels.service';
import { MetaIcon, InstagramIcon } from '@/components/ui/icons';
import { useOrgId } from '@/hooks/use-org-query-key';
import { useAuthStore } from '@/stores/auth-store';
import { ChannelConnectModal, type ConnectVariant } from '@/features/channels/components/channel-connect-modal';

/** Canal real = integração de verdade, ativa, e NÃO demo/sandbox. */
function isRealConnectedChannel(c: Channel) {
  const demo = c.config?.demo === true || c.connectionStatus === 'demo';
  if (demo) return false;
  if (!c.isActive) return false;
  return c.connectionStatus ? c.connectionStatus === 'connected' : true;
}

const STEPS = [
  { icon: Plug, label: 'Conectar canal' },
  { icon: Bot, label: 'Criar automação' },
  { icon: MessageCircle, label: 'Testar atendimento' },
];

const SUPPORT_WA =
  'https://wa.me/5511943464000?text=Oi%2C%20preciso%20de%20ajuda%20para%20conectar%20meu%20primeiro%20canal%20na%20EIXXO';

export function FirstRunChannelOnboarding() {
  const orgId = useOrgId();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  const [modal, setModal] = useState<ConnectVariant | null>(null);
  const [igChoice, setIgChoice] = useState(false);
  const [help, setHelp] = useState(false);

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
    enabled: !!orgId,
  });

  const hasRealChannel = (channels ?? []).some(isRealConnectedChannel);
  const onChannelsArea = pathname?.startsWith('/settings/channels') ?? false;
  const show = !onChannelsArea && !isLoading && channels !== undefined && !hasRealChannel;

  if (!show) return null;

  const goToFlow = () => {
    setModal(null);
    setIgChoice(false);
    router.push('/settings/channels');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* app ao fundo bloqueado — leve, sem peso: escurecido suave + desfoque */}
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-lg" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.35)] ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="px-7 pt-8 sm:px-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Primeiro passo
          </span>
          <h2 className="mt-4 text-[1.6rem] font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
            Conecte seu primeiro canal para começar
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Para usar a EIXXO, conecte WhatsApp ou Instagram e comece a centralizar conversas,
            automatizar respostas e qualificar leads com IA.
          </p>

          {/* etapas — 1 ativa, 2 e 3 discretas */}
          <div className="mt-6 flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-medium sm:inline ${
                      i === 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="h-px w-5 bg-zinc-200 dark:bg-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ações principais: 2 cards (ou escolha do Instagram) */}
        <div className="px-7 py-7 sm:px-9">
          {!igChoice ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {/* WhatsApp — recomendado */}
              <div className="relative flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-800/30">
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Recomendado
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/70 bg-white dark:border-zinc-700/70 dark:bg-zinc-900">
                  <MetaIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">WhatsApp</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Conecte a API Oficial da Meta para atender e automatizar conversas.
                </p>
                <button
                  onClick={() => setModal('whatsapp')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Conectar WhatsApp
                </button>
              </div>

              {/* Instagram */}
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-800/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/70 bg-white dark:border-zinc-700/70 dark:bg-zinc-900">
                  <InstagramIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Instagram</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Receba directs, comentários e menções em um só inbox.
                </p>
                <button
                  onClick={() => setIgChoice(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-primary/40 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Conectar Instagram
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-800/30">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Como conectar o Instagram?</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Escolha o caminho de conexão.</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setModal('instagram')}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-primary/40 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <InstagramIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Conectar com Instagram</span>
                </button>
                <button
                  onClick={() => setModal('meta-business')}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-primary/40 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <MetaIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Conectar via Meta Business Suite</span>
                </button>
              </div>
              <button
                onClick={() => setIgChoice(false)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </div>
          )}
        </div>

        {/* secundárias discretas — não liberam o app */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-7 py-3.5 sm:px-9 dark:border-zinc-800">
          <button
            onClick={() => setHelp(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Preciso de ajuda
          </button>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        </div>
      </div>

      {/* modal educativo (stacked sobre o gate) */}
      <ChannelConnectModal variant={modal} onClose={() => setModal(null)} onContinue={goToFlow} />

      {/* suporte */}
      {help && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setHelp(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-50">Precisa de ajuda para conectar?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              O suporte da EIXXO pode orientar você na conexão do primeiro canal.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <a
                href={SUPPORT_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com suporte
              </a>
              <button
                onClick={() => setHelp(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
