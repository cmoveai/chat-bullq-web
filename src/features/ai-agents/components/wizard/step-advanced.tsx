'use client';

import {
  Settings,
  Clock,
  Hourglass,
  UserCheck,
  ListChecks,
  Database,
  User,
  Phone,
  Mail,
  Flag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WizardState } from './types';

interface StepAdvancedProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const DELAY_OPTIONS = [0, 5, 10, 30, 60];

const TRIGGER_LABEL: Record<WizardState['leadQualificationTrigger'], string> = {
  AFTER_EACH_MESSAGE: 'Após Cada Mensagem',
  AFTER_N_MESSAGES: 'Após X Mensagens',
  WHEN_CONVERSATION_ENDS: 'Quando o Atendimento Termina',
};

export function StepAdvanced({ state, update }: StepAdvancedProps) {
  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Settings className="h-4 w-4 text-violet-600" />
          Configurações Avançadas
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Configure recursos avançados para seu agente
        </p>
      </header>

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Clock className="h-3.5 w-3.5 text-violet-600" />
          Fuso Horário
        </label>
        <select
          value={state.timezone}
          onChange={(e) => update({ timezone: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option value="America/Sao_Paulo">(GMT-03:00) São Paulo</option>
          <option value="America/New_York">(GMT-05:00) New York</option>
          <option value="Europe/Lisbon">(GMT+00:00) Lisboa</option>
          <option value="Europe/London">(GMT+00:00) London</option>
          <option value="UTC">UTC</option>
        </select>
        <p className="text-xs text-zinc-500">
          Fuso horário do agente para agendamento e operações baseadas em tempo
        </p>
      </section>

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Hourglass className="h-3.5 w-3.5 text-violet-600" />
          Atraso na Resposta (segundos)
        </label>
        <p className="text-xs text-zinc-500">
          Defina o atraso antes do agente responder às mensagens
        </p>
        <select
          value={state.responseDelaySeconds}
          onChange={(e) =>
            update({ responseDelaySeconds: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {DELAY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 0 ? 'Imediato' : `${s} segundos`}
            </option>
          ))}
        </select>
      </section>

      <ToggleCard
        icon={UserCheck}
        title="Habilitar Transferência para Humano"
        description="Transferir automaticamente o atendimento para humano quando o limite de interações for atingido"
        checked={state.transferToHumanEnabled}
        onChange={(v) => update({ transferToHumanEnabled: v })}
      />

      {state.transferToHumanEnabled && (
        <section className="space-y-2 pl-12">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <ListChecks className="h-3.5 w-3.5 text-violet-600" />
            Máximo de Interações antes da Transferência
          </label>
          <p className="text-xs text-zinc-500">
            Número de interações antes do agente transferir para um atendente
            humano
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                update({
                  maxInteractionsBeforeTransfer: Math.max(
                    1,
                    state.maxInteractionsBeforeTransfer - 1,
                  ),
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={state.maxInteractionsBeforeTransfer}
              onChange={(e) =>
                update({
                  maxInteractionsBeforeTransfer: Math.max(
                    1,
                    Number(e.target.value) || 1,
                  ),
                })
              }
              className="w-20 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() =>
                update({
                  maxInteractionsBeforeTransfer:
                    state.maxInteractionsBeforeTransfer + 1,
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              +
            </button>
          </div>
        </section>
      )}

      <ToggleCard
        icon={Database}
        title="Habilitar Coleta de Dados"
        description="Coletar dados durante o fluxo da conversa"
        checked={state.collectContactData}
        onChange={(v) => update({ collectContactData: v })}
      />

      {state.collectContactData && (
        <section className="space-y-3 pl-12">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Campos de Contato
            </p>
            <p className="text-xs text-zinc-500">
              Selecione quais informações de contato o agente deve coletar
              durante a conversa.
            </p>
          </div>
          <div className="space-y-2">
            <FieldToggle
              icon={User}
              label="Nome"
              hint="Texto"
              checked={state.collectStandardFields.includes('name')}
              onChange={() => toggleStandardField(state, update, 'name')}
            />
            <FieldToggle
              icon={Phone}
              label="Telefone"
              hint="Texto"
              checked={state.collectStandardFields.includes('phone')}
              onChange={() => toggleStandardField(state, update, 'phone')}
            />
            <FieldToggle
              icon={Mail}
              label="Email"
              hint="Email"
              checked={state.collectStandardFields.includes('email')}
              onChange={() => toggleStandardField(state, update, 'email')}
            />
          </div>
        </section>
      )}

      <ToggleCard
        icon={Flag}
        title="Qualificação de Lead"
        description="Quando habilitado, a IA analisará as conversas e qualificará leads com base na intenção e engajamento"
        checked={state.leadQualificationEnabled}
        onChange={(v) => update({ leadQualificationEnabled: v })}
      />

      {state.leadQualificationEnabled && (
        <section className="space-y-4 pl-12">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Gatilho de Qualificação
            </label>
            <p className="text-xs text-zinc-500">
              Escolha quando a IA deve qualificar leads durante as conversas
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                Object.keys(TRIGGER_LABEL) as Array<
                  WizardState['leadQualificationTrigger']
                >
              ).map((t) => {
                const active = state.leadQualificationTrigger === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update({ leadQualificationTrigger: t })}
                    className={`rounded-lg border px-3 py-3 text-xs font-medium transition ${
                      active
                        ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500 dark:bg-violet-900/20 dark:text-violet-300'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300'
                    }`}
                  >
                    {TRIGGER_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {state.leadQualificationTrigger === 'AFTER_N_MESSAGES' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Após quantas mensagens?
              </label>
              <input
                type="number"
                min={1}
                value={state.leadQualificationMessageCount}
                onChange={(e) =>
                  update({
                    leadQualificationMessageCount: Math.max(
                      1,
                      Number(e.target.value) || 1,
                    ),
                  })
                }
                className="w-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Prompt de Qualificação Personalizado
            </label>
            <textarea
              value={state.leadQualificationPrompt}
              onChange={(e) =>
                update({ leadQualificationPrompt: e.target.value })
              }
              rows={4}
              placeholder="Opcional: adicione instruções personalizadas sobre como a IA deve qualificar leads. Deixe em branco para usar o prompt de qualificação padrão."
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              Instruções personalizadas para como a IA deve qualificar leads.
              Deixe vazio para usar o prompt padrão.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function toggleStandardField(
  state: WizardState,
  update: (patch: Partial<WizardState>) => void,
  field: string,
) {
  const has = state.collectStandardFields.includes(field);
  update({
    collectStandardFields: has
      ? state.collectStandardFields.filter((f) => f !== field)
      : [...state.collectStandardFields, field],
  });
}

function ToggleCard({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
        checked
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} />
    </button>
  );
}

function FieldToggle({
  icon: Icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
        checked
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {label}
          </p>
          <p className="text-xs text-zinc-500">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} />
    </button>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
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
  );
}
