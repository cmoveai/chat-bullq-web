'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, MessageSquare, CheckCircle2, Plus, ExternalLink, Copy, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { NewCobrancaModal } from '../../_components/new-cobranca-modal';
import { HeroCard } from '../../_components/hero-card';

type LaunchCobrancaStatus =
  | 'AGUARDANDO'
  | 'AGUARDANDO_CONFIRMACAO'
  | 'PAGO'
  | 'CANCELADO';

interface LaunchCobranca {
  id: string;
  slug: string;
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  etapa: string;
  valor: string | number;
  vencimento: string;
  pixChave: string;
  pixEmv: string | null;
  status: LaunchCobrancaStatus;
  pagoEm: string | null;
  createdAt: string;
}

type Tab = LaunchCobrancaStatus;

const TAB_LABELS: Record<Tab, string> = {
  AGUARDANDO: 'A vencer',
  AGUARDANDO_CONFIRMACAO: 'Aguard. confirmação',
  PAGO: 'Pagas',
  CANCELADO: 'Canceladas',
};

const STATUS_BADGE: Record<
  LaunchCobrancaStatus,
  { label: string; className: string }
> = {
  AGUARDANDO: {
    label: 'Aberta',
    className:
      'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  },
  AGUARDANDO_CONFIRMACAO: {
    label: 'Conferindo',
    className:
      'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
  PAGO: {
    label: 'Paga',
    className:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  CANCELADO: {
    label: 'Cancelada',
    className:
      'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800',
  },
};

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

function daysFromToday(dateStr: string): number {
  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function formatDueLabel(dateStr: string): string {
  const days = daysFromToday(dateStr);
  const formatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  if (days < 0) return `${formatted} (${Math.abs(days)}d atrás)`;
  if (days === 0) return `${formatted} (hoje)`;
  return `${formatted} (+${days}d)`;
}

function isOverdue(c: LaunchCobranca): boolean {
  return c.status === 'AGUARDANDO' && daysFromToday(c.vencimento) < 0;
}

function vencimentoDateOnly(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export default function CobrancasPage() {
  const [tab, setTab] = useState<Tab>('AGUARDANDO');
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const confirmPaidMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await api.post(`/super-admin/cobrancas/${slug}/confirmar-pago`);
      return res.data;
    },
    onSuccess: (_d, slug) => {
      toast.success('Pagamento confirmado', { description: slug });
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'cobrancas'] });
    },
    onError: (e) => {
      toast.error('Erro ao confirmar pagamento', {
        description: e instanceof Error ? e.message : 'tente novamente',
      });
    },
  });

  function handleSendEmail(c: LaunchCobranca) {
    if (!c.clienteEmail) {
      toast.error('Sem email cadastrado pra essa cobrança');
      return;
    }
    toast('Enviar email', {
      description: `Lembrete será enviado pra ${c.clienteEmail} (Sprint 2 · template Resend)`,
    });
  }

  function handleSendWhatsapp(c: LaunchCobranca) {
    if (!c.clienteTelefone) {
      toast.error('Sem WhatsApp cadastrado pra essa cobrança');
      return;
    }
    const link = `${window.location.origin}/pagar/${c.slug}`;
    const msg = encodeURIComponent(
      `Oi ${c.clienteNome}, tudo bem? Passando pra te lembrar da cobrança "${c.etapa}" no valor de R$ ${Number(c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Link de pagamento: ${link}`,
    );
    window.open(
      `https://wa.me/${c.clienteTelefone.replace(/\D/g, '')}?text=${msg}`,
      '_blank',
    );
  }

  function handleConfirmPaid(c: LaunchCobranca) {
    if (
      !window.confirm(
        `Confirmar pagamento manual de "${c.etapa}" (R$ ${Number(c.valor).toLocaleString('pt-BR')})? Status vai mudar pra "Paga".`,
      )
    ) {
      return;
    }
    confirmPaidMutation.mutate(c.slug);
  }

  const { data, isLoading, error } = useQuery<LaunchCobranca[]>({
    queryKey: ['super-admin', 'cobrancas'],
    queryFn: async () => {
      const res = await api.get<{ data: LaunchCobranca[] }>('/super-admin/cobrancas');
      return res.data.data;
    },
    refetchInterval: 30_000,
  });

  const list = data ?? [];

  const counts = useMemo(() => {
    return {
      AGUARDANDO: list.filter((c) => c.status === 'AGUARDANDO').length,
      AGUARDANDO_CONFIRMACAO: list.filter((c) => c.status === 'AGUARDANDO_CONFIRMACAO').length,
      PAGO: list.filter((c) => c.status === 'PAGO').length,
      CANCELADO: list.filter((c) => c.status === 'CANCELADO').length,
    };
  }, [list]);

  const filtered = useMemo(() => {
    return list
      .filter((c) => c.status === tab)
      .sort((a, b) => {
        if (tab === 'PAGO') {
          return new Date(b.pagoEm ?? b.createdAt).getTime() -
                 new Date(a.pagoEm ?? a.createdAt).getTime();
        }
        return (
          daysFromToday(vencimentoDateOnly(a.vencimento)) -
          daysFromToday(vencimentoDateOnly(b.vencimento))
        );
      });
  }, [list, tab]);

  const totalAReceber = useMemo(
    () =>
      list
        .filter((c) => c.status === 'AGUARDANDO' || c.status === 'AGUARDANDO_CONFIRMACAO')
        .reduce((sum, c) => sum + Number(c.valor), 0),
    [list],
  );

  const totalPagas = useMemo(
    () => list.filter((c) => c.status === 'PAGO').reduce((sum, c) => sum + Number(c.valor), 0),
    [list],
  );

  return (
    <>
      <div className="space-y-5">
        <HeroCard
          eyebrow="Cobranças · EIXXO"
          caption="Total a receber neste mês"
          value={formatBrl(totalAReceber)}
          meta={[
            { label: `${counts.AGUARDANDO} a vencer`, trend: 'up' },
            { label: `${counts.AGUARDANDO_CONFIRMACAO} aguard. confirmação` },
            {
              label: `${formatBrl(totalPagas)} pagas`,
              trendLabel: 'no mês',
              trend: 'up',
            },
          ]}
          actions={[
            {
              label: 'Nova cobrança',
              icon: Plus,
              variant: 'primary',
              onClick: () => setModalOpen(true),
            },
          ]}
        />

        <header className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-zinc-500" />
              Faturas
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Banco do ZAP · refresh 30s ·{' '}
              <span className="text-emerald-600 dark:text-emerald-500 font-semibold">ao vivo</span>
            </p>
          </div>
        </header>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {(['AGUARDANDO', 'AGUARDANDO_CONFIRMACAO', 'PAGO', 'CANCELADO'] as Tab[]).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
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

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-400">
            Erro ao carregar cobranças do Launch · verifique o backend
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-5 py-3 font-medium">Cliente / Etapa</th>
                <th className="text-right px-3 py-3 font-medium">Valor</th>
                <th className="text-left px-3 py-3 font-medium">
                  {tab === 'PAGO' ? 'Pago em' : 'Vencimento'}
                </th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-zinc-500">
                    Carregando…
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((c) => {
                  const overdue = isOverdue(c);
                  const badge = overdue
                    ? {
                        label: 'Atrasada',
                        className:
                          'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
                      }
                    : STATUS_BADGE[c.status];
                  const linkPagar = `${typeof window !== 'undefined' ? window.location.origin : ''}/pagar/${c.slug}`;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {c.clienteNome}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate max-w-[320px]">
                          {c.etapa}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mt-0.5">
                          {c.slug}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100 font-medium">
                        {formatBrl(Number(c.valor))}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 text-xs tabular-nums">
                        {c.status === 'PAGO' && c.pagoEm
                          ? new Date(c.pagoEm).toLocaleDateString('pt-BR')
                          : formatDueLabel(vencimentoDateOnly(c.vencimento))}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 border rounded ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <ActionIcon
                            icon={ExternalLink}
                            title="Abrir página pública"
                            onClick={() => window.open(linkPagar, '_blank')}
                          />
                          <ActionIcon
                            icon={Copy}
                            title="Copiar link"
                            onClick={() => navigator.clipboard.writeText(linkPagar)}
                          />
                          {(c.status === 'AGUARDANDO' ||
                            c.status === 'AGUARDANDO_CONFIRMACAO') && (
                            <>
                              <ActionIcon
                                icon={Mail}
                                title="Reenviar email"
                                onClick={() => handleSendEmail(c)}
                              />
                              <ActionIcon
                                icon={MessageSquare}
                                title="Mandar WhatsApp"
                                onClick={() => handleSendWhatsapp(c)}
                              />
                              <ActionIcon
                                icon={CheckCircle2}
                                title="Marcar pago manual"
                                variant="emerald"
                                onClick={() => handleConfirmPaid(c)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-zinc-500">
                    Nenhuma cobrança {TAB_LABELS[tab].toLowerCase()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-500 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'cobrança' : 'cobranças'} · {TAB_LABELS[tab].toLowerCase()}
        </div>
      </div>

      <NewCobrancaModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function ActionIcon({
  icon: Icon,
  title,
  onClick,
  variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
  variant?: 'default' | 'emerald';
}) {
  const color =
    variant === 'emerald'
      ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400'
      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100';
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
