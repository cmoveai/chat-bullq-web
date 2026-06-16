import type { Conversation } from '../services/inbox.service';
import {
  CircleDashed,
  Clock,
  MessageCircle,
  Bot,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';

export type QueueStatus =
  | 'nao_iniciados'
  | 'aguardando'
  | 'em_aberto'
  | 'automacoes'
  | 'finalizados'
  | 'falha'
  | 'ocultas';

export interface QueueDef {
  key: QueueStatus;
  label: string;
  icon: React.ElementType;
  /** cor do dot/badge */
  dot: string;
  /** classes do chip ativo */
  active: string;
}

export const QUEUE_DEFS: QueueDef[] = [
  { key: 'nao_iniciados', label: 'Não iniciados', icon: CircleDashed, dot: 'bg-zinc-400', active: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200' },
  { key: 'aguardando', label: 'Aguardando', icon: Clock, dot: 'bg-amber-400', active: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { key: 'em_aberto', label: 'Em aberto', icon: MessageCircle, dot: 'bg-emerald-500', active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { key: 'automacoes', label: 'Automações', icon: Bot, dot: 'bg-violet-500', active: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  { key: 'finalizados', label: 'Finalizados', icon: CheckCircle2, dot: 'bg-sky-500', active: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  { key: 'falha', label: 'Falha', icon: AlertTriangle, dot: 'bg-red-500', active: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { key: 'ocultas', label: 'Ocultas', icon: EyeOff, dot: 'bg-zinc-300', active: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
];

export const QUEUE_BY_KEY: Record<QueueStatus, QueueDef> = QUEUE_DEFS.reduce(
  (acc, d) => { acc[d.key] = d; return acc; },
  {} as Record<QueueStatus, QueueDef>,
);

/**
 * Status de fila computado no frontend a partir dos dados disponíveis na lista.
 * Prioridade: ocultas → finalizados → automações → não iniciados → (direção da
 * última mensagem) aguardando/em aberto.
 *
 * Limitação conhecida: "Falha" depende do status de mensagem (FAILED), que NÃO
 * vem no payload da lista (LastMessage só tem direction). Por isso esse bucket
 * fica vazio na lista até o backend expor um sinal de falha por conversa.
 */
export function computeQueueStatus(c: Conversation): QueueStatus {
  if (c.isArchived) return 'ocultas';
  const s = (c.status || '').toUpperCase();
  if (s === 'CLOSED') return 'finalizados';
  if (s === 'BOT' || c.activeAgentId || c.aiEnabled === true) return 'automacoes';
  if (s === 'PENDING') return 'nao_iniciados';
  const lastDir = c.messages?.[0]?.direction;
  if (lastDir === 'OUTBOUND') return 'aguardando';
  return 'em_aberto';
}

export function computeQueueCounts(conversations: Conversation[]): Record<QueueStatus, number> {
  const counts = { nao_iniciados: 0, aguardando: 0, em_aberto: 0, automacoes: 0, finalizados: 0, falha: 0, ocultas: 0 } as Record<QueueStatus, number>;
  for (const c of conversations) counts[computeQueueStatus(c)]++;
  return counts;
}
