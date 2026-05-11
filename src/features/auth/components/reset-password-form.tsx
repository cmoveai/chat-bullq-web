'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Link inválido
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Este link não tem token válido. Se você quer redefinir sua senha,
            peça um novo link.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Pedir link novo <ArrowRight className="h-4 w-4" />
          </Link>
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

  if (success) {
    return (
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Senha atualizada
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Pronto · sua senha foi trocada com sucesso. Entre com a senha nova.
          </p>
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

  const onSubmit = async (data: ResetForm) => {
    if (data.password.length < 10) {
      toast.error('Senha precisa ter pelo menos 10 caracteres');
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error('Senhas não conferem');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Token inválido ou expirado · peça um novo link',
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          Redefinir senha
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Crie uma senha forte · será sua a partir de agora.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            Senha nova
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              required
              minLength={10}
              placeholder="Mínimo 10 caracteres"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            Confirmar senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={10}
              placeholder="Repita a senha"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Requisitos
          </p>
          <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              Mínimo 10 caracteres
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              Não usar senhas comuns ou de vazamentos públicos
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              Misturar letras, números e símbolos pra subir o score
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Redefinindo…
            </>
          ) : (
            <>
              Redefinir senha
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
