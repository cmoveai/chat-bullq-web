import type { Message } from '../services/inbox.service';

export type MsgOrigin = 'humano' | 'ia' | 'automacao' | 'campanha' | 'sistema';

export const ORIGIN_DEFS: Record<MsgOrigin, { label: string; cls: string }> = {
  humano: { label: 'Humano', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300' },
  ia: { label: 'IA', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  automacao: { label: 'Automação', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  campanha: { label: 'Campanha', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  sistema: { label: 'Sistema', cls: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

/**
 * Origem da mensagem, inferida com segurança a partir do payload disponível.
 * INBOUND (cliente) NÃO recebe badge. Só rotula quando o dado sustenta;
 * caso contrário retorna null (sem badge inventado).
 */
export function messageOrigin(m: Message): MsgOrigin | null {
  const meta = (m.metadata || {}) as Record<string, any>;
  const type = (m.type || '').toUpperCase();
  if (type === 'SYSTEM') return 'sistema';
  if (m.direction !== 'OUTBOUND') return null; // cliente
  if (type === 'TEMPLATE' || meta.campaignId) return 'campanha';
  if (meta.automationId || meta.flowExecutionId || (m as any).flowExecutionId || meta.source === 'automation')
    return 'automacao';
  const name = (m.senderName || '').toLowerCase();
  const aiHint =
    !!meta.agentId ||
    !!meta.aiAgentId ||
    !!(m as any).agentId ||
    /orquestr|agente|\bbot\b|\bia\b|assistente|\bsdr\b|suporte/.test(name);
  if (aiHint) return 'ia';
  if (m.senderId || m.sender) return 'humano';
  return null;
}

/** Falha de envio: status FAILED ou failedReason no payload (quando exposto). */
export function messageFailed(m: Message): boolean {
  if ((m.status || '').toUpperCase() === 'FAILED') return true;
  const meta = (m.metadata || {}) as Record<string, any>;
  return !!meta.failedReason || !!(m as any).failedReason;
}
