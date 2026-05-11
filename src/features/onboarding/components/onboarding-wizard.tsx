'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Experiencia = 'primeiros_passos' | 'alguns_testes' | 'operacao_madura';
type Objetivo = 'lancador_pessoal' | 'agencia_lancamento' | 'infoprodutor_perpetuo' | 'negocio_local' | 'outro';
type VolumeMensal = 'ate_500' | '500_2k' | '2k_10k' | '10k_mais';

interface OnboardingState {
  step: 1 | 2 | 3 | 4;
  experiencia?: Experiencia;
  objetivo?: Objetivo;
  setores: string[];
  tempoMercado?: VolumeMensal;
}

const SETORES = [
  { id: 'educacao', label: 'Educação · cursos online' },
  { id: 'coaching', label: 'Coaching · mentoria' },
  { id: 'saude', label: 'Saúde · bem-estar · fitness' },
  { id: 'beleza', label: 'Beleza · estética' },
  { id: 'imobiliaria', label: 'Imobiliária' },
  { id: 'direito', label: 'Direito · advocacia' },
  { id: 'marketing', label: 'Marketing · agência' },
  { id: 'financas', label: 'Finanças · investimentos' },
  { id: 'tech', label: 'Tecnologia · SaaS' },
  { id: 'ecommerce', label: 'E-commerce · loja virtual' },
  { id: 'outro', label: 'Outro' },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<OnboardingState>({ step: 1, setores: [] });

  function goNext() {
    if (state.step < 4) setState((s) => ({ ...s, step: (s.step + 1) as OnboardingState['step'] }));
  }
  function goBack() {
    if (state.step > 1) setState((s) => ({ ...s, step: (s.step - 1) as OnboardingState['step'] }));
  }

  function toggleSetor(id: string) {
    setState((s) => ({
      ...s,
      setores: s.setores.includes(id) ? s.setores.filter((x) => x !== id) : [...s.setores, id],
    }));
  }

  async function complete() {
    if (!state.experiencia || !state.objetivo || !state.tempoMercado || state.setores.length === 0) {
      toast.error('Responda todas as etapas');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/organizations/current/onboarding', {
        experiencia: state.experiencia,
        objetivo: state.objetivo,
        setores: state.setores,
        tempoMercado: state.tempoMercado,
      });
      toast.success('Pronto · vamos começar');
      router.push('/home?welcome=1');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar · tente de novo');
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance =
    (state.step === 1 && !!state.experiencia) ||
    (state.step === 2 && !!state.objetivo) ||
    (state.step === 3 && state.setores.length > 0) ||
    (state.step === 4 && !!state.tempoMercado);

  return (
    <div className="w-full max-w-2xl rounded-xl bg-card shadow-lg p-8 sm:p-10 border border-border">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-medium text-muted-foreground">
          <span>Etapa {state.step} de 4</span>
          <span>{Math.round((state.step / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(state.step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Etapa 1 · Experiência IA */}
      {state.step === 1 && (
        <Step
          eyebrow="Sobre você"
          title="Qual sua experiência com IA pra atendimento?"
          subtitle="A gente ajusta o produto pra começar do ponto certo."
        >
          <Choice
            label="Estou começando agora"
            sub="Nunca usei IA pra atender clientes ou estou nos primeiros testes."
            selected={state.experiencia === 'primeiros_passos'}
            onClick={() => setState((s) => ({ ...s, experiencia: 'primeiros_passos' }))}
          />
          <Choice
            label="Já fiz alguns testes"
            sub="Conheço Manychat, ChatGPT ou similar · quero algo mais avançado."
            selected={state.experiencia === 'alguns_testes'}
            onClick={() => setState((s) => ({ ...s, experiencia: 'alguns_testes' }))}
          />
          <Choice
            label="Operação madura"
            sub="Já tenho automação rodando · quero escalar com agentes IA reais."
            selected={state.experiencia === 'operacao_madura'}
            onClick={() => setState((s) => ({ ...s, experiencia: 'operacao_madura' }))}
          />
        </Step>
      )}

      {/* Etapa 2 · Tipo de negócio */}
      {state.step === 2 && (
        <Step
          eyebrow="Seu negócio"
          title="O que melhor descreve sua operação?"
          subtitle="Vamos personalizar templates e dashboard de acordo."
        >
          <Choice
            label="Lançador de infoproduto"
            sub="Faço lançamentos do meu próprio produto digital."
            selected={state.objetivo === 'lancador_pessoal'}
            onClick={() => setState((s) => ({ ...s, objetivo: 'lancador_pessoal' }))}
          />
          <Choice
            label="Agência de lançamento"
            sub="Faço lançamentos pra outros experts · 2 ou mais clientes."
            selected={state.objetivo === 'agencia_lancamento'}
            onClick={() => setState((s) => ({ ...s, objetivo: 'agencia_lancamento' }))}
          />
          <Choice
            label="Infoproduto perpétuo"
            sub="Vendo curso · membership · funil 24/7 sem datas de lançamento."
            selected={state.objetivo === 'infoprodutor_perpetuo'}
            onClick={() => setState((s) => ({ ...s, objetivo: 'infoprodutor_perpetuo' }))}
          />
          <Choice
            label="Negócio local · serviço"
            sub="Atendimento físico · clínica · salão · advocacia · imobiliária."
            selected={state.objetivo === 'negocio_local'}
            onClick={() => setState((s) => ({ ...s, objetivo: 'negocio_local' }))}
          />
          <Choice
            label="Outro"
            sub="Conte mais depois · vamos ajudar a configurar."
            selected={state.objetivo === 'outro'}
            onClick={() => setState((s) => ({ ...s, objetivo: 'outro' }))}
          />
        </Step>
      )}

      {/* Etapa 3 · Setores (multi-select) */}
      {state.step === 3 && (
        <Step
          eyebrow="Nicho"
          title="Em quais nichos você atua?"
          subtitle="Pode marcar mais de um · isso ajuda a sugerir templates relevantes."
        >
          <div className="grid grid-cols-2 gap-2">
            {SETORES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSetor(s.id)}
                className={`text-left text-sm px-4 py-3 rounded-lg border transition ${
                  state.setores.includes(s.id)
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-foreground/30 text-foreground/80'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Step>
      )}

      {/* Etapa 4 · Volume mensal */}
      {state.step === 4 && (
        <Step
          eyebrow="Volume"
          title="Quantas conversas no WhatsApp/Instagram por mês hoje?"
          subtitle="Estimativa basta · usamos pra sugerir o plano certo no fim do trial."
        >
          <Choice
            label="Até 500 conversas/mês"
            sub="Plano Solo é suficiente · ticket inicial."
            selected={state.tempoMercado === 'ate_500'}
            onClick={() => setState((s) => ({ ...s, tempoMercado: 'ate_500' }))}
          />
          <Choice
            label="500 a 2.000 conversas/mês"
            sub="Solo aperta · Time já é sweet spot."
            selected={state.tempoMercado === '500_2k'}
            onClick={() => setState((s) => ({ ...s, tempoMercado: '500_2k' }))}
          />
          <Choice
            label="2.000 a 10.000 conversas/mês"
            sub="Time ou Negócio · com 6+ agentes IA."
            selected={state.tempoMercado === '2k_10k'}
            onClick={() => setState((s) => ({ ...s, tempoMercado: '2k_10k' }))}
          />
          <Choice
            label="10.000+ conversas/mês"
            sub="Plano Negócio ou Empresa · multi-departamento."
            selected={state.tempoMercado === '10k_mais'}
            onClick={() => setState((s) => ({ ...s, tempoMercado: '10k_mais' }))}
          />
        </Step>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {state.step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        ) : (
          <div />
        )}

        {state.step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={complete}
            disabled={!canAdvance || submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Salvando...' : (
              <>
                Concluir <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Step({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{eyebrow}</div>
      <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Choice({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-5 py-4 transition ${
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
          : 'border-border hover:border-foreground/30'
      }`}
    >
      <div className="font-semibold text-sm text-foreground mb-0.5">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}
