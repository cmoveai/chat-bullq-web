'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  Bot,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  LifeBuoy,
  LogOut,
  ChevronDown,
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

const SUPPORT_WA = 'https://wa.me/5511943464000?text=Oi%2C%20preciso%20de%20ajuda%20para%20conectar%20meu%20primeiro%20canal%20na%20EIXXO';

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
  // Gate liberado só pela área de canais (onde se conecta) — todo o resto é bloqueado.
  const onChannelsArea = pathname?.startsWith('/settings/channels') ?? false;
  const show = !onChannelsArea && !isLoading && channels !== undefined && !hasRealChannel;

  if (!show) return null;

  // "Continuar" do modal educativo → abre o fluxo de conexão existente (área de canais).
  const goToFlow = () => {
    setModal(null);
    setIgChoice(false);
    router.push('/settings/channels');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* App ao fundo bloqueado: escurecido + desfocado, SEM fechar ao clicar fora */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
        <div className="px-6 pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Ativação da conta
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conecte seu primeiro canal para começar
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Para usar a EIXXO, conecte WhatsApp ou Instagram e comece a centralizar conversas,
            automatizar respostas e qualificar leads com IA.
          </p>

          {/* etapas */}
          <div className="mt-5 flex items-center gap-2 pb-5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${
                    i === 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="hidden text-[11px] font-medium sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ações de conexão (única forma de avançar) */}
        <div className="space-y-2 px-6 pb-2">
          {!igChoice ? (
            <>
              <button
                onClick={() => setModal('whatsapp')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <MetaIcon className="h-4 w-4" />
                Conectar WhatsApp
              </button>
              <button
                onClick={() => setIgChoice(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <InstagramIcon className="h-4 w-4" />
                Conectar Instagram
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setModal('instagram')}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-primary/40 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <InstagramIcon className="h-4 w-4" />
                Conectar com Instagram
              </button>
              <button
                onClick={() => setModal('meta-business')}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-primary/40 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <MetaIcon className="h-4 w-4" />
                Conectar via Meta Business Suite
              </button>
              <button
                onClick={() => setIgChoice(false)}
                className="inline-flex items-center gap-1.5 px-1 pt-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </>
          )}
        </div>

        {/* ações secundárias — NÃO liberam o app */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
          <button
            onClick={() => setHelp(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Preciso de ajuda
          </button>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* modal educativo (stacked sobre o gate) */}
      <ChannelConnectModal variant={modal} onClose={() => setModal(null)} onContinue={goToFlow} />

      {/* suporte */}
      {help && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setHelp(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-50">Precisa de ajuda?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Fale com o suporte para configurar seu primeiro canal.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setHelp(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Fechar
              </button>
              <a
                href={SUPPORT_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com suporte
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
