'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, ChevronRight, Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';
import {
  subscribersMock,
  SUBSCRIBERS_STATS,
  type Plan,
  type Subscriber,
  type SubscriberStatus,
} from '../../_mocks/subscribers';
import { SubscriberDrawer } from '../../_components/subscriber-drawer';
import { HeroCard } from '../../_components/hero-card';

interface OrgListItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: number;
  channels: number;
  subscription: {
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
    planCode: string;
    planName?: string;
    priceMonthlyCents?: number;
    trialEndsAt?: string | null;
    nextBillingAt?: string | null;
    canceledAt?: string | null;
  } | null;
}

function planCodeToPlan(code?: string): Plan {
  switch (code) {
    case 'PRO':
      return 'Pro';
    case 'GROWTH':
      return 'Growth';
    case 'STARTER':
    default:
      return 'Starter';
  }
}

function statusToSubStatus(s?: string): SubscriberStatus {
  switch (s) {
    case 'ACTIVE':
      return 'active';
    case 'PAST_DUE':
      return 'overdue';
    case 'CANCELED':
    case 'EXPIRED':
      return 'canceled';
    case 'TRIAL':
    default:
      return 'trial';
  }
}

function mapOrgToSubscriber(o: OrgListItem): Subscriber {
  const plan = planCodeToPlan(o.subscription?.planCode);
  const mrrBrl = o.subscription?.priceMonthlyCents
    ? o.subscription.priceMonthlyCents / 100
    : null;
  const since = new Date(o.createdAt);
  const days = Math.max(0, Math.floor((Date.now() - since.getTime()) / 86400000));
  return {
    id: o.id,
    name: o.name,
    email: `${o.slug}@cmove.ai`,
    plan,
    mrrBrl,
    status: statusToSubStatus(o.subscription?.status),
    lastLoginRelative: '—',
    customerSince: since.toLocaleDateString('pt-BR'),
    customerSinceDays: days,
    channels: o.channels > 0 ? [`${o.channels} canal${o.channels > 1 ? 'is' : ''}`] : [],
    agentsCount: 0,
    messages30d: 0,
    llmCostMonthUsd: 0,
    marginPct: 0,
    invoices: [],
  };
}

type StatusFilter = 'all' | 'active' | 'overdue' | 'risk' | 'trial' | 'canceled';
type PlanFilter = 'all' | Plan;
type SortKey = 'mrr-desc' | 'mrr-asc' | 'name' | 'recent';
type OrigemFilter = 'all' | NonNullable<Subscriber['origem']>;

const ORIGEM_LABEL_LIST: Record<NonNullable<Subscriber['origem']>, string> = {
  site: 'Site',
  indicacao: 'Indicação',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  evento: 'Evento',
  outro: 'Outro',
};

const STATUS_BADGE: Record<
  SubscriberStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Ativo',
    className:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  overdue: {
    label: 'Atrasado',
    className:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900',
  },
  risk: {
    label: 'Risco',
    className:
      'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
  },
  trial: {
    label: 'Trial',
    className:
      'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
  canceled: {
    label: 'Cancelado',
    className:
      'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800',
  },
};

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AssinantesPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [origemFilter, setOrigemFilter] = useState<OrigemFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('mrr-desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: orgsResp } = useQuery<{ data: OrgListItem[]; total: number }>({
    queryKey: ['super-admin', 'orgs', 'all'],
    queryFn: async () => {
      const res = await api.get<{ data: { data: OrgListItem[]; total: number } }>(
        '/super-admin/orgs?limit=200',
      );
      return (res.data as any).data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  // Lista base: dados reais quando disponíveis · senão fallback pro mock (UI dev)
  const baseList: Subscriber[] = orgsResp?.data?.length
    ? orgsResp.data.map(mapOrgToSubscriber)
    : subscribersMock;
  const usingReal = !!orgsResp?.data?.length;

  const filtered = useMemo(() => {
    let list = [...baseList];
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.cnpj ?? '').toLowerCase().includes(q) ||
          (s.razaoSocial ?? '').toLowerCase().includes(q) ||
          (s.cidade ?? '').toLowerCase().includes(q) ||
          (s.segmento ?? '').toLowerCase().includes(q),
      );
    }
    if (planFilter !== 'all') {
      list = list.filter((s) => s.plan === planFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (origemFilter !== 'all') {
      list = list.filter((s) => s.origem === origemFilter);
    }
    list.sort((a, b) => {
      switch (sortKey) {
        case 'mrr-desc':
          return (b.mrrBrl ?? 0) - (a.mrrBrl ?? 0);
        case 'mrr-asc':
          return (a.mrrBrl ?? 0) - (b.mrrBrl ?? 0);
        case 'name':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'recent':
          return a.customerSinceDays - b.customerSinceDays;
      }
    });
    return list;
  }, [search, planFilter, statusFilter, origemFilter, sortKey, baseList]);

  const selected = selectedId
    ? baseList.find((s) => s.id === selectedId) ?? null
    : null;

  const totalMrr = baseList
    .filter((s) => s.status === 'active' || s.status === 'overdue' || s.status === 'risk')
    .reduce((sum, s) => sum + (s.mrrBrl ?? 0), 0);

  const realStats = {
    active: baseList.filter((s) => s.status === 'active').length,
    trial: baseList.filter((s) => s.status === 'trial').length,
    canceled: baseList.filter((s) => s.status === 'canceled').length,
  };
  const stats = usingReal ? realStats : SUBSCRIBERS_STATS;

  return (
    <>
      <div className="space-y-5">
        <HeroCard
          eyebrow="Assinantes · CMOVE.AI-ZAP"
          caption="Total de organizações pagantes"
          value={String(stats.active)}
          meta={[
            {
              label: `MRR: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(totalMrr)}`,
              trend: 'up',
              trendLabel: usingReal ? 'real' : 'mock',
            },
            { label: `${stats.trial} em trial` },
            { label: `${stats.canceled} cancelado` },
          ]}
          actions={[
            {
              label: 'Novo assinante',
              icon: Plus,
              variant: 'primary',
              onClick: () =>
                toast('Novo assinante', {
                  description: 'Cadastro manual chega com Sprint 2 (Kirvano + onboarding self-service)',
                }),
            },
            {
              label: 'Exportar CSV',
              variant: 'secondary',
              onClick: () => exportSubscribersCsv(filtered),
            },
          ]}
          pending
        />

        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              Lista
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Clica numa linha pra abrir detalhes
            </p>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome, CNPJ, razão social, cidade ou segmento..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-lg focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <SelectFilter
            label="Plano"
            value={planFilter}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'Starter', label: 'Starter' },
              { value: 'Growth', label: 'Growth' },
              { value: 'Pro', label: 'Pro' },
            ]}
            onChange={(v) => setPlanFilter(v as PlanFilter)}
          />
          <SelectFilter
            label="Status"
            value={statusFilter}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Ativos' },
              { value: 'overdue', label: 'Atrasados' },
              { value: 'risk', label: 'Risco' },
              { value: 'trial', label: 'Lead/Trial' },
              { value: 'canceled', label: 'Cancelados' },
            ]}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
          />
          <SelectFilter
            label="Origem"
            value={origemFilter}
            options={[
              { value: 'all', label: 'Todas' },
              ...Object.entries(ORIGEM_LABEL_LIST).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={(v) => setOrigemFilter(v as OrigemFilter)}
          />
          <SelectFilter
            label="Ordenar"
            value={sortKey}
            options={[
              { value: 'mrr-desc', label: 'Maior MRR' },
              { value: 'mrr-asc', label: 'Menor MRR' },
              { value: 'name', label: 'Nome (A-Z)' },
              { value: 'recent', label: 'Mais recentes' },
            ]}
            onChange={(v) => setSortKey(v as SortKey)}
          />
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-5 py-3 font-medium">Nome / CNPJ</th>
                <th className="text-left px-3 py-3 font-medium">Segmento</th>
                <th className="text-left px-3 py-3 font-medium">Cidade</th>
                <th className="text-left px-3 py-3 font-medium">Origem</th>
                <th className="text-left px-3 py-3 font-medium">Plano</th>
                <th className="text-right px-3 py-3 font-medium">MRR</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <SubscriberRow
                  key={s.id}
                  subscriber={s}
                  onClick={() => setSelectedId(s.id)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-zinc-500">
                    Nenhum assinante encontrado com esses filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-500 tabular-nums">
          {filtered.length} de {baseList.length} exibidos
        </div>
      </div>

      <SubscriberDrawer
        subscriber={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

function SubscriberRow({
  subscriber,
  onClick,
}: {
  subscriber: Subscriber;
  onClick: () => void;
}) {
  const badge = STATUS_BADGE[subscriber.status];
  return (
    <tr
      onClick={onClick}
      className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
    >
      <td className="px-5 py-3">
        <div className="font-medium text-zinc-900 dark:text-zinc-100">
          {subscriber.name}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate max-w-[260px]">
          {subscriber.cnpj ? (
            <span className="font-mono">{subscriber.cnpj}</span>
          ) : (
            subscriber.email
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300 text-xs">
        {subscriber.segmento ?? '—'}
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
        {subscriber.cidade ? `${subscriber.cidade}/${subscriber.uf ?? ''}` : '—'}
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
        {subscriber.origem ? ORIGEM_LABEL_LIST[subscriber.origem] : '—'}
      </td>
      <td className="px-3 py-3">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {subscriber.plan}
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
        {subscriber.mrrBrl !== null ? formatBrl(subscriber.mrrBrl) : '—'}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 border rounded ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 inline-block group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
      </td>
    </tr>
  );
}

function exportSubscribersCsv(rows: Subscriber[]) {
  const header = [
    'Nome',
    'Razão social',
    'CNPJ',
    'Email',
    'Telefone',
    'Cidade',
    'UF',
    'Segmento',
    'Origem',
    'Plano',
    'MRR',
    'Status',
  ];
  const lines = rows.map((s) =>
    [
      s.name,
      s.razaoSocial ?? '',
      s.cnpj ?? '',
      s.email,
      s.telefone ?? '',
      s.cidade ?? '',
      s.uf ?? '',
      s.segmento ?? '',
      s.origem ?? '',
      s.plan,
      s.mrrBrl ?? '',
      s.status,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = '﻿' + [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assinantes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`CSV exportado · ${rows.length} assinantes`);
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-xs text-zinc-500 dark:text-zinc-500 inline-flex items-center gap-2">
      {label}:
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded-md px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
