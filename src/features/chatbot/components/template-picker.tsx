'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, Clock, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  CHATBOT_TEMPLATES,
  type ChatbotTemplate,
} from '@/features/chatbot/templates/chatbot-templates';
import { chatbotService } from '@/features/chatbot/services/chatbot.service';

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatePicker({ open, onClose }: TemplatePickerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState<string | null>(null);

  if (!open) return null;

  const handlePick = async (template: ChatbotTemplate) => {
    setApplying(template.id);
    try {
      const flow = await chatbotService.create({
        name: template.flowName,
        description: template.flowDescription,
        triggerType: template.triggerType,
      });
      // Usamos o "key" lógico do template como id do nó; o backend remapeia
      // key→uuid e reescreve os targetNodeId das edges. Assim o template já
      // nasce com as conexões funcionando (sem workaround de _templateEdges).
      await chatbotService.saveNodes(
        flow.id,
        template.nodes.map((n) => ({
          id: n.key,
          type: n.type,
          name: n.name,
          positionX: n.positionX,
          positionY: n.positionY,
          data: n.data,
          edges: n.edges.map((e) => ({
            targetNodeId: e.targetKey,
            condition: e.condition,
          })),
        })),
      );
      queryClient.invalidateQueries({ queryKey: ['chatbot-flows'] });
      toast.success(`Template "${template.title}" aplicado · ajuste e ative`);
      router.push(`/chatbot/${flow.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Erro ao aplicar template',
      );
      setApplying(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="border-b border-zinc-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-6 py-5 dark:border-zinc-800 dark:from-emerald-900/20 dark:to-emerald-900/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                Templates prontos
              </div>
              <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Escolha um modelo e ative em minutos
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                5 fluxos pré-configurados por nicho · você ajusta a copy depois
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-6 lg:grid-cols-2">
          {CHATBOT_TEMPLATES.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              applying={applying === tpl.id}
              disabled={applying !== null}
              onPick={() => handlePick(tpl)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  applying,
  disabled,
  onPick,
}: {
  template: ChatbotTemplate;
  applying: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-2xl dark:from-emerald-900/40 dark:to-emerald-800/40">
          {template.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {template.niche}
          </div>
          <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-zinc-100">
            {template.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {template.description}
      </p>

      {/* MOCKUP · preview do fluxo */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Preview da conversa
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500">
            <Clock className="h-3 w-3" /> {template.estimatedSetup}
          </span>
        </div>
        <div className="space-y-1.5">
          {template.preview.map((msg, i) => (
            <div
              key={i}
              className="rounded-md bg-white px-2.5 py-1.5 text-[11px] text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
            >
              <span className="font-semibold text-emerald-600">Bot:</span>{' '}
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* BENEFÍCIOS */}
      <div className="mt-4 space-y-1.5">
        {template.benefits.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
          >
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onPick}
        disabled={disabled}
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {applying ? (
          'Aplicando…'
        ) : (
          <>
            Usar template <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
