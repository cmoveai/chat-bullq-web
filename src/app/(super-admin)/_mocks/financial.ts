export interface FinancialBreakdown {
  label: string;
  amountBrl: number;
}

export interface FinancialMock {
  reference: string;
  inflowsBrl: number;
  inflowsMrr: number;
  inflowsAdHoc: number;
  variableBrl: number;
  variablePctOfRevenue: number;
  fixedBrl: number;
  fixedPctOfRevenue: number;
  marginBrl: number;
  marginPctOfRevenue: number;
  marginGoalPct: number;
  variableLines: FinancialBreakdown[];
  fixedLines: FinancialBreakdown[];
  projection: Array<{ month: string; revenueBrl: number; subscribers: number }>;
  goalSep26Subscribers: number;
}

export interface RevenueGrowthPoint {
  label: string;
  amountBrl: number;
}

export interface ExpenseCategory {
  name: string;
  amountBrl: number;
  pct: number;
  color: string;
}

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
  amountBrl: number;
  counterparty: string;
  status: 'completed' | 'scheduled' | 'pending';
}

export const revenueGrowth7d: RevenueGrowthPoint[] = [
  { label: 'Seg', amountBrl: 412 },
  { label: 'Ter', amountBrl: 597 },
  { label: 'Qua', amountBrl: 891 },
  { label: 'Qui', amountBrl: 1297 },
  { label: 'Sex', amountBrl: 1488 },
  { label: 'Sáb', amountBrl: 894 },
  { label: 'Dom', amountBrl: 597 },
];

export const revenueGrowth30d: RevenueGrowthPoint[] = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  amountBrl: Math.round(180 + 60 * i + Math.sin(i / 3) * 120 + Math.random() * 80),
}));

export const expenseBreakdown: ExpenseCategory[] = [
  { name: 'LLM (Anthropic)', amountBrl: 612, pct: 32, color: '#10b981' },
  { name: 'WhatsApp Cloud', amountBrl: 423, pct: 22, color: '#84cc16' },
  { name: 'Kirvano (4%)', amountBrl: 212, pct: 11, color: '#a3a3a3' },
  { name: 'Outras fixas', amountBrl: 681, pct: 35, color: '#27272a' },
];

export const recentTransactions: RecentTransaction[] = [
  {
    id: 'TX-0042',
    date: '07/05/2026',
    description: 'Assinatura Growth · Studio Beauty Marília',
    category: 'Assinatura',
    type: 'credit',
    amountBrl: 597,
    counterparty: 'Pix · Santander',
    status: 'completed',
  },
  {
    id: 'TX-0041',
    date: '06/05/2026',
    description: 'Anthropic API · uso mensal',
    category: 'LLM',
    type: 'debit',
    amountBrl: 612,
    counterparty: 'Anthropic',
    status: 'completed',
  },
  {
    id: 'TX-0040',
    date: '06/05/2026',
    description: 'Assinatura Pro · Imobiliária Capital',
    category: 'Assinatura',
    type: 'credit',
    amountBrl: 1297,
    counterparty: 'Pix · Santander',
    status: 'completed',
  },
  {
    id: 'TX-0039',
    date: '05/05/2026',
    description: 'WhatsApp Cloud API · conversations',
    category: 'WhatsApp',
    type: 'debit',
    amountBrl: 423,
    counterparty: 'Meta',
    status: 'completed',
  },
  {
    id: 'TX-0038',
    date: '05/05/2026',
    description: 'VPS Hostinger · KVM4',
    category: 'Infra',
    type: 'debit',
    amountBrl: 88,
    counterparty: 'Hostinger',
    status: 'scheduled',
  },
  {
    id: 'TX-0037',
    date: '04/05/2026',
    description: 'Assinatura Growth · Auto Escola Norte',
    category: 'Assinatura',
    type: 'credit',
    amountBrl: 597,
    counterparty: 'Pix · Santander',
    status: 'completed',
  },
  {
    id: 'TX-0036',
    date: '04/05/2026',
    description: 'Resend · email transacional',
    category: 'Infra',
    type: 'debit',
    amountBrl: 110,
    counterparty: 'Resend',
    status: 'completed',
  },
  {
    id: 'TX-0035',
    date: '03/05/2026',
    description: 'Assinatura Starter · Açaí do Bairro',
    category: 'Assinatura',
    type: 'credit',
    amountBrl: 297,
    counterparty: 'Pix · Santander',
    status: 'completed',
  },
];

export const financialMock: FinancialMock = {
  reference: 'Mai/2026',
  inflowsBrl: 5673,
  inflowsMrr: 5673,
  inflowsAdHoc: 0,
  variableBrl: 1247,
  variablePctOfRevenue: 22,
  fixedBrl: 681,
  fixedPctOfRevenue: 12,
  marginBrl: 3745,
  marginPctOfRevenue: 66,
  marginGoalPct: 40,
  variableLines: [
    { label: 'LLM (Anthropic/OpenRouter)', amountBrl: 612 },
    { label: 'WhatsApp Cloud API', amountBrl: 423 },
    { label: 'Kirvano (4%)', amountBrl: 212 },
  ],
  fixedLines: [
    { label: 'VPS Hostinger', amountBrl: 88 },
    { label: 'Domínios + SSL', amountBrl: 22 },
    { label: 'Resend (email)', amountBrl: 110 },
    { label: 'Backup R2', amountBrl: 35 },
    { label: 'NF + Supabase + outros', amountBrl: 426 },
  ],
  projection: [
    { month: 'Mai/26', revenueBrl: 5673, subscribers: 12 },
    { month: 'Jun/26', revenueBrl: 8400, subscribers: 18 },
    { month: 'Jul/26', revenueBrl: 12100, subscribers: 25 },
    { month: 'Ago/26', revenueBrl: 16800, subscribers: 33 },
  ],
  goalSep26Subscribers: 30,
};
