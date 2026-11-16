# Configuração das contas de cliente (Supabase)

Este guia tem **3 partes** e leva ~15 minutos. A ordem importa: o SMTP vem antes de criar contas,
senão o e-mail de confirmação não chega.

- [1. Rodar o SQL no Supabase](#1-rodar-o-sql-no-supabase)
- [2. Configurar o envio de e-mails (Resend)](#2-configurar-o-envio-de-e-mails-resend)
- [3. Criar e promover a conta de administradora](#3-criar-e-promover-a-conta-de-administradora)
- [4. Teste final](#4-teste-final)

---

## O que essa configuração entrega

| Recurso | Como funciona |
| --- | --- |
| Cadastro de cliente | `/` → **Minha Conta** → *Criar conta* (nome, WhatsApp, e-mail, senha) |
| Confirmação de e-mail | Obrigatória. A conta só funciona depois do clique no link enviado por e-mail |
| Recuperação de senha | *Esqueci minha senha* → link por e-mail → tela de nova senha |
| Pedidos por conta | Pedido feito logado fica ligado ao `user_id`; também aparece por e-mail igual |
| Favoritos por conta | Coração do produto grava na tabela `favorites` (visitante usa o navegador) |
| Painel `/admin` | Login real por e-mail/senha + `is_admin = true` no perfil |
| Segurança | RLS fechado: cliente vê só os próprios pedidos; visitante não vê pedido nenhum |

---

## 1. Rodar o SQL no Supabase

1. Abra <https://supabase.com/dashboard/project/dktpnqekuxtsqmazelox>
2. Menu lateral → **SQL Editor** → **New query**
3. Abra o arquivo [`supabase/migrations/001_customer_auth.sql`](supabase/migrations/001_customer_auth.sql), copie **tudo** e cole no editor
4. Clique em **Run** (ou `Ctrl + Enter`)

O script é idempotente (pode rodar de novo sem quebrar nada). Ele cria:

- `profiles` — nome, WhatsApp e a flag `is_admin`
- `favorites` — favoritos por conta
- `orders.user_id` — dono do pedido (+ índices)
- trigger `on_auth_user_created` — cria o perfil automaticamente no cadastro
- políticas de RLS para `profiles`, `favorites`, `orders`, `products`, `categories`
- funções `is_admin()`, `order_status(id)` e `claim_order_paid(id)`

> ⚠️ **Antes** desse SQL, a chave pública do site conseguia ler **todos** os pedidos (nome, telefone,
> endereço). Depois dele, não mais.

### Como conferir se rodou

No SQL Editor:

```sql
select tablename, policyname, cmd from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Devem aparecer políticas em `orders`, `products`, `categories`, `profiles` e `favorites`.

---

## 2. Configurar o envio de e-mails (Resend)

O envio padrão do Supabase **só entrega para e-mails da equipe do projeto** e tem limite baixo por hora.
Para clientes reais é preciso um SMTP próprio. O Resend tem plano grátis (3.000 e-mails/mês).

### 2.1 Criar a conta no Resend

1. Acesse <https://resend.com/signup> e crie a conta (pode entrar com GitHub/Google)
2. No painel, vá em **Domains** → **Add Domain** e informe o domínio da loja, ex.: `mimorosas.com.br`
3. O Resend mostra registros **DNS** (MX, TXT-SPF, TXT-DKIM). Adicione-os no painel onde o domínio está
   registrado (Registro.br, Cloudflare, Hostinger etc.)
4. Clique em **Verify**. Pode levar de minutos a algumas horas (DNS)

> Sem domínio próprio? O Resend tem o domínio de teste `onboarding@resend.dev`, mas ele **só envia para
> o seu próprio e-mail**. Serve para testar o fluxo, não para clientes.

### 2.2 Criar a chave de API (SMTP)

1. No Resend, **API Keys** → **Create API Key** → permissão **Sending access**
2. Copie a chave (`re_...`) — ela só aparece uma vez

Credenciais SMTP do Resend:

| Campo | Valor |
| --- | --- |
| Host | `smtp.resend.com` |
| Porta | `465` (SSL) ou `587` (TLS) |
| Usuário | `resend` |
| Senha | a API key `re_...` |
| Remetente | `Mimo Rosas <contato@seudominio.com.br>` (o domínio precisa estar verificado) |

### 2.3 Ligar no Supabase

1. Dashboard → **Authentication** → **Emails** (ou **Project Settings → Auth**) → **SMTP Settings**
2. Ative **Enable Custom SMTP** e preencha:

   | Campo no Supabase | Valor |
   | --- | --- |
   | Sender email | `contato@seudominio.com.br` |
   | Sender name | `Mimo Rosas` |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | `re_...` |

3. Salve. Use o botão de **envio de teste** se aparecer.

### 2.4 Conferir os modelos de e-mail

Em **Authentication → Emails → Templates**, revise:

- **Confirm signup** — precisa conter `{{ .ConfirmationURL }}`
- **Reset password** — idem
- Assunto sugerido: `Confirme seu e-mail • Mimo Rosas`

### 2.5 URLs de redirecionamento

Em **Authentication → URL Configuration**:

| Campo | Valor |
| --- | --- |
| Site URL | `https://mimorosas.com.br` |
| Redirect URLs | `http://localhost:5173/**` e `https://mimorosas.com.br/**` |

> Os `/**` no final são importantes: o link do e-mail volta para o site com parâmetros extras.
> Se publicar em outro domínio (ex.: Vercel), adicione esse domínio na lista também.

---

## 3. Criar e promover a conta de administradora

1. Abra `http://localhost:5173/admin` (ou `https://mimorosas.com.br/admin`)
2. Clique em **Criar conta** e cadastre-se com o e-mail da loja
3. Confirme o e-mail pelo link que chegar
4. No **SQL Editor** do Supabase, promova a conta (troque o e-mail):

```sql
update public.profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'seu@email.com');
```

5. Confira:

```sql
select u.email, p.full_name, p.is_admin
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.created_at;
```

6. Saia e entre de novo em `/admin`. O painel abre normalmente.

> Quem entra em `/admin` **sem** `is_admin = true` vê a mensagem "Conta sem permissão de administrador"
> e não consegue ler pedidos — é o RLS funcionando.

### Trocar a senha antiga do painel

A senha legada (`mimo2026`) só é usada como *fallback* enquanto a tabela `profiles` **não existe**.
Depois do SQL, o painel usa exclusivamente o login do Supabase Auth.

---

## 4. Teste final

1. **Cadastro** — em `/` → *Minha Conta* → *Criar conta*, use um e-mail real seu
   → deve aparecer "Confira seu e-mail"
2. **Confirmação** — abra o e-mail, clique no link → você volta ao site já logada, na área da conta
3. **Login sem confirmar** — antes de clicar no link, tentar entrar mostra
   "Confirme seu e-mail antes de entrar."
4. **Pedido** — faça uma compra logada → o pedido aparece em *Meus Pedidos*
5. **Favoritos** — clique no coração de um produto → aparece em *Favoritos* (e continua após sair/entrar)
6. **Senha** — *Esqueci minha senha* → link → nova senha → entrar com ela
7. **Isolamento** — com a conta do cliente, acesse `/admin`: deve dizer que não tem permissão
8. **Visitante** — abra a aba anônima e tente ler pedidos pela API pública:
   `https://dktpnqekuxtsqmazelox.supabase.co/rest/v1/orders?select=*`
   → deve voltar `[]`

---

## Pendências recomendadas (não bloqueiam o uso)

- **Token do Mercado Pago e chave PIX dentro de `categories`**: a configuração da loja é lida
  publicamente para a vitrine funcionar (frete, WhatsApp, textos). Isso significa que
  `mercadoPagoAccessToken` também fica visível no navegador. O ideal é separar as configurações
  públicas das secretas (ou usar uma *Edge Function* com a chave no servidor).
- **Confirmação automática de PIX de visitante**: quem compra sem conta vê o pagamento confirmado na
  tela, mas o pedido só é marcado como "Pago" no banco quando a administradora confirma no painel
  (a função `claim_order_paid` só aceita o dono do pedido, por segurança).
- **Webhook do Mercado Pago**: com uma *Edge Function* o status passaria a ser atualizado no servidor,
  sem depender do navegador aberto.
