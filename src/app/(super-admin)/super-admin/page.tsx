'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Plus, ChevronRight, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
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

interface AttentionItem {
  severity: 'red' | 'amber' | 'yellow';
  title: string;
  detail: string;
  cta: string;
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

const BRAND_NEUTRAL = {
  dot: 'bg-zinc-400',
  gradient: 'from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950',
  border: 'border-zinc-200 dark:border-zinc-800',
};

const PLAN_BRAND: Record<string, { dot: string; gradient: string; border: string }> = {
  Solo: BRAND_NEUTRAL,
  Time: {
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-950',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  Negócio: {
    dot: 'bg-amber-500',
    gradient: 'from-amber-50 to-white dark:from-amber-950/40 dark:to-zinc-950',
    border: 'border-amber-200 dark:border-amber-900',
  },
  Empresa: {
    dot: 'bg-blue-400',
    gradient: 'from-blue-50 to-white dark:from-blue-950/40 dark:to-zinc-950',
    border: 'border-blue-200 dark:border-blue-900',
  },
};

const DONUT_COLORS = ['#10b981', '#71717a', '#f59e0b', '#3b82f6', '#a855f7'];

// Meta de MRR · R$ 15 mil em 60 dias (Cris, 24/05/2026 · alvo 23/07/2026).
const MRR_GOAL = 15000;
const GOAL_DEADLINE = new Date('2026-07-23T23:59:59');

export default function SuperAdminVisaoGeralPage() {
  const { data: kpis } = useQuery<SuperAdminKpis>({
    queryKey: ['super-admin', 'kpis'],
    queryFn: async () => {
      const res = await api.get('/super-admin/kpis');
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 30_000,
  });

  const { data: orgsResp } = useQuery<OrgListResponse>({
    queryKey: ['super-admin', 'orgs', 'all'],
    queryFn: async () => {
      const res = await api.get('/super-admin/orgs?limit=200');
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
      const res = await api.get('/super-admin/analytics/mrr-history?days=30');
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const mrr = kpis?.mrrBrl ?? 0;
  const activeSubs = kpis?.activeSubs ?? 0;
  const trialSubs = kpis?.trialingSubs ?? 0;
  const subs = activeSubs + trialSubs;

  const series = mrrHist?.series?.map((p) => p.mrrBrl) ?? [];
  const displaySeries = series.length > 0 ? series : [mrr];
  const trendPct =
    series.length >= 2 && series[0] > 0
      ? Math.round(((series[series.length - 1] - series[0]) / series[0]) * 100)
      : 0;
  const trendLabel = `${trendPct >= 0 ? '+' : ''}${trendPct}%`;
  const newCount =
    mrrHist?.series && mrrHist.series.length >= 2
      ? Math.max(0, mrrHist.series[mrrHist.series.length - 1].activeSubs - mrrHist.series[0].activeSubs)
      : 0;

  // Receita por plano · agregada das orgs reais
  const planMap = new Map<string, { plan: string; subscribers: number; mrr: number }>();
  for (const o of orgsResp?.data ?? []) {
    const sub = o.subscription;
    if (!sub) continue;
    const isActive = sub.status === 'ACTIVE';
    const isTrial = sub.status === 'TRIAL';
    if (!isActive && !isTrial) continue;
    const name = sub.planName || sub.planCode || '—';
    const cur = planMap.get(name) ?? { plan: name, subscribers: 0, mrr: 0 };
    cur.subscribers += 1;
    if (isActive) cur.mrr += (sub.priceMonthlyCents ?? 0) / 100;
    planMap.set(name, cur);
  }
  const planCards = [...planMap.values()].sort((a, b) => b.mrr - a.mrr);

  // Atenção · assinaturas em atraso (real)
  const attention: AttentionItem[] = (orgsResp?.data ?? [])
    .filter((o) => o.subscription?.status === 'PAST_DUE')
    .map((o) => ({
      severity: 'red' as const,
      title: `${o.name} · pagamento em atraso`,
      detail: `Plano ${o.subscription?.planName ?? o.subscription?.planCode ?? '—'}`,
      cta: 'Cobrar',
    }));

  // Distribuição por plano (donut) · só clientes com assinatura ativa ou em trial
  const distMap = new Map<string, number>();
  for (const o of orgsResp?.data ?? []) {
    const status = o.subscription?.status;
    if (status !== 'ACTIVE' && status !== 'TRIAL') continue;
    const code = o.subscription?.planName || o.subscription?.planCode || '—';
    distMap.set(code, (distMap.get(code) ?? 0) + 1);
  }
  const donutData = [...distMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: DONUT_COLORS[i] ?? '#71717a' }));

  const goalPct = Math.min(100, Math.round((mrr / MRR_GOAL) * 100));
  const daysLeft = Math.max(0, Math.ceil((GOAL_DEADLINE.getTime() - Date.now()) / 86_400_000));

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3 mb-1">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Bom te ver de volta · veja a saúde geral do ZAP.
        </p>
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          Período · <span className="text-zinc-900 dark:text-zinc-100 font-medium">Mai/2026</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4">
        <HeroMrrCard mrr={mrr} subscribers={subs} newCount={newCount} series={displaySeries} />
        <GoalCard mrr={mrr} goal={MRR_GOAL} pct={goalPct} daysLeft={daysLeft} />
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
        {planCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6 text-center text-sm text-zinc-500">
            Nenhum assinante ativo ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {planCards.map((p) => {
              const brand = PLAN_BRAND[p.plan] ?? BRAND_NEUTRAL;
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
                      {p.subscribers} {p.subscribers === 1 ? 'assinante' : 'assinantes'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {p.mrr === 0 ? '—' : formatBrlFull(p.mrr)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500 mt-0.5">
                    MRR
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <RevenueGrowthCard mrr={mrr} trendPct={trendLabel} series={displaySeries} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <AttentionPanel items={attention} />
        <DistributionPanel data={donutData} total={subs} />
      </div>

      {kpis && (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center pt-2">
          Banco real · {kpis.totalOrgs} orgs · {kpis.totalUsers} users · {kpis.messagesToday} msgs hoje ·{' '}
          {kpis.activeChannels} canais · {kpis.activeSubs} ACTIVE / {kpis.trialingSubs} TRIAL /{' '}
          {kpis.pastDueSubs} PAST_DUE · LLM {kpis.llmCostMonthUsd.toFixed(2)} USD mês
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
}: {
  mrr: number;
  subscribers: number;
  newCount: number;
  series: number[];
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
          <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-400 font-semibold border border-emerald-700/60 rounded px-1.5 py-0.5">
            real
          </span>
        </div>

        <div className="text-xs text-zinc-400 mb-3">MRR · receita recorrente mensal</div>
        <div className="text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight">
          {formatBrlFull(mrr)}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {subscribers} {subscribers === 1 ? 'assinante ativo' : 'assinantes ativos'}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            {newCount} {newCount === 1 ? 'novo' : 'novos'} em 30 dias
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
            Ver resultado
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ mrr, goal, pct, daysLeft }: { mrr: number; goal: number; pct: number; daysLeft: number }) {
  const remaining = Math.max(0, goal - mrr);
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-700 to-emerald-900 p-6 text-white overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200 font-medium mb-3">
          Próxima meta
        </div>
        <h3 className="text-base font-semibold leading-tight mb-1">{formatBrl(goal)} de MRR</h3>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Faltam <span className="font-semibold tabular-nums">{formatBrl(remaining)}</span> ·{' '}
          <span className="font-semibold tabular-nums">{daysLeft} dias</span> (até 23/jul)
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
          <span className="tabular-nums font-semibold text-white">{formatBrlFull(mrr)}</span>
        </div>

        <Link
          href="/super-admin/planos"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-white hover:text-emerald-100 font-medium"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Ver planos
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
  const data = series.map((value, i) => ({ label: `${i + 1}`, value }));
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
            MRR consolidado · últimos 30 dias
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

function AttentionPanel({ items }: { items: AttentionItem[] }) {
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
            {items.length === 0 ? 'nada pendente' : `${items.length} item(ns) precisam de ação`}
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
      {items.length === 0 ? (
        <div className="px-5 py-8 flex flex-col items-center justify-center text-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Tudo em dia · nenhuma cobrança em atraso.</div>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
            >
              <span className={`w-2 h-2 rounded-full ${dotByLevel[item.severity]} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate">{item.detail}</div>
              </div>
              <button className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                {item.cta}
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
            </li>
          ))}
        </ul>
      )}
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
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Distribuição</div>
        <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
          {total} ativos
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-sm text-zinc-500">Sem assinantes</div>
      ) : (
        <>
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
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{d.name}</span>
                </span>
                <span className="tabular-nums text-zinc-900 dark:text-zinc-100 font-semibold">
                  {d.value}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
