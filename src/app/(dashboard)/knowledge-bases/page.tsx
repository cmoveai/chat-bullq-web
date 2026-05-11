'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  Type as TypeIcon,
  FileText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  knowledgeBasesService,
  type KnowledgeBase,
  formatBytes,
} from '@/features/knowledge-bases/services/knowledge-bases.service';
import { PageHeader } from '@/components/ui/page-header';

type Mode = 'list' | 'create-text' | 'create-upload';

export default function KnowledgeBasesPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>('list');

  const listQuery = useQuery({
    queryKey: ['knowledge-bases', 'list'],
    queryFn: () => knowledgeBasesService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeBasesService.remove(id),
    onSuccess: () => {
      toast.success('Base removida');
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Erro ao remover'),
  });

  const items: KnowledgeBase[] = Array.isArray(listQuery.data)
    ? listQuery.data
    : [];

  const handleDelete = (kb: KnowledgeBase) => {
    if (!confirm(`Excluir a base "${kb.name}"?`)) return;
    deleteMutation.mutate(kb.id);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={BookOpen}
        title="Bases de Conhecimento"
        description="Documentos e textos que seus agentes consultam pra responder clientes"
        actions={
          <>
            <button
              onClick={() => setMode('create-text')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <TypeIcon className="h-4 w-4" />
              Texto livre
            </button>
            <button
              onClick={() => setMode('create-upload')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              <Upload className="h-4 w-4" />
              Upload arquivo
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {listQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            Carregando bases...
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <BookOpen className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Nenhuma base de conhecimento ainda
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Faça upload de PDF/DOCX/TXT ou adicione texto direto
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('create-text')}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <TypeIcon className="h-4 w-4" />
                Texto livre
              </button>
              <button
                onClick={() => setMode('create-upload')}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((kb) => (
              <li
                key={kb.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600">
                  {kb.sourceType === 'UPLOAD' ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <TypeIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {kb.name}
                    </span>
                    <span className="rounded-md bg-zinc-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      {kb.sourceType === 'UPLOAD' ? 'Arquivo' : 'Texto'}
                    </span>
                    {kb._count?.agentLinks ? (
                      <span className="rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                        {kb._count.agentLinks} agente
                        {kb._count.agentLinks > 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </div>
                  {kb.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {kb.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {kb.sourceType === 'UPLOAD' && kb.sourceFilename
                      ? `${kb.sourceFilename} · ${formatBytes(kb.sourceSizeBytes)}`
                      : 'Texto livre'}
                    {' · '}
                    {new Date(kb.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(kb)}
                  className="text-zinc-400 hover:text-red-500"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mode === 'create-text' && (
        <CreateTextDialog onClose={() => setMode('list')} />
      )}
      {mode === 'create-upload' && (
        <UploadDialog onClose={() => setMode('list')} />
      )}
    </div>
  );
}

function CreateTextDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Nome e conteúdo são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await knowledgeBasesService.createText({
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
      });
      toast.success('Base criada');
      await qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar base');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <TypeIcon className="h-5 w-5 text-emerald-600" />
            Nova base · texto livre
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome *
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: FAQ Atendimento"
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
              placeholder="Pra que esta base serve"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Conteúdo *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole aqui FAQs, regras, scripts, informações de produtos..."
              rows={12}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Limite: 200.000 caracteres (~50k tokens)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !content.trim()}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Criando...' : 'Criar base'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Escolha um arquivo');
      return;
    }
    setSaving(true);
    try {
      await knowledgeBasesService.upload(
        file,
        name.trim() || undefined,
        description.trim() || undefined,
      );
      toast.success('Base criada via upload');
      await qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Erro no upload');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Upload className="h-5 w-5 text-emerald-600" />
            Nova base · upload arquivo
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Arquivo *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f && !name) setName(f.name.replace(/\.[^.]+$/, ''));
              }}
              required
              className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700 dark:text-zinc-300"
            />
            <p className="mt-1 text-xs text-zinc-500">
              PDF, DOCX, TXT, MD, CSV · máx 10MB
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Auto-preenche pelo nome do arquivo"
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
              placeholder="Pra que esta base serve"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !file}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Enviando...' : 'Criar base'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
