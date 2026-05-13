import { api } from '@/lib/api';

export type CheckoutPayload = {
  planId: 'starter' | 'growth' | 'pro';
  cycle: 'monthly' | 'quarterly';
  paymentMethod: 'card' | 'pix';
};

export const checkoutService = {
  async create(payload: CheckoutPayload): Promise<{ checkoutUrl: string; sessionId: string }> {
    const { data } = await api.post('/billing/checkout', payload);
    return data;
  },
};
