'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavGroupProps {
  label: string;
  icon: LucideIcon;
  storageKey: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible nav group used as a top-level sidebar item with children.
 * Mirrors the visual structure of PipelinesTree/InboxTree/JarvisTree so
 * groups like CRM / Atendimentos / Agentes feel like first-class items
 * (icon + label + chevron) — not subtle text section headings.
 */
export function NavGroup({
  label,
  icon: Icon,
  storageKey,
  defaultExpanded = true,
  children,
}: NavGroupProps) {
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultExpanded;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) return defaultExpanded;
    return stored !== '0';
  });

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, next ? '1' : '0');
    }
  };

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Icon className="size-5" />
        <span className="flex-1">{label}</span>
        {expanded ? (
          <ChevronDown className="size-4 text-zinc-400" />
        ) : (
          <ChevronRight className="size-4 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <div className="ml-5 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
  );
}
