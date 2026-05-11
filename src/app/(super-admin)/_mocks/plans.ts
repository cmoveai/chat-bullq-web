export interface PlanMock {
  name: 'Starter' | 'Growth' | 'Pro';
  priceBrl: number;
  isMostSold: boolean;
  subscribers: number;
  mrrBrl: number;
  marginPct: number;
  marginStatus: 'good' | 'warn' | 'bad';
  churn30dPct: number;
  trend30d: number[];
  limits: {
    channels: number | 'unlimited';
    agents: number | 'unlimited';
    monthlyConversations: number | 'unlimited';
  };
}

export const plansMock: PlanMock[] = [
  {
    name: 'Starter',
    priceBrl: 297,
    isMostSold: false,
    subscribers: 4,
    mrrBrl: 1188,
    marginPct: 58,
    marginStatus: 'good',
    churn30dPct: 0,
    trend30d: [1, 1, 2, 2, 2, 3, 3, 3, 4, 4],
    limits: { channels: 1, agents: 1, monthlyConversations: 500 },
  },
  {
    name: 'Growth',
    priceBrl: 597,
    isMostSold: true,
    subscribers: 6,
    mrrBrl: 3582,
    marginPct: 65,
    marginStatus: 'good',
    churn30dPct: 1.2,
    trend30d: [2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    limits: { channels: 3, agents: 5, monthlyConversations: 2000 },
  },
  {
    name: 'Pro',
    priceBrl: 1297,
    isMostSold: false,
    subscribers: 2,
    mrrBrl: 2594,
    marginPct: 41,
    marginStatus: 'warn',
    churn30dPct: 0,
    trend30d: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
    limits: { channels: 'unlimited', agents: 'unlimited', monthlyConversations: 'unlimited' },
  },
];

export const FUNNEL_30D = {
  trialsStarted: 12,
  activated: 6,
  paying: 3,
};
