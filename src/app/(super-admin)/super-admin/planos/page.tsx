'use client';

import { toast } from 'sonner';
import { Pencil, Plus, Layers } from 'lucide-react';
import { plansMock, FUNNEL_30D, type PlanMock } from '../../_mocks/plans';
import { Sparkline } from '../../_components/sparkline';
import { HeroCard } from '../../_components/hero-card';

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatLimit(value: number | 'unlimited'): string {
  return value === 'unlimited' ? 'Ilimitado' : String(value);
}

const MARGIN_COLOR: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-500',
  bad: 'text-red-600 dark:text-red-400',
};

const MARGIN_ICON: Record<'good' | 'warn' | 'bad', string> = {
  good: '✓',
  warn: '⚠',
  bad: '✕',
};

export default function PlanosPage() {
  const conversionPct = Math.round((FUNNEL_30D.paying / FUNNEL_30D.trialsStarted) * 100);
  const topPlan = plansMock.reduce((acc, p) => (p.subscribers > acc.subscribers ? p : acc), plansMock[0]);
  const totalMrr = plansMock.reduce((sum, p) => sum + p.mrrBrl, 0);

  return (
    <div className="space-y-5">
      <HeroCard
        eyebrow={`Plano em destaque · ${topPlan.name}`}
        caption={`MRR total dos planos ativos`}
        value={formatBrl(totalMrr)}
        meta={[
          {
            label: `${topPlan.name} é o mais vendido (${topPlan.subscribers} ass.)`,
            trend: 'up',
          },
          { label: `Conversão trial → pago: ${conversionPct}%`, trend: 'up' },
          { label: `Funil 30d: ${FUNNEL_30D.trialsStarted} → ${FUNNEL_30D.activated} → ${FUNNEL_30D.paying}` },
        ]}
        series={topPlan.trend30d}
        actions={[
          {
            label: 'Novo plano',
            icon: Plus,
            variant: 'primary',
            onClick: () =>
              toast('Novo plano', {
                description: 'Configuração de planos vem na próxima fatia · pricing definido por Cris',
              }),
          },
          {
            label: 'Editar plano',
            icon: Pencil,
            variant: 'secondary',
            onClick: () =>
              toast(`Editar ${topPlan.name}`, {
                description: 'Editor de planos chega com Sprint 2 Kirvano (limit enforcer + UI configuração)',
              }),
          },
        ]}
        pending
      />

      <header>
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          Comparativo
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          Margem · churn · uso · limites por plano
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plansMock.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-4">
          Funil últimos 30 dias
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FunnelStep
            label="Trials iniciados"
            value={FUNNEL_30D.trialsStarted}
            total={FUNNEL_30D.trialsStarted}
          />
          <FunnelStep
            label="Ativados (1ª msg)"
            value={FUNNEL_30D.activated}
            total={FUNNEL_30D.trialsStarted}
          />
          <FunnelStep
            label="Pagantes"
            value={FUNNEL_30D.paying}
            total={FUNNEL_30D.trialsStarted}
            highlight
          />
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          Conversão trial → pago:{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {conversionPct}%
          </span>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanMock }) {
  return (
    <div
      className={`relative rounded-2xl border p-5 ${
        plan.isMostSold
          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900/60'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40'
      }`}
    >
      {plan.isMostSold && (
        <div className="absolute -top-2 left-5 px-2 py-0.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] uppercase tracking-[0.14em] font-semibold rounded">
          Mais vendido
        </div>
      )}

      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {plan.name}
        </h3>
        <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {formatBrl(plan.priceBrl)}
        </div>
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-4">por mês</div>

      <div className="space-y-2.5 text-sm">
        <Row label="Assinantes">
          <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
            {plan.subscribers}
          </span>
        </Row>
        <Row label="MRR">
          <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
            {formatBrl(plan.mrrBrl)}
          </span>
        </Row>
        <Row label="Margem">
          <span className={`tabular-nums font-medium ${MARGIN_COLOR[plan.marginStatus]}`}>
            {plan.marginPct}% {MARGIN_ICON[plan.marginStatus]}
          </span>
        </Row>
        <Row label="Churn 30d">
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {plan.churn30dPct.toLocaleString('pt-BR')}%
          </span>
        </Row>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <Sparkline
          data={plan.trend30d}
          className="w-full h-12 text-zinc-400 dark:text-zinc-500"
        />
        <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600 mt-1">
          assinantes últ 30d
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-2">
          Limites de uso
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex justify-between">
          <span>Canais</span>
          <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatLimit(plan.limits.channels)}
          </span>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex justify-between">
          <span>Agentes IA</span>
          <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatLimit(plan.limits.agents)}
          </span>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex justify-between">
          <span>Conversas/mês</span>
          <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatLimit(plan.limits.monthlyConversations)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-zinc-500 dark:text-zinc-500 text-xs">{label}</span>
      {children}
    </div>
  );
}

function FunnelStep({
  label,
  value,
  total,
  highlight,
}: {
  label: string;
  value: number;
  total: number;
  highlight?: boolean;
}) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-2">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold tabular-nums ${
          highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </div>
      <div className="mt-2 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={highlight ? 'h-full bg-emerald-500' : 'h-full bg-zinc-900 dark:bg-zinc-100'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-600 mt-1.5">
        {pct}% do topo
      </div>
    </div>
  );
}
