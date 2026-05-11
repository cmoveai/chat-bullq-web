'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, MessageSquare, Pause, FileText } from 'lucide-react';
import type { Subscriber } from '../_mocks/subscribers';

const STATUS_INVOICE: Record<
  'paid' | 'open' | 'overdue' | 'refunded',
  { label: string; className: string }
> = {
  paid: { label: 'paga', className: 'text-emerald-600 dark:text-emerald-400' },
  open: { label: 'aberta', className: 'text-zinc-500 dark:text-zinc-400' },
  overdue: { label: 'atrasada', className: 'text-red-600 dark:text-red-400' },
  refunded: { label: 'estornada', className: 'text-zinc-400 dark:text-zinc-600' },
};

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

export function SubscriberDrawer({
  subscriber,
  onClose,
}: {
  subscriber: Subscriber | null;
  onClose: () => void;
}) {
  const router = useRouter();

  function handleCobrar() {
    if (!subscriber) return;
    toast.success(`Abrindo cobranças · pré-filtrado por ${subscriber.name}`);
    router.push('/super-admin/cobrancas');
    onClose();
  }

  function handlePausar() {
    if (!subscriber) return;
    toast('Pausar assinatura', {
      description: `${subscriber.name} · disponível quando Sprint 2 Kirvano entrar`,
    });
  }

  function handleWhatsApp() {
    if (!subscriber?.telefone) {
      toast.error('Esse assinante não tem telefone cadastrado');
      return;
    }
    const url = `https://wa.me/${subscriber.telefone.replace(/\D/g, '')}`;
    window.open(url, '_blank');
  }

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (subscriber) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [subscriber, onClose]);

  if (!subscriber) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-50 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {subscriber.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 truncate">
              {subscriber.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors text-zinc-500"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium">
              Plano {subscriber.plan}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {subscriber.mrrBrl !== null
                ? `${formatBrl(subscriber.mrrBrl)}/mês`
                : 'em trial'}
            </span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Cliente desde {subscriber.customerSince} · {subscriber.customerSinceDays} dias
          </div>

          <CadastraisSection subscriber={subscriber} />

          <section>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
              Faturas
            </div>
            {subscriber.invoices.length === 0 ? (
              <div className="text-xs text-zinc-400 dark:text-zinc-600 italic">
                Sem faturas (ainda em trial)
              </div>
            ) : (
              <ul className="space-y-2">
                {subscriber.invoices.map((inv, idx) => {
                  const sty = STATUS_INVOICE[inv.status];
                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-zinc-700 dark:text-zinc-300 w-16">
                        {inv.reference}
                      </span>
                      <span className="tabular-nums text-zinc-900 dark:text-zinc-100 flex-1">
                        {formatBrl(inv.amountBrl)}
                      </span>
                      <span className={`text-xs font-medium ${sty.className}`}>
                        {sty.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
              Uso (últ 30 dias)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Mensagens" value={subscriber.messages30d.toLocaleString('pt-BR')} />
              <Stat
                label="Canais"
                value={subscriber.channels.join(' · ') || '—'}
              />
              <Stat label="Agentes IA" value={String(subscriber.agentsCount)} />
              <Stat
                label="Custo LLM"
                value={`$${subscriber.llmCostMonthUsd.toFixed(2)}`}
              />
              <Stat
                label="Margem"
                value={`${subscriber.marginPct}%`}
                highlight={
                  subscriber.marginPct >= 60
                    ? 'good'
                    : subscriber.marginPct >= 40
                      ? 'warn'
                      : 'bad'
                }
              />
              <Stat label="Último login" value={subscriber.lastLoginRelative} />
            </div>
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
              Ações
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ActionButton icon={MessageSquare} label="Cobrar" onClick={handleCobrar} />
              <ActionButton icon={Pause} label="Pausar" onClick={handlePausar} />
              <ActionButton icon={FileText} label="WhatsApp" onClick={handleWhatsApp} />
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'good' | 'warn' | 'bad';
}) {
  const color =
    highlight === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : highlight === 'warn'
        ? 'text-amber-600 dark:text-amber-500'
        : highlight === 'bad'
          ? 'text-red-600 dark:text-red-400'
          : 'text-zinc-900 dark:text-zinc-100';
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500 font-medium mb-1">
        {label}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

const ORIGEM_LABEL: Record<NonNullable<Subscriber['origem']>, string> = {
  site: 'Site',
  indicacao: 'Indicação',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  evento: 'Evento',
  outro: 'Outro',
};

function CadastraisSection({ subscriber }: { subscriber: Subscriber }) {
  const hasAny =
    subscriber.razaoSocial ||
    subscriber.cnpj ||
    subscriber.telefone ||
    subscriber.cidade ||
    subscriber.segmento;

  if (!hasAny && !subscriber.origem && !subscriber.notas) return null;

  return (
    <>
      <section>
        <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
          Cadastro
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {subscriber.razaoSocial && (
            <Info label="Razão social" value={subscriber.razaoSocial} colSpan />
          )}
          {subscriber.cnpj && <Info label="CNPJ" value={subscriber.cnpj} mono />}
          {subscriber.telefone && (
            <Info
              label="Telefone"
              value={formatPhone(subscriber.telefone)}
            />
          )}
          {(subscriber.cidade || subscriber.uf) && (
            <Info
              label="Localização"
              value={[subscriber.cidade, subscriber.uf].filter(Boolean).join(' · ')}
              colSpan
            />
          )}
          {subscriber.segmento && (
            <Info label="Segmento" value={subscriber.segmento} colSpan />
          )}
        </div>
      </section>

      {(subscriber.origem || subscriber.origemDetalhe) && (
        <section>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
            Origem do lead
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 space-y-1">
            {subscriber.origem && (
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {ORIGEM_LABEL[subscriber.origem]}
              </div>
            )}
            {subscriber.origemDetalhe && (
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {subscriber.origemDetalhe}
              </div>
            )}
          </div>
        </section>
      )}

      {subscriber.notas && (
        <section>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
            Notas
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5">
            {subscriber.notas}
          </div>
        </section>
      )}
    </>
  );
}

function Info({
  label,
  value,
  mono,
  colSpan,
}: {
  label: string;
  value: string;
  mono?: boolean;
  colSpan?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 ${colSpan ? 'col-span-2' : ''}`}>
      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500 font-medium mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm text-zinc-900 dark:text-zinc-100 ${mono ? 'font-mono text-[13px]' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 13) {
    return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  return raw;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-xs text-zinc-700 dark:text-zinc-300"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
