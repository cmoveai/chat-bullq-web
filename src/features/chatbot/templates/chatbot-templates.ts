/**
 * Templates de automação prontos por nicho.
 * Cada template gera um ChatbotFlow com nodes pré-configurados.
 * Cliente escolhe template → backend cria flow + persiste nodes via saveNodes().
 */

export interface ChatbotTemplateNode {
  type: 'START' | 'MESSAGE' | 'MENU' | 'CONDITION' | 'WAIT' | 'TRANSFER' | 'END_FLOW';
  name: string | null;
  positionX: number;
  positionY: number;
  data: Record<string, any>;
  // edges referenciam outros nodes pelo "key" lógico (será mapeado pra ID real após criar)
  edges: Array<{ targetKey: string; condition?: string }>;
  key: string; // identificador interno usado nas edges
}

export interface ChatbotTemplate {
  id: string;
  niche: string;
  emoji: string;
  title: string;
  description: string;
  estimatedSetup: string; // "3 min", "5 min"
  benefits: string[];
  preview: string[]; // primeiras 3-4 mensagens do fluxo (mockup visual)
  flowName: string;
  flowDescription: string;
  triggerType: string;
  nodes: ChatbotTemplateNode[];
}

export const CHATBOT_TEMPLATES: ChatbotTemplate[] = [
  {
    id: 'clinica-agendamento',
    niche: 'Clínica · Saúde · Estética',
    emoji: '🩺',
    title: 'Agendamento de consulta',
    description:
      'Recepciona o paciente, identifica o tipo de consulta e direciona pra recepcionista com contexto pronto.',
    estimatedSetup: '3 min',
    benefits: [
      'Reduz tempo de fila no WhatsApp',
      'Captura nome + tipo de consulta antes do humano',
      'Funciona 24h sem ninguém ficar online',
    ],
    preview: [
      'Olá! Aqui é a Bia, assistente da clínica. Pra começar, qual seu nome?',
      'Prazer em conhecer, {name}! Você quer agendar uma consulta nova ou já é paciente?',
      'Perfeito! Vou direcionar pra recepção agora. Em até 5 min alguém te chama por aqui.',
    ],
    flowName: 'Agendamento Clínica',
    flowDescription: 'Recepção, qualificação e transferência pra recepcionista',
    triggerType: 'NEW_CONVERSATION',
    nodes: [
      {
        key: 'start',
        type: 'START',
        name: 'Início',
        positionX: 100,
        positionY: 100,
        data: {},
        edges: [{ targetKey: 'msg-welcome' }],
      },
      {
        key: 'msg-welcome',
        type: 'MESSAGE',
        name: 'Boas-vindas',
        positionX: 100,
        positionY: 220,
        data: {
          message:
            'Olá! Aqui é a Bia, assistente da clínica. Pra começar, qual seu nome?',
        },
        edges: [{ targetKey: 'wait-name' }],
      },
      {
        key: 'wait-name',
        type: 'WAIT',
        name: 'Aguarda nome',
        positionX: 100,
        positionY: 360,
        data: { variable: 'name' },
        edges: [{ targetKey: 'menu-tipo' }],
      },
      {
        key: 'menu-tipo',
        type: 'MENU',
        name: 'Tipo de consulta',
        positionX: 100,
        positionY: 500,
        data: {
          message:
            'Prazer em conhecer, {name}! Você quer agendar uma consulta nova ou já é paciente?',
          options: ['Consulta nova', 'Já sou paciente', 'Cancelar/remarcar'],
        },
        edges: [{ targetKey: 'transfer-recepcao' }],
      },
      {
        key: 'transfer-recepcao',
        type: 'TRANSFER',
        name: 'Recepção',
        positionX: 100,
        positionY: 660,
        data: {
          message:
            'Perfeito! Vou direcionar pra recepção agora. Em até 5 min alguém te chama por aqui.',
          department: 'Recepção',
        },
        edges: [],
      },
    ],
  },
  {
    id: 'salao-agendamento',
    niche: 'Salão · Beleza · Barbearia',
    emoji: '💇',
    title: 'Agendamento de horário',
    description:
      'Coleta nome, serviço desejado e dia preferido, depois transfere pra atendente confirmar horário.',
    estimatedSetup: '3 min',
    benefits: [
      'Cliente já chega filtrado por serviço',
      'Lista de serviços + preços em 1 clique',
      'Reduz pergunta repetida "tem horário sábado?"',
    ],
    preview: [
      'Oi! 💖 Bem-vinda ao nosso salão. Vou te ajudar a marcar seu horário. Qual seu nome?',
      'Que serviço você quer fazer hoje?',
      'Anotei aqui. Já vou passar pra Cami que cuida da agenda. Em 1 min ela responde!',
    ],
    flowName: 'Agendamento Salão',
    flowDescription: 'Coleta nome + serviço + transfere pra atendente',
    triggerType: 'NEW_CONVERSATION',
    nodes: [
      {
        key: 'start',
        type: 'START',
        name: 'Início',
        positionX: 100,
        positionY: 100,
        data: {},
        edges: [{ targetKey: 'msg-welcome' }],
      },
      {
        key: 'msg-welcome',
        type: 'MESSAGE',
        name: 'Boas-vindas',
        positionX: 100,
        positionY: 220,
        data: {
          message:
            'Oi! 💖 Bem-vinda ao nosso salão. Vou te ajudar a marcar seu horário. Qual seu nome?',
        },
        edges: [{ targetKey: 'wait-name' }],
      },
      {
        key: 'wait-name',
        type: 'WAIT',
        name: 'Aguarda nome',
        positionX: 100,
        positionY: 360,
        data: { variable: 'name' },
        edges: [{ targetKey: 'menu-servico' }],
      },
      {
        key: 'menu-servico',
        type: 'MENU',
        name: 'Serviço',
        positionX: 100,
        positionY: 500,
        data: {
          message: 'Que serviço você quer fazer hoje?',
          options: [
            'Corte',
            'Coloração',
            'Escova',
            'Manicure/Pedicure',
            'Outro',
          ],
        },
        edges: [{ targetKey: 'transfer-cami' }],
      },
      {
        key: 'transfer-cami',
        type: 'TRANSFER',
        name: 'Atendente',
        positionX: 100,
        positionY: 660,
        data: {
          message:
            'Anotei aqui {name}. Já vou passar pra Cami que cuida da agenda. Em 1 min ela responde!',
          department: 'Atendimento',
        },
        edges: [],
      },
    ],
  },
  {
    id: 'infoproduto-lancamento',
    niche: 'Infoproduto · Lançamento · Curso',
    emoji: '🚀',
    title: 'Captura de lead pra lançamento',
    description:
      'Pega nome + email + interesse, classifica calor do lead e dispara pra fila quente ou lista de aquecimento.',
    estimatedSetup: '5 min',
    benefits: [
      'Segmenta lead frio vs quente automaticamente',
      'Captura email pra sequência de aquecimento',
      'Reduz custo por lead qualificado',
    ],
    preview: [
      'Oi! Vi que você se interessou pelo nosso programa. Posso te chamar pelo seu nome?',
      'Pra te mandar o link da imersão gratuita, qual seu melhor email?',
      'Você já tem alguma experiência com {nicho} ou está começando agora?',
    ],
    flowName: 'Captura Lançamento',
    flowDescription: 'Captura lead + qualificação por experiência',
    triggerType: 'NEW_CONVERSATION',
    nodes: [
      {
        key: 'start',
        type: 'START',
        name: 'Início',
        positionX: 100,
        positionY: 100,
        data: {},
        edges: [{ targetKey: 'msg-welcome' }],
      },
      {
        key: 'msg-welcome',
        type: 'MESSAGE',
        name: 'Boas-vindas',
        positionX: 100,
        positionY: 220,
        data: {
          message:
            'Oi! Vi que você se interessou pelo nosso programa. Posso te chamar pelo seu nome?',
        },
        edges: [{ targetKey: 'wait-name' }],
      },
      {
        key: 'wait-name',
        type: 'WAIT',
        name: 'Aguarda nome',
        positionX: 100,
        positionY: 360,
        data: { variable: 'name' },
        edges: [{ targetKey: 'msg-email' }],
      },
      {
        key: 'msg-email',
        type: 'MESSAGE',
        name: 'Pede email',
        positionX: 100,
        positionY: 500,
        data: {
          message:
            'Prazer, {name}! Pra te mandar o link da imersão gratuita, qual seu melhor email?',
        },
        edges: [{ targetKey: 'wait-email' }],
      },
      {
        key: 'wait-email',
        type: 'WAIT',
        name: 'Aguarda email',
        positionX: 100,
        positionY: 640,
        data: { variable: 'email' },
        edges: [{ targetKey: 'menu-experiencia' }],
      },
      {
        key: 'menu-experiencia',
        type: 'MENU',
        name: 'Qualificação',
        positionX: 100,
        positionY: 780,
        data: {
          message:
            'Você já tem alguma experiência ou está começando agora?',
          options: [
            'Já estou no mercado',
            'Estou começando agora',
            'Só curiosidade',
          ],
        },
        edges: [{ targetKey: 'condition-quente' }],
      },
      {
        key: 'condition-quente',
        type: 'CONDITION',
        name: 'Lead quente?',
        positionX: 100,
        positionY: 940,
        data: { field: 'menu-experiencia', expected: 'Já estou no mercado' },
        edges: [
          { targetKey: 'transfer-vendas', condition: 'true' },
          { targetKey: 'msg-aquecimento', condition: 'false' },
        ],
      },
      {
        key: 'transfer-vendas',
        type: 'TRANSFER',
        name: 'Vendas',
        positionX: 320,
        positionY: 1080,
        data: {
          message:
            'Show! Vou te conectar com nosso time de vendas em 1 min · você é prioridade.',
          department: 'Vendas',
        },
        edges: [],
      },
      {
        key: 'msg-aquecimento',
        type: 'MESSAGE',
        name: 'Aquecimento',
        positionX: -120,
        positionY: 1080,
        data: {
          message:
            'Te incluí na nossa lista. Vai chegar conteúdo gratuito por email essa semana. Bora começar! 🚀',
        },
        edges: [{ targetKey: 'end' }],
      },
      {
        key: 'end',
        type: 'END_FLOW',
        name: 'Fim',
        positionX: -120,
        positionY: 1220,
        data: {},
        edges: [],
      },
    ],
  },
  {
    id: 'loja-ecommerce',
    niche: 'Loja · E-commerce · Varejo',
    emoji: '🛍️',
    title: 'Atendimento e rastreio de pedido',
    description:
      'Recebe cliente, descobre se é dúvida sobre produto ou pedido em andamento, e direciona com contexto.',
    estimatedSetup: '4 min',
    benefits: [
      'Reduz pergunta repetida "cadê meu pedido?"',
      'Cliente novo é direcionado pra catálogo',
      'Reclamação chega pra atendente já triado',
    ],
    preview: [
      'Olá! Bem-vindo à nossa loja. Como posso te ajudar?',
      'Você quer falar sobre um pedido que já fez ou é uma dúvida nova?',
      'Me passa o número do pedido (ou nome de cadastro) que vou olhar pra você.',
    ],
    flowName: 'Atendimento Loja',
    flowDescription: 'Triagem entre pedido em andamento vs cliente novo',
    triggerType: 'NEW_CONVERSATION',
    nodes: [
      {
        key: 'start',
        type: 'START',
        name: 'Início',
        positionX: 100,
        positionY: 100,
        data: {},
        edges: [{ targetKey: 'msg-welcome' }],
      },
      {
        key: 'msg-welcome',
        type: 'MESSAGE',
        name: 'Boas-vindas',
        positionX: 100,
        positionY: 220,
        data: {
          message: 'Olá! Bem-vindo à nossa loja. Como posso te ajudar?',
        },
        edges: [{ targetKey: 'menu-tipo' }],
      },
      {
        key: 'menu-tipo',
        type: 'MENU',
        name: 'Tipo de atendimento',
        positionX: 100,
        positionY: 360,
        data: {
          message:
            'Você quer falar sobre um pedido que já fez ou é uma dúvida nova?',
          options: [
            'Rastrear pedido',
            'Trocar/devolver',
            'Dúvida sobre produto',
            'Falar com atendente',
          ],
        },
        edges: [{ targetKey: 'condition-pedido' }],
      },
      {
        key: 'condition-pedido',
        type: 'CONDITION',
        name: 'É sobre pedido?',
        positionX: 100,
        positionY: 520,
        data: { field: 'menu-tipo', expected: 'Rastrear pedido' },
        edges: [
          { targetKey: 'msg-pedido', condition: 'true' },
          { targetKey: 'transfer-atendente', condition: 'false' },
        ],
      },
      {
        key: 'msg-pedido',
        type: 'MESSAGE',
        name: 'Pede número',
        positionX: 320,
        positionY: 660,
        data: {
          message:
            'Me passa o número do pedido (ou nome de cadastro) que vou olhar pra você.',
        },
        edges: [{ targetKey: 'transfer-pedidos' }],
      },
      {
        key: 'transfer-pedidos',
        type: 'TRANSFER',
        name: 'Pedidos',
        positionX: 320,
        positionY: 800,
        data: {
          message: 'Já vou consultar e volto em 2 min com o status.',
          department: 'Pedidos',
        },
        edges: [],
      },
      {
        key: 'transfer-atendente',
        type: 'TRANSFER',
        name: 'Atendente',
        positionX: -120,
        positionY: 660,
        data: {
          message: 'Vou te conectar com um atendente humano agora.',
          department: 'Atendimento',
        },
        edges: [],
      },
    ],
  },
  {
    id: 'advocacia-triagem',
    niche: 'Advocacia · Consultoria · Serviços',
    emoji: '⚖️',
    title: 'Triagem de novo caso',
    description:
      'Identifica o tipo de demanda jurídica do cliente e direciona pro advogado correto da equipe.',
    estimatedSetup: '4 min',
    benefits: [
      'Cliente já chega filtrado por área',
      'Reduz tempo do advogado em pré-qualificação',
      'Capta dados básicos antes da reunião',
    ],
    preview: [
      'Olá! Aqui é a Lia, assistente do escritório. Posso te chamar pelo seu nome?',
      'Sua dúvida é em qual área? Trabalhista, civil, família, tributário?',
      'Anotei. Vou direcionar pra advogada responsável e ela te chama em até 1h.',
    ],
    flowName: 'Triagem Jurídica',
    flowDescription: 'Captura nome + área de atuação e roteia pro advogado',
    triggerType: 'NEW_CONVERSATION',
    nodes: [
      {
        key: 'start',
        type: 'START',
        name: 'Início',
        positionX: 100,
        positionY: 100,
        data: {},
        edges: [{ targetKey: 'msg-welcome' }],
      },
      {
        key: 'msg-welcome',
        type: 'MESSAGE',
        name: 'Boas-vindas',
        positionX: 100,
        positionY: 220,
        data: {
          message:
            'Olá! Aqui é a Lia, assistente do escritório. Posso te chamar pelo seu nome?',
        },
        edges: [{ targetKey: 'wait-name' }],
      },
      {
        key: 'wait-name',
        type: 'WAIT',
        name: 'Aguarda nome',
        positionX: 100,
        positionY: 360,
        data: { variable: 'name' },
        edges: [{ targetKey: 'menu-area' }],
      },
      {
        key: 'menu-area',
        type: 'MENU',
        name: 'Área jurídica',
        positionX: 100,
        positionY: 500,
        data: {
          message:
            'Sua dúvida é em qual área? Trabalhista, civil, família, tributário?',
          options: [
            'Trabalhista',
            'Civil',
            'Família',
            'Tributário',
            'Outra área',
          ],
        },
        edges: [{ targetKey: 'transfer-advogado' }],
      },
      {
        key: 'transfer-advogado',
        type: 'TRANSFER',
        name: 'Advogado',
        positionX: 100,
        positionY: 660,
        data: {
          message:
            'Anotei {name}. Vou direcionar pra advogada responsável e ela te chama em até 1h.',
          department: 'Jurídico',
        },
        edges: [],
      },
    ],
  },
];

/**
 * Helper · resolve edges (targetKey → targetNodeId real após criar nodes no DB).
 * Usado pelo handler quando aplica template.
 */
export function resolveTemplateEdges(
  templateNodes: ChatbotTemplateNode[],
  createdNodes: Array<{ id: string; data: Record<string, any> }>,
): Array<{ id: string; edges: Array<{ targetNodeId: string; condition?: string }> }> {
  // mapeia key → ID criado (assumindo backend devolveu na mesma ordem do template)
  const keyToId = new Map<string, string>();
  templateNodes.forEach((tpl, idx) => {
    keyToId.set(tpl.key, createdNodes[idx].id);
  });

  return templateNodes.map((tpl, idx) => ({
    id: createdNodes[idx].id,
    edges: tpl.edges.map((e) => ({
      targetNodeId: keyToId.get(e.targetKey)!,
      condition: e.condition,
    })),
  }));
}
