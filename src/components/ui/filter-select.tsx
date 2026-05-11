'use client';

import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface FilterOption<T extends string> {
  value: T | '';
  label: string;
}

interface FilterSelectProps<T extends string> {
  value: T | '';
  onChange: (value: T | '') => void;
  options: FilterOption<T>[];
  icon?: LucideIcon;
  placeholder?: string;
  className?: string;
}

/**
 * Dropdown nativo estilizado pra filtros (Status, Prioridade, Pipeline, etc).
 * Match visual dos filtros AutomateFlow: pill com ícone + label + chevron.
 */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = 'Todos',
  className,
}: FilterSelectProps<T>) {
  return (
    <div
      className={clsx(
        'relative inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
        className,
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4 text-violet-600" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | '')}
        className="cursor-pointer appearance-none bg-transparent pr-7 outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-zinc-400" />
    </div>
  );
}
