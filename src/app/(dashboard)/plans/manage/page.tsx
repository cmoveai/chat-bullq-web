'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { PLANS, type Plan } from '@/features/landing/lib/plans-data';
import { checkoutService } from '@/features/billing/services/checkout.service';

export default function ManageSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Carregando…
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = (params.get('plan') as 'starter' | 'growth' | 'pro' | null) ?? 'growth';
  const cycle = (params.get('cycle') as 'monthly' | 'quarterly' | null) ?? 'monthly';
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];
  const price = cycle === 'monthly' ? plan.monthly : plan.quarterly;

  const [loading, setLoading] = useState<null | 'card' | 'pix'>(null);

  const handlePay = async (paymentMethod: 'card' | 'pix') => {
    setLoading(paymentMethod);
    try {
      const res = await checkoutService.create({
        planId: plan.id,
        cycle,
        paymentMethod,
      });
      // Redireciona pra hosted checkout Kirvano
      window.location.href = res.checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar checkout');
      setLoading(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Lock}
        title="Finalizar assinatura"
        description="Pagamento seguro · cartão ou Pix"
        actions={
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos planos
          </Link>
        }
      />

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        {/* RESUMO PEDIDO */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Resumo do pedido
          </h2>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-zinc-950 dark:text-white">
                {plan.name}
              </p>
              <p className="text-sm text-zinc-500">{plan.tagline}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Cobrança {cycle === 'monthly' ? 'mensal' : 'trimestral'}
                {cycle === 'quarterly' && ` · economiza ${plan.quarterlyOff}%`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-zinc-950 dark:text-white">
                R$ {price}
              </p>
              <p className="text-xs text-zinc-500">
                {cycle === 'monthly' ? 'por mês' : 'a cada 3 meses'}
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-950 dark:text-white">Total</span>
            <span className="text-xl font-black text-emerald-500">R$ {price}</span>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/15">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Garantia de satisfação · 30 dias
                </p>
                <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                  Experimente sem riscos. Se não ficar satisfeito em 30 dias,
                  devolvemos seu dinheiro.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGAMENTO */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Forma de pagamento
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Escolha como deseja pagar.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => handlePay('card')}
              disabled={loading !== null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-base font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading === 'card' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pagar com cartão de crédito
                </>
              )}
            </button>

            <button
              onClick={() => handlePay('pix')}
              disabled={loading !== null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-6 py-4 text-base font-bold text-zinc-950 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
            >
              {loading === 'pix' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Pagar com Pix'
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-500">
            Pagamento processado pela Kirvano · criptografia SSL ·{' '}
            <Lock className="inline h-3 w-3" /> seus dados estão protegidos
          </p>
        </div>
      </div>
    </div>
  );
}
