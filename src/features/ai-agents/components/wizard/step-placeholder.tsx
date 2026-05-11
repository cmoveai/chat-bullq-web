'use client';

import { Hammer } from 'lucide-react';

interface StepPlaceholderProps {
  title: string;
  description: string;
  preview: string[];
}

/**
 * Generic step body used while the deeper UI for a wizard step is still
 * being built. Shows the title/description from the AutomateFlow parity
 * plan plus a bulleted preview of what the step will eventually contain.
 */
export function StepPlaceholder({
  title,
  description,
  preview,
}: StepPlaceholderProps) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </header>

      <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/50 p-5 text-sm dark:border-violet-900/40 dark:bg-violet-900/10">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Hammer className="h-4 w-4" />
          <span className="font-medium">Em construção</span>
        </div>
        <p className="mt-2 text-xs text-violet-600/80 dark:text-violet-300/80">
          Esta etapa entrará no ar nas próximas iterações. O que será coberto
          aqui:
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          {preview.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
