'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PlanFeatures {
  whatsappChannels: boolean;
  instagramChannels: boolean;
  emailSend: boolean;
  emailReceive: boolean;
  bpmnBuilder: boolean;
  campaigns: boolean;
  multiChannelCampaigns: boolean;
  aiAgents: boolean;
  unlimitedAgents: boolean;
  crmKanban: boolean;
  customContactFields: boolean;
  dashboardBasic: boolean;
  dashboardAdvanced: boolean;
  prioritySupport: boolean;
}

export interface FeaturesResponse {
  planCode: string;
  planName: string;
  features: PlanFeatures;
}

const DEFAULT_FEATURES: PlanFeatures = {
  whatsappChannels: true,
  instagramChannels: true,
  emailSend: true,
  emailReceive: true,
  bpmnBuilder: true,
  campaigns: true,
  multiChannelCampaigns: true,
  aiAgents: true,
  unlimitedAgents: true,
  crmKanban: true,
  customContactFields: true,
  dashboardBasic: true,
  dashboardAdvanced: true,
  prioritySupport: true,
};

/**
 * Hook que retorna as features liberadas pra org atual com base no plano.
 * Otimista: enquanto carrega, retorna tudo true pra não esconder UI · backend
 * é fonte de verdade pra bloqueio real (LimitEnforcer/gates).
 */
export function useFeatures(): { features: PlanFeatures; planCode?: string; planName?: string; isLoading: boolean } {
  const { data, isLoading } = useQuery<FeaturesResponse>({
    queryKey: ['billing', 'me', 'features'],
    queryFn: async () => {
      const res = await api.get<{ data: FeaturesResponse }>('/billing/me/features');
      return (res.data as any).data ?? res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    features: data?.features ?? DEFAULT_FEATURES,
    planCode: data?.planCode,
    planName: data?.planName,
    isLoading,
  };
}

/** Hook conveniente · `useFeature('emailSend')` retorna boolean diretão. */
export function useFeature(key: keyof PlanFeatures): boolean {
  return useFeatures().features[key];
}
