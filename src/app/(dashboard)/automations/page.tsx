'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Instagram,
  MessageCircle,
  Hash,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  automationsService,
  type Automation,
  AUTOMATION_TYPE_LABEL,
} from '@/features/automations/services/automations.service';
import { PageHeader } from '@/components/ui/page-header';

export default function AutomationsPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const statsQuery = useQuery({
    queryKey: ['automations', 'stats'],
    queryFn: () => automationsService.stats(),
    refetchInterval: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ['automations', 'list'],
    queryFn: () => automationsService.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      automationsService.update(id, { isActive }),
    onSuccess: () => {
      toast.success('Automação atualizada');
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (err: any) =>
      toast.error(err?.message || 'Erro ao atualizar automação'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => automationsService.remove(id),
    onSuccess: () => {
      toast.success('Automação removida');
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (err: any) =>
      toast.error(err?.message || 'Erro ao remover'),
  });

  const raw = listQuery.data;
  const automations: Automation[] = Array.isArray(raw) ? raw : [];
  const stats = statsQuery.data;

  const handleToggle = (a: Automation) => {
    toggleMutation.mutate({ id: a.id, isActive: !a.isActive });
  };

  const handleDelete = (a: Automation) => {
    if (!confirm(`Excluir a automação "${a.name}"?`)) return;
    deleteMutation.mutate(a.id);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Zap}
        title="Automações"
        description="Crie regras automáticas que disparam quando algo acontece (ex: comentário no Instagram → DM)"
        actions={
          <button
            onClick={() => router.push('/automations/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <Plus className="h-4 w-4" />
            Nova automação
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={stats?.total ?? '—'}
          icon={<Zap className="h-4 w-4" />}
        />
        <StatCard
          label="Ativas"
          value={stats?.active ?? '—'}
          icon={<Power className="h-4 w-4" />}
        />
        <StatCard
          label="Inativas"
          value={stats?.inactive ?? '—'}
          icon={<PowerOff className="h-4 w-4" />}
        />
        <StatCard
          label="Execuções"
          value={stats?.totalExecutions ?? '—'}
          icon={<Hash className="h-4 w-4" />}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {listQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando automações...
          </div>
        ) : automations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <Zap className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Nenhuma automação ainda
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Comece criando sua primeira automação
              </p>
            </div>
            <button
              onClick={() => router.push('/automations/new')}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Nova automação
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {automations.map((a) => {
              const cfg = a.config as Record<string, unknown>;
              const keywords =
                Array.isArray(cfg?.keywords) && cfg.keywords.length
                  ? (cfg.keywords as string[]).join(', ')
                  : null;
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600">
                    <Instagram className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {a.name}
                      </span>
                      <span
                        className={
                          'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ' +
                          (a.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300')
                        }
                      >
                        {a.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        · {AUTOMATION_TYPE_LABEL[a.type]}
                      </span>
                    </div>
                    {a.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {a.description}
                      </p>
                    )}
                    {keywords && (
                      <p className="mt-1 text-xs text-zinc-500">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Palavras-chave:
                        </span>{' '}
                        {keywords}
                      </p>
                    )}
                    {typeof cfg?.dmMessage === 'string' && (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        <MessageCircle className="mr-1 inline h-3 w-3" />
                        {cfg.dmMessage as string}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {a.executionsCount} execuções
                      {a.lastExecutedAt
                        ? ' · última: ' +
                          new Date(a.lastExecutedAt).toLocaleString('pt-BR')
                        : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/automations/builder/${a.id}`)}
                    className="text-zinc-400 hover:text-blue-600"
                    title="Abrir construtor visual"
                  >
                    <GitBranch className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(a)}
                    className="text-zinc-400 hover:text-emerald-600"
                    title={a.isActive ? 'Desativar' : 'Ativar'}
                  >
                    {a.isActive ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="text-zinc-400 hover:text-red-500"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Atenção · backbone deployed.</strong> A integração webhook Meta
        → execução automática da DM ainda não está plugada. Tu pode configurar
        as automações aqui pra estruturar o fluxo · a execução viva entra na
        próxima iteração.
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
