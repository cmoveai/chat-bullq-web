'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { pipelinesService } from '@/features/pipelines/services/pipelines.service';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';

interface NodePropertiesPanelProps {
  node: Node;
  nodes?: Node[];
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const inputCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1';

export function NodePropertiesPanel({ node, nodes, onUpdate, onDelete, onClose }: NodePropertiesPanelProps) {
  const data = node.data as Record<string, any>;
  const update = useCallback(
    (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value }),
    [node.id, data, onUpdate],
  );
  const action = (data.action as string) || 'SAVE_CONTACT';
  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesService.list(),
    enabled: node.type === 'ACTION' && action === 'MOVE_CARD_STAGE',
  });
  const agentsQuery = useQuery({
    queryKey: ['ai-agents'],
    queryFn: () => aiAgentsService.list(),
    enabled: node.type === 'ACTION' && action === 'ASSIGN_AI_AGENT',
  });
  // Alvos possíveis de JUMP: os demais nós do flow (exclui START e o próprio).
  const jumpTargets = (nodes ?? []).filter((n) => n.id !== node.id && n.type !== 'START');

  return (
    <div className="w-72 border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Propriedades</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-500 dark:bg-zinc-800">
            {node.type}
          </span>
        </div>

        {node.type === 'MESSAGE' && (
          <div>
            <label className={labelCls}>Mensagem</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={data.message || ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Olá {{name}}, como posso ajudar?"
            />
            <p className="mt-1 text-[10px] text-zinc-400">Use {'{{variavel}}'} para interpolar</p>
          </div>
        )}

        {node.type === 'MENU' && (
          <>
            <div>
              <label className={labelCls}>Título do Menu</label>
              <input className={inputCls} value={data.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Escolha uma opção:" />
            </div>
            <div>
              <label className={labelCls}>Opções</label>
              {(data.options || []).map((opt: any, i: number) => (
                <div key={i} className="mt-1 flex gap-1">
                  <input
                    className={`${inputCls} flex-1`}
                    value={opt.label}
                    onChange={(e) => {
                      const opts = [...(data.options || [])];
                      opts[i] = { ...opts[i], label: e.target.value };
                      update('options', opts);
                    }}
                    placeholder={`Opção ${i + 1}`}
                  />
                  <button
                    onClick={() => update('options', (data.options || []).filter((_: any, j: number) => j !== i))}
                    className="rounded p-1 text-zinc-400 hover:text-red-500"
                  ><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button
                onClick={() => update('options', [...(data.options || []), { label: '', value: `opt_${Date.now()}` }])}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >+ Adicionar opção</button>
            </div>
          </>
        )}

        {node.type === 'CONDITION' && (
          <>
            <div>
              <label className={labelCls}>Variável</label>
              <input className={inputCls} value={data.variable || ''} onChange={(e) => update('variable', e.target.value)} placeholder="lastMenuSelection" />
            </div>
            <div>
              <label className={labelCls}>Operador</label>
              <select className={inputCls} value={data.operator || 'equals'} onChange={(e) => update('operator', e.target.value)}>
                <option value="equals">Igual a</option>
                <option value="not_equals">Diferente de</option>
                <option value="contains">Contém</option>
                <option value="gt">Maior que</option>
                <option value="lt">Menor que</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor</label>
              <input className={inputCls} value={data.value || ''} onChange={(e) => update('value', e.target.value)} />
            </div>
          </>
        )}

        {node.type === 'WAIT' && (
          <>
            <div>
              <label className={labelCls}>Aguardar tempo (segundos)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={data.delaySeconds ?? ''}
                onChange={(e) => update('delaySeconds', e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder="0 = espera resposta"
              />
              <p className="mt-1 text-[10px] text-zinc-400">
                Maior que 0 vira pausa temporizada (não espera resposta). A sessão retoma sozinha depois do tempo. Na simulação o tempo é pulado.
              </p>
            </div>
            {!data.delaySeconds && (
              <>
                <div>
                  <label className={labelCls}>Mensagem de espera</label>
                  <input className={inputCls} value={data.prompt || ''} onChange={(e) => update('prompt', e.target.value)} placeholder="Digite sua resposta..." />
                </div>
                <div>
                  <label className={labelCls}>Salvar resposta em</label>
                  <input className={inputCls} value={data.saveAs || ''} onChange={(e) => update('saveAs', e.target.value)} placeholder="lastInput" />
                </div>
              </>
            )}
          </>
        )}

        {node.type === 'TRANSFER' && (
          <div>
            <label className={labelCls}>Mensagem de transferência</label>
            <input className={inputCls} value={data.message || ''} onChange={(e) => update('message', e.target.value)} placeholder="Transferindo para um atendente..." />
          </div>
        )}

        {node.type === 'ACTION' && (
          <>
            <div>
              <label className={labelCls}>Ação</label>
              <select className={inputCls} value={action} onChange={(e) => update('action', e.target.value)}>
                <option value="SAVE_CONTACT">Salvar contato</option>
                <option value="ADD_TAG">Adicionar tag</option>
                <option value="SET_QUALIFICATION">Qualificar lead</option>
                <option value="SET_LEAD_SCORE">Lead score</option>
                <option value="MOVE_CARD_STAGE">Mover card de etapa</option>
                <option value="CREATE_TASK">Criar tarefa</option>
                <option value="SET_VARIABLE">Definir variável</option>
                <option value="ASSIGN_AI_AGENT">Atribuir agente IA</option>
                <option value="JUMP">Pular para nó (goto)</option>
                <option value="HANDOFF">Transferir p/ humano</option>
              </select>
            </div>

            {action === 'SAVE_CONTACT' && (
              <>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Salva os dados capturados no cadastro do contato. Use {'{{variavel}}'} pra puxar o que o cliente respondeu.
                </p>
                {([['name', 'Nome'], ['email', 'E-mail'], ['phone', 'Telefone'], ['notes', 'Notas']] as const).map(([field, label]) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <input
                      className={inputCls}
                      value={(data.fields?.[field]) || ''}
                      onChange={(e) => update('fields', { ...(data.fields || {}), [field]: e.target.value })}
                      placeholder={field === 'name' ? '{{nome}}' : field === 'email' ? '{{email}}' : field === 'phone' ? '{{telefone}}' : ''}
                    />
                  </div>
                ))}
                <p className="text-[10px] text-zinc-400">Campos em branco não são alterados no contato.</p>
              </>
            )}

            {action === 'ADD_TAG' && (
              <div>
                <label className={labelCls}>Tag</label>
                <input className={inputCls} value={data.tag || ''} onChange={(e) => update('tag', e.target.value)} placeholder="lead-quente" />
              </div>
            )}

            {action === 'SET_QUALIFICATION' && (
              <>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={data.status || 'QUALIFIED'} onChange={(e) => update('status', e.target.value)}>
                    <option value="NEW">Novo</option>
                    <option value="QUALIFYING">Em qualificação</option>
                    <option value="QUALIFIED">Qualificado</option>
                    <option value="DISQUALIFIED">Desqualificado</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pontos a somar (opcional)</label>
                  <input type="number" className={inputCls} value={data.scoreDelta ?? ''} onChange={(e) => update('scoreDelta', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
              </>
            )}

            {action === 'SET_LEAD_SCORE' && (
              <>
                <div>
                  <label className={labelCls}>Definir score (absoluto)</label>
                  <input type="number" className={inputCls} value={data.score ?? ''} onChange={(e) => update('score', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
                <div>
                  <label className={labelCls}>Ou ajustar (+/-)</label>
                  <input type="number" className={inputCls} value={data.delta ?? ''} onChange={(e) => update('delta', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
              </>
            )}

            {action === 'MOVE_CARD_STAGE' && (
              <div>
                <label className={labelCls}>Etapa de destino</label>
                <select className={inputCls} value={data.toStageId || ''} onChange={(e) => update('toStageId', e.target.value)}>
                  <option value="">Selecione…</option>
                  {(pipelinesQuery.data ?? []).map((p) => (
                    <optgroup key={p.id} label={p.name}>
                      {(p.stages ?? []).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {action === 'CREATE_TASK' && (
              <>
                <div>
                  <label className={labelCls}>Título da tarefa</label>
                  <input className={inputCls} value={data.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Ligar para o lead" />
                </div>
                <div>
                  <label className={labelCls}>Prazo em horas (opcional)</label>
                  <input type="number" className={inputCls} value={data.dueInHours ?? ''} onChange={(e) => update('dueInHours', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
              </>
            )}

            {action === 'SET_VARIABLE' && (
              <>
                <div>
                  <label className={labelCls}>Nome da variável</label>
                  <input className={inputCls} value={data.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="plano" />
                </div>
                <div>
                  <label className={labelCls}>Valor</label>
                  <input className={inputCls} value={data.value ?? ''} onChange={(e) => update('value', e.target.value)} placeholder="growth ou {{outraVar}}" />
                  <p className="mt-1 text-[10px] text-zinc-400">Use {'{{variavel}}'} pra compor a partir de outra. Fica disponível em CONDITION e MESSAGE.</p>
                </div>
              </>
            )}

            {action === 'ASSIGN_AI_AGENT' && (
              <div>
                <label className={labelCls}>Agente IA</label>
                <select className={inputCls} value={data.agentId || ''} onChange={(e) => update('agentId', e.target.value)}>
                  <option value="">Selecione…</option>
                  {(agentsQuery.data ?? []).map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-zinc-400">Só atribui o agente responsável à conversa/card. Não liga IA no canal nem dispara resposta automática.</p>
              </div>
            )}

            {action === 'JUMP' && (
              <div>
                <label className={labelCls}>Pular para o nó</label>
                <select className={inputCls} value={data.targetNodeId || ''} onChange={(e) => update('targetNodeId', e.target.value)}>
                  <option value="">Selecione…</option>
                  {jumpTargets.map((n) => (
                    <option key={n.id} value={n.id}>
                      {((n.data as any)?.label as string) || `${n.type} · ${n.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-zinc-400">Máximo de 10 saltos por execução — loops são interrompidos automaticamente.</p>
              </div>
            )}

            {['ADD_TAG', 'SET_QUALIFICATION', 'SET_LEAD_SCORE', 'MOVE_CARD_STAGE', 'CREATE_TASK', 'HANDOFF'].includes(action) && (
              <div>
                <label className={labelCls}>Motivo (auditoria)</label>
                <input className={inputCls} value={data.reason || ''} onChange={(e) => update('reason', e.target.value)} placeholder="Por que esta ação" />
              </div>
            )}
          </>
        )}

        {node.type !== 'START' && node.type !== 'END_FLOW' && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              onClick={() => onDelete(node.id)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover nó
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
