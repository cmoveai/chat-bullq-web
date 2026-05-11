export interface OverviewMock {
  kpis: {
    mrrBrl: number;
    mrrTrendPct: string;
    activeSubscribers: number;
    newSubscribers30d: number;
    churnPct: number;
    churnTrendDirection: 'up' | 'down';
    receivableNext7dBrl: number;
    receivableInvoiceCount: number;
  };
  mrrSeries: number[];
  planDistribution: Array<{ plan: string; count: number; pct: number }>;
  attention: Array<{
    severity: 'red' | 'amber' | 'yellow';
    title: string;
    detail: string;
    cta: string;
  }>;
}

export const overviewMock: OverviewMock = {
  kpis: {
    mrrBrl: 5673,
    mrrTrendPct: '18%',
    activeSubscribers: 12,
    newSubscribers30d: 4,
    churnPct: 1.2,
    churnTrendDirection: 'down',
    receivableNext7dBrl: 1794,
    receivableInvoiceCount: 3,
  },
  mrrSeries: [
    1200, 1500, 1700, 2100, 2400, 2800, 3100, 3400, 3700, 4100, 4400, 4800, 5100, 5673,
  ],
  planDistribution: [
    { plan: 'Growth', count: 6, pct: 50 },
    { plan: 'Starter', count: 4, pct: 33 },
    { plan: 'Pro', count: 2, pct: 17 },
  ],
  attention: [
    {
      severity: 'amber',
      title: 'Energia Solar BH · pagamento atrasado 2d',
      detail: 'R$ 597 · vencido 05/05',
      cta: 'Cobrar',
    },
    {
      severity: 'red',
      title: 'Pet Shop Bichano · sem mensagens há 11d',
      detail: 'risco de churn · plano Growth · cliente desde mar/26',
      cta: 'Ver',
    },
    {
      severity: 'amber',
      title: 'Plano Pro · margem caiu pra 41%',
      detail: 'custo LLM disparou nos últimos 14d',
      cta: 'Ver',
    },
  ],
};
