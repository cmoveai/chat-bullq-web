import { api } from '@/lib/api';

export interface Plan {
  id: string;
  code: string;
  name: string;
  priceMonthlyBrl: number;
  monthlyCredits: number;
  maxChannels: number | null;
  maxConversationsMonth: number | null;
  maxAgents: number | null;
  maxTools: number | null;
  maxMembers: number | null;
  highlighted?: boolean;
  features?: string[];
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | string;
  trialEndsAt: string | null;
  currentPeriodEnd?: string | null;
  creditsRemaining?: number;
  plan: Plan;
}

export interface UsageSnapshot {
  plan: Plan;
  status: string;
  trialEndsAt: string | null;
  usage: Record<string, number> & { creditsUsed?: number; creditsRemaining?: number };
  limits: {
    maxChannels: number | null;
    maxConversationsMonth: number | null;
    maxAgents: number | null;
    maxTools: number | null;
    maxMembers: number | null;
  };
}

export const billingService = {
  async listPlans(): Promise<Plan[]> {
    const { data } = await api.get('/billing/plans');
    return data.data ?? data;
  },

  async getCurrent(): Promise<Subscription | null> {
    try {
      const { data } = await api.get('/billing/me');
      return data.data ?? data;
    } catch {
      return null;
    }
  },

  async getUsage(): Promise<UsageSnapshot | null> {
    try {
      const { data } = await api.get('/billing/usage');
      return data.data ?? data;
    } catch {
      return null;
    }
  },

  async getStatus(): Promise<{
    suspended: boolean;
    isPilot: boolean;
    reason:
      | 'trial_pending_payment'
      | 'trial_expired'
      | 'past_due'
      | 'canceled'
      | 'expired'
      | 'no_subscription'
      | null;
    status: string | null;
    trialEndsAt: string | null;
    planCode: string | null;
  }> {
    const { data } = await api.get('/billing/me/status');
    return data.data ?? data;
  },
};

export function formatPlanPrice(brl: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(brl);
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}
