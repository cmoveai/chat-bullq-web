/**
 * Templates de automação prontos por nicho.
 * Cada template gera um ChatbotFlow com nodes pré-configurados.
 * Cliente escolhe template → backend cria flow + persiste nodes via saveNodes().
 *
 * Contrato dos nodes (precisa bater com os executores do engine):
 * - MESSAGE  data.message       · interpola {{var}}
 * - WAIT     data.saveAs        · captura a resposta na variável (sem prompt = silencioso)
 * - MENU     data.title + data.options [{label,value}] · interpola title · salva escolha em lastMenuSelection
 * - CONDITION data.variable/operator/value · ramifica por edge.condition 'true'/'false'
 * - TRANSFER data.message       · interpola {{var}} · manda pra fila humana
 */

export interface ChatbotTemplateNode {
  type: 'START' | 'MESSAGE' | 'MENU' | 'CONDITION' | 'WAIT' | 'ACTION' | 'TRANSFER' | 'END_FLOW';
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
      'Prazer em conhecer, Ana! Você quer agendar uma consulta nova ou já é paciente?',
      'Perfeito! Vou direcionar pra recepção agora. Em até 5 min alguém te chama por aqui.',
    ],
    flowName: 'Agendamento Clínica',
    flowDescription: 'Recepção, qualificação e transferência pra recepcionista',
    triggerType: 'FIRST_MESSAGE',
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
        data: { saveAs: 'name' },
        edges: [{ targetKey: 'menu-tipo' }],
      },
      {
        key: 'menu-tipo',
        type: 'MENU',
        name: 'Tipo de consulta',
        positionX: 100,
        positionY: 500,
        data: {
          title:
            'Prazer em conhecer, {{name}}! Você quer agendar uma consulta nova ou já é paciente?',
          options: [
            { label: 'Consulta nova', value: 'nova' },
            { label: 'Já sou paciente', value: 'paciente' },
            { label: 'Cancelar/remarcar', value: 'remarcar' },
          ],
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
            'Perfeito, {{name}}! Vou direcionar pra recepção agora. Em até 5 min alguém te chama por aqui.',
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
      'Oi! Bem-vinda ao nosso salão. Vou te ajudar a marcar seu horário. Qual seu nome?',
      'Que serviço você quer fazer hoje?',
      'Anotei aqui, Ana. Já vou passar pra Cami que cuida da agenda. Em 1 min ela responde!',
    ],
    flowName: 'Agendamento Salão',
    flowDescription: 'Coleta nome + serviço + transfere pra atendente',
    triggerType: 'FIRST_MESSAGE',
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
            'Oi! Bem-vinda ao nosso salão. Vou te ajudar a marcar seu horário. Qual seu nome?',
        },
        edges: [{ targetKey: 'wait-name' }],
      },
      {
        key: 'wait-name',
        type: 'WAIT',
        name: 'Aguarda nome',
        positionX: 100,
        positionY: 360,
        data: { saveAs: 'name' },
        edges: [{ targetKey: 'menu-servico' }],
      },
      {
        key: 'menu-servico',
        type: 'MENU',
        name: 'Serviço',
        positionX: 100,
        positionY: 500,
        data: {
          title: 'Que serviço você quer fazer hoje, {{name}}?',
          options: [
            { label: 'Corte', value: 'corte' },
            { label: 'Coloração', value: 'coloracao' },
            { label: 'Escova', value: 'escova' },
            { label: 'Manicure/Pedicure', value: 'manicure' },
            { label: 'Outro', value: 'outro' },
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
            'Anotei aqui, {{name}}. Já vou passar pra Cami que cuida da agenda. Em 1 min ela responde!',
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
      'Prazer, Ana! Pra te mandar o link da imersão gratuita, qual seu melhor email?',
      'Você já está no mercado ou está começando agora?',
    ],
    flowName: 'Captura Lançamento',
    flowDescription: 'Captura lead + qualificação por experiência',
    triggerType: 'FIRST_MESSAGE',
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
        data: { saveAs: 'name' },
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
            'Prazer, {{name}}! Pra te mandar o link da imersão gratuita, qual seu melhor email?',
        },
        edges: [{ targetKey: 'wait-email' }],
      },
      {
        key: 'wait-email',
        type: 'WAIT',
        name: 'Aguarda email',
        positionX: 100,
        positionY: 640,
        data: { saveAs: 'email' },
        edges: [{ targetKey: 'menu-experiencia' }],
      },
      {
        key: 'menu-experiencia',
        type: 'MENU',
        name: 'Qualificação',
        positionX: 100,
        positionY: 780,
        data: {
          title: 'Você já está no mercado ou está começando agora?',
          options: [
            { label: 'Já estou no mercado', value: 'mercado' },
            { label: 'Estou começando agora', value: 'comecando' },
            { label: 'Só curiosidade', value: 'curiosidade' },
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
        data: { variable: 'lastMenuSelection', operator: 'equals', value: 'mercado' },
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
            'Show, {{name}}! Vou te conectar com nosso time de vendas em 1 min · você é prioridade.',
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
            'Te incluí na nossa lista, {{name}}. Vai chegar conteúdo gratuito no seu email essa semana. Bora começar!',
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
    triggerType: 'FIRST_MESSAGE',
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
          title:
            'Você quer falar sobre um pedido que já fez ou é uma dúvida nova?',
          options: [
            { label: 'Rastrear pedido', value: 'rastrear' },
            { label: 'Trocar/devolver', value: 'trocar' },
            { label: 'Dúvida sobre produto', value: 'duvida' },
            { label: 'Falar com atendente', value: 'atendente' },
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
        data: { variable: 'lastMenuSelection', operator: 'equals', value: 'rastrear' },
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
      'Anotei, Ana. Vou direcionar pra advogada responsável e ela te chama em até 1h.',
    ],
    flowName: 'Triagem Jurídica',
    flowDescription: 'Captura nome + área de atuação e roteia pro advogado',
    triggerType: 'FIRST_MESSAGE',
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
        data: { saveAs: 'name' },
        edges: [{ targetKey: 'menu-area' }],
      },
      {
        key: 'menu-area',
        type: 'MENU',
        name: 'Área jurídica',
        positionX: 100,
        positionY: 500,
        data: {
          title:
            'Prazer, {{name}}! Sua dúvida é em qual área?',
          options: [
            { label: 'Trabalhista', value: 'trabalhista' },
            { label: 'Civil', value: 'civil' },
            { label: 'Família', value: 'familia' },
            { label: 'Tributário', value: 'tributario' },
            { label: 'Outra área', value: 'outra' },
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
            'Anotei, {{name}}. Vou direcionar pra advogada responsável e ela te chama em até 1h.',
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
