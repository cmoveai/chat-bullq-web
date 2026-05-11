'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';
import { WizardStepper } from '@/features/ai-agents/components/wizard/wizard-stepper';
import { StepBasicInfo } from '@/features/ai-agents/components/wizard/step-basic-info';
import { StepPlaceholder } from '@/features/ai-agents/components/wizard/step-placeholder';
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
      });
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
      return (
        <StepPlaceholder
          title="Comunicação"
          description="Configure como seu agente se comunicará com os usuários"
          preview={[
            'Estilo de comunicação: Formal / Normal / Casual',
            'Propósito: Suporte / Vendas / Uso Pessoal',
            'Usar emojis nas respostas (toggle)',
            'Restringir tópicos que o agente NÃO deve discutir',
            'Dividir respostas longas em múltiplas mensagens',
            'Idiomas suportados (10 idiomas)',
          ]}
        />
      );
    case 2:
      return (
        <StepPlaceholder
          title="Empresa"
          description="Forneça detalhes sobre sua empresa"
          preview={[
            'Nome da empresa / entidade',
            'Site oficial da empresa',
            'Setor e descrição (próxima iteração)',
          ]}
        />
      );
    case 3:
      return (
        <StepPlaceholder
          title="Base de Conhecimento"
          description="Selecione bases de conhecimento para seu agente"
          preview={[
            'Listar Bases de Conhecimento existentes da org',
            'Multi-select pra vincular ao agente',
            'CTA Criar Nova Base (reusa componente standalone /knowledge-bases)',
            'Empty state se org não tiver nenhuma base',
          ]}
        />
      );
    case 4:
      return (
        <StepPlaceholder
          title="Instruções Extras"
          description="Adicione instruções extras para personalizar o comportamento do seu agente"
          preview={[
            'Textarea grande para o system prompt customizado',
            'Botão "Gerar com IA" com 8 perguntas guiadas (contexto, objetivo, estilo, público, formato, exemplo few-shot, regras, ponto crítico)',
            'Preview do prompt gerado antes de salvar',
          ]}
        />
      );
    case 5:
      return (
        <StepPlaceholder
          title="Configurações Avançadas"
          description="Configure recursos avançados para seu agente"
          preview={[
            'Fuso horário (default America/Sao_Paulo)',
            'Atraso na resposta em segundos (0, 5, 10, 30, 60)',
            'Habilitar transferência para humano + número máximo de interações',
            'Habilitar coleta de dados (Nome / Telefone / Email + campos personalizados)',
            'Habilitar qualificação de lead com IA (modelo + gatilho + prompt customizado)',
          ]}
        />
      );
    case 6:
      return (
        <StepPlaceholder
          title="Conexões"
          description="Conecte seu agente aos canais de atendimento"
          preview={[
            'Lista de canais conectados (WhatsApp / Instagram / API)',
            'Multi-select pra vincular agente aos canais',
            'Status do canal (conectado / desconectado / pendente)',
          ]}
        />
      );
    case 7:
      return (
        <StepPlaceholder
          title="Integrações"
          description="Conecte seu agente com serviços externos"
          preview={[
            'Google Calendar (wizard 3-step: Calendário + Horário Funcionamento + Campos de Agendamento)',
            'Card de cada integração disponível com botão Conectar',
            'Listagem das integrações já configuradas',
          ]}
        />
      );
    default:
      return null;
  }
}
