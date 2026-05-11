'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  Save,
  Calendar,
  User as UserIcon,
  Tag as TagIcon,
  FileText,
  DollarSign,
  KanbanSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { offersService } from '@/features/offers/services/offers.service';
import { pipelinesService } from '@/features/pipelines/services/pipelines.service';
import { contactsService } from '@/features/contacts/services/contacts.service';
import { membersService } from '@/features/settings/services/members.service';

export default function NewOfferPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [contactId, setContactId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [value, setValue] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [saving, setSaving] = useState(false);

  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesService.list(),
  });
  const contactsQuery = useQuery({
    queryKey: ['contacts', 'list-for-offer'],
    queryFn: () => contactsService.list({ limit: '100' }),
  });
  const membersQuery = useQuery({
    queryKey: ['members', 'list-for-offer'],
    queryFn: () => membersService.list(),
  });

  const pipelines = Array.isArray(pipelinesQuery.data) ? pipelinesQuery.data : [];
  const contacts = Array.isArray(contactsQuery.data?.contacts)
    ? contactsQuery.data!.contacts
    : [];
  const members = Array.isArray(membersQuery.data) ? membersQuery.data : [];

  // Auto-pick default pipeline + first stage
  useEffect(() => {
    if (!pipelineId && pipelines.length > 0) {
      const def = pipelines.find((p) => p.isDefault) ?? pipelines[0];
      setPipelineId(def.id);
      if (def.stages && def.stages.length > 0) {
        setStageId(def.stages[0].id);
      }
    }
  }, [pipelineId, pipelines]);

  // When pipeline changes, reset stage to its first
  useEffect(() => {
    if (!pipelineId) return;
    const p = pipelines.find((pp) => pp.id === pipelineId);
    if (p && p.stages && p.stages.length > 0) {
      const stillValid = p.stages.find((s) => s.id === stageId);
      if (!stillValid) setStageId(p.stages[0].id);
    }
  }, [pipelineId, pipelines, stageId]);

  const currentPipeline = pipelines.find((p) => p.id === pipelineId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!pipelineId) {
      toast.error('Escolha um pipeline');
      return;
    }
    setSaving(true);
    try {
      await offersService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        pipelineId,
        stageId: stageId || undefined,
        contactId: contactId || undefined,
        assignedToId: assignedToId || undefined,
        value: value ? parseFloat(value) : undefined,
        expectedCloseDate: expectedCloseDate || undefined,
      });
      toast.success('Oferta criada');
      await qc.invalidateQueries({ queryKey: ['offers'] });
      router.push('/offers');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar oferta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Criar Nova Oferta</h1>
              <p className="mt-0.5 text-sm text-white/80">
                Preencha os detalhes para criar uma nova oferta/negócio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/offers')}
            className="inline-flex items-center gap-2 rounded-md bg-white/95 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Ofertas
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-50 p-6 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <FileText className="h-4 w-4 text-emerald-600" />
              Detalhes da Oferta
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Preencha as informações abaixo para criar sua oferta
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <TagIcon className="h-3.5 w-3.5 text-zinc-500" />
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Insira o título da oferta"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

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
                  placeholder="Insira a descrição da oferta"
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <KanbanSquare className="h-3.5 w-3.5 text-zinc-500" />
                    Pipeline <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pipelineId}
                    onChange={(e) => setPipelineId(e.target.value)}
                    required
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">Selecione um pipeline</option>
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.isDefault ? ' · padrão' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <TagIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Estágio
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    disabled={!currentPipeline}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
                  >
                    {currentPipeline?.stages?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    )) ?? <option value="">Escolha pipeline primeiro</option>}
                  </select>
                </div>
              </div>

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
                    {contacts.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.phone || c.email || c.id}
                      </option>
                    ))}
                  </select>
                </div>
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
                    {members.map((m: any) => (
                      <option key={m.id} value={m.userId}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0,00"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    Data Prevista de Fechamento
                  </label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/offers')}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !pipelineId}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Criando...' : 'Criar Oferta'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
