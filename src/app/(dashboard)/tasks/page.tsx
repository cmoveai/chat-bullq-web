'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  Loader2,
  Trash2,
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

export default function TasksPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const statsQuery = useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => tasksService.stats(),
    refetchInterval: 30_000,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'list'],
    queryFn: () => tasksService.list({}),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            <CheckSquare className="h-5 w-5 text-primary" />
            Tarefas
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Gerencie todas as suas tarefas e acompanhe o progresso da equipe.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats?.total ?? '—'} icon={<CheckSquare className="h-4 w-4" />} />
        <StatCard label="A fazer" value={stats?.todo ?? '—'} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Em andamento" value={stats?.inProgress ?? '—'} icon={<Loader2 className="h-4 w-4" />} />
        <StatCard label="Atrasadas" value={stats?.overdue ?? '—'} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {tasksQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando tarefas...
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState onCreate={() => setCreating(true)} />
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

      {creating && (
        <CreateTaskDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            qc.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}
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

function CreateTaskDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await tasksService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      toast.success('Tarefa criada');
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Nova tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Título *</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Responder proposta" required className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Prazo</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !title.trim()} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {saving ? 'Criando...' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
