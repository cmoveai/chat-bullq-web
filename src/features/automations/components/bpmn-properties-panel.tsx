'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Trash2, Copy } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { SUBTYPES, type BpmnNodeCategory } from './nodes/bpmn-nodes';
import { pipelinesService } from '@/features/pipelines/services/pipelines.service';
import { chatbotService } from '@/features/chatbot/services/chatbot.service';

interface BpmnPropertiesPanelProps {
  node: Node;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1';

export function BpmnPropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
}: BpmnPropertiesPanelProps) {
  const data = (node.data ?? {}) as Record<string, any>;
  const category = node.type as BpmnNodeCategory;
  const subtypes = SUBTYPES[category] ?? [];
  const subtype = subtypes.find((s) => s.code === data.subtype);

  const update = useCallback(
    (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value }),
    [node.id, data, onUpdate],
  );

  // Etapas do funil — só busca quando o node é MOVE_CARD_STAGE.
  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesService.list(),
    enabled: data.subtype === 'MOVE_CARD_STAGE',
  });
  const flowsQuery = useQuery({
    queryKey: ['chatbot-flows'],
    queryFn: () => chatbotService.list(),
    enabled: data.subtype === 'START_FLOW',
  });

  return (
    <div className="w-80 border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Propriedades</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800">
            {category}
          </span>
          {subtype && (
            <span className="text-xs text-zinc-700 dark:text-zinc-300">
              {subtype.label}
            </span>
          )}
        </div>

        <div>
          <label className={labelCls}>Tipo</label>
          <select
            className={inputCls}
            value={data.subtype ?? subtypes[0]?.code ?? ''}
            onChange={(e) => update('subtype', e.target.value)}
          >
            {subtypes.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          {subtype && (
            <p className="mt-1 text-[10px] italic text-zinc-400">{subtype.description}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Rótulo no canvas</label>
          <input
            className={inputCls}
            value={data.label ?? ''}
            onChange={(e) => update('label', e.target.value)}
            placeholder="Texto curto que aparece no card"
          />
        </div>

        {/* Triggers */}
        {category === 'TRIGGER' && data.subtype === 'IG_COMMENT' && (
          <div>
            <label className={labelCls}>Post ID (opcional)</label>
            <input
              className={inputCls}
              value={data.postId ?? ''}
              onChange={(e) => update('postId', e.target.value)}
              placeholder="vazio = qualquer post"
            />
          </div>
        )}
        {category === 'TRIGGER' && data.subtype === 'SCHEDULE' && (
          <div>
            <label className={labelCls}>Cron (estilo cron)</label>
            <input
              className={inputCls}
              value={data.cron ?? ''}
              onChange={(e) => update('cron', e.target.value)}
              placeholder="0 9 * * 1-5"
            />
          </div>
        )}

        {/* Conditions */}
        {category === 'CONDITION' && data.subtype === 'KEYWORD' && (
          <>
            <div>
              <label className={labelCls}>Palavras-chave (1 por linha)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={(data.keywords ?? []).join('\n')}
                onChange={(e) =>
                  update(
                    'keywords',
                    e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="preço\norçamento\nquanto custa"
              />
            </div>
            <div>
              <label className={labelCls}>Match</label>
              <select
                className={inputCls}
                value={data.matchMode ?? 'any'}
                onChange={(e) => update('matchMode', e.target.value)}
              >
                <option value="any">Qualquer</option>
                <option value="all">Todas</option>
              </select>
            </div>
          </>
        )}
        {category === 'CONDITION' && data.subtype === 'TAG' && (
          <div>
            <label className={labelCls}>Tag</label>
            <input
              className={inputCls}
              value={data.tag ?? ''}
              onChange={(e) => update('tag', e.target.value)}
              placeholder="lead-quente"
            />
          </div>
        )}

        {/* Actions */}
        {(category === 'ACTION') &&
          (data.subtype === 'SEND_DM' ||
            data.subtype === 'SEND_WA' ||
            data.subtype === 'SEND_EMAIL') && (
            <div>
              <label className={labelCls}>Mensagem</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={data.message ?? ''}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Olá {{name}}, recebi seu comentário..."
              />
              <p className="mt-1 text-[10px] text-zinc-400">
                Use {'{{variavel}}'} para interpolar
              </p>
            </div>
          )}
        {category === 'ACTION' && data.subtype === 'SEND_EMAIL' && (
          <div>
            <label className={labelCls}>Assunto</label>
            <input
              className={inputCls}
              value={data.subject ?? ''}
              onChange={(e) => update('subject', e.target.value)}
            />
          </div>
        )}
        {category === 'ACTION' && data.subtype === 'TAG' && (
          <div>
            <label className={labelCls}>Tag a adicionar</label>
            <input
              className={inputCls}
              value={data.tag ?? ''}
              onChange={(e) => update('tag', e.target.value)}
            />
          </div>
        )}
        {category === 'ACTION' && data.subtype === 'RUN_AGENT' && (
          <div>
            <label className={labelCls}>Agente ID</label>
            <input
              className={inputCls}
              value={data.agentId ?? ''}
              onChange={(e) => update('agentId', e.target.value)}
              placeholder="ID do AiAgent"
            />
          </div>
        )}

        {/* Ações de funil (Fase 2.5) */}
        {category === 'ACTION' && data.subtype === 'MOVE_CARD_STAGE' && (
          <div>
            <label className={labelCls}>Etapa de destino</label>
            <select
              className={inputCls}
              value={data.toStageId ?? ''}
              onChange={(e) => update('toStageId', e.target.value)}
            >
              <option value="">Selecione…</option>
              {(pipelinesQuery.data ?? []).map((p) => (
                <optgroup key={p.id} label={p.name}>
                  {(p.stages ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        {category === 'ACTION' && data.subtype === 'SET_QUALIFICATION' && (
          <>
            <div>
              <label className={labelCls}>Status de qualificação</label>
              <select
                className={inputCls}
                value={data.status ?? 'QUALIFIED'}
                onChange={(e) => update('status', e.target.value)}
              >
                <option value="NEW">Novo</option>
                <option value="QUALIFYING">Em qualificação</option>
                <option value="QUALIFIED">Qualificado</option>
                <option value="DISQUALIFIED">Desqualificado</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Pontos a somar (opcional)</label>
              <input
                type="number"
                className={inputCls}
                value={data.scoreDelta ?? ''}
                onChange={(e) =>
                  update('scoreDelta', e.target.value === '' ? undefined : Number(e.target.value))
                }
                placeholder="ex: 30"
              />
            </div>
          </>
        )}
        {category === 'ACTION' && data.subtype === 'SET_LEAD_SCORE' && (
          <>
            <div>
              <label className={labelCls}>Definir score (valor absoluto)</label>
              <input
                type="number"
                className={inputCls}
                value={data.score ?? ''}
                onChange={(e) =>
                  update('score', e.target.value === '' ? undefined : Number(e.target.value))
                }
                placeholder="ex: 50"
              />
            </div>
            <div>
              <label className={labelCls}>Ou ajustar (+/-)</label>
              <input
                type="number"
                className={inputCls}
                value={data.delta ?? ''}
                onChange={(e) =>
                  update('delta', e.target.value === '' ? undefined : Number(e.target.value))
                }
                placeholder="ex: 20"
              />
            </div>
          </>
        )}
        {category === 'ACTION' && data.subtype === 'CREATE_TASK' && (
          <>
            <div>
              <label className={labelCls}>Título da tarefa</label>
              <input
                className={inputCls}
                value={data.title ?? ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Ligar para o lead"
              />
            </div>
            <div>
              <label className={labelCls}>Prazo em horas (opcional)</label>
              <input
                type="number"
                className={inputCls}
                value={data.dueInHours ?? ''}
                onChange={(e) =>
                  update('dueInHours', e.target.value === '' ? undefined : Number(e.target.value))
                }
                placeholder="ex: 24"
              />
            </div>
          </>
        )}
        {category === 'ACTION' && data.subtype === 'SCHEDULE_FOLLOWUP' && (
          <>
            <div>
              <label className={labelCls}>Retornar daqui a (horas)</label>
              <input
                type="number"
                className={inputCls}
                value={data.inHours ?? 24}
                onChange={(e) => update('inHours', Number(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <label className={labelCls}>Nota (vira título da tarefa)</label>
              <input
                className={inputCls}
                value={data.note ?? ''}
                onChange={(e) => update('note', e.target.value)}
                placeholder="Retornar contato"
              />
            </div>
          </>
        )}
        {category === 'ACTION' &&
          [
            'MOVE_CARD_STAGE',
            'SET_QUALIFICATION',
            'SET_LEAD_SCORE',
            'CREATE_TASK',
            'SCHEDULE_FOLLOWUP',
            'HANDOFF',
          ].includes(data.subtype) && (
            <div>
              <label className={labelCls}>Motivo (auditoria)</label>
              <input
                className={inputCls}
                value={data.reason ?? ''}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="Por que esta ação"
              />
            </div>
          )}

        {category === 'ACTION' && data.subtype === 'START_FLOW' && (
          <div>
            <label className={labelCls}>Fluxo do chatbot</label>
            <select
              className={inputCls}
              value={data.flowId ?? ''}
              onChange={(e) => update('flowId', e.target.value)}
            >
              <option value="">Selecione…</option>
              {(flowsQuery.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-zinc-400">
              Inicia este fluxo de conversa na conversa do contato.
            </p>
          </div>
        )}

        {/* Utils */}
        {category === 'UTIL' && data.subtype === 'DELAY' && (
          <div>
            <label className={labelCls}>Esperar (minutos)</label>
            <input
              type="number"
              className={inputCls}
              value={data.minutes ?? 5}
              onChange={(e) => update('minutes', Number(e.target.value))}
              min={1}
            />
          </div>
        )}

        <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            onClick={() => onDuplicate(node.id)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicar (Cmd+D)
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remover (Delete)
          </button>
        </div>
      </div>
    </div>
  );
}
