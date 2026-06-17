'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  inboxService,
  type WhatsappTemplate,
  type TemplateParameter,
} from '../services/inbox.service';

interface Props {
  open: boolean;
  onClose: () => void;
  channelId: string;
  channelName?: string;
  conversationId: string;
  onSent?: () => void;
}

function findComponent(t: WhatsappTemplate, type: string) {
  return (t.components ?? []).find(
    (c) => String(c?.type ?? '').toUpperCase() === type,
  );
}

/** Variáveis efetivas: usa o parameterSchema da API; se ausente, deriva do BODY. */
function templateParams(t: WhatsappTemplate): TemplateParameter[] {
  if (t.parameterSchema && t.parameterSchema.length) return t.parameterSchema;
  const body = findComponent(t, 'BODY');
  const text: string = body?.text ?? '';
  const idx = Array.from(text.matchAll(/\{\{(\d+)\}\}/g)).map((m) => parseInt(m[1], 10));
  return Array.from(new Set(idx))
    .sort((a, b) => a - b)
    .map((i) => ({ index: i, key: String(i), type: 'text' as const, required: true }));
}

/** Preview do BODY com as variáveis substituídas (ou {{n}} se vazio). */
function renderBody(t: WhatsappTemplate, values: Record<string, string>): string {
  const body = findComponent(t, 'BODY');
  const text: string = body?.text ?? '';
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[String(n)]?.trim() || `{{${n}}}`);
}

export function TemplateSendModal({
  open,
  onClose,
  channelId,
  channelName,
  conversationId,
  onSent,
}: Props) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['channel-templates', channelId],
    queryFn: () => inboxService.listChannelTemplates(channelId),
    enabled: open && !!channelId,
  });

  const selected = useMemo(
    () => (templates ?? []).find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );
  const params = useMemo(() => (selected ? templateParams(selected) : []), [selected]);
  const allFilled = params
    .filter((p) => p.required)
    .every((p) => (values[p.key]?.trim() ?? '') !== '');

  if (!open) return null;

  function pick(t: WhatsappTemplate) {
    setSelectedId(t.id);
    setValues({});
  }

  function buildPayload() {
    if (!selected) return null;
    const ordered = [...params].sort((a, b) => a.index - b.index);
    const components = ordered.length
      ? [
          {
            type: 'body',
            parameters: ordered.map((p) => ({
              type: 'text',
              text: values[p.key] ?? '',
            })),
          },
        ]
      : [];
    return {
      conversationId,
      type: 'TEMPLATE' as const,
      content: {
        name: selected.name,
        language: { code: selected.language },
        components,
      },
    };
  }

  async function handleSend() {
    const payload = buildPayload();
    if (!payload || sending) return;
    setSending(true);
    try {
      await inboxService.sendMessage(payload);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      toast.success('Template enviado');
      onSent?.();
      onClose();
    } catch (err: any) {
      // Até C2.2 a API rejeita type=TEMPLATE (DTO) — erro claro, sem quebrar.
      toast.error(
        err?.response?.data?.message ||
          'Não foi possível enviar o template. Tente novamente.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Enviar template</h2>
            {channelName && (
              <p className="text-xs text-zinc-400">{channelName}</p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando templates…
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Nenhum template aprovado disponível para este canal.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Sincronize os templates aprovados da Meta nas configurações do canal antes de enviar.
              </p>
              <button
                onClick={onClose}
                className="mt-4 rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Entendi
              </button>
            </div>
          ) : !selected ? (
            <ul className="space-y-2">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => pick(t)}
                    className="w-full rounded-xl border border-zinc-200 p-3 text-left transition-colors hover:border-primary/40 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                        {t.language}
                      </span>
                      {t.category && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          {t.category}
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <Check className="h-3 w-3" /> {t.status}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {findComponent(t, 'BODY')?.text ?? '—'}
                    </p>
                    {t.qualityScore && (
                      <p className="mt-1 text-[10px] text-zinc-400">Qualidade: {t.qualityScore}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs font-medium text-primary hover:underline"
              >
                ← Voltar à lista
              </button>

              {/* Preview */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                {findComponent(selected, 'HEADER')?.text && (
                  <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    {findComponent(selected, 'HEADER')?.text}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
                  {renderBody(selected, values)}
                </p>
                {findComponent(selected, 'FOOTER')?.text && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {findComponent(selected, 'FOOTER')?.text}
                  </p>
                )}
              </div>

              {/* Variáveis */}
              {params.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Variáveis</p>
                  {params.map((p) => (
                    <div key={p.key}>
                      <label className="mb-1 block text-[11px] text-zinc-400">
                        {`{{${p.key}}}`} {p.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        value={values[p.key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder={`Valor para {{${p.key}}}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
            <button
              onClick={handleSend}
              disabled={!allFilled || sending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
