import { api } from '@/lib/api';

export type AutomationType = 'INSTAGRAM_DM_FROM_COMMENT';

export interface InstagramDmConfig {
  postId?: string;
  keywords: string[];
  matchMode?: 'any' | 'all';
  dmMessage: string;
  replyToComment?: string;
  onlyFirstTime?: boolean;
}

export interface Automation {
  id: string;
  organizationId: string;
  channelId: string | null;
  name: string;
  description: string | null;
  type: AutomationType;
  isActive: boolean;
  config: Record<string, unknown>;
  executionsCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel?: { id: string; name: string; type: string } | null;
}

export interface AutomationStats {
  total: number;
  active: number;
  inactive: number;
  totalExecutions: number;
}

export interface CreateAutomationInput {
  name: string;
  description?: string;
  type: AutomationType;
  channelId?: string;
  isActive?: boolean;
  config: Record<string, unknown>;
}

export interface UpdateAutomationInput {
  name?: string;
  description?: string | null;
  channelId?: string | null;
  isActive?: boolean;
  config?: Record<string, unknown>;
}

export const automationsService = {
  async list(): Promise<Automation[]> {
    const { data } = await api.get('/automations');
    return Array.isArray(data?.data) ? data.data : [];
  },
  async stats(): Promise<AutomationStats> {
    const { data } = await api.get('/automations/stats');
    return data.data;
  },
  async getById(id: string): Promise<Automation> {
    const { data } = await api.get(`/automations/${id}`);
    return data.data;
  },
  async create(input: CreateAutomationInput): Promise<Automation> {
    const { data } = await api.post('/automations', input);
    return data.data;
  },
  async update(id: string, input: UpdateAutomationInput): Promise<Automation> {
    const { data } = await api.patch(`/automations/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<{ ok: boolean }> {
    const { data } = await api.delete(`/automations/${id}`);
    return data.data ?? data;
  },
};

export const AUTOMATION_TYPE_LABEL: Record<AutomationType, string> = {
  INSTAGRAM_DM_FROM_COMMENT: 'Instagram · DM por comentário',
};
