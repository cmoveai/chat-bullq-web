'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Plan } from '../lib/plans-data';

type Props = {
  plan: Plan;
  cycle: 'monthly' | 'quarterly';
  onClose: () => void;
};

export function TrialModal({ plan, cycle, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || phone.replace(/\D/g, '').length < 10) {
      toast.error('Preencha todos os campos');
      return;
    }
    setSubmitting(true);
    try {
      // Salva no localStorage pra prefill do /register
      const data = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        planId: plan.id,
        cycle,
      };
      localStorage.setItem('cmove_zap_trial_intent', JSON.stringify(data));

      const params = new URLSearchParams({
        plan: plan.id,
        cycle,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      router.push(`/register?${params.toString()}`);
    } catch (err) {
      toast.error('Erro · tente novamente');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-2 flex items-center gap-2 text-base font-extrabold tracking-tight text-white">
          CMOVE<span className="text-cyan-400">.AI</span>{' '}
          <span className="text-emerald-400">ZAP</span>
        </div>

        <h2 className="mt-4 text-2xl font-black text-white">
          Comece seu trial de 30 dias
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Plano <span className="text-emerald-400">{plan.name}</span> · R${' '}
          {cycle === 'monthly' ? plan.monthly : plan.quarterly}{' '}
          {cycle === 'monthly' ? '/mês' : '/trimestre'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Telefone (WhatsApp)
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-3 text-sm text-zinc-400">
                🇧🇷 +55
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 98974-9229"
                required
                className="w-full rounded-r-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Cadastrar agora'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-zinc-500">
          Ao continuar você aceita os termos e a política de privacidade da CMOVE.AI
        </p>
      </div>
    </div>
  );
}
