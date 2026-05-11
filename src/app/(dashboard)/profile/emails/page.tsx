'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Star, Send, Trash2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileEmailsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleAdd = () => {
    toast('Em breve · feature em construção', {
      description:
        'Endpoint /users/me/emails será publicado na próxima iteração.',
    });
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        icon={Mail}
        title="Configurações de Email"
        description="Gerencie seus endereços de email e preferências de email"
        actions={
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        }
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Mail className="h-4 w-4 text-violet-600" />
          Endereços de Email
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Os seguintes endereços de email estão associados à sua conta:
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
            <input
              type="radio"
              checked
              readOnly
              className="h-4 w-4 accent-violet-600"
            />
            <span className="flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user?.email ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle className="h-3 w-3" />
              Verificado
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              <Star className="h-3 w-3" />
              Principal
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white opacity-60"
          >
            <Star className="h-4 w-4" />
            Tornar Principal
          </button>
          <button
            type="button"
            onClick={() =>
              toast('Em breve', {
                description: 'Reenvio de verificação na próxima iteração',
              })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Send className="h-4 w-4" />
            Reenviar Verificação
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 opacity-60 dark:border-red-900/40 dark:bg-zinc-800 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Plus className="h-4 w-4 text-violet-600" />
          Adicionar Endereço de Email
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Adicione um novo endereço de email à sua conta
        </p>

        {adding ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                <Mail className="h-3.5 w-3.5 text-violet-600" />
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Endereço de email"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
              >
                <Plus className="h-4 w-4" />
                Adicionar Email
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4" />
            Adicionar Email
          </button>
        )}
      </section>
    </div>
  );
}
