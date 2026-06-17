'use client';

import { AlertTriangle } from 'lucide-react';
import type { Message } from '../services/inbox.service';
import { messageOrigin, messageFailed, ORIGIN_DEFS } from '../lib/message-origin';

/** Chip de origem da mensagem (Humano/IA/Automação/Campanha/Sistema). Null quando
 *  não há dado confiável (ex.: mensagem do cliente). */
export function MessageOriginBadge({ message, align }: { message: Message; align?: 'left' | 'right' }) {
  const origin = messageOrigin(message);
  const failed = messageFailed(message);
  if (!origin && !failed) return null;
  return (
    <div className={`mb-0.5 flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
      {origin && (
        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${ORIGIN_DEFS[origin].cls}`}>
          {ORIGIN_DEFS[origin].label}
        </span>
      )}
      {failed && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/40 dark:text-red-300">
          <AlertTriangle className="h-2.5 w-2.5" />
          Falha de envio
        </span>
      )}
    </div>
  );
}
