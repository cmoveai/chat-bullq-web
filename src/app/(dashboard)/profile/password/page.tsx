'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Save, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';

export default function ProfilePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = () => {
    if (!password || password !== confirm) {
      toast.error('Senhas não conferem');
      return;
    }
    if (password.length < 8) {
      toast.error('Senha precisa ter no mínimo 8 caracteres');
      return;
    }
    toast('Em breve · feature em construção', {
      description:
        'Endpoint /users/me/password será publicado na próxima iteração.',
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        icon={Lock}
        title="Definir Senha"
        description="Crie uma nova senha para sua conta"
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Lock className="h-4 w-4 text-violet-600" />
          Configuração de Senha
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Defina uma senha forte para proteger sua conta
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <Lock className="h-3.5 w-3.5 text-violet-600" />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>Sua senha não pode ser muito parecida com o resto das suas informações pessoais.</li>
              <li>Sua senha precisa conter pelo menos 8 caracteres.</li>
              <li>Sua senha não pode ser uma senha comumente utilizada.</li>
              <li>Sua senha não pode ser inteiramente numérica.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <Lock className="h-3.5 w-3.5 text-violet-600" />
              Senha (novamente)
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirme sua nova senha"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
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
              Definir Senha
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/40 dark:bg-blue-900/10">
        <h2 className="flex items-center gap-2 text-base font-semibold text-blue-700 dark:text-blue-300">
          <Shield className="h-4 w-4" />
          Dicas de Segurança da Senha
        </h2>
        <p className="mt-1 text-xs text-blue-600 dark:text-blue-300/80">
          Crie uma Senha Forte:
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
          {[
            'Use pelo menos 8 caracteres',
            'Inclua letras maiúsculas e minúsculas',
            'Adicione números e caracteres especiais',
            'Evite usar informações pessoais',
            'Não reutilize senhas de outras contas',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
