'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  ListOrdered,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  expenseBreakdown,
  recentTransactions,
  revenueGrowth30d,
  revenueGrowth7d,
  financialMock,
  type RecentTransaction,
} from '../../_mocks/financial';
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
    return `R$ ${(value / 1000).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`;
  }
  return formatBrl(value);
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const series = range === '7d' ? revenueGrowth7d : revenueGrowth30d;
  const seriesTotal = series.reduce((s, p) => s + p.amountBrl, 0);
  const peak = series.reduce(
    (acc, p) => (p.amountBrl > acc.amountBrl ? p : acc),
    series[0],
  );
  const totalExpense = financialMock.variableBrl + financialMock.fixedBrl;
  const credits = recentTransactions.filter((t) => t.type === 'credit');
  const debits = recentTransactions.filter((t) => t.type === 'debit');
  const totalCredit = credits.reduce((s, t) => s + t.amountBrl, 0);
  const totalDebit = debits.reduce((s, t) => s + t.amountBrl, 0);

  return (
    <div className="space-y-5">
      <HeroCard
        eyebrow="Analytics · CMOVE.AI-ZAP"
        caption="Receita do período + breakdown de despesas + atividade"
        value={formatBrl(seriesTotal)}
        meta={[
          {
            label: `${range === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}`,
            trend: 'up',
            trendLabel: '+4,2%',
          },
          { label: `${credits.length} entradas (${formatBrl(totalCredit)})`, trend: 'up' },
          {
            label: `${debits.length} saídas (${formatBrl(totalDebit)})`,
            trend: 'down',
          },
        ]}
        actions={[
          {
            label: 'Exportar CSV',
            icon: Download,
            variant: 'primary',
            onClick: () => exportAnalyticsCsv(),
          },
          {
            label: 'Mudar período',
            variant: 'secondary',
            onClick: () =>
              toast('Filtro de período', {
                description: 'Use o toggle 7d/30d no card "Crescimento de receita"',
              }),
          },
        ]}
        pending
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium">
                Crescimento de receita
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {formatBrl(seriesTotal)}
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +4,2%
                </span>
              </div>
            </div>
            <div className="inline-flex bg-zinc-100 dark:bg-zinc-800/60 rounded-lg p-0.5 text-xs">
              {(['7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                    range === r
                      ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis
                  dataKey="label"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-600"
                  tickFormatter={(v) => formatBrlCompact(Number(v))}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v) => [formatBrl(Number(v)), 'Receita']}
                />
                <Area
                  type="monotone"
                  dataKey="amountBrl"
                  stroke="#84cc16"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-2 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
            Pico: {formatBrl(peak.amountBrl)} em{' '}
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{peak.label}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-4">
            Breakdown de despesas
          </div>

          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="amountBrl"
                  stroke="none"
                >
                  {expenseBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v) => formatBrl(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatBrlCompact(totalExpense)}
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">total</div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {expenseBreakdown.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 truncate">
                    {c.name}
                  </span>
                </span>
                <span className="tabular-nums text-zinc-900 dark:text-zinc-100 font-semibold shrink-0">
                  {c.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <header className="pt-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <ListOrdered className="w-3.5 h-3.5 text-zinc-500" />
          Atividade recente
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          Entradas e saídas das últimas movimentações
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left px-5 py-3 font-medium">Data</th>
              <th className="text-left px-3 py-3 font-medium">Descrição</th>
              <th className="text-left px-3 py-3 font-medium">Categoria</th>
              <th className="text-left px-3 py-3 font-medium">Tipo</th>
              <th className="text-right px-3 py-3 font-medium">Valor</th>
              <th className="text-left px-3 py-3 font-medium">Origem</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function exportAnalyticsCsv() {
  const header = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Origem', 'Status'];
  const lines = recentTransactions.map((t) =>
    [t.date, t.description, t.category, t.type, t.amountBrl, t.counterparty, t.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = '﻿' + [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`CSV exportado · ${recentTransactions.length} transações`);
}

function TxRow({ tx }: { tx: RecentTransaction }) {
  const STATUS_BADGE: Record<
    RecentTransaction['status'],
    { label: string; className: string }
  > = {
    completed: {
      label: 'Concluída',
      className:
        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    scheduled: {
      label: 'Agendada',
      className:
        'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    pending: {
      label: 'Pendente',
      className:
        'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    },
  };
  const badge = STATUS_BADGE[tx.status];
  const isCredit = tx.type === 'credit';

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs tabular-nums">
        {tx.date}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isCredit
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
            }`}
          >
            {isCredit ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <ArrowUpRight className="w-3 h-3" />
            )}
          </span>
          <span className="text-zinc-900 dark:text-zinc-100 truncate">
            {tx.description}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
        {tx.category}
      </td>
      <td className="px-3 py-3">
        <span
          className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${
            isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isCredit ? 'Crédito' : 'Débito'}
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums font-medium">
        <span
          className={
            isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-900 dark:text-zinc-100'
          }
        >
          {isCredit ? '+' : '−'} {formatBrl(tx.amountBrl)}
        </span>
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
        {tx.counterparty}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 border rounded ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  );
}
