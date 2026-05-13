'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { FeaturePaywall } from '@/features/billing/components/feature-paywall';
import {
  customFieldsService,
  type CustomContactField,
  type CustomFieldType,
  CUSTOM_FIELD_TYPE_LABEL,
} from '@/features/custom-fields/services/custom-fields.service';

const TYPES: CustomFieldType[] = [
  'text',
  'textarea',
  'number',
  'date',
  'email',
  'phone',
  'url',
  'select',
];

function newId() {
  return `f_${Math.random().toString(36).slice(2, 9)}`;
}

function CustomFieldsSettingsPageInner() {
  const qc = useQueryClient();
  const [fields, setFields] = useState<CustomContactField[]>([]);
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ['custom-contact-fields'],
    queryFn: () => customFieldsService.list(),
  });

  useEffect(() => {
    if (query.data) {
      setFields(query.data);
    }
  }, [query.data]);

  const save = useMutation({
    mutationFn: (next: CustomContactField[]) => customFieldsService.save(next),
    onSuccess: (saved) => {
      toast.success('Campos customizados salvos');
      setFields(saved);
      qc.invalidateQueries({ queryKey: ['custom-contact-fields'] });
    },
    onError: (err: any) =>
      toast.error(err?.message || 'Erro ao salvar campos'),
  });

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: newId(),
        label: 'Novo campo',
        type: 'text',
        order: prev.length,
      },
    ]);
  };

  const updateField = (id: string, patch: Partial<CustomContactField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  const removeField = (id: string) => {
    setFields((prev) =>
      prev
        .filter((f) => f.id !== id)
        .map((f, idx) => ({ ...f, order: idx })),
    );
  };

  const moveField = (id: string, dir: -1 | 1) => {
    setFields((prev) => {
      const i = prev.findIndex((f) => f.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy.map((f, idx) => ({ ...f, order: idx }));
    });
  };

  const handleSave = async () => {
    // Validações cliente-side
    for (const f of fields) {
      if (!f.label.trim()) {
        toast.error('Todo campo precisa de um label');
        return;
      }
      if (f.type === 'select' && (!f.options || f.options.length === 0)) {
        toast.error(`Campo "${f.label}" do tipo Seleção precisa de pelo menos 1 opção`);
        return;
      }
    }
    setSaving(true);
    try {
      await save.mutateAsync(fields);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Campos customizados de contato
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Defina campos extras que aparecem em cada contato (ex: Empresa,
              CNPJ, Cargo).
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

        {query.isLoading ? (
          <div className="mt-8 text-center text-sm text-zinc-500">
            Carregando...
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {fields.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <SettingsIcon className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Nenhum campo customizado ainda
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Adicione campos pra capturar informações extras dos contatos
                </p>
              </div>
            )}

            {fields.map((f, idx) => (
              <div
                key={f.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-0.5 pt-2">
                    <button
                      type="button"
                      onClick={() => moveField(f.id, -1)}
                      disabled={idx === 0}
                      className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                      title="Mover pra cima"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Nome do campo *
                      </label>
                      <input
                        value={f.label}
                        onChange={(e) =>
                          updateField(f.id, { label: e.target.value })
                        }
                        placeholder="Ex: Empresa"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Tipo
                      </label>
                      <select
                        value={f.type}
                        onChange={(e) =>
                          updateField(f.id, {
                            type: e.target.value as CustomFieldType,
                          })
                        }
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {CUSTOM_FIELD_TYPE_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {f.type === 'select' && (
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Opções (uma por linha)
                        </label>
                        <textarea
                          rows={3}
                          value={(f.options ?? []).join('\n')}
                          onChange={(e) =>
                            updateField(f.id, {
                              options: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Lead Quente&#10;Lead Morno&#10;Lead Frio"
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={f.required ?? false}
                          onChange={(e) =>
                            updateField(f.id, { required: e.target.checked })
                          }
                          className="h-3.5 w-3.5"
                        />
                        Obrigatório
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(f.id)}
                    className="text-zinc-400 hover:text-red-500"
                    title="Remover campo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addField}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              <Plus className="h-4 w-4" />
              Adicionar campo customizado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomFieldsSettingsPage() {
  return (
    <FeaturePaywall
      feature="customContactFields"
      title="Campos personalizados de contato"
      description="Crie campos extras pra capturar dados específicos do seu negócio em cada contato. Disponível a partir do plano Growth."
      requiredPlan="Growth"
    >
      <CustomFieldsSettingsPageInner />
    </FeaturePaywall>
  );
}
