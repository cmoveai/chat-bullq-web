'use client';

import { Megaphone, MessageSquare, Mail, Instagram, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FeaturePaywall } from '@/features/billing/components/feature-paywall';

const CHANNELS = [
  {
    icon: MessageSquare,
    name: 'WhatsApp',
    description: 'Disparo em massa de templates HSM aprovados pela Meta',
    available: true,
  },
  {
    icon: Mail,
    name: 'E-mail',
    description: 'Envio em massa via Resend · domínio cmove.ai verificado',
    available: true,
  },
  {
    icon: Instagram,
    name: 'Instagram DM',
    description: 'Direct message segmentado por engajamento',
    available: false,
  },
];

function CampaignsPageInner() {
  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <PageHeader
        icon={Megaphone}
        title="Campanhas"
        description="Disparo segmentado multi-canal · alcance todos os contatos com filtros avançados"
        actions={
          <button
            onClick={() =>
              toast('Nova campanha', {
                description: 'Builder de campanhas chega no próximo sprint · usar /automations enquanto isso',
              })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/25"
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CHANNELS.map((c) => (
          <div
            key={c.name}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <c.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.description}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
              <span
                className={`h-1.5 w-1.5 rounded-full ${c.available ? 'bg-emerald-500' : 'bg-zinc-400'}`}
              />
              <span className="text-zinc-500">{c.available ? 'Disponível' : 'Em breve'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
        <Megaphone className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Nenhuma campanha ainda
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Builder de campanhas chega na próxima fatia · use /automations pra fluxos individuais
        </p>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <FeaturePaywall
      feature="campaigns"
      title="Campanhas multi-canal"
      description="Disparo em massa segmentado por WhatsApp + E-mail + Instagram. Filtros avançados por tag, plano, último contato. Disponível a partir do plano Growth."
      requiredPlan="Growth"
    >
      <CampaignsPageInner />
    </FeaturePaywall>
  );
}
