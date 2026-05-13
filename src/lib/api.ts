import axios from 'axios';
import { getSupabaseAccessToken } from './supabase-browser';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Prefere JWT do Supabase (Fase 5 SSO) · fallback no JWT próprio antigo.
    let token: string | null = null;
    try {
      token = await getSupabaseAccessToken();
    } catch {
      // env Supabase ausente · ok, usa o legado
    }
    if (!token) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const orgId = localStorage.getItem('active_org_id');
    if (orgId) {
      config.headers['x-organization-id'] = orgId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          );
          localStorage.setItem('access_token', data.data.accessToken);
          localStorage.setItem('refresh_token', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    const data = error.response?.data ?? {};
    const message = data.message || error.message;
    // Cria Error custom preservando payload estruturado (code/kind/limit/used/planCode/planName)
    // pra UX de paywall poder ler. Backend manda esses campos quando lança
    // HttpException({ code: 'PLAN_LIMIT_REACHED', ...}) graças ao GlobalExceptionFilter
    // que dá spread em exceptionResponse.
    const err: any = new Error(Array.isArray(message) ? message[0] : message);
    err.status = error.response?.status;
    err.code = data.code;
    err.kind = data.kind;
    err.limit = data.limit;
    err.used = data.used;
    err.budgetCents = data.budgetCents;
    err.spentCents = data.spentCents;
    err.planCode = data.planCode;
    err.planName = data.planName;
    err.raw = data;
    return Promise.reject(err);
  },
);

/** Type helper · checa se um erro é um plan limit/budget vindo do backend. */
export type PlanErrorCode =
  | 'PLAN_LIMIT_REACHED'
  | 'PLAN_LIMIT_MONTHLY_REACHED'
  | 'PLAN_LLM_BUDGET_REACHED';

export interface PlanError extends Error {
  status: number;
  code: PlanErrorCode;
  kind?: string;
  limit?: number;
  used?: number;
  budgetCents?: number;
  spentCents?: number;
  planCode?: string;
  planName?: string;
}

export function isPlanError(err: unknown): err is PlanError {
  if (!err || typeof err !== 'object') return false;
  const code = (err as any).code;
  return (
    code === 'PLAN_LIMIT_REACHED' ||
    code === 'PLAN_LIMIT_MONTHLY_REACHED' ||
    code === 'PLAN_LLM_BUDGET_REACHED'
  );
}
