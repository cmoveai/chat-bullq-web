'use client';

import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  RefreshCw,
  Plug,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';

export default function ProfileTwoFactorPage() {
  const router = useRouter();

  const handleActivate = () => {
    toast('Em breve · feature em construção', {
      description:
        '2FA via TOTP (Google Authenticator) será publicada na próxima iteração.',
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        icon={ShieldCheck}
        title="Autenticação de Dois Fatores"
        description="Aprimore a segurança da sua conta com autenticação de dois fatores"
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Smartphone className="h-4 w-4 text-violet-600" />
          Aplicativo Autenticador
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Use um aplicativo autenticador como Google Authenticator ou Authy
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Aplicativo Autenticador
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  Inativo
                </span>
              </p>
              <p className="text-xs text-zinc-500">
                Um aplicativo autenticador não está ativo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleActivate}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            <Plug className="h-3.5 w-3.5" />
            Ativar
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <RefreshCw className="h-4 w-4 text-violet-600" />
          Códigos de Recuperação
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Códigos de backup para quando você perder acesso ao seu método de
          autenticação principal
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Códigos de Recuperação
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  Não configurado
                </span>
              </p>
              <p className="text-xs text-zinc-500">
                Nenhum código de recuperação configurado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    </div>
  );
}
