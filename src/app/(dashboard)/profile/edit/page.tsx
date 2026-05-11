'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, ArrowLeft, Save, User, Languages, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { useAuthStore } from '@/stores/auth-store';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [language, setLanguage] = useState('pt');

  const handleSave = () => {
    toast('Edição em breve', {
      description: 'O endpoint PATCH /users/me será publicado na próxima iteração.',
    });
  };

  const handleResetTutorial = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tutorial-completed');
      toast.success('Tutorial reiniciado');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        icon={Edit3}
        title="Editar Perfil"
        description="Mantenha suas informações de perfil atualizadas"
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
          <User className="h-4 w-4 text-violet-600" />
          Informações Pessoais
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Atualize seus dados pessoais
        </p>

        <div className="mt-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-2xl font-bold text-white">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'CM'}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Foto do perfil em breve
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <User className="h-3.5 w-3.5 text-violet-600" />
              Nome Completo
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <Languages className="h-3.5 w-3.5 text-violet-600" />
              Idioma
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <GraduationCap className="h-4 w-4 text-violet-600" />
          Configurações do Tutorial
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Gerencie suas preferências do tutorial de integração
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-200 p-6 text-center dark:border-zinc-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Reinicie o tutorial da plataforma desde o início
          </p>
          <p className="max-w-md text-xs text-zinc-500">
            Clique no botão abaixo para reiniciar o tutorial de integração desde
            o início. Isso ajudará você a aprender todos os recursos da
            plataforma novamente.
          </p>
          <button
            type="button"
            onClick={handleResetTutorial}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            Resetar Tutorial
          </button>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
        >
          <Save className="h-4 w-4" />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
