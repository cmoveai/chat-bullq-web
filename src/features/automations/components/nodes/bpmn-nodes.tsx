'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export type BpmnNodeCategory = 'TRIGGER' | 'CONDITION' | 'ACTION' | 'UTIL';

export interface BpmnSubtype {
  code: string;
  label: string;
  icon: string;
  description: string;
}

export const SUBTYPES: Record<BpmnNodeCategory, BpmnSubtype[]> = {
  TRIGGER: [
    {
      code: 'IG_COMMENT',
      label: 'Comentário Instagram',
      icon: 'IG',
      description: 'Dispara quando alguém comenta um post',
    },
    {
      code: 'IG_DM',
      label: 'DM Instagram',
      icon: 'IG',
      description: 'Dispara quando chega uma mensagem direta no Instagram',
    },
    {
      code: 'WA_MESSAGE',
      label: 'Mensagem WhatsApp',
      icon: 'WA',
      description: 'Dispara quando chega mensagem nova',
    },
    {
      code: 'SCHEDULE',
      label: 'Agendado',
      icon: 'SCH',
      description: 'Dispara em horários definidos',
    },
    {
      code: 'MANUAL',
      label: 'Manual',
      icon: 'MAN',
      description: 'Disparado manualmente do painel',
    },
  ],
  CONDITION: [
    {
      code: 'KEYWORD',
      label: 'Palavra-chave',
      icon: 'KW',
      description: 'Verifica se o texto contém palavra',
    },
    {
      code: 'TIME_WINDOW',
      label: 'Horário comercial',
      icon: 'TM',
      description: 'Verifica se está dentro do horário',
    },
    {
      code: 'TAG',
      label: 'Tem tag',
      icon: 'TG',
      description: 'Verifica se contato tem uma tag',
    },
    {
      code: 'FIRST_TIME',
      label: 'Primeira vez',
      icon: 'F1',
      description: 'Primeira interação do contato',
    },
  ],
  ACTION: [
    {
      code: 'SEND_DM',
      label: 'Enviar DM',
      icon: 'DM',
      description: 'Envia DM no Instagram',
    },
    {
      code: 'SEND_WA',
      label: 'Enviar WhatsApp',
      icon: 'WA',
      description: 'Envia mensagem no WhatsApp',
    },
    {
      code: 'SEND_EMAIL',
      label: 'Enviar e-mail',
      icon: 'EM',
      description: 'Envia e-mail via Resend',
    },
    {
      code: 'TRANSFER',
      label: 'Transferir humano',
      icon: 'TR',
      description: 'Passa pra atendente humano',
    },
    {
      code: 'TAG',
      label: 'Marcar tag',
      icon: 'TG',
      description: 'Adiciona tag ao contato',
    },
    {
      code: 'RUN_AGENT',
      label: 'Chamar agente IA',
      icon: 'AI',
      description: 'Delega resposta pra agente IA',
    },
  ],
  UTIL: [
    {
      code: 'DELAY',
      label: 'Aguardar',
      icon: 'DL',
      description: 'Pausa o fluxo por X minutos',
    },
    {
      code: 'END',
      label: 'Fim',
      icon: 'END',
      description: 'Encerra o fluxo',
    },
  ],
};

const CATEGORY_STYLE: Record<
  BpmnNodeCategory,
  { color: string; ring: string; accent: string }
> = {
  TRIGGER: {
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    accent: 'text-emerald-700 dark:text-emerald-400',
  },
  CONDITION: {
    color: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    accent: 'text-amber-700 dark:text-amber-400',
  },
  ACTION: {
    color: 'bg-blue-500',
    ring: 'ring-blue-500/20',
    accent: 'text-blue-700 dark:text-blue-400',
  },
  UTIL: {
    color: 'bg-zinc-500',
    ring: 'ring-zinc-500/20',
    accent: 'text-zinc-700 dark:text-zinc-400',
  },
};

const CATEGORY_LABEL: Record<BpmnNodeCategory, string> = {
  TRIGGER: 'Gatilho',
  CONDITION: 'Condição',
  ACTION: 'Ação',
  UTIL: 'Utilidade',
};

interface BpmnBaseProps {
  category: BpmnNodeCategory;
  selected?: boolean;
  data: any;
  hasInput?: boolean;
  hasOutput?: boolean;
  outputCount?: number;
}

function BpmnBase({
  category,
  selected,
  data,
  hasInput = true,
  hasOutput = true,
  outputCount = 1,
}: BpmnBaseProps) {
  const style = CATEGORY_STYLE[category];
  const subtype = SUBTYPES[category].find((s) => s.code === data?.subtype);
  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-xl border-2 bg-white shadow-sm transition-shadow dark:bg-zinc-900 ${
        selected
          ? `border-primary shadow-lg ring-2 ${style.ring}`
          : 'border-zinc-200 dark:border-zinc-700'
      }`}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !border-2 !border-white !bg-zinc-400 dark:!border-zinc-900"
        />
      )}
      <div className={`flex items-center gap-2 rounded-t-[10px] px-3 py-2 ${style.color}`}>
        <span className="font-mono text-[10px] tracking-tight text-white/80">
          {subtype?.icon ?? '?'}
        </span>
        <span className="text-xs font-semibold text-white">
          {subtype?.label ?? CATEGORY_LABEL[category]}
        </span>
      </div>
      <div className="space-y-1 px-3 py-2 text-xs">
        <div className={`text-[10px] uppercase tracking-[0.12em] ${style.accent}`}>
          {CATEGORY_LABEL[category]}
        </div>
        {data?.label && (
          <p className="text-zinc-700 dark:text-zinc-300">{data.label}</p>
        )}
        {!data?.label && subtype?.description && (
          <p className="text-zinc-400 italic">{subtype.description}</p>
        )}
      </div>
      {hasOutput &&
        Array.from({ length: outputCount }).map((_, i) => (
          <Handle
            key={i}
            type="source"
            position={Position.Bottom}
            id={`output-${i}`}
            className="!h-3 !w-3 !border-2 !border-white !bg-primary dark:!border-zinc-900"
            style={
              outputCount > 1
                ? { left: `${((i + 1) / (outputCount + 1)) * 100}%` }
                : undefined
            }
          />
        ))}
    </div>
  );
}

export const TriggerNode = memo(({ data, selected }: NodeProps) => (
  <BpmnBase category="TRIGGER" data={data} selected={selected} hasInput={false} />
));
TriggerNode.displayName = 'TriggerNode';

export const ConditionNode = memo(({ data, selected }: NodeProps) => (
  <BpmnBase category="CONDITION" data={data} selected={selected} outputCount={2} />
));
ConditionNode.displayName = 'ConditionNode';

export const ActionNode = memo(({ data, selected }: NodeProps) => (
  <BpmnBase category="ACTION" data={data} selected={selected} />
));
ActionNode.displayName = 'ActionNode';

export const UtilNode = memo(({ data, selected }: NodeProps) => {
  const isEnd = (data as any)?.subtype === 'END';
  return (
    <BpmnBase
      category="UTIL"
      data={data}
      selected={selected}
      hasOutput={!isEnd}
    />
  );
});
UtilNode.displayName = 'UtilNode';

export const nodeTypes = {
  TRIGGER: TriggerNode,
  CONDITION: ConditionNode,
  ACTION: ActionNode,
  UTIL: UtilNode,
};
