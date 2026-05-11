'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Send, CheckCircle2 } from 'lucide-react';
import type { Ticket } from '../_mocks/tickets';

const SLA_DOT: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

const SLA_LABEL: Record<'green' | 'yellow' | 'red', string> = {
  green: 'dentro do SLA',
  yellow: 'atenção',
  red: 'estourou SLA',
};

export function TicketDrawer({
  ticket,
  onClose,
}: {
  ticket: Ticket | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (ticket) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [ticket, onClose]);

  if (!ticket) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-50 overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
                {ticket.id}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {ticket.customerName}
              </span>
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {ticket.subject}
            </h2>
            <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 flex items-center gap-2">
              <span>Aberto há {ticket.openedRelative}</span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${SLA_DOT[ticket.sla]}`} />
                {SLA_LABEL[ticket.sla]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-500"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
          {ticket.thread.map((msg, idx) => {
            const isCustomer = msg.from === 'customer';
            return (
              <div
                key={idx}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
                    isCustomer
                      ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900'
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-[0.12em] font-semibold mb-1 ${
                      isCustomer
                        ? 'text-zinc-500 dark:text-zinc-500'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  >
                    {msg.authorName} · {msg.sentAtRelative}
                  </div>
                  <div className="leading-relaxed">{msg.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        <TicketComposer ticket={ticket} onResolved={onClose} />
      </aside>
    </>
  );
}

function TicketComposer({
  ticket,
  onResolved,
}: {
  ticket: Ticket;
  onResolved: () => void;
}) {
  const [reply, setReply] = useState('');

  function handleResolve() {
    if (!window.confirm(`Marcar ${ticket.id} como resolvido?`)) return;
    toast.success(`${ticket.id} resolvido`, {
      description: 'Persistência real chega quando o módulo Suporte tiver schema próprio',
    });
    onResolved();
  }

  function handleSend() {
    if (!reply.trim()) {
      toast.error('Escreva uma mensagem antes de enviar');
      return;
    }
    toast.success('Resposta enviada', { description: `${ticket.id} · ${ticket.customerName}` });
    setReply('');
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Responder..."
        rows={2}
        className="w-full resize-none text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <button
          onClick={handleResolve}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolver
        </button>
        <button
          onClick={handleSend}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar
        </button>
      </div>
    </div>
  );
}

