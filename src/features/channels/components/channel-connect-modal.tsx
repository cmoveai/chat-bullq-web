'use client';

import { X, Check, AlertTriangle } from 'lucide-react';
import { MetaIcon, InstagramIcon } from '@/components/ui/icons';
import { Facebook as FacebookIcon, Music2 as TikTokIcon } from 'lucide-react';

export type ConnectVariant =
  | 'whatsapp'
  | 'instagram'
  | 'meta-business'
  | 'facebook'
  | 'tiktok';

type Step = { title: string; desc: string };

type VariantConfig = {
  icon: React.ElementType;
  title: string;
  description: string;
  steps?: Step[];
  alert?: string;
  comingSoon?: { text: string };
};

const CONFIG: Record<ConnectVariant, VariantConfig> = {
  whatsapp: {
    icon: MetaIcon,
    title: 'Conecte seu WhatsApp',
    description:
      'Centralize conversas, automatize respostas e qualifique leads com IA usando a API Oficial da Meta.',
    steps: [
      {
        title: 'Entre com sua conta da Meta',
        desc: 'Use uma conta administradora do portfólio empresarial onde o WhatsApp da empresa está vinculado.',
      },
      {
        title: 'Autorize as permissões necessárias',
        desc: 'A EIXXO solicitará acesso para conectar e gerenciar o número escolhido com segurança.',
      },
      {
        title: 'Selecione o número da empresa',
        desc: 'Escolha o número que será usado no atendimento dentro da EIXXO.',
      },
    ],
    alert:
      'Mesmo usando WhatsApp Business, o número precisa estar pronto na Meta para conexão via API Oficial.',
  },
  instagram: {
    icon: InstagramIcon,
    title: 'Conecte o Instagram',
    description:
      'Receba directs, comentários e interações do Instagram dentro da EIXXO.',
    steps: [
      {
        title: 'Faça login com o Instagram',
        desc: 'Entre na conta do Instagram que deseja conectar.',
      },
      {
        title: 'Autorize o acesso da EIXXO',
        desc: 'Permita que a EIXXO acesse as informações necessárias para centralizar o atendimento.',
      },
      {
        title: 'Finalize a conexão',
        desc: 'Depois da autorização, a conta aparecerá na sua central de atendimento.',
      },
    ],
  },
  'meta-business': {
    icon: MetaIcon,
    title: 'Conecte via Meta Business Suite',
    description:
      'Use o Meta Business Suite para conectar contas do Instagram e páginas vinculadas ao seu negócio.',
    steps: [
      {
        title: 'Faça login com o Facebook',
        desc: 'Use uma conta que administre o portfólio empresarial da empresa.',
      },
      {
        title: 'Autorize as permissões necessárias',
        desc: 'A EIXXO solicitará acesso às páginas e perfis do Instagram vinculados ao negócio.',
      },
      {
        title: 'Selecione as contas',
        desc: 'Escolha a página do Facebook e o Instagram que deseja conectar.',
      },
    ],
  },
  facebook: {
    icon: FacebookIcon,
    title: 'Conecte o Facebook',
    description:
      'Centralize comentários, mensagens e interações da sua página do Facebook na EIXXO.',
    steps: [
      {
        title: 'Tenha uma página criada',
        desc: 'Para conectar o Facebook, é necessário ter uma página vinculada ao seu negócio.',
      },
      {
        title: 'Faça login com o Facebook',
        desc: 'Use uma conta com acesso administrativo à página.',
      },
      {
        title: 'Selecione a página',
        desc: 'Escolha a página do Facebook que deseja conectar à EIXXO.',
      },
    ],
  },
  tiktok: {
    icon: TikTokIcon,
    title: 'TikTok em breve',
    description: 'Comentários, mensagens e interações do TikTok.',
    comingSoon: {
      text: 'A integração com TikTok ainda não está disponível nesta versão da EIXXO.',
    },
  },
};

interface Props {
  variant: ConnectVariant | null;
  onClose: () => void;
  onContinue: () => void;
}

export function ChannelConnectModal({ variant, onClose, onContinue }: Props) {
  if (!variant) return null;
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;
  const isComingSoon = !!cfg.comingSoon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {cfg.title}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {cfg.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isComingSoon ? (
          <div className="p-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {cfg.comingSoon!.text}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Entendi
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 p-5">
              {cfg.steps!.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{s.desc}</p>
                  </div>
                </div>
              ))}

              {cfg.alert && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{cfg.alert}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
                Continuar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
