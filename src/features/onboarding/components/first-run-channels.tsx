'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { channelsService, type Channel } from '@/features/channels/services/channels.service';
import { billingService } from '@/features/billing/services/billing.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { useAuthStore } from '@/stores/auth-store';
import { ActivationConnect } from './activation-connect';

/** Canal real = integração de verdade, ativa, e NÃO demo/sandbox. */
export function isRealConnectedChannel(c: Channel) {
  const demo = c.config?.demo === true || c.connectionStatus === 'demo';
  if (demo) return false;
  if (!c.isActive) return false;
  return c.connectionStatus ? c.connectionStatus === 'connected' : true;
}

// Exceção DEV interna: SÓ a conta eixxo@cmove.ai na org EIXXO Hub. Não é bypass
// genérico — não libera por role OWNER, nem outra conta CMOVE, nem outro tenant.
const DEV_BYPASS_EMAIL = 'eixxo@cmove.ai';
const DEV_BYPASS_ORG_ID = 'cmqfk1s3h0002pd06jhu9wb0p';
const DEV_BYPASS_ORG_SLUG = 'eixxo-hub-mqfk1s3b';

export function useInternalDevBypass(): boolean {
  const email = useAuthStore((s) => s.user?.email);
  const activeOrgId = useAuthStore((s) => s.activeOrgId);
  const organizations = useAuthStore((s) => s.organizations);
  if (email !== DEV_BYPASS_EMAIL) return false;
  if (activeOrgId === DEV_BYPASS_ORG_ID) return true;
  const activeOrg = organizations.find((o) => o.id === activeOrgId);
  return activeOrg?.slug === DEV_BYPASS_ORG_SLUG;
}

/** Activation Gate obrigatório: sem canal real, bloqueia o app inteiro.
 *  Suprimido em /settings/channels — lá a própria área renderiza o Activation
 *  Mode simplificado (ver ChannelsList). */
export function FirstRunChannelOnboarding() {
  const orgId = useOrgId();
  const pathname = usePathname();
  const isInternalDevBypass = useInternalDevBypass();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
    enabled: !!orgId,
  });

  // Mesma query/key do AccountSuspendedBanner (React Query dedupe · sem request extra).
  // Conta suspensa NÃO vê o onboarding de canal: o fluxo único é ativar o plano antes.
  const { data: billing } = useQuery({
    queryKey: ['billing', 'me', 'status'],
    queryFn: () => billingService.getStatus(),
  });
  const isSuspended = billing?.suspended === true;
  // demo-first: conta piloto nunca e bloqueada pelo activation gate.
  const isPilot = billing?.isPilot === true;

  const hasRealChannel = (channels ?? []).some(isRealConnectedChannel);
  const onChannelsArea = pathname?.startsWith('/settings/channels') ?? false;
  const show =
    !isInternalDevBypass &&
    !onChannelsArea &&
    !isLoading &&
    channels !== undefined &&
    !hasRealChannel &&
    billing !== undefined &&
    !isSuspended &&
    !isPilot;

  if (!show) return null;
  return <ActivationConnect variant="overlay" />;
}
