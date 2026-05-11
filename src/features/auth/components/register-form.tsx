'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, Building2, CheckCircle2,
} from 'lucide-react';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

interface InviteInfo {
  email: string;
  role: string;
  organization: { id: string; name: string; slug: string };
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setActiveOrg } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inviteToken = searchParams.get('invite');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!inviteToken) return;
    setInviteLoading(true);
    authService
      .validateInvitation(inviteToken)
      .then((info) => {
        setInviteInfo(info);
        form.setValue('email', info.email);
      })
      .catch(() => {
        toast.error('Convite inválido ou expirado');
      })
      .finally(() => setInviteLoading(false));
  }, [inviteToken, form]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        inviteToken: inviteToken || undefined,
      });

      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);

      setAuth(result.user, result.organizations);
      setActiveOrg(result.organizations[0].id);

      toast.success(
        inviteInfo
          ? `Bem-vinda! Você entrou em ${inviteInfo.organization.name}`
          : 'Conta criada · vamos começar!',
      );
      router.push(inviteInfo ? '/inbox' : '/onboarding');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="flex w-full items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {inviteInfo ? 'Aceitar convite' : 'Criar sua conta'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {inviteInfo
            ? 'Preencha pra entrar no time.'
            : '7 dias grátis · sem cartão · cancele quando quiser.'}
        </p>
      </div>

      {inviteInfo && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <Building2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Convite recebido
            </p>
            <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              {inviteInfo.organization.name}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* NOME */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            Nome
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome completo"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('name')}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

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
              readOnly={!!inviteInfo}
              placeholder="seu@email.com"
              className={`block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white ${
                inviteInfo
                  ? 'cursor-not-allowed bg-zinc-50 dark:bg-zinc-800/50'
                  : ''
              }`}
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
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            Senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* CONFIRMAR SENHA */}
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
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* INCLUSO */}
        {!inviteInfo && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Incluso no trial
            </p>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                7 dias completos no plano Solo
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                R$ 50 em crédito IA pra testar agentes
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                Suporte direto no WhatsApp da Cris
              </li>
            </ul>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Criando…
            </>
          ) : (
            <>
              {inviteInfo ? 'Aceitar convite e entrar' : 'Criar conta grátis'}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* TERMS */}
        {!inviteInfo && (
          <p className="text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Ao criar conta você aceita nossos{' '}
            <a
              href="https://cmove.ai/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Termos
            </a>{' '}
            e a{' '}
            <a
              href="https://cmove.ai/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Política de Privacidade
            </a>
            .
          </p>
        )}
      </form>

      {/* DIVIDER + LOGIN */}
      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
