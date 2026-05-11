'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';
import { knowledgeBasesService } from '@/features/knowledge-bases/services/knowledge-bases.service';
import { WizardStepper } from '@/features/ai-agents/components/wizard/wizard-stepper';
import { StepBasicInfo } from '@/features/ai-agents/components/wizard/step-basic-info';
import { StepCommunication } from '@/features/ai-agents/components/wizard/step-communication';
import { StepCompany } from '@/features/ai-agents/components/wizard/step-company';
import { StepKnowledge } from '@/features/ai-agents/components/wizard/step-knowledge';
import { StepInstructions } from '@/features/ai-agents/components/wizard/step-instructions';
import { StepAdvanced } from '@/features/ai-agents/components/wizard/step-advanced';
import { StepConnections } from '@/features/ai-agents/components/wizard/step-connections';
import { StepIntegrations } from '@/features/ai-agents/components/wizard/step-integrations';
import {
  INITIAL_WIZARD_STATE,
  WIZARD_STEPS,
  type WizardState,
} from '@/features/ai-agents/components/wizard/types';

const DEFAULT_PROMPT = `Você é o(a) atendente da empresa. Sua missão é responder os clientes com simpatia, agilidade e clareza.

Regras:
- Use apenas as informações que você sabe com certeza.
- Se o cliente pedir algo fora do seu conhecimento, transfira para um humano.
- Mantenha tom natural e direto, sem rebuscar.`;

export default function NewAgentPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [saving, setSaving] = useState(false);

  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  const update = (patch: Partial<WizardState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const canAdvance = () => {
    if (stepIndex === 0) {
      return !!state.name.trim() && !!state.modelId;
    }
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error('Preencha os campos obrigatórios antes de avançar');
      return;
    }
    if (!isLastStep) setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleSave = async () => {
    if (!state.name.trim() || !state.modelId) {
      toast.error('Nome e modelo são obrigatórios');
      setStepIndex(0);
      return;
    }
    setSaving(true);
    try {
      // Campos sem coluna dedicada no schema vão pra modelParams.wizard.
      // Quando o backend ganhar colunas próprias, basta migrar daqui.
      const wizardExtras = {
        communication: {
          style: state.communicationStyle,
          purpose: state.purpose,
          useEmojis: state.useEmojis,
          restrictedTopics: state.restrictedTopics,
          splitLongResponses: state.splitLongResponses,
          languages: state.languages,
        },
        company: {
          name: state.companyName,
          website: state.companyWebsite,
        },
        advanced: {
          timezone: state.timezone,
          responseDelaySeconds: state.responseDelaySeconds,
          transferToHumanEnabled: state.transferToHumanEnabled,
          maxInteractionsBeforeTransfer: state.maxInteractionsBeforeTransfer,
        },
        integrations: {
          googleCalendar: state.googleCalendarConfig,
        },
      };

      const agent = await aiAgentsService.create({
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        kind: state.kind,
        modelId: state.modelId,
        systemPrompt:
          state.extraInstructions.trim() || DEFAULT_PROMPT,
        temperature: 0.7,
        parentAgentId: null,
        department: undefined,
        modelParams: { wizard: wizardExtras } as any,
        collectContactData: state.collectContactData,
        collectStandardFields: state.collectStandardFields,
        collectCustomFieldIds: state.collectCustomFieldIds,
        leadQualificationEnabled: state.leadQualificationEnabled,
        leadQualificationTrigger: state.leadQualificationTrigger,
        leadQualificationMessageCount: state.leadQualificationMessageCount,
        leadQualificationPrompt:
          state.leadQualificationPrompt.trim() || undefined,
      } as any);

      // Link knowledge bases + channels in best-effort follow-ups.
      // The agent already exists; failures here only log a warning.
      await Promise.allSettled([
        ...state.knowledgeBaseIds.map((kbId) =>
          knowledgeBasesService
            .linkAgents(kbId, [agent.id])
            .catch((err: any) =>
              console.warn(`KB link ${kbId} failed:`, err?.message),
            ),
        ),
        ...state.channelIds.map((chId) =>
          aiAgentsService
            .assignChannel(agent.id, { channelId: chId })
            .catch((err: any) =>
              console.warn(`Channel ${chId} bind failed:`, err?.message),
            ),
        ),
      ]);

      toast.success(`Agente "${agent.name}" criado`);
      router.push('/ai-agents?tab=agents');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar agente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <PageHeader
        icon={Bot}
        title="Criar Novo Agente"
        description="Configure seu agente inteligente preenchendo as informações abaixo"
        actions={
          <button
            type="button"
            onClick={() => router.push('/ai-agents?tab=agents')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Agentes
          </button>
        }
      />

      <WizardStepper
        currentStep={stepIndex}
        onStepClick={(idx) => setStepIndex(idx)}
      />

      <div className="flex-1">{renderStep(state, update, stepIndex)}</div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0 || saving}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>

        <span className="text-xs text-zinc-500">
          Etapa {stepIndex + 1} de {WIZARD_STEPS.length}
        </span>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Criar Agente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800 disabled:opacity-60"
          >
            Próximo
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function renderStep(
  state: WizardState,
  update: (patch: Partial<WizardState>) => void,
  stepIndex: number,
) {
  switch (stepIndex) {
    case 0:
      return <StepBasicInfo state={state} update={update} />;
    case 1:
      return <StepCommunication state={state} update={update} />;
    case 2:
      return <StepCompany state={state} update={update} />;
    case 3:
      return <StepKnowledge state={state} update={update} />;
    case 4:
      return <StepInstructions state={state} update={update} />;
    case 5:
      return <StepAdvanced state={state} update={update} />;
    case 6:
      return <StepConnections state={state} update={update} />;
    case 7:
      return <StepIntegrations state={state} update={update} />;
    default:
      return null;
  }
}
