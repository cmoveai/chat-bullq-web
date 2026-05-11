'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowDown,
  Minus,
  ArrowUp,
  AlertCircle,
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Save,
  Calendar,
  User as UserIcon,
  Briefcase,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  tasksService,
  type TaskStatus,
  type TaskPriority,
} from '@/features/tasks/services/tasks.service';
import { contactsService } from '@/features/contacts/services/contacts.service';
import { membersService } from '@/features/settings/services/members.service';

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'LOW', label: 'Baixa', icon: ArrowDown },
  { value: 'MEDIUM', label: 'Média', icon: Minus },
  { value: 'HIGH', label: 'Alta', icon: ArrowUp },
  { value: 'URGENT', label: 'Urgente', icon: AlertCircle },
];

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'TODO', label: 'A Fazer', icon: Circle },
  { value: 'IN_PROGRESS', label: 'Em Andamento', icon: Loader2 },
  { value: 'DONE', label: 'Concluída', icon: CheckCircle2 },
  { value: 'CANCELLED', label: 'Cancelada', icon: XCircle },
];

export default function NewTaskPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactId, setContactId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [saving, setSaving] = useState(false);

  // data fetches pros dropdowns
  const contactsQuery = useQuery({
    queryKey: ['contacts', 'list-for-task'],
    queryFn: () => contactsService.list({ limit: '100' }),
  });
  const membersQuery = useQuery({
    queryKey: ['members', 'list-for-task'],
    queryFn: () => membersService.list(),
  });

  const rawContacts = contactsQuery.data?.contacts;
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];
  const rawMembers = membersQuery.data;
  const members = Array.isArray(rawMembers) ? rawMembers : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    setSaving(true);
    try {
      await tasksService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        contactId: contactId || undefined,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate || undefined,
      });
      toast.success('Tarefa criada');
      router.push('/tasks');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar tarefa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Criar Nova Tarefa</h1>
              <p className="mt-0.5 text-sm text-white/80">
                Preencha os detalhes para criar uma nova tarefa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/tasks')}
            className="inline-flex items-center gap-2 rounded-md bg-white/95 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Tarefas
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-auto bg-zinc-50 p-6 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Card · Detalhes */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <FileText className="h-4 w-4 text-emerald-600" />
              Detalhes da Tarefa
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Preencha as informações abaixo para criar sua tarefa
            </p>

            <div className="mt-5 space-y-5">
              {/* Título */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="text-emerald-600">●</span> Título{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Insira o título da tarefa"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  Descrição{' '}
                  <span className="text-xs font-normal text-zinc-500">
                    (opcional)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insira a descrição da tarefa"
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Contato + Oferta */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Contato
                  </label>
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">Selecione um contato</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.phone || c.email || c.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                    Oferta
                  </label>
                  <select
                    disabled
                    className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50"
                  >
                    <option>Em breve · módulo de Ofertas</option>
                  </select>
                </div>
              </div>

              {/* Atribuído + Data */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Atribuído A
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">Selecione um usuário</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.userId}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    Data de vencimento
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Prioridade · 4 cards */}
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-zinc-500" />
                  Prioridade <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = priority === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setPriority(opt.value)}
                        className={
                          selected
                            ? 'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-3 py-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-zinc-200 bg-white px-3 py-3 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status · 4 cards */}
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <CheckSquare className="h-3.5 w-3.5 text-zinc-500" />
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = status === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={
                          selected
                            ? 'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-3 py-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-zinc-200 bg-white px-3 py-3 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Footer botões */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/tasks')}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
