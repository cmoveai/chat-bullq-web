'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  pipelinesService,
  type CardSummary,
} from '../services/pipelines.service';

interface Props {
  open: boolean;
  pipelineId: string;
  card: CardSummary | null;
  stageId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CardDialog({
  open,
  pipelineId,
  card,
  stageId,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatingCobranca, setCreatingCobranca] = useState(false);
  const [cobrancaPanel, setCobrancaPanel] = useState(false);
  const [cobrancaVencimento, setCobrancaVencimento] = useState('');
  const [cobrancaValor, setCobrancaValor] = useState('');
  const [cobrancaRecorrente, setCobrancaRecorrente] = useState(false);
  const [cobrancaRecorrenciaDias, setCobrancaRecorrenciaDias] = useState('30');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? '');
      setValue(card.value ? String(card.value) : '');
      setClosedReason(card.closedReason ?? '');
      setCobrancaValor(card.value ? String(card.value) : '');
    } else {
      setTitle('');
      setDescription('');
      setValue('');
      setClosedReason('');
      setCobrancaValor('');
    }
    const def = new Date();
    def.setDate(def.getDate() + 7);
    setCobrancaVencimento(def.toISOString().slice(0, 10));
    setCobrancaPanel(false);
    setCobrancaRecorrente(false);
    setCobrancaRecorrenciaDias('30');
  }, [card, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const numericValue = value ? parseFloat(value.replace(',', '.')) : undefined;
      if (card) {
        await pipelinesService.updateCard(card.id, {
          title: title.trim(),
          description: description || null,
          value: numericValue as any,
          closedReason: closedReason || undefined,
        } as any);
      } else {
        await pipelinesService.createCard(pipelineId, {
          title: title.trim(),
          description: description || undefined,
          value: numericValue,
          stageId: stageId ?? undefined,
        });
      }
      toast.success(card ? 'Card atualizado' : 'Card criado');
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCobranca = async () => {
    if (!card) return;
    if (!cobrancaValor || parseFloat(cobrancaValor.replace(',', '.')) <= 0) {
      toast.error('Valor obrigatório');
      return;
    }
    if (!cobrancaVencimento) {
      toast.error('Vencimento obrigatório');
      return;
    }
    setCreatingCobranca(true);
    try {
      const result = await pipelinesService.createCobrancaFromCard(card.id, {
        valor: parseFloat(cobrancaValor.replace(',', '.')),
        vencimento: cobrancaVencimento,
        recorrente: cobrancaRecorrente,
        recorrenciaDias: cobrancaRecorrente
          ? parseInt(cobrancaRecorrenciaDias, 10) || 30
          : undefined,
      });
      toast.success('Cobrança gerada · WhatsApp será disparado se cliente tiver telefone', {
        description: `slug: ${result.slug}`,
        action: {
          label: 'Ver cobrança',
          onClick: () =>
            window.open(`${window.location.origin}/pagar/${result.slug}`, '_blank'),
        },
        duration: 12000,
      });
      setCobrancaPanel(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao gerar cobrança');
    } finally {
      setCreatingCobranca(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    if (!confirm(`Excluir card "${card.title}"?`)) return;
    setSaving(true);
    try {
      await pipelinesService.removeCard(card.id);
      toast.success('Card removido');
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao excluir');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {card ? 'Editar card' : 'Novo card'}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Lead CMOVE.AI"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Descrição
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="contexto, próximos passos, info coletada…"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Valor (R$)
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ex: 4500"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              inputMode="decimal"
            />
          </div>

          {card && card.status !== 'OPEN' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Motivo do fechamento
              </label>
              <input
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
                placeholder={
                  card.status === 'WON'
                    ? 'ex: assinou contrato 12 meses'
                    : 'ex: optou por concorrente'
                }
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          )}

          {card?.contact && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500">Contato</p>
              <p className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                {card.contact.name || card.contact.phone}
              </p>
            </div>
          )}

          {card && (
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setCobrancaPanel((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Gerar cobrança Pix
                  </span>
                  {card.status === 'WON' && (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-300 dark:border-emerald-800 rounded px-1.5 py-0.5">
                      sugerido
                    </span>
                  )}
                </span>
                <span className="text-xs text-zinc-500">
                  {cobrancaPanel ? 'fechar' : 'abrir'}
                </span>
              </button>
              {cobrancaPanel && (
                <div className="p-3 space-y-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-500">
                        Valor (R$)
                      </label>
                      <input
                        value={cobrancaValor}
                        onChange={(e) => setCobrancaValor(e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-500">
                        Vencimento
                      </label>
                      <input
                        type="date"
                        value={cobrancaVencimento}
                        onChange={(e) => setCobrancaVencimento(e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={cobrancaRecorrente}
                      onChange={(e) => setCobrancaRecorrente(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      Recorrente · sistema agenda próxima a cada{' '}
                      <input
                        type="number"
                        min={1}
                        max={365}
                        disabled={!cobrancaRecorrente}
                        value={cobrancaRecorrenciaDias}
                        onChange={(e) => setCobrancaRecorrenciaDias(e.target.value)}
                        className="w-12 px-1 py-0.5 mx-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                      />
                      dias após pagamento
                    </span>
                  </label>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500">
                    Cliente: <span className="font-medium text-zinc-700 dark:text-zinc-300">{card.contact?.name ?? title}</span>
                    {card.contact?.phone && <> · WhatsApp será disparado pra {card.contact.phone}</>}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateCobranca}
                    disabled={creatingCobranca}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
                  >
                    {creatingCobranca && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Gerar cobrança
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div>
            {card && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : card ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
