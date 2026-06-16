'use client';

import type { Conversation } from '../services/inbox.service';
import {
  QUEUE_DEFS,
  computeQueueCounts,
  type QueueStatus,
} from '../lib/conversation-queue';

interface Props {
  conversations: Conversation[];
  active: QueueStatus | null;
  onSelect: (q: QueueStatus | null) => void;
}

/** Barra das 7 filas de atendimento. Clicar filtra; clicar no ativo limpa.
 *  Contadores são sobre as conversas carregadas (paginação client-side). */
export function InboxStatusBar({ conversations, active, onSelect }: Props) {
  const counts = computeQueueCounts(conversations);

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin px-3 pb-2 pt-1">
      {QUEUE_DEFS.map((d) => {
        const isActive = active === d.key;
        const count = counts[d.key];
        const Icon = d.icon;
        return (
          <button
            key={d.key}
            onClick={() => onSelect(isActive ? null : d.key)}
            title={d.label}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? d.active
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.dot}`} />
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className={isActive ? 'inline' : 'hidden sm:inline'}>{d.label}</span>
            <span
              className={`rounded-full px-1.5 text-[10px] font-semibold tabular-nums ${
                isActive ? 'bg-white/60 dark:bg-black/20' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
