'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Sparkline } from './sparkline';

interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary';
}

interface HeroCardProps {
  eyebrow: string;
  caption?: string;
  value: string;
  meta?: Array<{ label: string; trend?: 'up' | 'down'; trendLabel?: string }>;
  actions?: HeroAction[];
  series?: number[];
  pending?: boolean;
  tone?: 'dark' | 'emerald';
}

export function HeroCard({
  eyebrow,
  caption,
  value,
  meta,
  actions,
  series,
  pending,
  tone = 'dark',
}: HeroCardProps) {
  const isEmerald = tone === 'emerald';

  const containerClass = isEmerald
    ? 'bg-gradient-to-br from-emerald-700 via-emerald-700 to-emerald-900'
    : 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-black';

  const eyebrowClass = isEmerald
    ? 'text-emerald-200'
    : 'text-zinc-400';

  const captionClass = isEmerald
    ? 'text-emerald-100/90'
    : 'text-zinc-400';

  const metaTextClass = isEmerald
    ? 'text-emerald-100'
    : 'text-zinc-300';

  return (
    <div className={`relative rounded-2xl p-7 text-white overflow-hidden ${containerClass}`}>
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-0 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`text-[10px] uppercase tracking-[0.18em] font-medium ${eyebrowClass}`}>
            {eyebrow}
          </div>
          {pending && (
            <span className="text-[10px] uppercase tracking-[0.14em] text-amber-400 font-semibold border border-amber-700/60 rounded px-1.5 py-0.5">
              mock
            </span>
          )}
        </div>

        {caption && (
          <div className={`text-xs mb-3 ${captionClass}`}>{caption}</div>
        )}

        <div className="text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>

        {meta && meta.length > 0 && (
          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs ${metaTextClass}`}>
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {m.trend && (
                  <ArrowUpRight
                    className={`w-3 h-3 ${
                      m.trend === 'up' ? 'text-emerald-400' : 'rotate-90 text-red-400'
                    }`}
                  />
                )}
                <span>{m.label}</span>
                {m.trendLabel && (
                  <span className={m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {m.trendLabel}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {series && series.length > 0 && (
          <div className="mt-5 -mb-2 -mx-1 h-14 opacity-90">
            <Sparkline
              data={series}
              className={`w-full h-full ${isEmerald ? 'text-emerald-200' : 'text-emerald-400'}`}
            />
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {actions.map((a, i) => {
              const Icon = a.icon;
              const cls =
                a.variant === 'secondary'
                  ? 'inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm rounded-xl transition-colors'
                  : 'inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 text-sm rounded-xl font-medium hover:bg-zinc-100 transition-colors';
              const content = (
                <>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {a.label}
                  {a.variant === 'secondary' && <ChevronRight className="w-3.5 h-3.5" />}
                </>
              );
              return a.href ? (
                <Link key={i} href={a.href} className={cls}>
                  {content}
                </Link>
              ) : (
                <button key={i} onClick={a.onClick} className={cls}>
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
