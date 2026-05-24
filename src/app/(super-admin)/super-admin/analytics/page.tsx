'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { HeroCard } from '../../_components/hero-card';

interface MrrHistoryResp {
  days: number;
  series: Array<{ date: string; mrrBrl: number; activeSubs: number; trialSubs: number }>;
}

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

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const days = range === '7d' ? 7 : 30;

  const { data: mrrHist } = useQuery<MrrHistoryResp>({
    queryKey: ['super-admin', 'mrr-history', days],
    queryFn: async () => {
      const res = await api.get(`/super-admin/analytics/mrr-history?days=${days}`);
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const raw = mrrHist?.series ?? [];
  const series = raw.map((p) => ({
    label: p.date.slice(8, 10) + '/' + p.date.slice(5, 7),
    mrrBrl: p.mrrBrl,
    subs: p.activeSubs + p.trialSubs,
  }));

  const last = series[series.length - 1];
  const first = series[0];
  const mrrNow = last?.mrrBrl ?? 0;
  const mrrTrend =
    first && first.mrrBrl > 0 ? Math.round(((mrrNow - first.mrrBrl) / first.mrrBrl) * 100) : 0;
  const subsTrend = first ? (last?.subs ?? 0) - first.subs : 0;

  return (
    <div className="space-y-5">
      <HeroCard
        eyebrow="Analytics do ZAP"
        caption="Crescimento de receita recorrente e de assinantes"
        value={formatBrl(mrrNow)}
        meta={[
          {
            label: `MRR atual`,
            trend: mrrTrend >= 0 ? 'up' : 'down',
            trendLabel: `${mrrTrend >= 0 ? '+' : ''}${mrrTrend}% no período`,
          },
          { label: `${last?.subs ?? 0} assinantes` },
          { label: range === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias' },
        ]}
        actions={[]}
      />

      <div className="flex justify-end">
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

      <ChartCard
        title="Crescimento de MRR"
        value={formatBrl(mrrNow)}
        trend={`${mrrTrend >= 0 ? '+' : ''}${mrrTrend}%`}
        trendUp={mrrTrend >= 0}
        data={series}
        dataKey="mrrBrl"
        color="#10b981"
        gradientId="anMrr"
        tickFormatter={(v) => formatBrlCompact(v)}
        tooltipLabel="MRR"
        formatValue={(v) => formatBrl(v)}
      />

      <ChartCard
        title="Crescimento de assinantes"
        value={`${last?.subs ?? 0}`}
        trend={`${subsTrend >= 0 ? '+' : ''}${subsTrend}`}
        trendUp={subsTrend >= 0}
        data={series}
        dataKey="subs"
        color="#3b82f6"
        gradientId="anSubs"
        tickFormatter={(v) => String(v)}
        tooltipLabel="Assinantes"
        formatValue={(v) => String(v)}
        icon={<Users className="w-3.5 h-3.5 text-zinc-500" />}
      />

      {series.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          Sem histórico suficiente ainda · os gráficos preenchem conforme o ZAP acumula dias.
        </p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  value,
  trend,
  trendUp,
  data,
  dataKey,
  color,
  gradientId,
  tickFormatter,
  tooltipLabel,
  formatValue,
  icon,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  data: Array<Record<string, any>>;
  dataKey: string;
  color: string;
  gradientId: string;
  tickFormatter: (v: number) => string;
  tooltipLabel: string;
  formatValue: (v: number) => string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium inline-flex items-center gap-2">
            {icon}
            {title}
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
              {value}
            </div>
            <span
              className={`text-xs font-medium inline-flex items-center gap-0.5 ${
                trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend}
            </span>
          </div>
        </div>
      </div>

      <div className="h-56 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
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
              width={46}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
              tickFormatter={(v) => tickFormatter(Number(v))}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(v) => [formatValue(Number(v)), tooltipLabel]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
