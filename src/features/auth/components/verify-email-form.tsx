'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2, CheckCircle2, AlertCircle, Mail, ArrowRight, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { authService } from '../services/auth.service';

type VerifyState = 'verifying' | 'success' | 'error' | 'no-token';

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'no-token');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;
    authService
      .verifyEmail(token)
      .then(() => {
        if (!active) return;
        setState('success');
      })
      .catch((err) => {
        if (!active) return;
        setState('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Token inválido ou expirado',
        );
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      toast.error('Informe um e-mail válido');
      return;
    }
    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail);
      setResendSent(true);
    } catch {
      // Endpoint silencioso · sempre mostra sucesso
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  // VERIFICANDO
  if (state === 'verifying') {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Validando seu e-mail…
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Confirmando o token e liberando o acesso · alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  // SUCESSO
  if (state === 'success') {
    return (
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            E-mail confirmado
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Tudo certo · sua conta está ativa. Bem-vinda à CMOVE.AI-ZAP. Vamos
            começar a operação.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Próximos passos
          </p>
          <ol className="mt-2 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
            <li className="flex gap-2">
              <span className="font-bold">1.</span> Conectar primeiro canal (WhatsApp · Instagram)
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span> Criar primeiro agente IA
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span> Receber primeira conversa
            </li>
          </ol>
        </div>

        <Link
          href="/login"
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Entrar agora
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  // ERRO ou SEM TOKEN
  return (
    <div className="w-full">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar pro login
      </Link>

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {state === 'no-token' ? 'Link inválido' : 'Não conseguimos confirmar'}
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {state === 'no-token'
            ? 'Este link não tem token válido. Peça um novo link de confirmação abaixo.'
            : errorMessage || 'O token pode ter expirado (válido por 24h) ou já foi usado.'}
        </p>
      </div>

      {resendSent ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Link reenviado
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            Se a conta existir, vai chegar um e-mail novo em segundos.
          </p>
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="resend-email"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Pedir novo link
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="resend-email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resendLoading}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Reenviar verificação
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Não recebeu o e-mail anterior? Pode estar em spam ou promoções. Adicione
        cris@cmove.ai aos contatos confiáveis.
      </p>
    </div>
  );
}
