export type TicketStatus = 'open' | 'pending_customer' | 'resolved';
export type TicketSla = 'green' | 'yellow' | 'red';

export interface TicketMessage {
  from: 'customer' | 'support';
  authorName: string;
  body: string;
  sentAtRelative: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  customerId: string;
  subject: string;
  openedRelative: string;
  openedHours: number;
  sla: TicketSla;
  status: TicketStatus;
  thread: TicketMessage[];
}

function deriveSla(hours: number): TicketSla {
  if (hours < 4) return 'green';
  if (hours < 24) return 'yellow';
  return 'red';
}

export const ticketsMock: Ticket[] = [
  {
    id: '#056',
    customerName: 'Energia Solar BH',
    customerId: 'sub_004',
    subject: 'Webhook não dispara',
    openedRelative: '2h',
    openedHours: 2,
    sla: deriveSla(2),
    status: 'open',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Oi, configurei o webhook do Pix mas ele não tá disparando quando alguém paga…',
        sentAtRelative: '14:23',
      },
      {
        from: 'support',
        authorName: 'Cris',
        body: 'Vou olhar agora, qual canal você configurou?',
        sentAtRelative: '14:31',
      },
    ],
  },
  {
    id: '#055',
    customerName: 'Auto Escola Norte',
    customerId: 'sub_002',
    subject: 'Pix não conciliou',
    openedRelative: '4h',
    openedHours: 4,
    sla: deriveSla(4),
    status: 'open',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Recebi um Pix de R$ 250 mas não apareceu no painel da Silvia. Pode dar uma olhada?',
        sentAtRelative: '12:10',
      },
    ],
  },
  {
    id: '#054',
    customerName: 'Studio Beauty Marília',
    customerId: 'sub_005',
    subject: 'Como conectar Instagram?',
    openedRelative: 'ontem',
    openedHours: 22,
    sla: deriveSla(22),
    status: 'pending_customer',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Quero conectar meu IG comercial. Como faço?',
        sentAtRelative: 'ontem 18:40',
      },
      {
        from: 'support',
        authorName: 'Cris',
        body: 'Aceita as permissões aqui no link… aguardando teu OK.',
        sentAtRelative: 'ontem 19:12',
      },
    ],
  },
  {
    id: '#053',
    customerName: 'Açaí do Bairro',
    customerId: 'sub_006',
    subject: 'Trial expirou cedo',
    openedRelative: '2d',
    openedHours: 48,
    sla: deriveSla(48),
    status: 'open',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Acho que meu trial deveria durar mais. Vocês podem verificar?',
        sentAtRelative: '2d atrás',
      },
    ],
  },
  {
    id: '#052',
    customerName: 'Pet Shop Bichano',
    customerId: 'sub_010',
    subject: 'Dúvida sobre limite de mensagens',
    openedRelative: '3d',
    openedHours: 72,
    sla: deriveSla(72),
    status: 'pending_customer',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Quanto custa pra subir pro Growth?',
        sentAtRelative: '3d atrás',
      },
      {
        from: 'support',
        authorName: 'Cris',
        body: 'Diferença é R$ 300 e libera 3 canais e 5 agentes. Topa?',
        sentAtRelative: '2d atrás',
      },
    ],
  },
  {
    id: '#051',
    customerName: 'Imobiliária Capital',
    customerId: 'sub_001',
    subject: 'Agente sumiu da conversa',
    openedRelative: '4d',
    openedHours: 96,
    sla: deriveSla(96),
    status: 'resolved',
    thread: [
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'O agente IA parou de responder no número 3.',
        sentAtRelative: '4d atrás',
      },
      {
        from: 'support',
        authorName: 'Cris',
        body: 'Reativei o canal · era token expirado. Revisei e renovou pelos próximos 60d.',
        sentAtRelative: '3d atrás',
      },
      {
        from: 'customer',
        authorName: 'Cliente',
        body: 'Funcionou, valeu!',
        sentAtRelative: '3d atrás',
      },
    ],
  },
];
