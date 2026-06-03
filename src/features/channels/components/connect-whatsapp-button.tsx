'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MetaIcon } from '@/components/ui/icons';
import {
  launchEmbeddedSignup,
  isEmbeddedSignupConfigured,
} from '../lib/embedded-signup';
import { channelsService, type Channel } from '../services/channels.service';

interface ConnectWhatsAppButtonProps {
  channelName?: string;
  onConnected?: (channel: Channel) => void;
}

/**
 * CTA de Conectar WhatsApp via Embedded Signup (Tech Provider). Quando o
 * config_id ainda não está setado (pré-aprovação da Meta), mostra um aviso e
 * deixa o usuário cair no formulário manual.
 */
export function ConnectWhatsAppButton({
  channelName,
  onConnected,
}: ConnectWhatsAppButtonProps) {
  const [loading, setLoading] = useState(false);
  const configured = isEmbeddedSignupConfigured();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await launchEmbeddedSignup();
      const channel = await channelsService.embeddedSignup({
        ...result,
        channelName,
      });
      toast.success('WhatsApp conectado com sucesso.');
      onConnected?.(channel);
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível conectar o WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
        Conexão automática (Embedded Signup) fica disponível assim que a
        verificação da Meta for aprovada. Por enquanto, configure manualmente
        abaixo.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MetaIcon className="h-4 w-4" />
      )}
      {loading ? 'Conectando...' : 'Conectar WhatsApp (automático)'}
    </button>
  );
}
