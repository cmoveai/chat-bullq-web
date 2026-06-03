import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/channels',
        permanent: false,
      },
    ];
  },
  // Dev HTTPS: proxia a API na mesma origem pra evitar mixed content
  // (página https → API http://localhost:3001). Só ativa quando
  // DEV_API_PROXY_TARGET estiver setado (ambiente local de teste).
  async rewrites() {
    const target = process.env.DEV_API_PROXY_TARGET;
    if (!target) return [];
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

// Cyber Onda 2 · #26 · Sentry build hooks
// Env-gated · só ativa upload de source maps quando SENTRY_AUTH_TOKEN existe.
// SENTRY_ORG e SENTRY_PROJECT vêm das env vars (configurar quando criar projeto).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  disableLogger: true,
  automaticVercelMonitors: false,
});
