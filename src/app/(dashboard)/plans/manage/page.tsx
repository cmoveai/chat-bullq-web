'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ArrowLeft, List, Check } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  billingService,
  formatPlanPrice,
} from '@/features/billing/services/billing.service';

export default function ManageSubscriptionPage() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['billing', 'me'],
    queryFn: () => billingService.getCurrent(),
  });

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={CreditCard}
        title="Gerenciar Assinatura"
        description="Gerencie sua assinatura e cobrança"
        actions={
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Todos os Planos
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
          Carregando assinatura...
        </div>
      ) : !subscription ? (
        <NoSubscriptionState />
      ) : (
        <ActiveSubscriptionCard subscription={subscription} />
      )}
    </div>
  );
}

function NoSubscriptionState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
        <CreditCard className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nenhuma Assinatura Ativa
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500">
          Você ainda não tem uma assinatura ativa. Escolha um plano que atenda
          às suas necessidades e comece a usar nossos serviços.
        </p>
      </div>
      <Link
        href="/plans"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
      >
        <List className="h-4 w-4" />
        Ver Planos Disponíveis
      </Link>
    </div>
  );
}

function ActiveSubscriptionCard({
  subscription,
}: {
  subscription: NonNullable<
    Awaited<ReturnType<typeof billingService.getCurrent>>
  >;
}) {
  const STATUS_LABEL: Record<string, string> = {
    TRIALING: 'Em período de teste',
    ACTIVE: 'Ativa',
    PAST_DUE: 'Pagamento pendente',
    CANCELED: 'Cancelada',
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Plano atual
          </p>
          <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {subscription.plan.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {subscription.plan.priceMonthlyBrl
              ? `${formatPlanPrice(subscription.plan.priceMonthlyBrl)}/mensal`
              : 'Custom'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            subscription.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : subscription.status === 'TRIALING'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          <Check className="h-3 w-3" />
          {STATUS_LABEL[subscription.status] ?? subscription.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Créditos restantes"
          value={
            subscription.creditsRemaining !== undefined
              ? subscription.creditsRemaining.toLocaleString('pt-BR')
              : '—'
          }
        />
        <Stat
          label="Renovação"
          value={
            subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  'pt-BR',
                )
              : '—'
          }
        />
        <Stat
          label="Trial termina"
          value={
            subscription.trialEndsAt
              ? new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')
              : '—'
          }
        />
        <Stat label="Canais máx." value={subscription.plan.maxChannels ?? 'Ilim.'} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <List className="h-4 w-4" />
          Trocar de plano
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
