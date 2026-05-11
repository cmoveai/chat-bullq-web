'use client';

import { useQuery } from '@tanstack/react-query';
import { User, Info, Mail, Calendar, Bot, Zap, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';
import { automationsService } from '@/features/automations/services/automations.service';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: agents = [] } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: () => aiAgentsService.list(),
    staleTime: 60_000,
  });

  const { data: automations = [] } = useQuery({
    queryKey: ['automations'],
    queryFn: () => automationsService.list(),
    staleTime: 60_000,
  });

  // user.createdAt não vem do /auth/me hoje; usamos placeholder até o backend
  // adicionar o campo (Pack D backend, próxima iteração).
  const memberSinceYear = new Date().getFullYear();
  const memberSinceFull = 'Em breve';

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-bold ring-1 ring-white/20 backdrop-blur-sm">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'CM'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{user?.name ?? '—'}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/80">
              <Mail className="h-3.5 w-3.5" />
              {user?.email ?? '—'}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Info className="h-4 w-4 text-violet-600" />
          Informações do Perfil
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome" value={user?.name ?? '—'} />
          <Field label="Email" value={user?.email ?? '—'} />
          <Field label="Idioma" value="Português" />
          <Field label="Membro Desde" value={memberSinceFull} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Membro Desde"
          value={memberSinceYear}
          icon={<Calendar className="h-4 w-4" />}
        />
        <Stat
          label="Agentes de IA"
          value={agents.length}
          icon={<Bot className="h-4 w-4" />}
        />
        <Stat
          label="Automações"
          value={automations.length}
          icon={<Zap className="h-4 w-4" />}
        />
        <Stat
          label="Ativo Por"
          value="Sessão atual"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
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
      <div className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  );
}

void User;
