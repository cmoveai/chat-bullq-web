'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  Loader2,
  Trash2,
  Flag,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  tasksService,
  type Task,
  type TaskStatus,
  type TaskPriority,
  TASK_STATUS_LABEL,
  TASK_STATUS_COLOR,
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_COLOR,
} from '@/features/tasks/services/tasks.service';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSelect } from '@/components/ui/filter-select';

export default function TasksPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const statsQuery = useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => tasksService.stats(),
    refetchInterval: 30_000,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'list', { search, statusFilter, priorityFilter }],
    queryFn: () =>
      tasksService.list({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: () => {
      toast.success('Tarefa removida');
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) =>
      tasksService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Defensive: garante que tasks é sempre array
  const rawTasks = tasksQuery.data;
  const tasks: Task[] = Array.isArray(rawTasks) ? rawTasks : [];
  const stats = statsQuery.data;

  const handleToggleDone = (t: Task) => {
    const next: TaskStatus = t.status === 'DONE' ? 'TODO' : 'DONE';
    updateMutation.mutate({ id: t.id, input: { status: next } });
  };

  const handleDelete = (t: Task) => {
    if (!confirm(`Excluir a tarefa "${t.title}"?`)) return;
    deleteMutation.mutate(t.id);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={CheckSquare}
        title="Tarefas"
        description="Gerencie todas as suas tarefas e acompanhe o progresso"
        actions={
          <button
            onClick={() => router.push('/tasks/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <Plus className="h-4 w-4" />
            Nova tarefa
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats?.total ?? '—'} icon={<CheckSquare className="h-4 w-4" />} />
        <StatCard label="A fazer" value={stats?.todo ?? '—'} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Em andamento" value={stats?.inProgress ?? '—'} icon={<Loader2 className="h-4 w-4" />} />
        <StatCard label="Atrasadas" value={stats?.overdue ?? '—'} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <FilterSelect
          icon={Clock}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Todos os Status"
          options={(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => ({
            value: s,
            label: TASK_STATUS_LABEL[s],
          }))}
        />
        <FilterSelect
          icon={Flag}
          value={priorityFilter}
          onChange={setPriorityFilter}
          placeholder="Todas as Prioridades"
          options={(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => ({
            value: p,
            label: TASK_PRIORITY_LABEL[p],
          }))}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {tasksQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando tarefas...
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState onCreate={() => router.push('/tasks/new')} />
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <input
                  type="checkbox"
                  checked={t.status === 'DONE'}
                  onChange={() => handleToggleDone(t)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={t.status === 'DONE' ? 'text-sm font-medium line-through text-zinc-400' : 'text-sm font-medium text-zinc-900 dark:text-zinc-100'}>
                      {t.title}
                    </span>
                    <span className={'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ' + TASK_STATUS_COLOR[t.status]}>
                      {TASK_STATUS_LABEL[t.status]}
                    </span>
                    <span className={'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ' + TASK_PRIORITY_COLOR[t.priority]}>
                      {TASK_PRIORITY_LABEL[t.priority]}
                    </span>
                  </div>
                  {t.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{t.description}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(t)} className="text-zinc-400 hover:text-red-500" title="Excluir tarefa">
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

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
        <CheckSquare className="h-6 w-6 text-zinc-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Nenhuma tarefa encontrada</p>
        <p className="mt-1 text-xs text-zinc-500">Comece criando sua primeira tarefa</p>
      </div>
      <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
        <Plus className="h-4 w-4" />
        Nova tarefa
      </button>
    </div>
  );
}

