'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth.service';

interface ForgotForm {
  email: string;
}

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const form = useForm<ForgotForm>({ defaultValues: { email: '' } });

  const onSubmit = async (data: ForgotForm) => {
    if (!data.email || !data.email.includes('@')) {
      toast.error('Informe um e-mail válido');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(data.email);
      setSubmitted(true);
    } catch {
      // Endpoint é silencioso pra evitar enumeração · sempre mostra success
      setEmailSent(data.email);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Verifique seu e-mail
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Se a conta existir, enviamos um link seguro pra{' '}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {emailSent}
            </span>
            .
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Próximos passos
          </p>
          <ol className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">1.</span>
              Abre seu e-mail (caixa de entrada · spam · ou promoções)
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">2.</span>
              Clica no botão "Redefinir senha"
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">3.</span>
              Cria uma senha nova · entra direto
            </li>
          </ol>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              form.setValue('email', emailSent);
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reenviar link
          </button>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-zinc-600 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar pro login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar pro login
      </Link>

      <div className="mb-8 space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Recuperar senha
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cola o e-mail da conta · vamos enviar um link seguro.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            E-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="seu@email.com"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('email')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
            </>
          ) : (
            <>
              Enviar link de recuperação
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Por segurança, sempre mostramos a mesma resposta · independente de a conta
        existir ou não. Isso evita enumeração de e-mails.
      </p>
    </div>
  );
}
