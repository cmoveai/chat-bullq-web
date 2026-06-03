# WhatsApp Embedded Signup — EIXXO

> Mapa do que o onboarding oficial de WhatsApp (Cloud API via Embedded Signup) exige
> pra o cliente conectar o número dele sozinho, de forma segura, dentro do EIXXO.
> Decisão de arquitetura: **oficial (Meta) em vez de não-oficial (Z-API/QR)** — protege
> o número do cliente de ban e não depende de terceiro não-oficial.
> Levantado em 2026-05-25 (checagem ao vivo via Graph API).

---

## Por que oficial, não QR (Z-API)

O caminho do QR (Z-API/Zappfy, protocolo não-oficial) é mais fácil de plugar, MAS:
- É contra os termos do WhatsApp → a Meta **bane o número do cliente** (especialmente com automação/escala). O ativo banido é a linha principal do negócio dele.
- Conexão cai sozinha (sessão expira) → bot para → cliente acha que é golpe.
- Risco sistêmico: Meta bloqueia o Z-API → todos os clientes caem no mesmo dia.
- Contradiz o princípio "tudo dentro do Meta, APIs oficiais, sem BSP/terceiro".

A **Cloud API foi feita pra automação** — não bane por isso, é estável, protege o número.
O **Embedded Signup** existe pra deixar o onboarding oficial quase tão suave quanto o QR
(popup de login do Meta), sem o risco de ban.

---

## O que a CMOVE JÁ tem (checado ao vivo 25/05)

- App Meta `1499094515106220` com produto WhatsApp.
- Token com permissões `whatsapp_business_management` + `business_management` **concedidas**.
- Negócio Meta: "Cmove Ai Tecnologia Inteligencia Artificial & Treinamentos Ltda"
  (business_id `1016123776230493`), `account_review_status: APPROVED`.
- WABA própria GREEN funcionando (`738512719286055`, número CMOVE.AI First).
- Webhook de produção recebendo: `https://zap.cmove.ai/api/v1/webhooks/WHATSAPP_OFFICIAL`
  (reaproveitável pra WABA de cliente via `subscribed_apps`).
- Infra de canal WHATSAPP_OFFICIAL no produto (adapter, http-client, validação de assinatura).

---

## O que FALTA — portões no Meta (ações de painel, dependem de review)

1. **Verificação de Negócio → APPROVED.** Hoje está `business_verification_status: "pending"`.
   Pra onboardar OUTRAS empresas via Embedded Signup precisa estar aprovada.
   Onde: Business Manager → Central de Segurança → enviar docs do CNPJ
   (66.432.401/0001-29). Review da Meta, leva dias. **PRINCIPAL BLOQUEIO.**
2. **Virar Tech Provider** — aceitar termos de Tech Provider/Solution Partner no app,
   pra o Embedded Signup conectar contas de terceiros (não só a própria).
3. **Advanced Access (App Review)** — confirmar no painel do app que
   `whatsapp_business_management` está em **Advanced Access** (não só Standard).
   Se não estiver: submeter o caso de uso à revisão da Meta (com vídeo do fluxo).
4. **Criar a configuração do Embedded Signup** — painel → WhatsApp → Embedded Signup →
   gera um `config_id` (usado no popup do front).

---

## O que FALTA — construir (código EIXXO)

5. **Front:** carregar o SDK "Facebook Login for Business"; botão "Conectar WhatsApp"
   que abre o popup com o `config_id`. No retorno, recebe um `code`.
6. **Back (a "cola" do onboarding):**
   - trocar o `code` por token da WABA do cliente;
   - chamar `POST /{waba-id}/subscribed_apps` → plugar nosso webhook na WABA dele;
   - registrar/verificar o número (SMS/voz) na Cloud API;
   - persistir como canal WHATSAPP_OFFICIAL (config: phoneNumberId, accessToken, appSecret,
     businessAccountId) — boa parte já existe; falta substituir o "colar credencial manual"
     pela cola automática.
   - Tela guiada de status: "conectando… → conectado", igual à experiência do QR.

---

## Duas decisões de produto (mudam pricing e UX)

7. **Quem paga a Meta pela conversa?** Cloud API cobra por conversa (janela 24h; atendimento
   tem cota grátis, depois paga; template marketing/utility paga).
   - Opção A: o **cliente** pluga o cartão dele na WABA dele (mais limpo, ele paga direto).
   - Opção B: **billing consolidado** (EIXXO paga a Meta e re-cobra no plano).
   Afeta margem e o pricing dos planos (Starter/Growth/Pro).
8. **O número do cliente (catch real do oficial):**
   - No oficial o número vira **API-only** → **deixa de funcionar no app do WhatsApp** no celular.
     Pra SMB que usa o WhatsApp no celular o dia todo, é fricção alta.
   - No QR (não-oficial) ele continua usando o app normal.
   - Saídas: cliente usa **número novo/dedicado** pro bot, OU migra o atual aceitando perder
     o app naquele número (migração exige desregistrar do app + 2FA).

---

## Ordem recomendada

1. **Agora:** terminar a Verificação de Negócio (envia docs do CNPJ) — é o gargalo de tempo, roda em paralelo a tudo.
2. **Primeiros clientes (beta, ~5):** onboarding manual/white-glove na oficial (Cris junto). Não precisa do Embedded Signup pra 5.
3. **Pra escalar:** Tech Provider + `config_id` + construir a cola (front popup + back code→token→subscribe→registrar número).
4. **Decidir billing** (cliente paga direto vs consolidado) antes de abrir self-serve.

---

## Estado / pendências relacionadas

- Task interna: "Conexão WhatsApp self-serve confiável" (pendente).
- Não-oficial (Z-API) segue suportado no produto como tipo de canal (a linha "Cris Corporativo"
  roda Z-API), mas **não é o caminho recomendado pro cliente** pelos motivos acima.
- ⚠️ Credenciais do canal oficial (token System User + app secret) vazaram no transcript de uma
  sessão e estão pendentes de rotação (não bloqueia nada; ver memória da sessão 2026-05-25).
