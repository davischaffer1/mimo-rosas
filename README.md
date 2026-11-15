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
| Painel administrativo | `/admin` (ou `/painel`) |
| Alternativa | `/?admin=1` |

O painel **não** tem link na vitrine: o acesso é somente pela URL. A senha padrão é `mimo2026` e pode ser alterada no painel (aba *Banco Supabase & Publicação*).

## Rotas e deploy

O site é uma SPA: a rota `/admin` precisa devolver o `index.html`. Já estão incluídos:

- `vercel.json` — rewrite para Vercel
- `public/_redirects` — rewrite para Netlify

Em **GitHub Pages**, copie `dist/index.html` para `dist/404.html` no deploy (fallback de SPA), senão `/admin` digitado direto retorna 404.

## Estrutura

```
index.html          # Tailwind via CDN
src/main.jsx        # bootstrap do React
src/App.jsx         # app completo (vitrine + painel admin)
public/_redirects   # fallback SPA para Netlify
vercel.json         # fallback SPA para Vercel
```

> `src/App.jsx` concentra todo o app em um único arquivo — candidato natural a ser dividido em componentes (`Header`, `ProductCard`, `Cart`, `Checkout`, `AdminPanel`).
