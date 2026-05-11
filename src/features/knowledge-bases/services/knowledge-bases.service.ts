import { api } from '@/lib/api';

export type KbSourceType = 'UPLOAD' | 'TEXT';

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  sourceType: KbSourceType;
  sourceFilename?: string | null;
  sourceMimeType?: string | null;
  sourceSizeBytes?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { agentLinks: number };
  contentPreview?: string;
  content?: string;
  agentLinks?: {
    agent: { id: string; name: string; kind: string };
  }[];
}

export interface CreateKbTextInput {
  name: string;
  description?: string;
  content: string;
}

export interface UpdateKbInput {
  name?: string;
  description?: string | null;
  content?: string;
}

export const knowledgeBasesService = {
  async list(): Promise<KnowledgeBase[]> {
    const { data } = await api.get('/knowledge-bases');
    return Array.isArray(data?.data) ? data.data : [];
  },
  async getById(id: string, full = false): Promise<KnowledgeBase> {
    const { data } = await api.get(`/knowledge-bases/${id}`, {
      params: full ? { full: 'true' } : {},
    });
    return data.data;
  },
  async createText(input: CreateKbTextInput): Promise<KnowledgeBase> {
    const { data } = await api.post('/knowledge-bases/text', input);
    return data.data;
  },
  async upload(
    file: File,
    name?: string,
    description?: string,
  ): Promise<KnowledgeBase> {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    if (description) form.append('description', description);
    const { data } = await api.post('/knowledge-bases/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  async update(id: string, input: UpdateKbInput): Promise<KnowledgeBase> {
    const { data } = await api.patch(`/knowledge-bases/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<{ ok: boolean }> {
    const { data } = await api.delete(`/knowledge-bases/${id}`);
    return data.data ?? data;
  },
  async linkAgents(id: string, agentIds: string[]): Promise<{ ok: boolean; linked: number }> {
    const { data } = await api.put(`/knowledge-bases/${id}/agents`, { agentIds });
    return data.data ?? data;
  },
  async byAgent(agentId: string): Promise<KnowledgeBase[]> {
    const { data } = await api.get(`/knowledge-bases/agent/${agentId}`);
    return Array.isArray(data?.data) ? data.data : [];
  },
};

export function formatBytes(n: number | null | undefined): string {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
