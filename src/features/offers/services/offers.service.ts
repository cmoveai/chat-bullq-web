import { api } from '@/lib/api';

export type OfferStatus = 'OPEN' | 'WON' | 'LOST';

export interface Offer {
  id: string;
  organizationId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  description: string | null;
  value: string | number | null;
  currency: string;
  status: OfferStatus;
  order: number;
  contactId: string | null;
  conversationId: string | null;
  assignedToId: string | null;
  metadata: Record<string, unknown>;
  closedAt: string | null;
  closedReason: string | null;
  createdAt: string;
  updatedAt: string;
  pipeline?: { id: string; name: string; color: string | null } | null;
  stage?: {
    id: string;
    name: string;
    type: 'NORMAL' | 'WON' | 'LOST';
    color: string | null;
  } | null;
  contact?: {
    id: string;
    name: string | null;
    phone: string | null;
    avatarUrl?: string | null;
  } | null;
  assignedTo?: { id: string; name: string; avatarUrl: string | null } | null;
  conversation?: { id: string; subject: string | null; protocol: string | null } | null;
}

export interface OfferStats {
  total: number;
  open: number;
  won: number;
  lost: number;
  inProgress: number;
  totalValue: number;
  wonValue: number;
}

export interface CreateOfferInput {
  title: string;
  description?: string;
  pipelineId: string;
  stageId?: string;
  contactId?: string;
  assignedToId?: string;
  conversationId?: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
}

export interface UpdateOfferInput {
  title?: string;
  description?: string | null;
  stageId?: string;
  status?: OfferStatus;
  contactId?: string | null;
  assignedToId?: string | null;
  conversationId?: string | null;
  value?: number | null;
  currency?: string;
  expectedCloseDate?: string | null;
  closedReason?: string | null;
}

export interface OfferFilters {
  status?: OfferStatus;
  pipelineId?: string;
  stageId?: string;
  assignedToId?: string;
  contactId?: string;
  conversationId?: string;
  search?: string;
}

export const offersService = {
  async list(filters: OfferFilters = {}): Promise<Offer[]> {
    const { data } = await api.get('/offers', { params: filters });
    return data.data;
  },
  async stats(): Promise<OfferStats> {
    const { data } = await api.get('/offers/stats');
    return data.data;
  },
  async getById(id: string): Promise<Offer> {
    const { data } = await api.get(`/offers/${id}`);
    return data.data;
  },
  async create(input: CreateOfferInput): Promise<Offer> {
    const { data } = await api.post('/offers', input);
    return data.data;
  },
  async update(id: string, input: UpdateOfferInput): Promise<Offer> {
    const { data } = await api.patch(`/offers/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<{ ok: boolean }> {
    const { data } = await api.delete(`/offers/${id}`);
    return data.data ?? data;
  },
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  OPEN: 'Em andamento',
  WON: 'Ganho',
  LOST: 'Perdido',
};

export const OFFER_STATUS_COLOR: Record<OfferStatus, string> = {
  OPEN: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  WON: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  LOST: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function formatCurrency(value: number | string | null | undefined, currency = 'BRL') {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
