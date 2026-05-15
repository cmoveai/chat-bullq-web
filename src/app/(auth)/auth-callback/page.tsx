'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Cyber Onda 2 · #22 · Callback OAuth Google
 *
 * Backend redireciona pra cá com:
 *   /auth-callback?token=...&refresh=...&isNew=...
 *
 * Aqui salva tokens no localStorage e redireciona pro dashboard
 * (ou onboarding se isNew=1).
 *
 * useSearchParams precisa estar dentro de Suspense pra Next 14+ static export.
 */

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params?.get('token');
    const refresh = params?.get('refresh');
    const isNew = params?.get('isNew') === '1';
    const err = params?.get('error');

    if (err) {
      setError(err);
      return;
    }
    if (!token || !refresh) {
      setError('missing_tokens');
      return;
    }

    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh);
    setTimeout(() => {
      router.replace(isNew ? '/onboarding' : '/dashboard');
    }, 200);
  }, [params, router]);

  if (error) {
    return (
      <>
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Falha no login Google
        </p>
        <p className="mt-2 text-xs text-zinc-500">{error}</p>
        <button
          onClick={() => router.replace('/login')}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Voltar pro login
        </button>
      </>
    );
  }

  return (
    <>
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Conectando sua conta Google...
      </p>
    </>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <Suspense
          fallback={<Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />}
        >
          <AuthCallbackInner />
        </Suspense>
      </div>
    </div>
  );
}
