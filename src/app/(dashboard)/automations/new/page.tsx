'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Instagram,
  MessageCircle,
  Hash,
  Type as TypeIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { automationsService } from '@/features/automations/services/automations.service';
import { PageHeader } from '@/components/ui/page-header';

export default function NewAutomationPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [dmMessage, setDmMessage] = useState('');
  const [replyToComment, setReplyToComment] = useState('');
  const [postId, setPostId] = useState('');
  const [onlyFirstTime, setOnlyFirstTime] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dê um nome à automação');
      return;
    }
    const kws = keywords
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (kws.length === 0) {
      toast.error('Adicione pelo menos 1 palavra-chave');
      return;
    }
    if (!dmMessage.trim()) {
      toast.error('Escreva a mensagem DM');
      return;
    }

    setSaving(true);
    try {
      await automationsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        type: 'INSTAGRAM_DM_FROM_COMMENT',
        isActive,
        config: {
          keywords: kws,
          matchMode,
          dmMessage: dmMessage.trim(),
          replyToComment: replyToComment.trim() || undefined,
          postId: postId.trim() || undefined,
          onlyFirstTime,
        },
      });
      toast.success('Automação criada');
      await qc.invalidateQueries({ queryKey: ['automations'] });
      router.push('/automations');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar automação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="px-6 pt-6">
        <PageHeader
          icon={Instagram}
          title="Nova automação · Instagram DM por comentário"
          description="Quando alguém comentar com uma palavra-chave, mande DM automaticamente"
          actions={
            <button
              type="button"
              onClick={() => router.push('/automations')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          }
        />
      </div>

      <div className="flex-1 overflow-auto bg-zinc-50 p-6 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Detalhes */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <TypeIcon className="h-4 w-4 text-emerald-600" />
              Detalhes
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nome da automação *
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Captação Reels Workshop"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Descrição (opcional)
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito da automação"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                Ativar imediatamente após criar
              </label>
            </div>
          </section>

          {/* Gatilho */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <Hash className="h-4 w-4 text-emerald-600" />
              Gatilho · palavra-chave no comentário
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Palavras-chave * (uma por linha ou separadas por vírgula)
                </label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="EU QUERO&#10;QUERO SABER MAIS&#10;LINK"
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Case-insensitive · acentos contam como letras diferentes.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Modo de match
                </label>
                <select
                  value={matchMode}
                  onChange={(e) =>
                    setMatchMode(e.target.value as 'any' | 'all')
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="any">Qualquer palavra-chave bate</option>
                  <option value="all">Todas devem aparecer juntas</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Post específico (opcional · vazio = todos os posts)
                </label>
                <input
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  placeholder="ID do post Instagram"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </section>

          {/* Ação */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Ação · enviar DM
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Mensagem da DM *
                </label>
                <textarea
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  placeholder="Oi! Aqui está o link prometido: https://..."
                  rows={4}
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Resposta pública ao comentário (opcional)
                </label>
                <input
                  value={replyToComment}
                  onChange={(e) => setReplyToComment(e.target.value)}
                  placeholder="Ex: Já te mandei no privado!"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={onlyFirstTime}
                  onChange={(e) => setOnlyFirstTime(e.target.checked)}
                  className="h-4 w-4"
                />
                Só envia DM da primeira vez pra cada pessoa (evita spam)
              </label>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/automations')}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Criando...' : 'Criar Automação'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
