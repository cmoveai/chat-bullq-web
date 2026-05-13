'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { billingService } from '../services/billing.service';

type Status = {
  suspended: boolean;
  reason:
    | 'trial_pending_payment'
    | 'trial_expired'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'no_subscription'
    | null;
  status: string | null;
  trialEndsAt: string | null;
  planCode: string | null;
};

const REASON_COPY: Record<NonNullable<Status['reason']>, string> = {
  trial_pending_payment:
    'Pagamento pendente. Escolha um plano (cartão ou Pix) para liberar o acesso.',
  trial_expired: 'Seu trial de 30 dias terminou. Ative um plano para voltar a usar.',
  past_due: 'Pagamento em atraso. Atualize seu cartão para continuar usando.',
  canceled: 'Sua assinatura foi cancelada. Reative para voltar a usar.',
  expired: 'Sua assinatura expirou. Renove para voltar a usar.',
  no_subscription: 'Sua conta está suspensa. Ative um plano para começar.',
};

// Rotas que cliente suspenso PODE acessar (pra ativar plano)
const ALLOWED_WHEN_SUSPENDED = ['/plans', '/profile', '/onboarding'];

export function AccountSuspendedBanner() {
  const pathname = usePathname();
  const router = useRouter();

  const { data } = useQuery<Status>({
    queryKey: ['billing', 'me', 'status'],
    queryFn: () => billingService.getStatus(),
    refetchInterval: 30_000,
  });

  // Bloqueio de acesso: se conta suspensa e rota atual não está liberada,
  // redireciona pra /plans (cliente precisa pagar antes de acessar)
  useEffect(() => {
    if (!data || !data.suspended) return;
    const allowed = ALLOWED_WHEN_SUSPENDED.some((p) => pathname.startsWith(p));
    if (!allowed) router.replace('/plans');
  }, [data, pathname, router]);

  if (!data || !data.suspended || !data.reason) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-red-500/30 bg-red-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <strong className="font-bold">Sua conta está suspensa.</strong>{' '}
            <span className="text-white/90">{REASON_COPY[data.reason]}</span>
          </div>
        </div>
        <Link
          href="/plans"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-red-700 shadow hover:bg-zinc-100"
        >
          Ativar plano agora
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
