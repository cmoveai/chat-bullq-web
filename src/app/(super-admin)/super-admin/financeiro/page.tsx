'use client';

import { toast } from 'sonner';
import {
  Download,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { financialMock } from '../../_mocks/financial';
import { HeroCard } from '../../_components/hero-card';

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatBrlCompact(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
  }
  return formatBrl(value);
}

export default function FinanceiroPage() {
  const m = financialMock;

  return (
    <div className="space-y-5">
      <HeroCard
        eyebrow={`Fluxo financeiro · ${m.reference}`}
        caption="Margem operacional do mês"
        value={formatBrl(m.marginBrl)}
        meta={[
          {
            label: `${m.marginPctOfRevenue}% da receita`,
            trend: 'up',
            trendLabel: 'meta atingida',
          },
          { label: `Entradas: ${formatBrl(m.inflowsBrl)}` },
          { label: `Saídas: ${formatBrl(m.variableBrl + m.fixedBrl)}` },
        ]}
        actions={[
          {
            label: 'Exportar CSV',
            icon: Download,
            variant: 'primary',
            onClick: () => exportFinancialCsv(m),
          },
          {
            label: 'Mudar mês',
            variant: 'secondary',
            onClick: () =>
              toast('Filtro de mês', {
                description: 'Seletor de período chega quando tiver histórico real (atual: Mai/26 fixo)',
              }),
          },
        ]}
        pending
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiPill
          label="Saldo do mês"
          value={formatBrl(m.marginBrl)}
          trend={{ direction: 'up', pct: '18%' }}
        />
        <KpiPill
          label="Entradas"
          value={formatBrl(m.inflowsBrl)}
          trend={{ direction: 'up', pct: '18%' }}
        />
        <KpiPill
          label="Saídas"
          value={formatBrl(m.variableBrl + m.fixedBrl)}
          trend={{ direction: 'down', pct: '5%', positive: true }}
        />
        <KpiPill
          label="A receber 7d"
          value={formatBrl(1794)}
          trend={{ direction: 'up', pct: '6%' }}
        />
      </div>

      <header>
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
          Distribuição
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          Método 40/20/40 da CMOVE.AI · variáveis ≤ 40% · fixas ≤ 20% · margem op ≥ 40%
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
        <div className="space-y-4">
          <RuleBar
            label="Variáveis"
            value={m.variablePctOfRevenue}
            limit={40}
            amountBrl={m.variableBrl}
            inverse
          />
          <RuleBar
            label="Fixas"
            value={m.fixedPctOfRevenue}
            limit={20}
            amountBrl={m.fixedBrl}
            inverse
          />
          <RuleBar
            label="Margem op"
            value={m.marginPctOfRevenue}
            limit={40}
            amountBrl={m.marginBrl}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard
          title="Detalhe variáveis"
          totalBrl={m.variableBrl}
          lines={m.variableLines}
        />
        <BreakdownCard
          title="Detalhe fixas"
          totalBrl={m.fixedBrl}
          lines={m.fixedLines}
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-1">
          Projeção 90 dias
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-500 mb-5">
          Rumo às {m.goalSep26Subscribers} assinantes em Set/26
        </div>
        <div className="grid grid-cols-4 gap-4">
          {m.projection.map((p, i) => (
            <ProjectionStep
              key={p.month}
              month={p.month}
              revenue={p.revenueBrl}
              subscribers={p.subscribers}
              isLast={i === m.projection.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function exportFinancialCsv(m: typeof financialMock) {
  const lines = [
    ['Métrica', 'Valor (BRL)'].join(','),
    ['Entradas (MRR)', m.inflowsMrr].join(','),
    ['Entradas (avulsas)', m.inflowsAdHoc].join(','),
    [`Despesas variáveis (${m.variablePctOfRevenue}%)`, m.variableBrl].join(','),
    [`Despesas fixas (${m.fixedPctOfRevenue}%)`, m.fixedBrl].join(','),
    [`Margem operacional (${m.marginPctOfRevenue}%)`, m.marginBrl].join(','),
    '',
    'Detalhe variáveis,',
    ...m.variableLines.map((l) => `"${l.label}",${l.amountBrl}`),
    '',
    'Detalhe fixas,',
    ...m.fixedLines.map((l) => `"${l.label}",${l.amountBrl}`),
  ];
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financeiro-${m.reference.toLowerCase().replace('/', '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`CSV ${m.reference} exportado`);
}

function KpiPill({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: { direction: 'up' | 'down'; pct: string; positive?: boolean };
}) {
  const trendPositive = trend?.positive ?? trend?.direction === 'up';
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-2">
        {label}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
              trendPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend.pct}
          </span>
        )}
      </div>
    </div>
  );
}

function RuleBar({
  label,
  value,
  limit,
  amountBrl,
  inverse,
}: {
  label: string;
  value: number;
  limit: number;
  amountBrl: number;
  inverse?: boolean;
}) {
  const pct = Math.min(100, value);
  const isOk = inverse ? value <= limit : value >= limit;
  const color = isOk ? 'bg-emerald-500' : 'bg-amber-500';
  const slack = inverse ? limit - value : value - limit;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
        <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
          {value}% · {formatBrl(amountBrl)}
          {isOk && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-[11px]">
              {inverse ? `folga ${slack}%` : `+${slack}% acima da meta`}
            </span>
          )}
        </span>
      </div>
      <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${pct}%` }} />
        <div
          className="absolute inset-y-0 w-px bg-zinc-400 dark:bg-zinc-600"
          style={{ left: `${limit}%` }}
          title={`Meta: ${limit}%`}
        />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  totalBrl,
  lines,
}: {
  title: string;
  totalBrl: number;
  lines: Array<{ label: string; amountBrl: number }>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium">
          {title}
        </div>
        <div className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {formatBrl(totalBrl)}
        </div>
      </div>
      <ul className="space-y-2">
        {lines.map((l, i) => (
          <li
            key={i}
            className="flex justify-between items-baseline text-sm py-1.5 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
          >
            <span className="text-zinc-700 dark:text-zinc-300">{l.label}</span>
            <span className="tabular-nums text-zinc-900 dark:text-zinc-100 font-medium">
              {formatBrl(l.amountBrl)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectionStep({
  month,
  revenue,
  subscribers,
  isLast,
}: {
  month: string;
  revenue: number;
  subscribers: number;
  isLast?: boolean;
}) {
  return (
    <div className={isLast ? 'border-l-2 border-emerald-500 pl-3' : 'border-l border-zinc-200 dark:border-zinc-800 pl-3'}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium">
        {month}
      </div>
      <div
        className={`text-lg font-semibold tabular-nums mt-1 ${
          isLast ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {formatBrlCompact(revenue)}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-500 tabular-nums mt-0.5">
        {subscribers} assinantes
      </div>
    </div>
  );
}
