import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Faixa gradient roxa usada no topo de cada página de feature.
 * Padroniza ícone circular à esquerda, título + descrição no centro,
 * e CTAs à direita. Match visual dos prints AutomateFlow.
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5 text-white shadow-sm',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-sm text-white/75">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
