# Pagamento online com Asaas (PIX + cartão com confirmação automática)

Este é o guia para ligar o pagamento de verdade na Mimo Rosas: **PIX com confirmação
automática** e **cartão de crédito** (até 3x), sem ninguém precisar confirmar pedido na mão.

Enquanto as chaves abaixo não estiverem configuradas na Vercel, o site continua funcionando do
jeito antigo (PIX copia-e-cola manual + Mercado Pago), então nada quebra no meio do caminho.

---

## 1. Como funciona depois de configurado

```
Cliente escolhe PIX                    Cliente escolhe Cartão
        │                                      │
        ▼                                      ▼
POST /api/asaas/create  ──►  Asaas cria a cobrança com o valor do pedido salvo no banco
        │                                      │
        ▼                                      ▼
QR Code oficial na tela          Abre a fatura segura do Asaas em outra aba
        │                                      │
        └──────────────┬───────────────────────┘
                       ▼
        Asaas chama /api/asaas/webhook  →  pedido vira "Pago" sozinho
                       +
        A tela do pedido consulta /api/asaas/status a cada 4s
```

Pontos importantes:

- O **valor cobrado vem do Supabase**, nunca do navegador — ninguém consegue pagar R$ 1 por um
  pedido de R$ 200.
- A **chave da API do Asaas fica só na Vercel** (nunca no navegador).
- Se o webhook atrasar, a própria tela confirma pela consulta direta. Se a cliente fechar tudo,
  o webhook ainda marca o pedido como **Pago** no painel.

Arquivos envolvidos:

```
server/asaas.js            # regras compartilhadas (Asaas + Supabase service role)
api/asaas/config.js        # GET  /api/asaas/config   → o site pergunta se está ligado
api/asaas/create.js        # POST /api/asaas/create   → cria PIX ou fatura de cartão
api/asaas/status.js        # GET  /api/asaas/status   → consulta o pagamento de um pedido
api/asaas/webhook.js       # POST /api/asaas/webhook  → Asaas avisa que foi pago
```

---

## 2. Criar a conta no Asaas

### De quem deve ser a conta? (a da loja, não a do desenvolvedor)

A conta no Asaas é a **conta que recebe o dinheiro**, então ela precisa ser da Mimo Rosas —
CNPJ/MEI da loja ou, na falta dele, o CPF da dona.

| Se a conta for do desenvolvedor | Problema |
| --- | --- |
| Dinheiro cai na sua conta | Vira faturamento e IR seus; MEI pode estourar o limite com vendas alheias |
| Nota fiscal | Sai no seu documento, não no da loja |
| Estorno / chargeback / bloqueio | Atinge o seu CPF, não o da cliente |
| Fim do contrato | Migração de conta, chaves e histórico; dinheiro preso no meio |
| Verificação de identidade | O Asaas valida documento do titular; operação de terceiros pode ser bloqueada |

No Asaas, **"cliente" é só o pagador** da cobrança (nome + CPF + e-mail) — não é carteira, não
recebe dinheiro e não tem painel. É justamente isso que `server/asaas.js` cria automaticamente
(`ensureAsaasCustomer`) a partir do CPF/CNPJ digitado no checkout.

**Como o desenvolvedor trabalha sem ser o dono da conta:**

1. A loja cria a conta, valida identidade e cadastra a chave PIX.
2. A loja gera a API key (*Integrações → API Keys*) e envia por canal seguro.
3. A API key vai para as variáveis da Vercel (passo 4 abaixo).
4. Para dar suporte no painel, a loja pode convidar você em *Configurações → Usuários* (quando
   disponível na conta) — a API key já é suficiente para o site funcionar.

A chave continua sendo da loja: se o contrato terminar, ela revoga a key e o site deixa de cobrar
na hora.

> **Subcontas** (uma conta-filha dentro da sua) só valem a pena se você for uma plataforma: exigem
> conta-mãe **PJ**, passam por avaliação regulatória e têm taxa de criação. Para uma loja única,
> abrir a conta no nome da loja é mais simples e mais barato.

> **CPF ou CNPJ?** Se a loja é MEI, confira na Receita se o CNPJ está **Ativo** (DAS em atraso
> atrapalha a aprovação). E se ela está prestes a abrir o MEI, espere e abra já no CNPJ — trocar
> CPF por CNPJ depois normalmente exige outra conta e refazer a integração.

Passos:

1. Acesse <https://www.asaas.com> e crie a conta **da loja** (a Mimo Rosas). Pode ser CPF (pessoa
   física) ou CNPJ/MEI — o Asaas aceita os dois.
2. Termine a validação de identidade (envio de documento/selfie). Sem isso a conta não recebe
   pagamentos de verdade.
3. Cadastre uma **chave PIX** na conta Asaas (menu *Pix*). Sem chave cadastrada o QR Code gerado
   pode vencer no mesmo dia.
4. Confirme se **PIX** e **Cartão de crédito** estão habilitados em *Configurações da conta*.

> Para testar antes de receber dinheiro de verdade existe o ambiente **Sandbox**
> (<https://sandbox.asaas.com>), com uma conta separada e uma chave de API própria.

---

## 3. Pegar a chave de API

No painel do Asaas: **Integrações → API Keys → Nova chave**.

- Marque as permissões de **cobranças**, **clientes** e **webhooks**.
- Copie a chave inteira (ela aparece uma única vez).
- Guarde também se é **produção** ou **sandbox** — cada ambiente tem chave e URL diferentes.

---

## 4. Configurar as variáveis na Vercel

**Vercel → projeto da loja → Settings → Environment Variables** (ambiente *Production* e
*Preview*), e depois faça um **Redeploy**:

| Nome | Valor | Obrigatória |
| --- | --- | --- |
| `ASAAS_API_KEY` | a chave copiada no passo 3 | ✅ |
| `ASAAS_ENV` | `production` para dinheiro real; `sandbox` para testes | ✅ |
| `ASAAS_WEBHOOK_TOKEN` | uma senha longa e aleatória que você inventa (ex.: 40 caracteres) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Project Settings → API → `service_role` secret** | ✅ |
| `SUPABASE_URL` | `https://dktpnqekuxtsqmazelox.supabase.co` | opcional |

⚠️ A `SUPABASE_SERVICE_ROLE_KEY` **ignora todas as regras de acesso** do banco. Marque como
*Sensitive* na Vercel e nunca cole em código, print, WhatsApp ou no chat do site. Ela só é usada
dentro das funções do servidor.

Sem as quatro primeiras variáveis o site mantém o fluxo antigo (o checkout nem mostra o campo de
CPF/CNPJ). É assim que você sabe se a configuração pegou: **com tudo certo, o checkout passa a
pedir CPF/CNPJ e mostra “Pagamento processado pelo Asaas”.**

---

## 5. Configurar o webhook no Asaas

No painel do Asaas: **Integrações → Webhooks → Adicionar** (ou *Configurações → Webhooks*).

| Campo | Valor |
| --- | --- |
| URL | `https://www.mimorosas.com.br/api/asaas/webhook` |
| E-mail | o e-mail da loja (recebe aviso se a fila falhar) |
| Token de autenticação | exatamente o mesmo valor de `ASAAS_WEBHOOK_TOKEN` |
| Versão da API | a mais recente disponível |
| Fila de sincronização | **ativada** (reenvia eventos que falharem) |

Eventos para marcar (os outros podem ficar desligados):

- ✅ `PAYMENT_CONFIRMED`
- ✅ `PAYMENT_RECEIVED`
- ✅ `PAYMENT_RECEIVED_IN_CASH`
- ✅ `PAYMENT_REFUNDED`
- ✅ `PAYMENT_CHARGEBACK_REQUESTED`

O que cada um faz:

| Evento | Ação no pedido |
| --- | --- |
| confirmado / recebido | status → **Pago** |
| estorno / chargeback | status → **Pendente** (para você conferir à mão) |

Se o token estiver errado, o Asaas recebe `401` e o pedido **não** é confirmado pelo webhook
(a tela ainda confirma pela consulta direta, mas o painel pode atrasar).

---

## 6. Testar

### No Sandbox (recomendado antes de valer dinheiro)

1. Crie a conta sandbox, gere a chave sandbox e cadastre:
   `ASAAS_API_KEY` = chave sandbox, `ASAAS_ENV` = `sandbox`.
2. Configure o webhook com a URL de produção (o Asaas sandbox também chama a URL real).
3. Faça um pedido de teste no site escolhendo **PIX**: o QR Code deve aparecer e o texto
   “PIX oficial Mimo Rosas” deve substituir a chave PIX antiga.
4. Confirme a cobrança no painel do Asaas sandbox (*Cobranças → a cobrança → Confirmar
   recebimento em dinheiro*). Em segundos a tela deve virar **Pagamento Confirmado** e o pedido
   deve ficar **Pago** no `/admin`.
5. Repita com **cartão**: a fatura do Asaas deve abrir em outra aba e, após o pagamento
   simulado, a tela também deve confirmar sozinha.

### Em produção

1. Troque `ASAAS_ENV` para `production`, use a chave de produção e faça **Redeploy**.
2. Faça **um pedido real de valor baixo** (ex.: um enfeite) pagando por PIX.
3. Confira: pedido **Pago** no `/admin`, valor creditado no Asaas e nenhuma mensagem de erro no
   console do navegador.

---

## 7. Segurança: rotacionar a chave do Mercado Pago

Hoje o **Access Token do Mercado Pago está salvo em `categories` (config da loja), que é leitura
pública** — qualquer visitante consegue ler esse token no navegador. Assim que o Asaas estiver
funcionando:

1. Entre no Mercado Pago → *Suas integrações* → aplicação → **revogar/renovar o Access Token**.
2. Cole o novo token no painel admin só se for continuar usando o Checkout Pro como reserva;
   caso contrário, deixe o campo vazio.
3. O fluxo do Mercado Pago continua no código apenas como rede de segurança enquanto o Asaas não
   estiver configurado.

---

## 8. Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Checkout não pede CPF/CNPJ | Variáveis ausentes ou deploy antigo | Confira as 4 variáveis na Vercel e faça Redeploy |
| “Pagamento online ainda não configurado” | `ASAAS_API_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` vazia | Preencha e redeploy |
| “Não foi possível iniciar o pagamento” | Chave errada para o ambiente (sandbox × produção) | Confira `ASAAS_ENV` e gere a chave do ambiente certo |
| CPF recusado | CPF/CNPJ inválido (dígito verificador) | Corrija o documento da cliente |
| Pedido não vira "Pago" | Webhook com token errado ou URL errada | Confira a URL `/api/asaas/webhook` e o token |
| QR Code vence no mesmo dia | Conta sem chave PIX cadastrada | Cadastre a chave PIX no Asaas |
| Pedido pago continua pendente no painel | Service role key ausente | Configure `SUPABASE_SERVICE_ROLE_KEY` e redeploy |

Para investigar: **Vercel → Deployments → Functions → logs** (`/api/asaas/create`, `/api/asaas/status`
e `/api/asaas/webhook` registram erros) e **Asaas → Integrações → Webhooks → histórico de envios**.

---

## 9. Taxas (referência)

O Asaas não tem mensalidade; cobra por transação recebida (PIX costuma ser o mais barato,
cartão à vista/parcelado tem taxa maior). Confira os valores atuais em
<https://www.asaas.com/precos> antes de definir frete grátis e descontos.
