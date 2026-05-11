'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CreateResponse {
  notification?:
    | { ok: true; channel: 'template' | 'text' | 'admin'; messageId?: string }
    | { ok: false; reason: string; fallbackUrl?: string };
  publicLink?: string;
  slug: string;
}

interface NewCobrancaModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  etapa: string;
  valor: string;
  vencimento: string;
  pix_chave: string;
  pix_emv: string;
  recorrente: boolean;
  recorrencia_dias: string;
}

const EMPTY: FormState = {
  cliente_nome: '',
  cliente_email: '',
  cliente_telefone: '',
  etapa: '',
  valor: '',
  vencimento: '',
  pix_chave: '66432401000129',
  pix_emv: '',
  recorrente: false,
  recorrencia_dias: '30',
};

export function NewCobrancaModal({ open, onClose }: NewCobrancaModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: FormState) => {
      const payload = {
        cliente_nome: input.cliente_nome.trim(),
        cliente_email: input.cliente_email.trim() || undefined,
        cliente_telefone: input.cliente_telefone.trim() || undefined,
        etapa: input.etapa.trim(),
        valor: parseFloat(input.valor.replace(',', '.')),
        vencimento: input.vencimento,
        pix_chave: input.pix_chave.trim(),
        pix_emv: input.pix_emv.trim() || undefined,
        recorrente: input.recorrente,
        recorrencia_dias: input.recorrente ? parseInt(input.recorrencia_dias, 10) || 30 : undefined,
      };
      const res = await api.post<{ data: CreateResponse }>('/super-admin/cobrancas', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'cobrancas'] });
      const n = data.notification;
      if (n?.ok) {
        toast.success('Cobrança criada · WhatsApp disparado automaticamente', {
          description: `Via ${n.channel === 'template' ? 'template Meta aprovado' : 'mensagem direta'}`,
        });
      } else if (n?.fallbackUrl) {
        toast.warning('Cobrança criada · disparo automático falhou', {
          description: 'Clica pra abrir o WhatsApp manualmente',
          action: {
            label: 'Abrir WhatsApp',
            onClick: () => window.open(n.fallbackUrl, '_blank'),
          },
          duration: 12000,
        });
      } else {
        toast.success('Cobrança criada', {
          description: data.publicLink ?? '',
        });
      }
      setForm(EMPTY);
      onClose();
    },
  });

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && !mutation.isPending) onClose();
    }
    if (open) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose, mutation.isPending]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente_nome || !form.etapa || !form.valor || !form.vencimento || !form.pix_chave) {
      return;
    }
    mutation.mutate(form);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-40"
        onClick={() => !mutation.isPending && onClose()}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Nova cobrança
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                Cria registro em <code className="font-mono text-[11px]">cobrancas_publicas</code> · página fica em{' '}
                <code className="font-mono text-[11px]">pagar.cmove.ai/[slug]</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => !mutation.isPending && onClose()}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-500"
              disabled={mutation.isPending}
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <Field label="Cliente *">
              <input
                type="text"
                value={form.cliente_nome}
                onChange={(e) => update('cliente_nome', e.target.value)}
                placeholder="Nome do cliente"
                required
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input
                  type="email"
                  value={form.cliente_email}
                  onChange={(e) => update('cliente_email', e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className={inputCls}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  type="text"
                  value={form.cliente_telefone}
                  onChange={(e) => update('cliente_telefone', e.target.value)}
                  placeholder="5511..."
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Etapa / Descrição *">
              <input
                type="text"
                value={form.etapa}
                onChange={(e) => update('etapa', e.target.value)}
                placeholder="Ex: Mensalidade Mai/26"
                required
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor (R$) *">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.valor}
                  onChange={(e) => update('valor', e.target.value)}
                  placeholder="0,00"
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Vencimento *">
                <input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => update('vencimento', e.target.value)}
                  required
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Chave Pix *">
              <input
                type="text"
                value={form.pix_chave}
                onChange={(e) => update('pix_chave', e.target.value)}
                placeholder="CNPJ / email / telefone / chave aleatória"
                required
                className={inputCls}
              />
            </Field>

            <Field
              label="Pix EMV (copia-cola · opcional)"
              hint="Cola aqui o copia-cola do app Santander pra cliente pagar com 1 toque"
            >
              <textarea
                value={form.pix_emv}
                onChange={(e) => update('pix_emv', e.target.value)}
                placeholder="00020126..."
                rows={2}
                className={`${inputCls} resize-none font-mono text-[11px]`}
              />
            </Field>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recorrente}
                  onChange={(e) => update('recorrente', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Cobrança recorrente
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                    Quando essa for paga, sistema agenda a próxima automaticamente
                  </div>
                </div>
              </label>
              {form.recorrente && (
                <div className="mt-3 pl-7">
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-500 inline-flex items-center gap-2">
                    Intervalo:
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={form.recorrencia_dias}
                      onChange={(e) => update('recorrencia_dias', e.target.value)}
                      className="w-16 px-2 py-1 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100"
                    />
                    dias
                  </label>
                </div>
              )}
            </div>

            {mutation.isError && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3">
                Erro ao criar cobrança:{' '}
                {mutation.error instanceof Error ? mutation.error.message : 'tente novamente'}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => !mutation.isPending && onClose()}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Criar cobrança
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-1.5">
        {label}
      </div>
      {children}
      {hint && <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1">{hint}</div>}
    </label>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100';
