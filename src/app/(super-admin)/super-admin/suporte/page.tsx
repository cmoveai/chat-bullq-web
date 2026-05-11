'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronRight, LifeBuoy, Plus } from 'lucide-react';
import { ticketsMock, type Ticket, type TicketStatus } from '../../_mocks/tickets';
import { TicketDrawer } from '../../_components/ticket-drawer';
import { HeroCard } from '../../_components/hero-card';

const TAB_LABELS: Record<TicketStatus, string> = {
  open: 'Aberto',
  pending_customer: 'Pendente cliente',
  resolved: 'Resolvido',
};

const SLA_DOT: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

export default function SuportePage() {
  const [tab, setTab] = useState<TicketStatus>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      open: ticketsMock.filter((t) => t.status === 'open').length,
      pending_customer: ticketsMock.filter((t) => t.status === 'pending_customer').length,
      resolved: ticketsMock.filter((t) => t.status === 'resolved').length,
    };
  }, []);

  const filtered = useMemo(() => {
    return ticketsMock
      .filter((t) => t.status === tab)
      .sort((a, b) => b.openedHours - a.openedHours);
  }, [tab]);

  const selected = selectedId ? ticketsMock.find((t) => t.id === selectedId) ?? null : null;
  const resolvedToday = 8;
  const slaBreaches = ticketsMock.filter((t) => t.sla === 'red' && t.status !== 'resolved').length;
  const avgResponseHours = 3.2;

  return (
    <>
      <div className="space-y-5">
        <HeroCard
          eyebrow="Suporte · CMOVE.AI-ZAP"
          caption="Tickets abertos agora"
          value={String(counts.open)}
          meta={[
            { label: `${counts.pending_customer} aguard. cliente` },
            {
              label: `${resolvedToday} resolvidos hoje`,
              trend: 'up',
              trendLabel: 'no SLA',
            },
            {
              label: `Resposta média: ${avgResponseHours}h`,
              trend: slaBreaches > 0 ? 'down' : 'up',
            },
          ]}
          actions={[
            {
              label: 'Novo ticket',
              icon: Plus,
              variant: 'primary',
              onClick: () =>
                toast('Novo ticket', {
                  description: 'Abertura manual chega quando ZAP plugar canal de suporte interno',
                }),
            },
            {
              label: 'Ver SLA',
              variant: 'secondary',
              onClick: () =>
                toast('SLA atual', {
                  description: '🟢 < 4h · 🟡 4-24h · 🔴 > 24h · resposta média 3.2h',
                }),
            },
          ]}
          pending
        />

        <header>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
            <LifeBuoy className="w-3.5 h-3.5 text-zinc-500" />
            Tickets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            Clica num ticket pra abrir o thread completo
          </p>
        </header>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['open', 'pending_customer', 'resolved'] as TicketStatus[]).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                {TAB_LABELS[t]}
                <span
                  className={`text-xs tabular-nums px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {counts[t]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900 dark:bg-zinc-100" />
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-5 py-3 font-medium w-20">Ticket</th>
                <th className="text-left px-3 py-3 font-medium">Cliente</th>
                <th className="text-left px-3 py-3 font-medium">Assunto</th>
                <th className="text-left px-3 py-3 font-medium">Aberto</th>
                <th className="text-left px-3 py-3 font-medium w-12">SLA</th>
                <th className="text-right px-5 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onClick={() => setSelectedId(t.id)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-zinc-500">
                    Nenhum ticket {TAB_LABELS[tab].toLowerCase()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-4 pt-1">
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${SLA_DOT.green}`} />
            &lt; 4h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${SLA_DOT.yellow}`} />
            4-24h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${SLA_DOT.red}`} />
            &gt; 24h
          </span>
        </div>
      </div>

      <TicketDrawer ticket={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}

function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
    >
      <td className="px-5 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
        {ticket.id}
      </td>
      <td className="px-3 py-3 text-zinc-900 dark:text-zinc-100">
        {ticket.customerName}
      </td>
      <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
        {ticket.subject}
      </td>
      <td className="px-3 py-3 text-zinc-500 dark:text-zinc-500 text-xs tabular-nums">
        {ticket.openedRelative}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-block w-2 h-2 rounded-full ${SLA_DOT[ticket.sla]}`}
          title={ticket.sla}
        />
      </td>
      <td className="px-5 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 inline-block group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
      </td>
    </tr>
  );
}
