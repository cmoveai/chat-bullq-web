'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Target,
  Smile,
  Ban,
  Scissors,
  Languages,
  Headset,
  ShoppingCart,
  User,
  Plus,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WizardState } from './types';

interface StepCommunicationProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const STYLE_OPTIONS: Array<{ id: WizardState['communicationStyle']; label: string }> = [
  { id: 'FORMAL', label: 'Formal' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'CASUAL', label: 'Casual' },
];

const PURPOSE_OPTIONS: Array<{
  id: WizardState['purpose'];
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'SUPPORT', label: 'Suporte', icon: Headset },
  { id: 'SALES', label: 'Vendas', icon: ShoppingCart },
  { id: 'PERSONAL', label: 'Uso Pessoal', icon: User },
];

const LANGUAGES = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'Inglês' },
  { id: 'es', label: 'Espanhol' },
  { id: 'fr', label: 'Francês' },
  { id: 'de', label: 'Alemão' },
  { id: 'it', label: 'Italiano' },
  { id: 'ja', label: 'Japonês' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ar', label: 'Árabe' },
  { id: 'hi', label: 'Hindi' },
];

export function StepCommunication({ state, update }: StepCommunicationProps) {
  const [topicDraft, setTopicDraft] = useState('');

  const addTopic = () => {
    const t = topicDraft.trim();
    if (!t || state.restrictedTopics.includes(t)) return;
    update({ restrictedTopics: [...state.restrictedTopics, t] });
    setTopicDraft('');
  };

  const removeTopic = (t: string) => {
    update({ restrictedTopics: state.restrictedTopics.filter((x) => x !== t) });
  };

  const toggleLanguage = (id: string) => {
    const has = state.languages.includes(id);
    update({
      languages: has
        ? state.languages.filter((l) => l !== id)
        : [...state.languages, id],
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <MessageSquare className="h-4 w-4 text-violet-600" />
          Configurações de Comunicação
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Configure como seu agente se comunicará com os usuários
        </p>
      </header>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Estilo de Comunicação
        </label>
        <p className="text-xs text-zinc-500">
          Escolha o estilo de comunicação para seu agente
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STYLE_OPTIONS.map((opt) => {
            const active = state.communicationStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ communicationStyle: opt.id })}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500 dark:bg-violet-900/20 dark:text-violet-300'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Target className="h-3.5 w-3.5 text-violet-600" />
          Propósito
        </label>
        <p className="text-xs text-zinc-500">
          Defina o principal propósito deste agente
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PURPOSE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = state.purpose === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ purpose: opt.id })}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500 dark:bg-violet-900/20 dark:text-violet-300'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <ToggleRow
        icon={Smile}
        title="Usar Emojis nas Respostas"
        description="Permitir que o agente use emojis nas respostas"
        checked={state.useEmojis}
        onChange={(v) => update({ useEmojis: v })}
      />

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Ban className="h-3.5 w-3.5 text-violet-600" />
          Restringir Tópicos
        </label>
        <p className="text-xs text-zinc-500">
          Defina tópicos que o agente NÃO deve discutir
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicDraft}
            onChange={(e) => setTopicDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTopic();
              }
            }}
            placeholder="Digite o tópico e pressione Enter"
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addTopic}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
        {state.restrictedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {state.restrictedTopics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTopic(t)}
                  className="ml-1 text-violet-500 hover:text-violet-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <ToggleRow
        icon={Scissors}
        title="Dividir Respostas Longas"
        description="Dividir automaticamente respostas longas em múltiplas mensagens"
        checked={state.splitLongResponses}
        onChange={(v) => update({ splitLongResponses: v })}
      />

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Languages className="h-3.5 w-3.5 text-violet-600" />
          Idiomas Suportados
        </label>
        <p className="text-xs text-zinc-500">
          Selecione os idiomas nos quais o agente pode se comunicar. Se um
          usuário escrever em um idioma diferente, o agente irá informá-lo.
        </p>
        <div className="space-y-1.5 pt-2">
          {LANGUAGES.map((lang) => {
            const active = state.languages.includes(lang.id);
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggleLanguage(lang.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                  active
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950'
                }`}
              >
                <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Languages className="h-3.5 w-3.5 text-violet-600" />
                  {lang.label}
                </span>
                <Switch checked={active} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
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
