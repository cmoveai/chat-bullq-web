'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Coins,
  CalendarClock,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  billingService,
  daysUntil,
} from '@/features/billing/services/billing.service';

/**
 * Faixa fina no topo do dashboard com créditos + trial badge + bell + theme toggle.
 * Match do print 1 (AutomateFlow) mas com paleta CMOVE.
 * Gracioso quando billing endpoints retornam null (sem assinatura).
 */
export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: subscription } = useQuery({
    queryKey: ['billing', 'me'],
    queryFn: () => billingService.getCurrent(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const credits = subscription?.creditsRemaining ?? 0;
  const trialDays = daysUntil(subscription?.trialEndsAt ?? null);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        {mounted ? (
          isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        aria-label="Notificações"
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Bell className="h-4 w-4" />
      </button>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
        <Coins className="h-3.5 w-3.5" />
        <span>
          {Number(credits).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span className="text-violet-500/80 dark:text-violet-400/80">
          créditos
        </span>
      </div>

      {trialDays !== null && trialDays > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>
            {trialDays} {trialDays === 1 ? 'dia' : 'dias'} de teste
          </span>
        </div>
      )}
    </div>
  );
}
