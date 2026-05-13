'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { automationsService } from '@/features/automations/services/automations.service';
import {
  BpmnBuilder,
  type BpmnFlowConfig,
} from '@/features/automations/components/bpmn-builder';
import { FeaturePaywall } from '@/features/billing/components/feature-paywall';

export default function AutomationBuilderPage() {
  const params = useParams();
  const id = String(params?.id ?? '');

  const { data: automation, isLoading, error } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => automationsService.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Carregando automação...
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Erro ao carregar automação
      </div>
    );
  }

  const config: BpmnFlowConfig | null =
    automation.config && typeof automation.config === 'object' && 'nodes' in automation.config
      ? (automation.config as unknown as BpmnFlowConfig)
      : null;

  return (
    <FeaturePaywall
      feature="bpmnBuilder"
      title="Construtor BPMN visual"
      description="Crie fluxos de automação multi-etapa com gatilhos, condições, ações e simulador. Disponível a partir do plano Growth."
      requiredPlan="Growth"
    >
      <BpmnBuilder
        automationName={automation.name}
        initialConfig={config}
        onSave={async (newConfig) => {
          await automationsService.update(id, {
            config: {
              ...(automation.config ?? {}),
              ...newConfig,
            } as Record<string, unknown>,
          });
        }}
        backHref="/automations"
      />
    </FeaturePaywall>
  );
}
