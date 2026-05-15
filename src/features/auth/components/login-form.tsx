'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);

      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);

      setAuth(result.user, result.organizations);

      toast.success(`Bem-vinda, ${result.user.name}!`);
      router.push('/home');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Entrar na sua conta
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Bem-vinda de volta · entre pra continuar onde parou.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* EMAIL */}
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
              placeholder="seu@email.com"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* SENHA */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••"
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
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* SSO Google · Cyber Onda 2 #22 */}
      <div className="mt-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-400">ou</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <a
        href={
          (process.env.NEXT_PUBLIC_API_URL ?? 'https://zap.cmove.ai/api/v1') +
          '/auth/google'
        }
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.67-2.25 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.52H2.18v2.84A11 11 0 0 0 12 23Z"/>
          <path fill="#FBBC05" d="M5.86 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.68-2.84Z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.68 2.84C6.72 7.3 9.14 5.38 12 5.38Z"/>
        </svg>
        Entrar com Google
      </a>

      {/* DIVIDER + SIGNUP */}
      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Não tem conta?{' '}
          <Link
            href="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Começar grátis · 7 dias
          </Link>
        </p>
      </div>

      {/* TRUST badges */}
      <div className="mt-8 flex items-center justify-center gap-5 text-[10px] uppercase tracking-widest text-zinc-400">
        <span>LGPD ✓</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>SLA 99,5%</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>RLS 100%</span>
      </div>
    </div>
  );
}
