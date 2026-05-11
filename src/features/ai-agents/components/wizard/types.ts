import type { AgentKind } from '../../services/ai-agents.service';

export interface WizardState {
  // Step 1
  name: string;
  description: string;
  modelId: string;

  // Step 2 (Communication)
  communicationStyle: 'FORMAL' | 'NORMAL' | 'CASUAL';
  purpose: 'SUPPORT' | 'SALES' | 'PERSONAL';
  useEmojis: boolean;
  restrictedTopics: string[];
  splitLongResponses: boolean;
  languages: string[];

  // Step 3 (Company)
  companyName: string;
  companyWebsite: string;

  // Step 4 (Knowledge Base)
  knowledgeBaseIds: string[];

  // Step 5 (Extra Instructions)
  extraInstructions: string;

  // Step 6 (Advanced)
  timezone: string;
  responseDelaySeconds: number;
  transferToHumanEnabled: boolean;
  maxInteractionsBeforeTransfer: number;
  collectContactData: boolean;
  collectStandardFields: string[];
  collectCustomFieldIds: string[];
  leadQualificationEnabled: boolean;
  leadQualificationModelId: string | null;
  leadQualificationTrigger: 'AFTER_EACH_MESSAGE' | 'AFTER_N_MESSAGES' | 'WHEN_CONVERSATION_ENDS';
  leadQualificationMessageCount: number;
  leadQualificationPrompt: string;

  // Step 7 (Connections)
  channelIds: string[];

  // Step 8 (Integrations)
  googleCalendarConfig: null | {
    name: string;
    timezone: string;
    alwaysOpen: boolean;
    allowMultiple: boolean;
    defaultDurationMinutes: number;
  };

  // Auxiliary
  kind: AgentKind;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  name: '',
  description: '',
  modelId: 'anthropic/claude-sonnet-4-6',
  communicationStyle: 'NORMAL',
  purpose: 'SUPPORT',
  useEmojis: false,
  restrictedTopics: [],
  splitLongResponses: true,
  languages: ['pt'],
  companyName: '',
  companyWebsite: '',
  knowledgeBaseIds: [],
  extraInstructions: '',
  timezone: 'America/Sao_Paulo',
  responseDelaySeconds: 30,
  transferToHumanEnabled: true,
  maxInteractionsBeforeTransfer: 10,
  collectContactData: false,
  collectStandardFields: ['name', 'phone', 'email'],
  collectCustomFieldIds: [],
  leadQualificationEnabled: false,
  leadQualificationModelId: null,
  leadQualificationTrigger: 'WHEN_CONVERSATION_ENDS',
  leadQualificationMessageCount: 5,
  leadQualificationPrompt: '',
  channelIds: [],
  googleCalendarConfig: null,
  kind: 'WORKER',
};

export interface WizardStep {
  id: string;
  label: string;
  iconKey:
    | 'info'
    | 'chat'
    | 'building'
    | 'database'
    | 'code'
    | 'settings'
    | 'plug'
    | 'lightbulb';
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'basic', label: 'Informações Básicas', iconKey: 'info' },
  { id: 'communication', label: 'Comunicação', iconKey: 'chat' },
  { id: 'company', label: 'Empresa', iconKey: 'building' },
  { id: 'knowledge', label: 'Base de Conhecimento', iconKey: 'database' },
  { id: 'instructions', label: 'Instruções Extras', iconKey: 'code' },
  { id: 'advanced', label: 'Configurações Avançadas', iconKey: 'settings' },
  { id: 'connections', label: 'Conexões', iconKey: 'plug' },
  { id: 'integrations', label: 'Integrações', iconKey: 'lightbulb' },
];
