'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, Building2,
  Phone, FileText, Users,
} from 'lucide-react';
import {
  registerSchema,
  type RegisterFormData,
  COMPANY_SIZE_OPTIONS,
} from '../schemas/register.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

interface InviteInfo {
  email: string;
  role: string;
  organization: { id: string; name: string; slug: string };
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCpfCnpj = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

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
  const planIntent = searchParams.get('plan') as 'starter' | 'growth' | 'pro' | null;
  const cycleIntent = searchParams.get('cycle') as 'monthly' | 'quarterly' | null;
  const prefilledName = searchParams.get('name') || '';
  const prefilledEmail = searchParams.get('email') || '';
  const prefilledPhone = searchParams.get('phone') || '';

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: prefilledName,
      email: prefilledEmail,
      phone: prefilledPhone ? formatPhone(prefilledPhone) : '',
      cpfCnpj: '',
      companySize: undefined,
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
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
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        companySize: data.companySize,
        planIntent:
          planIntent && cycleIntent
            ? { planId: planIntent, cycle: cycleIntent }
            : undefined,
        inviteToken: inviteToken || undefined,
      });

      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);

      setAuth(result.user, result.organizations);
      setActiveOrg(result.organizations[0].id);

      toast.success(
        inviteInfo
          ? `Bem-vinda! Você entrou em ${inviteInfo.organization.name}`
          : 'Conta criada · vamos validar seu WhatsApp',
      );
      router.push(inviteInfo ? '/inbox' : '/onboarding/verify-phone');
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
          {inviteInfo ? 'Aceitar convite' : 'Crie uma conta para começar'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {inviteInfo
            ? 'Preencha pra entrar no time.'
            : 'Trial de 30 dias · garantia de devolução · cancele quando quiser.'}
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

      {planIntent && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Plano selecionado: <strong className="uppercase">{planIntent}</strong>
          {cycleIntent && (
            <> · {cycleIntent === 'monthly' ? 'Mensal' : 'Trimestral'}</>
          )}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* NOME */}
        <Field label="Nome" error={form.formState.errors.name?.message}>
          <FieldInput
            icon={<User className="h-4 w-4" />}
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            {...form.register('name')}
          />
        </Field>

        {/* EMAIL */}
        <Field label="E-mail corporativo" error={form.formState.errors.email?.message}>
          <FieldInput
            icon={<Mail className="h-4 w-4" />}
            type="email"
            autoComplete="email"
            readOnly={!!inviteInfo}
            placeholder="seu@email.com"
            {...form.register('email')}
          />
        </Field>

        {/* TELEFONE WA */}
        {!inviteInfo && (
          <Field
            label="Telefone (WhatsApp)"
            error={form.formState.errors.phone?.message}
          >
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                🇧🇷 +55
              </span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="(11) 98974-9229"
                className="block w-full rounded-r-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                value={form.watch('phone') || ''}
                onChange={(e) =>
                  form.setValue('phone', formatPhone(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </Field>
        )}

        {/* CPF / CNPJ */}
        {!inviteInfo && (
          <Field
            label="CPF ou CNPJ"
            error={form.formState.errors.cpfCnpj?.message}
          >
            <FieldInput
              icon={<FileText className="h-4 w-4" />}
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={form.watch('cpfCnpj') || ''}
              onChange={(e) =>
                form.setValue('cpfCnpj', formatCpfCnpj(e.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </Field>
        )}

        {/* TAMANHO EMPRESA */}
        {!inviteInfo && (
          <Field
            label="Tamanho da empresa"
            error={form.formState.errors.companySize?.message}
          >
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                className="block w-full appearance-none rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                {...form.register('companySize')}
              >
                <option value="">Selecione</option>
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        )}

        {/* SENHA */}
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* CONFIRMAR SENHA */}
        <Field
          label="Confirmar senha"
          error={form.formState.errors.confirmPassword?.message}
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
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
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* TERMOS */}
        {!inviteInfo && (
          <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              {...form.register('acceptedTerms')}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span>
              Eu concordo que li e aceito os{' '}
              <a
                href="https://cmove.ai/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
              >
                Termos de Uso e Política de Privacidade
              </a>{' '}
              do CMOVE.AI-ZAP.
            </span>
          </label>
        )}
        {form.formState.errors.acceptedTerms && (
          <p className="-mt-2 text-xs text-red-500">
            {form.formState.errors.acceptedTerms.message}
          </p>
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
              {inviteInfo ? 'Aceitar convite e entrar' : 'Criar conta'}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Faça o login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const FieldInput = ({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
      {icon}
    </span>
    <input
      {...props}
      className="block w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm text-zinc-950 placeholder-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
    />
  </div>
);
