'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  Bot,
  MessageCircle,
  Sparkles,
  Check,
  ArrowRight,
  Facebook as FacebookIcon,
} from 'lucide-react';
import { channelsService, type Channel } from '@/features/channels/services/channels.service';
import { MetaIcon, InstagramIcon } from '@/components/ui/icons';
import { useOrgId } from '@/hooks/use-org-query-key';

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

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12v-3.2a5.7 5.7 0 0 0-.78-.05A5.69 5.69 0 1 0 15.54 15V8.99a7.36 7.36 0 0 0 4.3 1.38V7.27a4.28 4.28 0 0 1-3.24-1.45Z" />
  </svg>
);

export function FirstRunChannelOnboarding() {
  const orgId = useOrgId();
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // começa oculto até checar localStorage

  const storageKey = orgId ? `eixxo_first_channel_dismissed_${orgId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    setDismissed(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
    enabled: !!orgId,
  });

  const hasRealChannel = (channels ?? []).some(isRealConnectedChannel);
  // Não bloquear a própria área de canais — é pra lá que o onboarding manda.
  const onChannelsArea = pathname?.startsWith('/settings/channels') ?? false;
  const show =
    !dismissed && !onChannelsArea && !isLoading && channels !== undefined && !hasRealChannel;

  if (!show) return null;

  const goConnect = () => {
    // abre o fluxo de conexão existente (área de canais) — não conecta nada sozinho
    router.push('/settings/channels');
    setDismissed(true);
  };

  const doLater = () => {
    if (storageKey) localStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  const connections = [
    { name: 'WhatsApp', icon: MetaIcon, enabled: true, action: goConnect, hint: 'API oficial da Meta' },
    { name: 'Instagram', icon: InstagramIcon, enabled: true, action: goConnect, hint: 'DMs e comentários' },
    { name: 'Facebook', icon: FacebookIcon, enabled: false, hint: 'Em breve' },
    { name: 'TikTok', icon: TikTokIcon, enabled: false, hint: 'Em breve' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* fundo do dashboard escurecido + desfocado */}
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md" />

      {/* área de conexões destacada (spotlight) */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 pt-6 dark:border-zinc-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Minhas conexões
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conecte seu primeiro canal
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Centralize conversas, automatize respostas e qualifique leads com IA em um só painel.
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

        {/* cards de conexão */}
        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          {connections.map((c) => (
            <button
              key={c.name}
              onClick={c.enabled ? c.action : undefined}
              disabled={!c.enabled}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                c.enabled
                  ? 'border-zinc-200 bg-white hover:border-primary/40 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
                  : 'cursor-not-allowed border-dashed border-zinc-200 bg-zinc-50/60 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40'
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/60 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</p>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{c.hint}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ações */}
        <div className="flex flex-col gap-2 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <button
            onClick={goConnect}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <MetaIcon className="h-4 w-4" />
            Conectar WhatsApp
          </button>
          <button
            onClick={goConnect}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <InstagramIcon className="h-4 w-4" />
            Conectar Instagram
          </button>
          <button
            onClick={doLater}
            className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Check className="h-3.5 w-3.5" />
            Fazer depois
          </button>
        </div>
      </div>
    </div>
  );
}
