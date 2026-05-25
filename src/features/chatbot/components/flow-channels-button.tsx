'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { channelsService, type ChannelType } from '@/features/channels/services/channels.service';
import { chatbotService, type ChatbotFlow } from '../services/chatbot.service';

const CHANNEL_LABEL: Record<ChannelType, string> = {
  WHATSAPP_OFFICIAL: 'WhatsApp',
  WHATSAPP_ZAPPFY: 'WhatsApp',
  WHATSAPP_ZAPI: 'WhatsApp',
  INSTAGRAM: 'Instagram',
};

interface FlowChannelsButtonProps {
  flow: ChatbotFlow;
}

export function FlowChannelsButton({ flow }: FlowChannelsButtonProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(flow.channels?.map((c) => c.channelId) ?? []),
  );
  const ref = useRef<HTMLDivElement>(null);

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelsService.list(),
    enabled: open,
  });

  // Mantém a seleção sincronizada se o flow recarregar (ex: após salvar).
  useEffect(() => {
    setSelected(new Set(flow.channels?.map((c) => c.channelId) ?? []));
  }, [flow.channels]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const linkedCount = flow.channels?.length ?? 0;
  const needsChannel = flow.isActive && linkedCount === 0;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      await chatbotService.linkChannels(flow.id, [...selected]);
      await queryClient.invalidateQueries({ queryKey: ['chatbot-flow', flow.id] });
      queryClient.invalidateQueries({ queryKey: ['chatbot-flows'] });
      toast.success(
        selected.size === 0
          ? 'Fluxo desvinculado de todos os canais'
          : `Fluxo vinculado a ${selected.size} canal(is)`,
      );
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao vincular canal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
          needsChannel
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
        }`}
      >
        {needsChannel ? <AlertTriangle className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
        Canais{linkedCount > 0 ? ` (${linkedCount})` : ''}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Canais deste fluxo</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              O fluxo só dispara nos canais marcados.
            </p>
          </div>

          {needsChannel && (
            <div className="mx-2 my-1.5 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              Fluxo ativo sem canal vinculado · ele não vai responder ninguém.
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              </div>
            ) : channels && channels.length > 0 ? (
              channels.map((ch) => {
                const checked = selected.has(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => toggle(ch.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-zinc-800 dark:text-zinc-200">{ch.name}</span>
                      <span className="block text-[10px] text-zinc-400">{CHANNEL_LABEL[ch.type]}</span>
                    </span>
                    {!ch.isActive && (
                      <span className="text-[10px] text-zinc-400">inativo</span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-6 text-center text-xs text-zinc-400">
                Nenhum canal conectado ainda. Conecte um canal em Configurações.
              </p>
            )}
          </div>

          <div className="border-t border-zinc-100 px-2 pt-2 dark:border-zinc-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar canais'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
