'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginSupabasePage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const sb = (typeof window !== 'undefined') ? getSupabaseBrowser() : null;

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('Sem sessão devolvida');
      // Carrega user + orgs via /auth/me-supabase (backend Fase 5 já entende o JWT)
      const { data: meRes } = await api.get<{ ok: true; user: { id: string; email: string; name: string; avatarUrl: string | null } }>(
        '/auth/me-supabase',
      );
      // Buscamos as orgs reais via /auth/me clássico que já está pronto
      const { data: meClassicRes } = await api.get<{ data: { user: any; organizations: any[] } }>(
        '/auth/me',
      );
      setAuth(meClassicRes.data.user, meClassicRes.data.organizations || []);
      void meRes;
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!sb || !email) {
      setError('Informe o e-mail primeiro');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/login-supabase` },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar magic link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entrar na CMOVE.AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Login unificado via Supabase Auth (SSO entre LAUNCH e EIXXO)
          </p>
        </div>

        {magicSent ? (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 p-4 text-sm">
            Link enviado pra <strong>{email}</strong>. Confira a caixa de entrada e clique no botão.
          </div>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="sua senha"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar com senha'}
            </button>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full rounded-md border border-border bg-background py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              Enviar link de acesso por e-mail
            </button>
          </form>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Quer usar o login antigo?{' '}
          <Link href="/login" className="underline">
            Ir pra /login clássico
          </Link>
        </div>
      </div>
    </div>
  );
}
