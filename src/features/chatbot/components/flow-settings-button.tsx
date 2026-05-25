'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { chatbotService, type ChatbotFlow } from '../services/chatbot.service';

interface FlowSettingsButtonProps {
  flow: ChatbotFlow;
}

const TRIGGER_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: 'KEYWORD', label: 'Quando receber uma palavra-chave', hint: 'O bot só responde se a mensagem contiver uma das palavras abaixo.' },
  { value: 'FIRST_MESSAGE', label: 'Na primeira mensagem da conversa', hint: 'O bot inicia assim que o contato manda a primeira mensagem.' },
  { value: 'ALWAYS', label: 'Em qualquer mensagem', hint: 'O bot responde a qualquer mensagem recebida.' },
];

export function FlowSettingsButton({ flow }: FlowSettingsButtonProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [triggerType, setTriggerType] = useState(flow.triggerType || 'FIRST_MESSAGE');
  const [keywords, setKeywords] = useState(
    Array.isArray(flow.triggerConfig?.keywords) ? flow.triggerConfig.keywords.join(', ') : '',
  );
  const [respectHours, setRespectHours] = useState(!!flow.triggerConfig?.respectBusinessHours);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const kws = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      const triggerConfig = {
        ...(flow.triggerConfig || {}),
        keywords: kws,
        respectBusinessHours: respectHours,
      };
      await chatbotService.update(flow.id, { triggerType, triggerConfig });
      await queryClient.invalidateQueries({ queryKey: ['chatbot-flow', flow.id] });
      queryClient.invalidateQueries({ queryKey: ['chatbot-flows'] });
      toast.success('Configurações do fluxo salvas');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const labelCls = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1';
  const inputCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
      >
        <Settings2 className="h-3.5 w-3.5" /> Gatilho
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">Quando o bot deve responder</p>

          <div className="space-y-1.5">
            {TRIGGER_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="radio"
                  name="triggerType"
                  className="mt-0.5"
                  checked={triggerType === opt.value}
                  onChange={() => setTriggerType(opt.value)}
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">{opt.label}</span>
                  <span className="block text-[10px] text-zinc-400">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {triggerType === 'KEYWORD' && (
            <div className="mt-3">
              <label className={labelCls}>Palavras-chave</label>
              <input
                className={inputCls}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="promo, desconto, quero comprar"
              />
              <p className="mt-1 text-[10px] text-zinc-400">Separe por vírgula. Não diferencia maiúsculas/minúsculas.</p>
            </div>
          )}

          <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={respectHours}
                onChange={(e) => setRespectHours(e.target.checked)}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">Responder só no horário comercial</span>
                <span className="block text-[10px] text-zinc-400">Fora do horário, envia a mensagem de horário definida nas configurações da organização.</span>
              </span>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar gatilho'}
          </button>
        </div>
      )}
    </div>
  );
}
