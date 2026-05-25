# DEFINIÇÃO DE PRONTO — EIXXO (a virada)

> Documento canônico de escopo do pré-lançamento. A trave não se move.
> Criado 2026-05-24.

**Princípio:** tudo que o usuário vê, funciona. Promete pouco, entrega impecável.
**Ordem inegociável:** FUNÇÃO → UX (clareza) → UI (confiança visual) → conversão.
**Regra de ouro:** nada sobe pra "pronto" sem aceite real (testado funcionando).
**Padrão:** maturidade e excelência de mercado — não "mais um". O que faz parecer "mais um" é prometer 8 e entregar 1; aqui prometemos 3 e entregamos 3 impecáveis.

---

## CAMADA 0 — Encanamento (a cozinha cozinha)
Sem isto não há produto.
- [ ] **Conexão WhatsApp self-serve** — cliente conecta o número dele sozinho, sem suporte. _Aceite:_ do zero ao "Conectado" pela UI; sobrevive a reconexão/reinício; multi-tenant.
- [ ] **Recebimento no inbox** — mensagem do contato cai no inbox em tempo real. _Aceite:_ enviar do celular → aparece em <5s. (existe; validar e2e)
- [ ] **Envio automático no WhatsApp** — automação envia texto + mídia/link no número conectado (`SEND_WA` real). _Aceite:_ gatilho dispara → mensagem chega no WhatsApp do contato.
- [ ] **Loop fechado** — gatilho (comentário IG / palavra-chave WhatsApp) → ação no canal certo, ponta a ponta. _Aceite:_ sem mensagem duplicada (unificar os 2 engines); idempotente.
- [ ] **Dogfood** — nosso próprio número rodando o loop, como canal conectado de verdade (não .env). _Aceite:_ a CMOVE usa o EIXXO no número dela antes de qualquer venda.

## CAMADA 1 — Os 3 modelos que vendem (impecáveis)
Cada um: template pronto + testado e2e + mídia onde precisa.
- [ ] **Comentário IG → DM com link.** _Aceite:_ comentar no post real → DM chega com link clicável.
- [ ] **Captura de lead** — coletar nome/telefone/e-mail no chat → vira contato. _Aceite:_ fluxo de perguntas → dado salvo no contato.
- [ ] **Resposta automática WhatsApp por palavra-chave + horário de funcionamento.** _Aceite:_ palavra-chave → resposta; fora do horário → resposta de horário.

## CAMADA 2 — Clareza (UX) + Sinais de confiança (UI)
Depois do core. Não redesenhar tela que pode ser cortada.

**UX (estrutura/fluxo):**
- [ ] **Menu podado** ao fluxo-core: Conectar · Inbox · Automações · Dashboard. Esconder o resto.
- [ ] **Zero beco sem saída** — nada clicável que dê "em breve"/toast. Some campanhas, templates de vapor, nós que não rodam.
- [ ] **Onboarding guiado**: conectar canal → criar 1ª automação → receber 1ª conversa.

**Sinais de confiança (UI que É confiança, não enfeite):**
- [ ] **Status visível**: canal conectado/desconectado; automação ligada/desligada + nº de execuções.
- [ ] **Confirmação de envio**: "mensagem enviada ✓"; falha visível com motivo (nunca silenciosa).
- [ ] **Confirmação antes de disparar** ação irreversível (ex: ligar automação que responde todo mundo).
- [ ] **Telas vazias que guiam** o próximo passo (não só "nenhum dado").
- [ ] **Estados de erro honestos**: WhatsApp caiu → avisa; automação falhou → mostra onde.
- [ ] **Feedback de carregamento** (skeleton/spinner) — nada de tela travada sem sinal.
- [ ] **Tirar o banner mentiroso** da /automations (diz que execução não está plugada; está).

**UI (polimento visual) — por último:** hierarquia, coerência de cores/tipografia. Nativo CMOVE; NÃO copiar o visual do concorrente (referência é funcional, não visual).

## CAMADA 3 — Fachada (front-end público / marca)
A vitrine só pode prometer o que a cozinha entrega. (Já existe base: zap.cmove.ai é landing comercial real — mas marca errada CMOVE.AI-ZAP e vende vapor.)
- [ ] **Rebrand EIXXO Hub aplicado**: nome, logo, identidade — tirar CMOVE.AI-ZAP da landing E do app.
- [ ] **Domínio EIXXO Hub no ar** (eixxohub.com/.app) apontando pro produto.
- [ ] **Landing alinhada à REALIDADE**: vender só inbox + os 3 modelos que funcionam + automação real. Remover/ocultar campanhas e features de vapor até existirem.
- [ ] **Preço coerente** com o produto realmente entregue (revisar 167/347/897 vs o que funciona).
- [ ] **Cadastro/trial funcionando** ponta a ponta (signup → conecta canal → usa).
- [ ] Sinais de confiança verdadeiros (CNPJ, garantia, trial) — já existem, manter.

> **Status (Cris, 24/05): tudo PRÉ-LANÇAMENTO / interno** — não está divulgado, sem cliente externo comprando. Logo NÃO há risco vivo de pagamento por vapor. Vantagem: dá pra construir as 3 camadas com as portas fechadas e abrir só quando estiver pronto; a data de inauguração é decisão da Cris. A landing honesta (vender só o que funciona) é item normal desta Camada 3, feita no rebrand — não emergência.

## FORA DO PRÉ-LANÇAMENTO
Entra só depois do 1º cliente validar o núcleo: campanhas WhatsApp em massa · Facebook/TikTok · abas Comentários/Menções no inbox · os outros 5 modelos · quiz nativo · agente IA em automação · delay/agendamento.

## ORDEM DE EXECUÇÃO
Camada 0 (cozinha) → Camada 1 (3 modelos) → Camada 2 (salão: UX + sinais de confiança) → Camada 3 (fachada: rebrand + landing honesta + domínio) → UI polimento. Nada de camada superior antes da de baixo fechar. A inauguração só acontece com as 3 camadas verdes.
