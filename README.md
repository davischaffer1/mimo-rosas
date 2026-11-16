# Mimo Rosas

Loja de presentes, aromas e sabores artesanais (chimarrão, chás e cafés) com vitrine e painel administrativo no mesmo app.

Vite + React 18 + Tailwind (via CDN) + Supabase (opcional) + Mercado Pago (opcional).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o build
```

## Acessos

| Área | URL |
| --- | --- |
| Vitrine (loja) | `/` |
| Área do cliente (login/cadastro) | `/` → **Minha Conta** (link direto: `/?conta=1`) |
| Painel administrativo | `/admin` (ou `/painel`) |
| Alternativa | `/?admin=1` |

O painel **não** tem link na vitrine: o acesso é somente pela URL.

## Contas de cliente e administração

O login é feito com **Supabase Auth** (e-mail + senha), com confirmação de e-mail obrigatória.
O painel `/admin` exige um perfil com `is_admin = true`; as tabelas têm **RLS fechado**, então cada
cliente só vê os próprios pedidos e favoritos.

A configuração completa (SQL, SMTP com Resend, criação da conta de administradora e checklist de
testes) está em **[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)**.

Resumo do que precisa ser feito uma única vez no Supabase:

1. Rodar [`supabase/migrations/001_customer_auth.sql`](supabase/migrations/001_customer_auth.sql) no SQL Editor
2. Configurar SMTP próprio (o padrão do Supabase só envia para a equipe do projeto)
3. Criar a conta em `/admin` e promovê-la:
   ```sql
   update public.profiles set is_admin = true
    where id = (select id from auth.users where email = 'seu@email.com');
   ```

## Rotas e deploy

O site é uma SPA: a rota `/admin` precisa devolver o `index.html`. Já estão incluídos:

- `vercel.json` — rewrite para Vercel
- `public/_redirects` — rewrite para Netlify

Em **GitHub Pages**, copie `dist/index.html` para `dist/404.html` no deploy (fallback de SPA), senão `/admin` digitado direto retorna 404.

## Estrutura

```
index.html                     # Tailwind via CDN
src/main.jsx                   # bootstrap do React
src/App.jsx                    # app completo (vitrine + painel admin)
src/lib/supabaseClient.js      # cliente Supabase (sessão persistida)
src/auth/useAuth.js            # sessão, perfil, login/cadastro/recuperação
src/auth/AuthPanel.jsx         # telas de login/cadastro (cliente e admin)
src/account/AccountArea.jsx    # pedidos, favoritos e dados do cliente
supabase/migrations/           # schema + RLS (rodar no SQL Editor)
public/_redirects              # fallback SPA para Netlify
vercel.json                    # fallback SPA para Vercel
```

> `src/App.jsx` concentra todo o app em um único arquivo — candidato natural a ser dividido em componentes (`Header`, `ProductCard`, `Cart`, `Checkout`, `AdminPanel`).
