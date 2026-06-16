'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Radio,
  UserCheck,
  Tag as TagIcon,
  Clock,
  UserPlus,
  Link2,
  Target,
  CheckSquare,
  Pencil,
  KanbanSquare,
  ArrowRightLeft,
  Eye,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import type { Conversation } from '../services/inbox.service';
import { QUEUE_BY_KEY, computeQueueStatus } from '../lib/conversation-queue';
import { pipelinesService } from '@/features/pipelines/services/pipelines.service';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

type CrmAction = { key: string; label: string; icon: React.ElementType };

const ACTIONS_NO_CONTACT: CrmAction[] = [
  { key: 'criar_lead', label: 'Criar lead', icon: UserPlus },
  { key: 'atribuir_lead', label: 'Atribuir a lead existente', icon: Link2 },
];

const ACTIONS_CONTACT: CrmAction[] = [
  { key: 'criar_oportunidade', label: 'Criar oportunidade', icon: Target },
  { key: 'tarefa', label: 'Adicionar tarefa', icon: CheckSquare },
  { key: 'atribuir', label: 'Atribuir responsável', icon: UserCheck },
  { key: 'editar', label: 'Editar contato', icon: Pencil },
];

const ACTIONS_OPP: CrmAction[] = [
  { key: 'ver_pipeline', label: 'Ver no pipeline', icon: Eye },
  { key: 'mover_etapa', label: 'Mover etapa', icon: ArrowRightLeft },
  { key: 'tarefa', label: 'Adicionar tarefa', icon: CheckSquare },
];

export function InboxLeadPanel({ conversation }: { conversation: Conversation | null }) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [creatingOpp, setCreatingOpp] = useState(false);

  if (!conversation) {
    return (
      <aside className="hidden w-80 shrink-0 flex-col border-l border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 xl:flex">
        <div className="m-auto text-center text-sm text-zinc-400 dark:text-zinc-500">
          Selecione uma conversa para ver o lead.
        </div>
      </aside>
    );
  }

  const c = conversation;
  const queue = QUEUE_BY_KEY[computeQueueStatus(c)];
  const tags = c.contact?.tags ?? c.tags ?? [];

  // Estado a partir do que o payload do inbox realmente expõe.
  // contactId é sempre presente, então "tem contato" exige nome ou telefone reais.
  const hasContact = !!(c.contact && (c.contact.name || c.contact.phone));
  // Card ("oportunidade") ativo vem de crm.activeCard (GET /conversations/:id).
  // Mantém o fallback defensivo a campos legados, sem inventar dado.
  const opp: any = c.crm?.activeCard ?? (c as any).card ?? (c as any).opportunity ?? null;
  const hasOpportunity = !!opp;

  const fireNotice = () => setNotice('Ação de CRM disponível em breve nesta versão.');

  // Cria a oportunidade no pipeline default a partir da conversa. O backend
  // deriva o contactId da própria conversa (só enviamos conversationId) e a
  // valida na org. Depois invalidamos o detalhe pra o painel virar Estado 3.
  async function handleCreateOpportunity() {
    if (creatingOpp) return;
    setCreatingOpp(true);
    setNotice(null);
    try {
      const pipelines = await pipelinesService.list();
      if (!pipelines.length) {
        toast.error('Nenhum pipeline disponível para criar oportunidade.');
        return;
      }
      const target = pipelines.find((p) => p.isDefault) ?? pipelines[0];
      await pipelinesService.createCard(target.id, { conversationId: c.id });
      await queryClient.invalidateQueries({ queryKey: ['conversation', c.id] });
      toast.success('Oportunidade criada no pipeline');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar oportunidade');
    } finally {
      setCreatingOpp(false);
    }
  }

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-zinc-200/80 bg-white p-4 scrollbar-thin dark:border-zinc-800 dark:bg-zinc-950 xl:flex">
      {/* Cabeçalho + dados do contato — só quando há contato real */}
      {hasContact && (
        <section>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {(c.contact?.name || c.contact?.phone || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {c.contact?.name || c.contact?.phone}
              </p>
              <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${queue.active}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${queue.dot}`} />
                {queue.label}
              </span>
            </div>
          </div>

          <dl className="mt-4 space-y-2.5 text-xs">
            <Row icon={Phone} label="Telefone" value={c.contact?.phone || '—'} />
            <Row icon={Radio} label="Canal" value={c.channel?.name || c.channel?.type || '—'} />
            <Row icon={UserCheck} label="Responsável" value={c.assignedTo?.name || 'Não atribuído'} />
            <Row icon={Clock} label="Última interação" value={fmtDate(c.lastMessageAt)} />
            <div className="flex items-start gap-2">
              <TagIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <div className="flex flex-1 flex-wrap gap-1">
                {tags.length > 0 ? (
                  tags.map((t, i) => (
                    <span key={i} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {t.tag?.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-zinc-400">Sem tags</span>
                )}
              </div>
            </div>
          </dl>
        </section>
      )}

      {/* Bloco CRM — um de três estados, sem contradição com o cabeçalho */}
      {hasOpportunity ? (
        // Estado 3 — Oportunidade ativa / card vinculado
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Oportunidade ativa</p>
          </div>
          <dl className="mt-3 space-y-2.5 text-xs">
            <Row icon={Target} label="Oportunidade" value={opp.title || opp.name || '—'} />
            <Row icon={KanbanSquare} label="Etapa" value={opp.stage?.name || opp.stageName || '—'} />
            <Row icon={Info} label="Status" value={opp.status || '—'} />
            <Row icon={UserCheck} label="Responsável" value={opp.assignedTo?.name || c.assignedTo?.name || 'Não atribuído'} />
            {(opp.value ?? null) !== null && (
              <Row icon={Target} label="Valor" value={String(opp.value)} />
            )}
            {opp.nextTask?.title && <Row icon={CheckSquare} label="Próxima tarefa" value={opp.nextTask.title} />}
          </dl>
          <CrmActions actions={ACTIONS_OPP} onAction={fireNotice} />
          {notice && <NoticeLine text={notice} />}
        </section>
      ) : hasContact ? (
        // Estado 2 — Contato identificado, sem oportunidade
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contato identificado</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Este contato já está vinculado à conversa, mas ainda não possui oportunidade ativa no CRM.
          </p>
          <CrmActions
            actions={ACTIONS_CONTACT}
            busyKey={creatingOpp ? 'criar_oportunidade' : undefined}
            onAction={(key) =>
              key === 'criar_oportunidade' ? handleCreateOpportunity() : fireNotice()
            }
          />
          {notice && <NoticeLine text={notice} />}
        </section>
      ) : (
        // Estado 1 — Sem contato/lead vinculado
        <section className="rounded-xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-400" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lead não encontrado</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Esta conversa ainda não está vinculada a um contato, lead ou oportunidade no CRM.
          </p>
          <CrmActions actions={ACTIONS_NO_CONTACT} onAction={fireNotice} />
          {notice && <NoticeLine text={notice} />}
        </section>
      )}

      {/* Resumo IA — estado vazio (sem chamada real) */}
      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resumo IA</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
          Resumo por IA ainda não disponível para esta conversa.
        </p>
      </section>
    </aside>
  );
}

function CrmActions({
  actions,
  onAction,
  busyKey,
}: {
  actions: CrmAction[];
  onAction: (key: string) => void;
  busyKey?: string;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {actions.map((a) => {
        const busy = busyKey === a.key;
        return (
          <button
            key={a.key}
            onClick={() => onAction(a.key)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 transition-colors hover:border-primary/40 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <a.icon className="h-3.5 w-3.5" />}
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

function NoticeLine({ text }: { text: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-zinc-400">
      <Info className="h-3 w-3" /> {text}
    </p>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      <span className="text-zinc-400">{label}:</span>
      <span className="ml-auto truncate text-right font-medium text-zinc-700 dark:text-zinc-200">{value}</span>
    </div>
  );
}
