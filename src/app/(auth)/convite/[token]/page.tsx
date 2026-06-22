'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Link de convite de piloto fechado: /convite/<token>.
 * Carrega o token e leva o participante ao cadastro, mantendo o token via
 * query (pilotInvite). O token não é tratado como canal de suporte nem exposto
 * em logs. Sem token não há fluxo público de piloto.
 */
export default function ConvitePilotoPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const raw = params?.token;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token) {
      router.replace('/login');
      return;
    }
    router.replace(`/register?pilotInvite=${encodeURIComponent(token)}`);
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      <p className="text-sm">Abrindo seu convite da EIXXO…</p>
    </div>
  );
}
