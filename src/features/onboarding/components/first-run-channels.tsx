'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { channelsService, type Channel } from '@/features/channels/services/channels.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { ActivationConnect } from './activation-connect';

/** Canal real = integração de verdade, ativa, e NÃO demo/sandbox. */
export function isRealConnectedChannel(c: Channel) {
  const demo = c.config?.demo === true || c.connectionStatus === 'demo';
  if (demo) return false;
  if (!c.isActive) return false;
  return c.connectionStatus ? c.connectionStatus === 'connected' : true;
}

/** Activation Gate obrigatório: sem canal real, bloqueia o app inteiro.
 *  Suprimido em /settings/channels — lá a própria área renderiza o Activation
 *  Mode simplificado (ver ChannelsList). */
export function FirstRunChannelOnboarding() {
  const orgId = useOrgId();
  const pathname = usePathname();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', orgId],
    queryFn: () => channelsService.list(),
    enabled: !!orgId,
  });

  const hasRealChannel = (channels ?? []).some(isRealConnectedChannel);
  const onChannelsArea = pathname?.startsWith('/settings/channels') ?? false;
  const show = !onChannelsArea && !isLoading && channels !== undefined && !hasRealChannel;

  if (!show) return null;
  return <ActivationConnect variant="overlay" />;
}
