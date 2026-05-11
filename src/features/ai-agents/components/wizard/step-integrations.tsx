'use client';

import { useState } from 'react';
import { Lightbulb, Calendar, Plug, Check, X, Clock, Hourglass } from 'lucide-react';
import { toast } from 'sonner';
import type { WizardState } from './types';

interface StepIntegrationsProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepIntegrations({ state, update }: StepIntegrationsProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calConfigured = !!state.googleCalendarConfig;

  const handleDisconnect = () => {
    update({ googleCalendarConfig: null });
    toast.success('Google Calendar desconectado');
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Lightbulb className="h-4 w-4 text-violet-600" />
          Integrações
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Conecte seu agente com serviços externos
        </p>
      </header>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Integrações Disponíveis
        </p>

        <div className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Google Calendar
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Conecte seu Google Calendar para habilitar agendamento automático
              e gerenciamento de compromissos.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Pill>Agendar Eventos</Pill>
              <Pill>Gerenciamento de Tempo</Pill>
              <Pill>Sincronização em Tempo Real</Pill>
            </div>
          </div>
          {calConfigured ? (
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Check className="h-3 w-3" />
                Conectado
              </span>
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <X className="h-3 w-3" />
                Desconectar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800"
            >
              <Plug className="h-3.5 w-3.5" />
              Conectar
            </button>
          )}
        </div>

        {!calConfigured && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma integração configurada
            </p>
            <p className="max-w-md text-xs text-zinc-500">
              Adicione sua primeira integração para estender as capacidades do
              seu agente com serviços externos como Google Calendar.
            </p>
          </div>
        )}

        {calConfigured && state.googleCalendarConfig && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Configuração ativa
            </p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
              <li>
                <Clock className="mr-1 inline h-3 w-3 text-violet-600" />
                <strong>Fuso:</strong> {state.googleCalendarConfig.timezone}
              </li>
              <li>
                <Hourglass className="mr-1 inline h-3 w-3 text-violet-600" />
                <strong>Duração padrão:</strong>{' '}
                {state.googleCalendarConfig.defaultDurationMinutes} min
              </li>
              <li>
                <Calendar className="mr-1 inline h-3 w-3 text-violet-600" />
                <strong>Sempre aberto:</strong>{' '}
                {state.googleCalendarConfig.alwaysOpen ? 'Sim' : 'Não'}
              </li>
              <li>
                <Calendar className="mr-1 inline h-3 w-3 text-violet-600" />
                <strong>Múltiplos agendamentos:</strong>{' '}
                {state.googleCalendarConfig.allowMultiple ? 'Sim' : 'Não'}
              </li>
            </ul>
          </div>
        )}
      </div>

      {showCalendar && (
        <GoogleCalendarWizard
          onClose={() => setShowCalendar(false)}
          initial={state.googleCalendarConfig}
          onSave={(config) => {
            update({ googleCalendarConfig: config });
            setShowCalendar(false);
            toast.success('Integração Google Calendar configurada');
          }}
        />
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
      {children}
    </span>
  );
}

function GoogleCalendarWizard({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (cfg: NonNullable<WizardState['googleCalendarConfig']>) => void;
  initial: WizardState['googleCalendarConfig'];
}) {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<NonNullable<WizardState['googleCalendarConfig']>>(
    initial ?? {
      name: '',
      timezone: 'America/Sao_Paulo',
      alwaysOpen: true,
      allowMultiple: false,
      defaultDurationMinutes: 60,
    },
  );

  const labels = ['Calendário', 'Horário de Funcionamento', 'Campos de Agendamento'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-start justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white">
              <Plug className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Integração Google Calendar
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Conecte serviços externos para aprimorar as capacidades do seu
                agente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <ol className="flex items-center justify-around border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          {labels.map((l, idx) => (
            <li key={l} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  idx === step
                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white'
                    : idx < step
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                }`}
              >
                {idx + 1}
              </span>
              <span
                className={`text-xs ${
                  idx === step
                    ? 'font-semibold text-violet-700 dark:text-violet-300'
                    : 'text-zinc-500'
                }`}
              >
                {l}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Nome da Integração
                </label>
                <input
                  type="text"
                  value={cfg.name}
                  onChange={(e) => setCfg({ ...cfg, name: e.target.value })}
                  placeholder="Ex: Cris Magalhães"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <p className="text-xs text-zinc-500">
                  Este nome é usado para dar contexto ao agente
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Fuso Horário
                </label>
                <select
                  value={cfg.timezone}
                  onChange={(e) => setCfg({ ...cfg, timezone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="America/Sao_Paulo">(GMT-03:00) São Paulo</option>
                  <option value="America/New_York">(GMT-05:00) New York</option>
                  <option value="Europe/Lisbon">(GMT+00:00) Lisboa</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Toggle
                checked={cfg.alwaysOpen}
                onChange={(v) => setCfg({ ...cfg, alwaysOpen: v })}
                title="Sempre Aberto"
                description="Permitir agendamento a qualquer hora"
              />
              <Toggle
                checked={cfg.allowMultiple}
                onChange={(v) => setCfg({ ...cfg, allowMultiple: v })}
                title="Permitir Múltiplos Agendamentos"
                description="Permitir múltiplos agendamentos no mesmo horário"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Duração Padrão do Agendamento
                </label>
                <select
                  value={cfg.defaultDurationMinutes}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      defaultDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/50 p-4 text-xs dark:border-violet-900/40 dark:bg-violet-900/10">
              <p className="font-medium text-violet-700 dark:text-violet-300">
                Campos de Agendamento personalizados
              </p>
              <p className="mt-1 text-violet-600/80 dark:text-violet-300/80">
                Configuração granular de campos extras que o cliente preencherá
                ao agendar (Nome do campo / Tipo) entra na próxima iteração.
                Por enquanto o agendamento usa o padrão (nome + telefone +
                email + observações).
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {step === 0 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !cfg.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-1.5 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800 disabled:opacity-60"
            >
              Continuar →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(cfg)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-1.5 text-xs font-medium text-white hover:from-violet-700 hover:to-purple-800"
            >
              <Check className="h-3.5 w-3.5" />
              Criar Integração
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
        checked
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
      }`}
    >
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <span
        aria-hidden
        className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition ${
          checked
            ? 'bg-gradient-to-r from-violet-600 to-purple-700'
            : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
