// Cliente Supabase pra uso no navegador (Fase 5b SSO).
//
// Singleton em memória. Sessão persiste em cookies via @supabase/ssr.
// Use junto com supabase.auth.* pra login/logout/refresh sem precisar de back-end próprio.

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes no env do front',
    );
  }
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

/**
 * Pega o JWT atual do Supabase (do cookie/storage gerenciado pelo @supabase/ssr).
 * Retorna null se não houver sessão.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const sb = getSupabaseBrowser();
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
