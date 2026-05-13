'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Plus, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';
import { overviewMock } from '../_mocks/overview';
import { Sparkline } from '../_components/sparkline';

interface SuperAdminKpis {
  totalOrgs: number;
  totalUsers: number;
  messagesToday: number;
  activeChannels: number;
  mrrBrl: number;
  llmCostMonthUsd: number;
  activeSubs: number;
  trialingSubs: number;
  pastDueSubs: number;
}

interface OrgListItem {
  id: string;
  name: string;
  slug: string;
  members: number;
  channels: number;
  subscription: {
    status: string;
    planCode: string;
    planName?: string;
    priceMonthlyCents?: number;
  } | null;
}

interface OrgListResponse {
  data: OrgListItem[];
  total: number;
}

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBrlFull(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

const PLAN_BRAND: Record<
  'Starter' | 'Growth' | 'Pro' | 'Trial',
  { dot: string; gradient: string; border: string }
> = {
  Starter: {
    dot: 'bg-zinc-400',
    gradient: 'from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950',
    border: 'border-zinc-200 dark:border-zinc-800',
  },
  Growth: {
    dot: 'bg-emerald-500',
    gradient:
      'from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-950',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  Pro: {
    dot: 'bg-amber-500',
    gradient: 'from-amber-50 to-white dark:from-amber-950/40 dark:to-zinc-950',
    border: 'border-amber-200 dark:border-amber-900',
  },
  Trial: {
    dot: 'bg-blue-400',
    gradient: 'from-blue-50 to-white dark:from-blue-950/40 dark:to-zinc-950',
    border: 'border-blue-200 dark:border-blue-900',
  },
};

const PRODUCT_CARDS: Array<{
  plan: 'Starter' | 'Growth' | 'Pro' | 'Trial';
  subscribers: number;
  amount: number;
  hint: string;
}> = [
  { plan: 'Starter', subscribers: 4, amount: 1188, hint: '4 assinantes' },
  { plan: 'Growth', subscribers: 6, amount: 3582, hint: '6 assinantes' },
  { plan: 'Pro', subscribers: 2, amount: 2594, hint: '2 assinantes' },
  { plan: 'Trial', subscribers: 2, amount: 0, hint: '2 em avaliação' },
];

const DONUT_COLORS = ['#10b981', '#71717a', '#f59e0b', '#3b82f6'];

const MARGIN_GOAL = 14985;

export default function SuperAdminVisaoGeralPage() {
  const { data: realKpis } = useQuery<SuperAdminKpis>({
    queryKey: ['super-admin', 'kpis'],
    queryFn: async () => {
      const res = await api.get<{ data: SuperAdminKpis }>('/super-admin/kpis');
      return res.data.data;
    },
    refetchInterval: 30_000,
  });

  const { data: orgsResp } = useQuery<OrgListResponse>({
    queryKey: ['super-admin', 'orgs', 'all'],
    queryFn: async () => {
      const res = await api.get<{ data: OrgListResponse }>(
        '/super-admin/orgs?limit=200',
      );
      // backend retorna { data: { data: [...], total } } · interceptor já
      // desempilha 1 nível, sobra o envelope interno do service.
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const { data: mrrHist } = useQuery<{
    days: number;
    series: Array<{ date: string; mrrBrl: number; activeSubs: number; trialSubs: number }>;
  }>({
    queryKey: ['super-admin', 'mrr-history', 30],
    queryFn: async () => {
      const res = await api.get<{ data: { days: number; series: any[] } }>(
        '/super-admin/analytics/mrr-history?days=30',
      );
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const m = overviewMock;

  // Real values quando disponíveis · fallback pro mock pra UI não quebrar
  const mrrReal = realKpis?.mrrBrl;
  const mrrDisplay = mrrReal ?? m.kpis.mrrBrl;
  const subsReal = realKpis ? realKpis.activeSubs + realKpis.trialingSubs : undefined;
  const subsDisplay = subsReal ?? m.kpis.activeSubscribers;
  const usingRealMrr = mrrReal !== undefined && mrrReal > 0;

  // Série histórica real · usa quando tem variação (mais de 1 valor distinto)
  const realSeries = mrrHist?.series.map((p) => p.mrrBrl);
  const seriesVariation = realSeries
    ? new Set(realSeries).size
    : 0;
  const mrrSeries = realSeries && seriesVariation > 1 ? realSeries : m.mrrSeries;
  // Tendência: comparação último dia vs início da série
  const realTrendPct =
    realSeries && realSeries.length >= 2 && realSeries[0] > 0
      ? Math.round(((realSeries[realSeries.length - 1] - realSeries[0]) / realSeries[0]) * 100)
      : null;
  const mrrTrendPct =
    realTrendPct !== null ? `${realTrendPct >= 0 ? '+' : ''}${realTrendPct}%` : m.kpis.mrrTrendPct;
  // Novos assinantes 30d · diff de activeSubs entre primeiro e último ponto
  const realNewCount =
    mrrHist?.series && mrrHist.series.length >= 2
      ? Math.max(
          0,
          mrrHist.series[mrrHist.series.length - 1].activeSubs - mrrHist.series[0].activeSubs,
        )
      : null;
  const newCountDisplay = realNewCount ?? m.kpis.newSubscribers30d;

  // Plan distribution calculada a partir das orgs reais
  const realDistribution = orgsResp?.data
    ? Object.entries(
        orgsResp.data.reduce<Record<string, number>>((acc, o) => {
          const code = o.subscription?.planCode ?? 'NONE';
          acc[code] = (acc[code] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count)
    : null;

  const goalPct = Math.min(100, Math.round((mrrDisplay / MARGIN_GOAL) * 100));
  const donutData = (
    realDistribution && realDistribution.length > 0
      ? realDistribution
      : m.planDistribution.map((p) => ({ plan: p.plan, count: p.count }))
  ).map((p, i) => ({
    name: p.plan,
    value: p.count,
    color: DONUT_COLORS[i] ?? '#71717a',
  }));

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3 mb-1">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Bom te ver de volta · veja a saúde geral do seu produto.
          </p>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          Período · <span className="text-zinc-900 dark:text-zinc-100 font-medium">Mai/2026</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4">
        <HeroMrrCard
          mrr={mrrDisplay}
          subscribers={subsDisplay}
          newCount={newCountDisplay}
          series={mrrSeries}
          isReal={usingRealMrr}
        />
        <GoalCard mrr={mrrDisplay} goal={MARGIN_GOAL} pct={goalPct} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Receita por plano
          </h2>
          <Link
            href="/super-admin/planos"
            className="text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRODUCT_CARDS.map((p) => {
            const brand = PLAN_BRAND[p.plan];
            return (
              <div
                key={p.plan}
                className={`rounded-xl border ${brand.border} bg-gradient-to-br ${brand.gradient} p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${brand.dot}`} />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {p.plan}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500 font-medium">
                    {p.hint}
                  </span>
                </div>
                <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {p.amount === 0 ? '—' : formatBrlFull(p.amount)}
                </div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500 mt-0.5">
                  MRR
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <RevenueGrowthCard
        mrr={mrrDisplay}
        trendPct={mrrTrendPct}
        series={mrrSeries}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <AttentionPanel items={m.attention} />
        <DistributionPanel data={donutData} total={subsDisplay} />
      </div>

      {realKpis && (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center pt-2">
          Banco real · {realKpis.totalOrgs} orgs · {realKpis.totalUsers} users ·{' '}
          {realKpis.messagesToday} msgs hoje · {realKpis.activeChannels} canais ·{' '}
          {realKpis.activeSubs} ACTIVE / {realKpis.trialingSubs} TRIAL /{' '}
          {realKpis.pastDueSubs} PAST_DUE · LLM {realKpis.llmCostMonthUsd.toFixed(2)} USD mês
        </div>
      )}
    </div>
  );
}

function HeroMrrCard({
  mrr,
  subscribers,
  newCount,
  series,
  isReal,
}: {
  mrr: number;
  subscribers: number;
  newCount: number;
  series: number[];
  isReal: boolean;
}) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-black p-7 text-zinc-100 overflow-hidden">
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-0 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-medium">
            Conta principal · CMOVE.AI-ZAP
          </div>
          {isReal ? (
            <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-400 font-semibold border border-emerald-700/60 rounded px-1.5 py-0.5">
              real
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.14em] text-amber-400 font-semibold border border-amber-700/60 rounded px-1.5 py-0.5">
              mock
            </span>
          )}
        </div>

        <div className="text-xs text-zinc-400 mb-3">MRR · receita recorrente mensal</div>
        <div className="text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight">
          {formatBrlFull(mrr)}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {subscribers} assinantes ativos
          </span>
          <span className="text-zinc-600">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            {newCount} novos em 30 dias
          </span>
        </div>

        <div className="mt-5 -mb-2 -mx-1 h-14 opacity-90">
          <Sparkline data={series} className="w-full h-full text-emerald-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <Link
            href="/super-admin/cobrancas"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 text-sm rounded-xl font-medium hover:bg-zinc-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova cobrança
          </Link>
          <Link
            href="/super-admin/financeiro"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm rounded-xl transition-colors"
          >
            Ver fluxo
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ mrr, goal, pct }: { mrr: number; goal: number; pct: number }) {
  const remaining = Math.max(0, goal - mrr);
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-700 to-emerald-900 p-6 text-white overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200 font-medium mb-3">
          Próxima meta
        </div>
        <h3 className="text-base font-semibold leading-tight mb-1">
          R$ 15 mil de MRR
        </h3>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Faltam <span className="font-semibold tabular-nums">{formatBrl(remaining)}</span> · ~5 novos Growth ou 12 Starter
        </p>

        <div className="mt-5">
          <div className="flex justify-between text-[11px] text-emerald-100 mb-1.5 font-medium">
            <span>Progresso</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 bg-emerald-950/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-300 to-white rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-[11px] text-emerald-100/80">
          <span>Hoje</span>
          <span className="tabular-nums font-semibold text-white">
            {formatBrlFull(mrr)}
          </span>
        </div>

        <Link
          href="/super-admin/planos"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-white hover:text-emerald-100 font-medium"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Ver estratégia de plano
        </Link>
      </div>
    </div>
  );
}

function RevenueGrowthCard({
  mrr,
  trendPct,
  series,
}: {
  mrr: number;
  trendPct: string;
  series: number[];
}) {
  const data = series.map((value, i) => ({
    label: `${i + 1}`,
    value,
  }));
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium">
            Crescimento da receita
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatBrlFull(mrr)}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              {trendPct}
            </span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            últimos 14 períodos · MRR consolidado
          </div>
        </div>
      </div>

      <div className="h-56 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="overviewMrrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
              width={50}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
              tickFormatter={(v) => formatBrl(Number(v))}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(v) => [formatBrl(Number(v)), 'MRR']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#overviewMrrGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AttentionPanel({
  items,
}: {
  items: typeof overviewMock.attention;
}) {
  const dotByLevel: Record<'red' | 'amber' | 'yellow', string> = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-400',
  };
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Atenção
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
            {items.length} itens precisam de ação
          </div>
        </div>
        <Link
          href="/super-admin/cobrancas"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1"
        >
          Ver tudo
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
          >
            <span
              className={`w-2 h-2 rounded-full ${dotByLevel[item.severity]} shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {item.title}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                {item.detail}
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
              {item.cta}
            </button>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DistributionPanel({
  data,
  total,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Distribuição
        </div>
        <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
          {total} ativos
        </span>
      </div>

      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {total}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
            assinantes
          </div>
        </div>
      </div>

      <ul className="space-y-2 mt-4">
        {data.map((d) => (
          <li
            key={d.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                {d.name}
              </span>
            </span>
            <span className="tabular-nums text-zinc-900 dark:text-zinc-100 font-semibold">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
