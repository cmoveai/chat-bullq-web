'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  DollarSign,
  TrendingUp,
  Trophy,
  Trash2,
  Phone,
  Search,
  KanbanSquare,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  offersService,
  type Offer,
  type OfferStatus,
  OFFER_STATUS_LABEL,
  OFFER_STATUS_COLOR,
  formatCurrency,
} from '@/features/offers/services/offers.service';
import { pipelinesService } from '@/features/pipelines/services/pipelines.service';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSelect } from '@/components/ui/filter-select';

export default function OffersPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfferStatus | ''>('');
  const [pipelineFilter, setPipelineFilter] = useState<string>('');

  const statsQuery = useQuery({
    queryKey: ['offers', 'stats'],
    queryFn: () => offersService.stats(),
    refetchInterval: 30_000,
  });

  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesService.list(),
    staleTime: 60_000,
  });

  const offersQuery = useQuery({
    queryKey: ['offers', 'list', { search, statusFilter, pipelineFilter }],
    queryFn: () =>
      offersService.list({
        search: search || undefined,
        status: statusFilter || undefined,
        pipelineId: pipelineFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offersService.remove(id),
    onSuccess: () => {
      toast.success('Oferta removida');
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (err: any) =>
      toast.error(err?.message || 'Erro ao remover oferta'),
  });

  const rawOffers = offersQuery.data;
  const offers: Offer[] = Array.isArray(rawOffers) ? rawOffers : [];
  const stats = statsQuery.data;

  const handleDelete = (o: Offer) => {
    if (!confirm(`Excluir a oferta "${o.title}"?`)) return;
    deleteMutation.mutate(o.id);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Briefcase}
        title="Ofertas"
        description="Gerencie todos os seus negócios e acompanhe o progresso"
        actions={
          <>
            <button
              onClick={() => router.push('/pipelines')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <KanbanSquare className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => router.push('/offers/new')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              <Plus className="h-4 w-4" />
              Nova oferta
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Negócios"
          value={stats?.total ?? '—'}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          label="Valor Total"
          value={
            stats ? formatCurrency(stats.totalValue) : '—'
          }
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Ganho"
          value={stats?.won ?? '—'}
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          label="Em Andamento"
          value={stats?.inProgress ?? '—'}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar ofertas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <FilterSelect
          icon={KanbanSquare}
          value={pipelineFilter}
          onChange={setPipelineFilter}
          placeholder="Todos os Pipelines"
          options={(pipelinesQuery.data ?? []).map((p) => ({
            value: p.id,
            label: p.name,
          }))}
        />
        <FilterSelect
          icon={Activity}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Todos os Status"
          options={(Object.keys(OFFER_STATUS_LABEL) as OfferStatus[]).map((s) => ({
            value: s,
            label: OFFER_STATUS_LABEL[s],
          }))}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {offersQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando ofertas...
          </div>
        ) : offers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <Briefcase className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Nenhum negócio encontrado
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Comece criando seu primeiro negócio
              </p>
            </div>
            <button
              onClick={() => router.push('/offers/new')}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Nova oferta
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {offers.map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {o.title}
                    </span>
                    <span
                      className={
                        'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ' +
                        OFFER_STATUS_COLOR[o.status]
                      }
                    >
                      {OFFER_STATUS_LABEL[o.status]}
                    </span>
                    {o.stage && (
                      <span className="rounded-md bg-zinc-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        {o.stage.name}
                      </span>
                    )}
                    {o.pipeline && (
                      <span className="text-[11px] text-zinc-500">
                        · {o.pipeline.name}
                      </span>
                    )}
                  </div>
                  {o.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {o.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    {o.value !== null && o.value !== undefined && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(o.value, o.currency)}
                      </span>
                    )}
                    {o.contact && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {o.contact.name ?? o.contact.phone ?? '—'}
                      </span>
                    )}
                    {o.assignedTo && (
                      <span className="inline-flex items-center gap-1">
                        · {o.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(o)}
                  className="text-zinc-400 hover:text-red-500"
                  title="Excluir oferta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  );
}
