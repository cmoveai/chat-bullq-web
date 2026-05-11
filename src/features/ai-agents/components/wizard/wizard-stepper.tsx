'use client';

import {
  Info,
  MessageSquare,
  Building,
  Database,
  Code2,
  Settings,
  Plug,
  Lightbulb,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { WIZARD_STEPS, type WizardStep } from './types';

const ICON_MAP: Record<WizardStep['iconKey'], LucideIcon> = {
  info: Info,
  chat: MessageSquare,
  building: Building,
  database: Database,
  code: Code2,
  settings: Settings,
  plug: Plug,
  lightbulb: Lightbulb,
};

interface WizardStepperProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <ol className="flex w-full items-start">
        {WIZARD_STEPS.map((step, idx) => {
          const Icon = ICON_MAP[step.iconKey];
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          const canClick = !!onStepClick && idx <= currentStep;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-start"
              style={{ minWidth: 0 }}
            >
              <div className="flex flex-1 flex-col items-center text-center">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && onStepClick?.(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-sm'
                      : isDone
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                        : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                  } ${canClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <Icon className="h-4 w-4" />
                </button>
                <span
                  className={`mt-2 line-clamp-2 px-1 text-[10px] font-medium leading-tight ${
                    isActive
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < WIZARD_STEPS.length - 1 && (
                <div className="mt-5 h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className={`h-full bg-gradient-to-r from-violet-600 to-purple-700 transition-all ${
                      idx < currentStep ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
