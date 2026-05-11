'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Contact,
  Users,
  Mail,
  Phone,
  Clock,
  Download,
  Tag,
  Sliders,
  Search,
  ExternalLink,
} from 'lucide-react';
import { contactsService } from '@/features/contacts/services/contacts.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { PageHeader } from '@/components/ui/page-header';

export default function ContactsPage() {
  const orgId = useOrgId();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ['contacts', orgId, 'stats'],
    queryFn: () => contactsService.stats(),
    refetchInterval: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ['contacts', orgId, 'list', search, page],
    queryFn: () =>
      contactsService.list({ search, page: String(page), limit: '20' }),
  });

  const contacts = listQuery.data?.contacts ?? [];
  const pagination = listQuery.data?.pagination;
  const stats = statsQuery.data;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Contact}
        title="Contatos"
        description="Gerencie todos os seus contatos em um só lugar"
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20">
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <Link
              href="/settings/tags"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <Tag className="h-4 w-4" />
              Etiquetas
            </Link>
            <Link
              href="/settings/custom-fields"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              <Sliders className="h-4 w-4" />
              Campos
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Contatos"
          value={stats?.total ?? '—'}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Com Email"
          value={stats?.withEmail ?? '—'}
          icon={<Mail className="h-4 w-4" />}
        />
        <StatCard
          label="Com Telefone"
          value={stats?.withPhone ?? '—'}
          icon={<Phone className="h-4 w-4" />}
        />
        <StatCard
          label="Hoje"
          value={stats?.today ?? '—'}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {listQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando contatos...
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState />
        ) : (
          <ContactsTable contacts={contacts} />
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            {pagination.total} contato{pagination.total === 1 ? '' : 's'} · página{' '}
            {pagination.page} de {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
            >
              Anterior
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
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
        <Contact className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nenhum contato encontrado
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Nenhum contato corresponde à sua busca atual.
        </p>
      </div>
    </div>
  );
}

function ContactsTable({
  contacts,
}: {
  contacts: import('@/features/contacts/services/contacts.service').Contact[];
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full table-fixed">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Contato
            </th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Telefone
            </th>
            <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Email
            </th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tags
            </th>
            <th className="w-[10%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {contacts.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="truncate px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                {c.name || <span className="text-zinc-400">Sem nome</span>}
              </td>
              <td className="truncate px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                {c.phone || '—'}
              </td>
              <td className="truncate px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                {c.email || '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <span
                      key={t.tag.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${t.tag.color}20`,
                        color: t.tag.color,
                      }}
                    >
                      {t.tag.name}
                    </span>
                  ))}
                  {c.tags.length > 3 && (
                    <span className="text-[10px] text-zinc-400">
                      +{c.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/settings/contacts`}
                  className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline dark:text-violet-400"
                >
                  Detalhes
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
