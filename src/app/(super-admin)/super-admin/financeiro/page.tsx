'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Download,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';
import { api } from '@/lib/api';
import { HeroCard } from '../../_components/hero-card';

interface InvoiceSummary {
  paidThisMonthBrl: number;
  paidThisMonthCount: number;
  paidPrevMonthBrl: number;
  openBrl: number;
  openCount: number;
  overdueBrl: number;
  overdueCount: number;
}

interface InvoicesResponse {
  summary: InvoiceSummary;
}

interface FinanceSnapshot {
  reference: string;
  inflowsBrl: number;
  variableBrl: number;
  fixedBrl: number;
  marginBrl: number;
  variablePct: number;
  fixedPct: number;
  marginPct: number;
  isMethodPassing: boolean;
  llmCostMonthUsd: number;
  llmCostMonthBrl: number;
  receivable7dBrl: number;
  receivable7dCount: number;
}

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

// Resultado do ZAP como unidade de negócio: receita do produto menos os custos
// DIRETOS dele (gateway + IA). Custo fixo da empresa e 40/20/40 consolidado NÃO
// entram aqui — vivem no cmove.ai/admin. O ZAP reporta a contribuição pra lá.
export default function ResultadoZapPage() {
  const { data: invoicesResp } = useQuery<InvoicesResponse>({
    queryKey: ['super-admin', 'invoices'],
    queryFn: async () => {
      const res = await api.get('/super-admin/invoices?limit=20');
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const { data: finance } = useQuery<FinanceSnapshot>({
    queryKey: ['super-admin', 'finance-snapshot'],
    queryFn: async () => {
      const res = await api.get('/super-admin/finance/snapshot');
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const summary = invoicesResp?.summary;
  const reference = finance?.reference ?? '—';
  const inflows = finance?.inflowsBrl ?? 0;
  const gatewayBrl = finance?.variableBrl ?? 0; // gateway + impostos (est. 10%)
  const llmBrl = finance?.llmCostMonthBrl ?? 0; // custo de IA real
  const llmUsd = finance?.llmCostMonthUsd ?? 0;
  const receivable = finance?.receivable7dBrl ?? 0;
  const receivableCount = finance?.receivable7dCount ?? 0;

  const directCosts = gatewayBrl + llmBrl;
  const contribution = inflows - directCosts;
  const contributionPct = inflows > 0 ? Math.round((contribution / inflows) * 100) : 0;
  const isHealthy = contribution > 0;

  const trendPct =
    summary && summary.paidPrevMonthBrl > 0
      ? Math.round(
          ((summary.paidThisMonthBrl - summary.paidPrevMonthBrl) /
            summary.paidPrevMonthBrl) *
            100,
        )
      : 0;

  return (
    <div className="space-y-5">
      <HeroCard
        eyebrow={`Resultado do ZAP · ${reference}`}
        caption="Margem de contribuição do mês"
        value={formatBrl(contribution)}
        meta={[
          {
            label: `${contributionPct}% de contribuição`,
            trend: isHealthy ? 'up' : 'down',
            trendLabel: isHealthy ? 'o ZAP se paga' : 'ainda no investimento',
          },
          { label: `Receita: ${formatBrl(inflows)}` },
          { label: `Custos diretos: ${formatBrl(directCosts)}` },
        ]}
        actions={[
          {
            label: 'Exportar CSV',
            icon: Download,
            variant: 'primary',
            onClick: () => finance && exportResultadoCsv(finance, contribution),
          },
          {
            label: 'Mudar mês',
            variant: 'secondary',
            onClick: () =>
              toast('Filtro de mês', {
                description: 'Seletor de período chega quando houver histórico de meses fechados.',
              }),
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiPill
          label="Recebido este mês"
          value={formatBrl(inflows)}
          trend={
            trendPct !== 0
              ? { direction: trendPct >= 0 ? 'up' : 'down', pct: `${Math.abs(trendPct)}%` }
              : undefined
          }
        />
        <KpiPill
          label="A receber (7 dias)"
          value={formatBrl(receivable)}
          trend={{ direction: 'up', pct: `${receivableCount} abertas`, positive: true }}
        />
        <KpiPill label="Custos diretos" value={formatBrl(directCosts)} />
        <KpiPill
          label="Contribuição"
          value={formatBrl(contribution)}
          trend={{ direction: isHealthy ? 'up' : 'down', pct: `${contributionPct}%`, positive: isHealthy }}
        />
      </div>

      <header>
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <Wallet className="w-3.5 h-3.5 text-zinc-500" />
          Custos diretos do ZAP
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          Só o que o produto consome. Custo fixo da empresa e 40/20/40 consolidado ficam no cmove.ai/admin.
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
        <ul className="space-y-3">
          <CostRow
            icon={<Wallet className="w-4 h-4 text-zinc-400" />}
            label="Gateway + impostos"
            note="estimado em 10% da receita"
            amountBrl={gatewayBrl}
          />
          <CostRow
            icon={<Cpu className="w-4 h-4 text-zinc-400" />}
            label="Custo de IA"
            note={`real · US$ ${llmUsd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} medido por execução`}
            amountBrl={llmBrl}
            realBadge
          />
        </ul>
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-baseline justify-between">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Total de custos diretos</span>
          <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatBrl(directCosts)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Contribuição do ZAP
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Receita − custos diretos. Quando positiva e crescente, o ZAP se capitaliza e remunera a CMOVE.AI.
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-xl font-semibold tabular-nums ${
                isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'
              }`}
            >
              {formatBrl(contribution)}
            </div>
            <div className="text-[11px] text-zinc-500 tabular-nums">{contributionPct}% da receita</div>
          </div>
        </div>
        {inflows === 0 && (
          <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            Sem receita em {reference} ainda · fase de investimento da CMOVE.AI no ZAP.
          </p>
        )}
      </div>
    </div>
  );
}

function exportResultadoCsv(f: FinanceSnapshot, contribution: number) {
  const lines = [
    ['Métrica', 'Valor (BRL)'].join(','),
    ['Receita (recebido)', f.inflowsBrl].join(','),
    ['Gateway + impostos (est. 10%)', f.variableBrl].join(','),
    ['Custo de IA (real)', f.llmCostMonthBrl].join(','),
    ['Contribuição', contribution].join(','),
    ['A receber 7 dias', f.receivable7dBrl].join(','),
  ];
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resultado-zap-${f.reference}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`CSV ${f.reference} exportado`);
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

function CostRow({
  icon,
  label,
  note,
  amountBrl,
  realBadge,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  amountBrl: number;
  realBadge?: boolean;
}) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {label}
            {realBadge && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                real
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500">{note}</div>
        </div>
      </div>
      <span className="text-sm tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
        {formatBrl(amountBrl)}
      </span>
    </li>
  );
}
