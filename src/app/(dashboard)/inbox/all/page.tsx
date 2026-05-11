'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  MessageCircle,
  CheckCircle,
  Clock,
  User,
  Search,
  Activity,
  Headset,
  MessagesSquare,
} from 'lucide-react';
import { inboxService } from '@/features/inbox/services/inbox.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSelect } from '@/components/ui/filter-select';

type StatusFilter = 'PENDING' | 'BOT' | 'OPEN' | 'WAITING' | 'CLOSED' | '';
type ControlFilter = 'human' | 'ai' | '';

const STATUS_LABEL: Record<Exclude<StatusFilter, ''>, string> = {
  PENDING: 'Pendente',
  BOT: 'Bot',
  OPEN: 'Aberto',
  WAITING: 'Aguardando',
  CLOSED: 'Resolvido',
};

export default function AllConversationsPage() {
  const orgId = useOrgId();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [controlFilter, setControlFilter] = useState<ControlFilter>('');

  const statsQuery = useQuery({
    queryKey: ['conversations', orgId, 'stats'],
    queryFn: () => inboxService.getStats(),
    refetchInterval: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ['conversations', orgId, 'all', { search, statusFilter, controlFilter }],
    queryFn: () =>
      inboxService.getConversations({
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        limit: '30',
      }),
  });

  const conversations = (listQuery.data?.conversations ?? []).filter((c) => {
    if (controlFilter === 'human') return !!c.assignedToId;
    if (controlFilter === 'ai') return !c.assignedToId;
    return true;
  });
  const stats = statsQuery.data;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={History}
        title="Todas as Conversas"
        description="Histórico completo de todos os atendimentos e conversas"
        actions={
          <Link
            href="/inbox"
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <MessagesSquare className="h-4 w-4" />
            Chat Ativo
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Conversas"
          value={stats?.total ?? '—'}
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Resolvido"
          value={stats?.resolved ?? '—'}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Ativo"
          value={stats?.active ?? '—'}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Controlado por Humano"
          value={stats?.humanControlled ?? '—'}
          icon={<User className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <FilterSelect
          icon={Activity}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Todos os Status"
          options={(Object.keys(STATUS_LABEL) as Array<keyof typeof STATUS_LABEL>).map(
            (s) => ({ value: s, label: STATUS_LABEL[s] }),
          )}
        />
        <FilterSelect
          icon={Headset}
          value={controlFilter}
          onChange={setControlFilter}
          placeholder="Todo Controle"
          options={[
            { value: 'human', label: 'Controlado por Humano' },
            { value: 'ai', label: 'Controlado por IA' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {listQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando conversas...
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <ConversationsTable conversations={conversations} />
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
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
        <MessageCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nenhum atendimento encontrado
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Nenhum atendimento corresponde aos seus filtros atuais.
        </p>
      </div>
    </div>
  );
}

function ConversationsTable({
  conversations,
}: {
  conversations: import('@/features/inbox/services/inbox.service').Conversation[];
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full table-fixed">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Contato
            </th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Protocolo
            </th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Atribuído
            </th>
            <th className="w-[20%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Última msg
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {conversations.map((c) => (
            <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="truncate px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                <Link
                  href={`/inbox?conversation=${c.id}`}
                  className="hover:text-violet-600 hover:underline"
                >
                  {c.contact?.name || c.contact?.phone || 'Sem nome'}
                </Link>
              </td>
              <td className="truncate px-4 py-3 text-xs font-mono text-zinc-500">
                {c.protocol || '—'}
              </td>
              <td className="px-4 py-3 text-xs">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {STATUS_LABEL[c.status as keyof typeof STATUS_LABEL] ?? c.status}
                </span>
              </td>
              <td className="truncate px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                {c.assignedTo?.name ?? (
                  <span className="text-zinc-400">IA / Não atribuído</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-xs text-zinc-500">
                {c.lastMessageAt
                  ? new Date(c.lastMessageAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
