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
