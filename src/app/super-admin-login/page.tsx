'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Receipt, TrendingUp } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminGlobalLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Limpa sessão Supabase pra usar SÓ o login próprio (evita o conflito
      // em que o lib/api mandaria o token Supabase pro /auth/me).
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));

      const res = await authService.login({ email, password });
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      setAuth(res.user, res.organizations);

      if (res.user.globalRole !== 'SUPER_ADMIN') {
        setError('Esta conta não tem acesso de Admin Global.');
        setLoading(false);
        return;
      }
      router.replace('/super-admin');
    } catch {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Branding · só desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-14 flex-col justify-between">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#1DB954]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] shadow-[0_0_10px_#1DB954]" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 font-medium">
            EIXXO
          </span>
        </div>

        <div className="relative">
          <h1
            style={{ fontFamily: 'var(--font-montserrat)' }}
            className="text-5xl font-semibold text-white tracking-tight leading-[1.05]"
          >
            Admin<br />Global
          </h1>
          <p
            style={{ fontFamily: 'var(--font-montserrat)' }}
            className="text-xl text-zinc-300 mt-5 font-light"
          >
            O comando da sua operação.
          </p>
          <p className="text-sm text-zinc-500 mt-3 max-w-sm leading-relaxed">
            Assinantes, cobranças e o resultado do ZAP num só lugar. Acesso restrito ao dono da plataforma.
          </p>
        </div>

        <ul className="relative space-y-3">
          {[
            { icon: Users, label: 'Gestão de assinantes e planos' },
            { icon: Receipt, label: 'Cobranças e faturas em tempo real' },
            { icon: TrendingUp, label: 'Resultado e crescimento do ZAP' },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                <Icon className="w-4 h-4 text-[#1DB954]" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* marca compacta · mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
                EIXXO
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-montserrat)' }} className="text-2xl font-semibold text-white mt-2">Admin Global</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-xl font-semibold text-white">Entrar</h2>
            <p className="text-sm text-zinc-500 mt-1">Use suas credenciais de dono.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-[#1DB954] focus:outline-none transition-colors"
                placeholder="voce@cmove.ai"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-[#1DB954] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#1DB954] hover:brightness-110 disabled:opacity-60 text-black text-sm font-semibold py-2.5 transition-all"
            >
              {loading ? 'Entrando…' : 'Entrar no Admin Global'}
            </button>
          </form>

          <p className="text-center text-[11px] text-zinc-600 mt-8">CMOVE.AI · acesso seguro</p>
        </div>
      </div>
    </div>
  );
}
