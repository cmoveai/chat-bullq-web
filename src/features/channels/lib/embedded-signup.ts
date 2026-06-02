/**
 * Embedded Signup (WhatsApp Tech Provider) — carrega o Facebook SDK e roda o
 * fluxo de "Conectar WhatsApp". Devolve o `code` (response_type=code) junto com
 * o `waba_id` e `phone_number_id` que o evento de sessão do ES carrega.
 *
 * Config via env (preenchidas quando a Business Verification aprovar e o
 * Embedded Signup tiver config_id):
 *   NEXT_PUBLIC_META_APP_ID
 *   NEXT_PUBLIC_META_ES_CONFIG_ID
 *   NEXT_PUBLIC_META_GRAPH_VERSION (default v21.0)
 */

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export interface EmbeddedSignupResult {
  code: string;
  wabaId: string;
  phoneNumberId: string;
}

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const CONFIG_ID = process.env.NEXT_PUBLIC_META_ES_CONFIG_ID;
const GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v21.0';

export function isEmbeddedSignupConfigured(): boolean {
  return Boolean(APP_ID && CONFIG_ID);
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SDK só carrega no browser'));
  }
  if (window.FB) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: GRAPH_VERSION,
      });
      resolve();
    };

    const id = 'facebook-jssdk';
    if (document.getElementById(id)) return;
    const js = document.createElement('script');
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    js.async = true;
    js.defer = true;
    js.crossOrigin = 'anonymous';
    js.onerror = () => reject(new Error('Falha ao carregar o SDK do Facebook'));
    document.body.appendChild(js);
  });

  return sdkPromise;
}

/**
 * Abre o popup do Embedded Signup e resolve com { code, wabaId, phoneNumberId }.
 * Rejeita se o usuário fechar/cancelar ou se faltar config.
 */
export async function launchEmbeddedSignup(): Promise<EmbeddedSignupResult> {
  if (!isEmbeddedSignupConfigured()) {
    throw new Error(
      'Embedded Signup ainda não configurado (faltam NEXT_PUBLIC_META_APP_ID / NEXT_PUBLIC_META_ES_CONFIG_ID).',
    );
  }

  await loadSdk();

  return new Promise<EmbeddedSignupResult>((resolve, reject) => {
    let sessionInfo: { wabaId?: string; phoneNumberId?: string } = {};

    const onMessage = (event: MessageEvent) => {
      if (
        typeof event.origin !== 'string' ||
        !event.origin.endsWith('facebook.com')
      ) {
        return;
      }
      let payload: any;
      try {
        payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (payload.event === 'FINISH' || payload.event === 'FINISH_ONLY_WABA') {
        sessionInfo = {
          wabaId: payload.data?.waba_id,
          phoneNumberId: payload.data?.phone_number_id,
        };
      } else if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
        cleanup();
        reject(new Error('Conexão cancelada ou interrompida no popup da Meta.'));
      }
    };

    const cleanup = () => window.removeEventListener('message', onMessage);
    window.addEventListener('message', onMessage);

    window.FB.login(
      (response: any) => {
        cleanup();
        const code = response?.authResponse?.code;
        if (!code) {
          reject(new Error('Login não autorizado (sem code).'));
          return;
        }
        if (!sessionInfo.wabaId || !sessionInfo.phoneNumberId) {
          reject(
            new Error(
              'Não recebi o número/WABA do fluxo. Tente conectar novamente.',
            ),
          );
          return;
        }
        resolve({
          code,
          wabaId: sessionInfo.wabaId,
          phoneNumberId: sessionInfo.phoneNumberId,
        });
      },
      {
        config_id: CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      },
    );
  });
}
