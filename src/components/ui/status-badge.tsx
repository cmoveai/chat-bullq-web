import { Activity, PauseCircle, AlertCircle, Settings2, Clock } from 'lucide-react';

export type StatusKind =
  | 'live'
  | 'paused'
  | 'error'
  | 'configuring'
  | 'pending';

interface StatusBadgeProps {
  kind: StatusKind;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
  withDot?: boolean;
}

const STATUS_CONFIG: Record<
  StatusKind,
  { defaultLabel: string; icon: React.ElementType; classes: string; dotClass: string }
> = {
  live: {
    defaultLabel: 'Ativo',
    icon: Activity,
    classes:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30',
    dotClass: 'bg-emerald-500',
  },
  paused: {
    defaultLabel: 'Pausado',
    icon: PauseCircle,
    classes:
      'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-400/20',
    dotClass: 'bg-zinc-400',
  },
  error: {
    defaultLabel: 'Erro',
    icon: AlertCircle,
    classes:
      'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-400/30',
    dotClass: 'bg-red-500',
  },
  configuring: {
    defaultLabel: 'Configurando',
    icon: Settings2,
    classes:
      'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-400/30',
    dotClass: 'bg-amber-500',
  },
  pending: {
    defaultLabel: 'Pendente',
    icon: Clock,
    classes:
      'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-400/30',
    dotClass: 'bg-blue-500',
  },
};

export function StatusBadge({
  kind,
  label,
  className = '',
  size = 'sm',
  withDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[kind];
  const text = label ?? config.defaultLabel;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider ring-1 ring-inset ${config.classes} ${sizeClasses} ${className}`}
    >
      {withDot ? (
        <span
          className={`relative flex h-1.5 w-1.5 ${kind === 'live' ? '' : ''}`}
        >
          {kind === 'live' && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass} animate-ping`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass}`}
          />
        </span>
      ) : null}
      {text}
    </span>
  );
}
