'use client';

import { useState } from 'react';
import { Magnet, Plus, CheckCircle, Users, Clock, Search, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSelect } from '@/components/ui/filter-select';

export default function LeadCapturesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');

  const handleCreate = () => {
    toast('Em breve · feature em construção', {
      description: 'A criação de páginas de captura estará disponível na próxima atualização',
    });
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Magnet}
        title="Capturas de Leads"
        description="Crie e gerencie suas páginas de captura de leads"
        actions={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <Plus className="h-4 w-4" />
            Criar Captura de Leads
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Páginas" value={0} icon={<Magnet className="h-4 w-4" />} />
        <StatCard label="Ativo" value={0} icon={<CheckCircle className="h-4 w-4" />} />
        <StatCard label="Total de Capturas" value={0} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Hoje" value={0} icon={<Clock className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por título, slug ou descrição..."
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
          options={[
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' },
          ]}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
          <Magnet className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Nenhuma captura de leads ainda
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Crie sua primeira captura de leads para começar a capturar leads.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <Plus className="h-4 w-4" />
          Crie sua primeira captura de leads
        </button>
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
  value: number;
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
