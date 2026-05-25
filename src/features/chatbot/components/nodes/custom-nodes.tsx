'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import {
  Play, MessageSquare, List, GitBranch, Clock, UserPlus, ArrowRightLeft, Flag,
} from 'lucide-react';
import { BaseNode } from './base-node';

const ic = 'h-4 w-4 text-white';

export const StartNode = memo(({ selected }: NodeProps) => (
  <BaseNode label="Início" icon={<Play className={ic} />} color="bg-emerald-500" selected={selected} hasInput={false}>
    <p className="italic opacity-60">Ponto de entrada do fluxo</p>
  </BaseNode>
));
StartNode.displayName = 'StartNode';

export const MessageNode = memo(({ data, selected }: NodeProps) => (
  <BaseNode label="Mensagem" icon={<MessageSquare className={ic} />} color="bg-blue-500" selected={selected}>
    <p className="line-clamp-2">{(data as any).message || 'Texto da mensagem...'}</p>
  </BaseNode>
));
MessageNode.displayName = 'MessageNode';

export const MenuNode = memo(({ data, selected }: NodeProps) => {
  const options = (data as any).options || [];
  return (
    <BaseNode label="Menu" icon={<List className={ic} />} color="bg-violet-500" selected={selected} outputCount={Math.max(options.length, 1)}>
      <p className="font-medium">{(data as any).title || 'Menu de opções'}</p>
      {options.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {options.map((opt: any, i: number) => (
            <li key={i} className="flex items-center gap-1">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">{i + 1}</span>
              <span className="truncate">{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </BaseNode>
  );
});
MenuNode.displayName = 'MenuNode';

export const ConditionNode = memo(({ data, selected }: NodeProps) => (
  <BaseNode label="Condição" icon={<GitBranch className={ic} />} color="bg-amber-500" selected={selected} outputCount={2}>
    <p>{(data as any).variable || 'variavel'} {(data as any).operator || '=='} {(data as any).value || '?'}</p>
    <div className="mt-1 flex gap-2 text-[10px]">
      <span className="rounded bg-green-100 px-1 text-green-700">Sim ↓</span>
      <span className="rounded bg-red-100 px-1 text-red-700">Não ↓</span>
    </div>
  </BaseNode>
));
ConditionNode.displayName = 'ConditionNode';

export const WaitNode = memo(({ data, selected }: NodeProps) => (
  <BaseNode label="Aguardar Input" icon={<Clock className={ic} />} color="bg-cyan-500" selected={selected}>
    <p>{(data as any).prompt || 'Aguardando resposta do usuário...'}</p>
    {(data as any).saveAs && <p className="mt-1 opacity-50">Salvar em: {(data as any).saveAs}</p>}
  </BaseNode>
));
WaitNode.displayName = 'WaitNode';

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const fields = ((data as any).fields || {}) as Record<string, string>;
  const filled = Object.entries(fields).filter(([, v]) => v).map(([k]) => k);
  const labels: Record<string, string> = { name: 'nome', email: 'e-mail', phone: 'telefone', notes: 'notas' };
  return (
    <BaseNode label="Salvar no contato" icon={<UserPlus className={ic} />} color="bg-emerald-500" selected={selected}>
      <p>{filled.length ? `Salva: ${filled.map((f) => labels[f] || f).join(', ')}` : 'Configure os campos a salvar'}</p>
    </BaseNode>
  );
});
ActionNode.displayName = 'ActionNode';

export const TransferNode = memo(({ data, selected }: NodeProps) => (
  <BaseNode label="Transferir" icon={<ArrowRightLeft className={ic} />} color="bg-rose-500" selected={selected} hasOutput={false}>
    <p>{(data as any).message || 'Transferindo para atendente...'}</p>
  </BaseNode>
));
TransferNode.displayName = 'TransferNode';

export const EndNode = memo(({ selected }: NodeProps) => (
  <BaseNode label="Fim" icon={<Flag className={ic} />} color="bg-zinc-500" selected={selected} hasOutput={false}>
    <p className="italic opacity-60">Fluxo encerrado</p>
  </BaseNode>
));
EndNode.displayName = 'EndNode';

export const nodeTypes = {
  START: StartNode,
  MESSAGE: MessageNode,
  MENU: MenuNode,
  CONDITION: ConditionNode,
  WAIT: WaitNode,
  ACTION: ActionNode,
  TRANSFER: TransferNode,
  END_FLOW: EndNode,
};
