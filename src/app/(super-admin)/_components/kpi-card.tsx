import { TrendingDown, TrendingUp } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { direction: 'up' | 'down'; pct: string; positive?: boolean };
  pending?: boolean;
}

export function KpiCard({ label, value, hint, trend, pending }: KpiCardProps) {
  const trendIsPositive = trend?.positive ?? trend?.direction === 'up';
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-3">
        {label}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
          {value}
        </div>
        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trendIsPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            <TrendIcon className="w-3 h-3" />
            {trend.pct}
          </div>
        )}
        {pending && (
          <span className="text-[9px] uppercase tracking-[0.12em] text-amber-600 dark:text-amber-500 font-semibold border border-amber-300 dark:border-amber-800 rounded px-1.5 py-0.5">
            mock
          </span>
        )}
      </div>
      {hint && (
        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">{hint}</div>
      )}
    </div>
  );
}
