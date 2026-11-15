import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  Home,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  Sparkles,
  Send,
  MapPin,
  Truck,
  Store,
  CreditCard,
  QrCode,
  ShieldCheck,
  SlidersHorizontal,
  Settings,
  Package,
  ClipboardList,
  Database,
  Bot,
  Edit3,
  Copy,
  RefreshCw,
  Eye,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Camera
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÃO DO SUPABASE PRÉ-CONECTADA AO PROJETO DA MIMO ROSAS
// ============================================================================
const DEFAULT_SUPABASE_URL = 'https://dktpnqekuxtsqmazelox.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7WyhLNtUeEMNnbE_MyTo2g_IYrCA8AU';

// ============================================================================
// DADOS INICIAIS (SINCRONIZADOS ENTRE LOJA E PAINEL ADMIN)
// ============================================================================
const INITIAL_CATEGORIES = [
  {
    id: 'infusoes',
    name: 'Infusões para Chimarrão, Drinks e Tererê',
    shortName: 'Infusões para Chimarrão, Drinks e Tererê',
    iconType: 'cuia',
    description: 'Pétalas, especiarias e frutas desidratadas para transformar seu ritual.'
  },
  {
    id: 'blend',
    name: 'Blend para Chimarrão',
    shortName: 'Blend para Chimarrão',
    iconType: 'leaves',
    description: 'Combinações autorais de ervas aromáticas e flores selecionadas.'
  },
  {
    id: 'capsulas-cafe',
    name: 'Cápsulas de Café',
    shortName: 'Cápsulas de Café',
    iconType: 'coffee-bean',
    description: 'Cafés especiais com notas florais, caramelo e chocolate.'
  },
  {
    id: 'capsulas-cha',
    name: 'Cápsulas de Chá',
    shortName: 'Cápsulas de Chá',
    iconType: 'tea-cup',
    description: 'Cápsulas artesanais em formato de rosa que desabrocham na xícara.'
  },
  {
    id: 'enfeites',
    name: 'Enfeites de Cuia',
    shortName: 'Enfeites de Cuia',
    iconType: 'gift',
    description: 'Detalhes delicados em resina, pérolas e flores para decorar seu mate.'
  },
  {
    id: 'cuias',
    name: 'Cuias Resinadas',
    shortName: 'Cuias Resinadas',
    iconType: 'cuia-resin',
    description: 'Cuias exclusivas revestidas à mão com acabamento em resina.'
  },
  {
    id: 'chaveiros',
    name: 'Chaveiros em Resina',
    shortName: 'Chaveiros em Resina',
    iconType: 'keychain',
    description: 'Lembranças afetivas com iniciais, pétalas naturais e folha de ouro.'
  },
  {
    id: 'bombas',
    name: 'Bombas de Chimarrão Personalizadas',
    shortName: 'Bombas Personalizadas',
    iconType: 'bomba',
    description: 'Bombas em inox e banhadas com pingentes e pedrarias exclusivas.'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Infusões para Chimarrão, Drinks e Tererê',
    category: 'infusoes',
    price: 24.9,
    stock: 32,
    badge: 'Mais Vendido',
    badgeType: 'star',
    featured: true,
    active: true,
    rating: 4.9,
    reviews: 128,
    image:
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosas & Hibisco (50g)', 'Cítrico Imperial (50g)', 'Maçã & Canela (50g)'],
    description:
      'Mix artesanal de botões de rosas rubras, hibisco selecionado, cascas de laranja doce e especiarias. Perfeito para decorar e aromatizar seu chimarrão, tererê ou criar drinks autorais.'
  },
  {
    id: 'prod-2',
    name: 'Cápsulas de Chá – Rosa',
    category: 'capsulas-cha',
    price: 19.9,
    stock: 45,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: true,
    active: true,
    rating: 5.0,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa com 2 Rosas', 'Caixa Presente com 4 Rosas'],
    description:
      'Nossas icônicas rosas artesanais de chá! Moldadas delicadamente à mão com pétalas comestíveis, ervas aromáticas e brilho perolado próprio para infusão.'
  },
  {
    id: 'prod-3',
    name: 'Blend para Chimarrão – Jardim de Rosas',
    category: 'blend',
    price: 22.9,
    stock: 20,
    badge: 'Artesanal',
    badgeType: 'leaf',
    featured: true,
    active: true,
    rating: 4.9,
    reviews: 67,
    image:
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Pote 60g', 'Refil 100g'],
    description:
      'Combinação suave de camomila, erva-doce, capim-limão e pétalas de rosas cor-de-rosa. Deixa o seu mate leve, perfumado e com visual encantador.'
  },
  {
    id: 'prod-4',
    name: 'Cuia Resinada Quartzo Rosa & Ouro',
    category: 'cuias',
    price: 119.9,
    stock: 8,
    badge: 'Exclusivo',
    badgeType: 'star',
    featured: true,
    active: true,
    rating: 5.0,
    reviews: 52,
    image:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosa Porcelana', 'Framboesa Imperial'],
    description:
      'Cuia de porongo selecionado revestida artesanalmente em resina epóxi de alto brilho, com efeito marmorizado quartzo rosa e detalhes em folha de ouro.'
  },
  {
    id: 'prod-5',
    name: 'Cápsulas de Café Gourmet – Flor de Baunilha',
    category: 'capsulas-cafe',
    price: 28.9,
    stock: 26,
    badge: 'Edição Especial',
    badgeType: 'star',
    featured: false,
    active: true,
    rating: 4.8,
    reviews: 41,
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa c/ 10 Cápsulas (Compatível Nespresso)'],
    description:
      'Café 100% Arábica de torra média com notas naturais de baunilha, caramelo e toque floral aveludado.'
  },
  {
    id: 'prod-6',
    name: 'Kit Enfeites de Cuia – Rosa & Pérola',
    category: 'enfeites',
    price: 18.5,
    stock: 38,
    badge: 'Delicado',
    badgeType: 'leaf',
    featured: false,
    active: true,
    rating: 4.9,
    reviews: 83,
    image:
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Kit 3 Enfeites Rosé', 'Kit 3 Enfeites Framboesa'],
    description:
      'Trio de enfeites modelados em resina com mini rosas esculpidas, ponto de luz e acabamento perolado para deixar seu chimarrão único.'
  },
  {
    id: 'prod-7',
    name: 'Chaveiro em Resina Inicial com Pétalas Reais',
    category: 'chaveiros',
    price: 26.9,
    stock: 30,
    badge: 'Presenteável',
    badgeType: 'star',
    featured: false,
    active: true,
    rating: 5.0,
    reviews: 112,
    image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Letra A–M (Dourado)', 'Letra N–Z (Rosé Gold)', 'Formato Coração'],
    description:
      'Chaveiro artesanal eternizado em resina cristal com pétalas de rosas naturais desidratadas, flocos de ouro e tassel de seda.'
  },
  {
    id: 'prod-8',
    name: 'Bomba de Chimarrão Inox Rosé com Pedra Quartzo',
    category: 'bombas',
    price: 64.9,
    stock: 14,
    badge: 'Mais Vendido',
    badgeType: 'star',
    featured: false,
    active: true,
    rating: 4.9,
    reviews: 76,
    image:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['21cm Bico Torto', '23cm Tradicional'],
    description:
      'Bomba em aço inox 304 com acabamento Rosé Gold, anel cravejado com pedra em tom quartzo rosa e bojo desmontável com escovinha.'
  },
  {
    id: 'prod-9',
    name: 'Infusão Frutas Vermelhas & Rosas',
    category: 'infusoes',
    price: 26.9,
    stock: 25,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: false,
    active: true,
    rating: 4.9,
    reviews: 39,
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Tubo de Vidro 45g', 'Pote Presente 70g'],
    description:
      'Morangos, amoras, mirtilos desidratados e pétalas de rosas. Sabor adocicado e aroma irresistível para gin tônica, chimarrão ou chá gelado.'
  },
  {
    id: 'prod-10',
    name: 'Blend para Chimarrão – Brisa da Manhã',
    category: 'blend',
    price: 21.9,
    stock: 19,
    badge: null,
    badgeType: null,
    featured: false,
    active: true,
    rating: 4.8,
    reviews: 29,
    image:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Pote 60g'],
    description:
      'Blend refrescante com hortelã-pimenta, Marcela do campo, anis-estrelado e flores de jasmim.'
  },
  {
    id: 'prod-11',
    name: 'Cápsulas de Café – Avelã & Cacau',
    category: 'capsulas-cafe',
    price: 29.9,
    stock: 22,
    badge: null,
    badgeType: null,
    featured: false,
    active: true,
    rating: 4.9,
    reviews: 34,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa c/ 10 Cápsulas'],
    description:
      'Espresso encorpado e cremoso com aroma envolvente de avelãs tostadas e fundo de cacau nobre.'
  },
  {
    id: 'prod-12',
    name: 'Cápsulas de Chá – Rosa Branca & Pêssego',
    category: 'capsulas-cha',
    price: 21.9,
    stock: 30,
    badge: 'Artesanal',
    badgeType: 'leaf',
    featured: false,
    active: true,
    rating: 5.0,
    reviews: 61,
    image:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa com 2 Rosas'],
    description:
      'Cápsula em formato de rosa esculpida com chá branco, pedacinhos de pêssego e pétalas aromáticas.'
  },
  {
    id: 'prod-13',
    name: 'Enfeite de Cuia Borboleta Cristal Rosé',
    category: 'enfeites',
    price: 14.9,
    stock: 40,
    badge: null,
    badgeType: null,
    featured: false,
    active: true,
    rating: 4.9,
    reviews: 48,
    image:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Unidade Rosé', 'Dupla Borboleta + Rosa'],
    description:
      'Enfeite de cuia com haste em inox e borboleta em resina translúcida com glitter fino furta-cor.'
  },
  {
    id: 'prod-14',
    name: 'Cuia Resinada Pérola Imperial Personalizada',
    category: 'cuias',
    price: 129.9,
    stock: 10,
    badge: 'Personalizável',
    badgeType: 'star',
    featured: false,
    active: true,
    rating: 5.0,
    reviews: 44,
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Com Inicial Dourada', 'Sem Inicial'],
    description:
      'Cuia artesanal com bocal em inox e acabamento perolado creme e rosa antigo.'
  },
  {
    id: 'prod-15',
    name: 'Chaveiro Resina Mini Rosa Eternizada',
    category: 'chaveiros',
    price: 29.9,
    stock: 18,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: false,
    active: true,
    rating: 5.0,
    reviews: 57,
    image:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Redondo Dourado', 'Hexagonal Rosé'],
    description:
      'Pingente de chaveiro com um botão de rosa real desidratado e preservado dentro da resina cristalina.'
  },
  {
    id: 'prod-16',
    name: 'Bomba de Chimarrão Banhada Ouro c/ Pingente Rosa',
    category: 'bombas',
    price: 79.9,
    stock: 12,
    badge: 'Premium',
    badgeType: 'star',
    featured: false,
    active: true,
    rating: 5.0,
    reviews: 63,
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['19cm', '21cm', '23cm'],
    description:
      'Bomba de chimarrão com banho dourado verniz italiano e pingente exclusivo da rosa Mimo Rosas.'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'MR-94821',
    customerName: 'Carolina Mendes',
    phone: '(54) 99912-3456',
    deliveryMethod: 'delivery',
    address: 'Rua das Hortênsias, 420 - Gramado/RS',
    cep: '95670-000',
    paymentMethod: 'pix',
    status: 'Pago',
    total: 64.7,
    createdAt: 'Hoje, 14:20',
    items: [
      { name: 'Infusões para Chimarrão, Drinks e Tererê', qty: 1, price: 24.9 },
      { name: 'Cápsulas de Chá – Rosa', qty: 2, price: 19.9 }
    ]
  }
];

const HERO_SLIDES = [
  {
    id: 1,
    titleLine1: 'Pequenos detalhes,',
    titleLine2: 'grandes',
    titleScript: 'momentos.',
    subtitle: 'Presentes, aromas e sabores para tornar a vida mais especial.',
    cta: 'Conheça nossos produtos',
    image:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
    targetCategory: 'all'
  },
  {
    id: 2,
    titleLine1: 'Seu chimarrão com',
    titleLine2: 'toque de',
    titleScript: 'poesia.',
    subtitle: 'Infusões florais, blends selecionados e cuias resinadas feitas à mão.',
    cta: 'Ver linha Chimarrão',
    image:
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85',
    targetCategory: 'infusoes'
  },
  {
    id: 3,
    titleLine1: 'Presentes que',
    titleLine2: 'encantam',
    titleScript: 'corações.',
    subtitle: 'Cápsulas de chá em formato de rosa e chaveiros personalizados.',
    cta: 'Escolher um presente',
    image:
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85',
    targetCategory: 'capsulas-cha'
  }
];

// ============================================================================
// ARQUIVOS PARA CRIAR DIRETO NO SITE DO GITHUB (SEM INSTALAR NADA NO PC)
// ============================================================================
const GITHUB_FILES = {
  packageJson: `{
  "name": "mimo-rosas-loja",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.1"
  }
}`,
  indexHtml: `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mimo Rosas | Loja Oficial</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-[#F6E9E5]">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  viteConfig: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});`,
  mainJsx: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
};

const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- SCRIPT SQL COMPLETO - MIMO ROSAS (SUPABASE + STORAGE DE FOTOS)
-- Cole este código no menu "SQL Editor" do Supabase e clique em "Run"
-- ============================================================================

-- 1. Tabela de Categorias
create table if not exists public.categories (
  id text primary key,
  name text not null,
  short_name text not null,
  icon_type text not null,
  description text,
  created_at timestamptz default now()
);

-- 2. Tabela de Produtos
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text references public.categories(id) on delete set null,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  badge text,
  badge_type text default 'star',
  featured boolean default false,
  active boolean default true,
  rating numeric(3,2) default 5.0,
  reviews integer default 10,
  image text not null,
  gallery jsonb default '[]'::jsonb,
  variations jsonb default '["Padrão"]'::jsonb,
  description text,
  created_at timestamptz default now()
);

-- 3. Tabela de Pedidos (Recebidos do Checkout)
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  delivery_method text not null,
  address text,
  cep text,
  payment_method text not null,
  status text not null default 'Pendente',
  total numeric(10,2) not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4. Habilitar RLS e liberar acesso para a chave Publishable (Loja + Painel)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Liberar categorias geral" on public.categories;
create policy "Liberar categorias geral" on public.categories for all using (true) with check (true);

drop policy if exists "Liberar produtos geral" on public.products;
create policy "Liberar produtos geral" on public.products for all using (true) with check (true);

drop policy if exists "Liberar pedidos geral" on public.orders;
create policy "Liberar pedidos geral" on public.orders for all using (true) with check (true);

-- 5. Criar Bucket Público de Fotos (Supabase Storage)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Acesso publico fotos Mimo Rosas" on storage.objects;
create policy "Acesso publico fotos Mimo Rosas"
on storage.objects for all
using (bucket_id = 'products')
with check (bucket_id = 'products');`;

const SUPABASE_STORAGE_SQL_ONLY = `-- Ativar Galeria de Fotos (Bucket 'products') no Supabase Storage
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Acesso publico fotos Mimo Rosas" on storage.objects;
create policy "Acesso publico fotos Mimo Rosas"
on storage.objects for all
using (bucket_id = 'products')
with check (bucket_id = 'products');`;

// ============================================================================
// COMPONENTES SVG FIÉIS À IMAGEM DE REFERÊNCIA DA MIMO ROSAS
// ============================================================================
const MimoRoseOutlineSVG = ({ className = 'w-11 h-12', strokeColor = '#A90F4D' }) => (
  <svg
    viewBox="0 0 80 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Símbolo Rosa Mimo Rosas"
  >
    <path
      d="M24 18C24 11 32 8 41 8C50 8 59 11 59 18C59 24 49 27 40 27C30 27 24 23 24 18Z"
      stroke={strokeColor}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M31 17C34 14 46 14 49 17C51 19 46 22 40 22C34 22 29 19 31 17Z"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M36 17.5C38 16.5 42 16.5 44 17.5"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M23 16C18 19 16 27 18 36C20 46 28 56 41 56C53 56 61 46 63 35C65 26 62 19 58 16"
      stroke={strokeColor}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 24C27 31 38 34 52 29"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 33C26 42 40 44 58 31"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M25 46C33 49 48 48 56 41"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M40.5 56V89"
      stroke={strokeColor}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M40.5 76C32 71 23 67 16 69C22 75 31 78 40.5 77Z"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40.5 78C48 74 56 71 63 73C57 79 49 80 40.5 79Z"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartFlourishSVG = ({ className = 'w-64 h-8' }) => (
  <svg viewBox="0 0 260 36" fill="none" className={className}>
    <path
      d="M8 29C55 18 96 22 130 26C164 22 205 14 252 6"
      stroke="#A90F4D"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M130 25C126 19 120 12 124 8C127 5 130 9 130 13C130 9 134 5 137 8C141 12 135 19 130 25Z"
      stroke="#A90F4D"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CategoryIconSVG = ({ type }) => {
  const stroke = '#A90F4D';
  switch (type) {
    case 'cuia':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M29 9L34 5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M25 18L31 7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M15 18H33" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M14 20C12 25 13 33 19 36C22 37.5 26 37.5 29 36C35 33 36 25 34 20H14Z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M18 40H30" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M20 36.5L19 40M28 36.5L29 40" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'leaves':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path
            d="M24 36C24 25 18 16 9 14C9 24 14 33 24 36Z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 36C24 24 30 15 39 13C39 23 34 33 24 36Z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M24 39V22" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15 21L24 31" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M33 20L24 30" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'coffee-bean':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <ellipse
            cx="21"
            cy="24"
            rx="9"
            ry="12"
            transform="rotate(-18 21 24)"
            stroke={stroke}
            strokeWidth="2"
          />
          <path
            d="M18 13C22 19 19 28 23 35"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M28 14C33 15 37 20 36 27C35 33 31 36 26 35"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'tea-cup':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M20 12C20 10 22 9 22 7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 12C26 10 28 9 28 7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12 18H32V24C32 30 27.5 34 22 34C16.5 34 12 30 12 24V18Z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M32 20H35.5C37.5 20 39 21.5 39 23.5C39 25.5 37.5 27 35.5 27H31.5"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M10 37H35" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'gift':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <rect x="11" y="18" width="26" height="7" rx="1.5" stroke={stroke} strokeWidth="2" />
          <path
            d="M13 25V37C13 38.1 13.9 39 15 39H33C34.1 39 35 38.1 35 37V25"
            stroke={stroke}
            strokeWidth="2"
          />
          <path d="M24 18V39" stroke={stroke} strokeWidth="2" />
          <path
            d="M24 18C20 18 16 15.5 16 12.5C16 10.5 18 9 20 9C22.5 9 24 12 24 18Z"
            stroke={stroke}
            strokeWidth="2"
          />
          <path
            d="M24 18C28 18 32 15.5 32 12.5C32 10.5 30 9 28 9C25.5 9 24 12 24 18Z"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    case 'cuia-resin':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path
            d="M14 16H34L32 30C31 34 27.5 37 24 37C20.5 37 17 34 16 30L14 16Z"
            stroke={stroke}
            strokeWidth="2"
          />
          <path d="M15 24C20 27 27 22 33 25" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 40H29" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M35 10L36 13L39 14L36 15L35 18L34 15L31 14L34 13L35 10Z" fill={stroke} />
        </svg>
      );
    case 'keychain':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <circle cx="24" cy="13" r="5" stroke={stroke} strokeWidth="2" />
          <path d="M24 18V23" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M24 39C18 34 14 29.5 14 25.5C14 22.5 16.5 20.5 19 20.5C21 20.5 23 22 24 23.5C25 22 27 20.5 29 20.5C31.5 20.5 34 22.5 34 25.5C34 29.5 30 34 24 39Z"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    case 'bomba':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M31 9L19 31" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M31 9L35 7" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="25" cy="20" r="3" fill="#F6E9E5" stroke={stroke} strokeWidth="1.8" />
          <ellipse
            cx="17"
            cy="35"
            rx="5"
            ry="6"
            transform="rotate(25 17 35)"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return null;
  }
};

const formatBRL = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ============================================================================
// COMPONENTE PRINCIPAL (VITRINE + PAINEL ADMIN + SUPABASE INTEGRADO)
// ============================================================================
export default function App() {
  // Modo de visualização: 'store' (Vitrine Cliente) | 'admin' (Sistema Administrativo)
  const [appMode, setAppMode] = useState('store');
  const [adminTab, setAdminTab] = useState('products');

  // Proteção por Senha do Painel Admin (para publicação segura na Vercel)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return localStorage.getItem('mimo_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  // Estados de Conexão Direta com o Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    try {
      return localStorage.getItem('mimo_sb_url') || DEFAULT_SUPABASE_URL;
    } catch {
      return DEFAULT_SUPABASE_URL;
    }
  });

  const [supabaseKey, setSupabaseKey] = useState(() => {
    try {
      return localStorage.getItem('mimo_sb_key') || DEFAULT_SUPABASE_ANON_KEY;
    } catch {
      return DEFAULT_SUPABASE_ANON_KEY;
    }
  });

  const [sbStatus, setSbStatus] = useState({
    connected: false,
    loading: false,
    message: 'Verificando conexão com o Supabase...'
  });

  // Banco de Dados Reativo (Sincroniza entre Vitrine, Painel Admin e Supabase)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_db_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_db_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_db_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [storeConfig, setStoreConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_db_config');
      return saved
        ? JSON.parse(saved)
        : {
            whatsappNumber: '5554999999999',
            freeShippingMin: 120,
            defaultShippingFee: 14.9,
            assistantGreeting:
              'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais.',
            adminPassword: 'mimo2026'
          };
    } catch {
      return {
        whatsappNumber: '5554999999999',
        freeShippingMin: 120,
        defaultShippingFee: 14.9,
        assistantGreeting:
          'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais.',
        adminPassword: 'mimo2026'
      };
    }
  });

  // Estados da Vitrine
  const [activeView, setActiveView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQty, setProductQty] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  // Menus e Modais da Loja
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [heroIndex, setHeroIndex] = useState(0);
  const [addedFeedbackId, setAddedFeedbackId] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  // Estados do Painel Admin (Criação/Edição de Produto)
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [adminToast, setAdminToast] = useState('');
  const [storeToast, setStoreToast] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState({
    title: 'Arquivo 1: package.json',
    code: GITHUB_FILES.packageJson
  });

  // Carrinho e Favoritos
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_favs');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  // Checkout Demonstrativo
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'pix',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Assistente Virtual
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: storeConfig.assistantGreeting,
      time: 'Agora'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const categoryScrollRef = useRef(null);
  const catalogSectionRef = useRef(null);
  const chatEndRef = useRef(null);
  const codePreviewTextareaRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);

  // Função segura de cópia que funciona dentro do Preview sem erro NotAllowedError
  const safeCopyText = (textToCopy, label = 'Conteúdo') => {
    let copied = false;
    try {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      copied = false;
    }

    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => showAdminToast(`${label} copiado!`))
        .catch(() => showAdminToast(`${label} exibido abaixo para selecionar e copiar.`));
      return;
    }

    showAdminToast(`${label} copiado para a área de transferência!`);
  };

  // Permite abrir direto no painel com ?admin=1 no link da Vercel
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') {
        setAppMode('admin');
      }
    } catch {
      // ignora
    }
  }, []);

  // Persistência Local
  useEffect(() => {
    try {
      localStorage.setItem('mimo_db_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_db_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_db_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_db_config', JSON.stringify(storeConfig));
    } catch {
      // ignore
    }
  }, [storeConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_rosas_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_rosas_favs', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_sb_url', supabaseUrl);
      localStorage.setItem('mimo_sb_key', supabaseKey);
    } catch {
      // ignore
    }
  }, [supabaseUrl, supabaseKey]);

  const showAdminToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3200);
  };

  // ============================================================================
  // UPLOAD DE FOTOS: SUPABASE STORAGE + COMPRESSÃO INTELIGENTE AUTOMÁTICA
  // ============================================================================
  const compressImageToDataUrl = (file, maxWidth = 900, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const uploadProductPhoto = async (file, target = 'main') => {
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    setUploadStatusMsg('Enviando e otimizando foto...');

    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const safeFileName = `mimo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext || 'jpg'}`;

      let finalImageUrl = '';
      let usedStorageBucket = false;

      // 1. Tenta enviar diretamente para o Supabase Storage (bucket 'products')
      if (cleanUrl && supabaseKey) {
        try {
          const uploadRes = await fetch(
            `${cleanUrl}/storage/v1/object/products/${safeFileName}`,
            {
              method: 'POST',
              headers: {
                apikey: supabaseKey.trim(),
                Authorization: `Bearer ${supabaseKey.trim()}`,
                'Content-Type': file.type || 'image/jpeg',
                'x-upsert': 'true'
              },
              body: file
            }
          );

          if (uploadRes.ok) {
            finalImageUrl = `${cleanUrl}/storage/v1/object/public/products/${safeFileName}`;
            usedStorageBucket = true;
          }
        } catch {
          // Segue para o fallback automático comprimido
        }
      }

      // 2. Fallback Inteligente: Comprime em HTML5 Canvas (máx 900px, JPEG 82%) se o bucket ainda não foi criado
      if (!finalImageUrl) {
        finalImageUrl = await compressImageToDataUrl(file, 900, 0.82);
      }

      setEditingProduct((prev) => {
        if (!prev) return prev;
        const currentGallery =
          Array.isArray(prev.gallery) && prev.gallery.length > 0
            ? prev.gallery
            : prev.image
            ? [prev.image]
            : [];

        if (target === 'main') {
          const updatedGallery = [
            finalImageUrl,
            ...currentGallery.filter((url) => url !== finalImageUrl)
          ];
          return {
            ...prev,
            image: finalImageUrl,
            gallery: updatedGallery
          };
        } else {
          const updatedGallery = [...currentGallery, finalImageUrl];
          return {
            ...prev,
            image: prev.image || finalImageUrl,
            gallery: updatedGallery
          };
        }
      });

      if (usedStorageBucket) {
        setUploadStatusMsg('✅ Foto salva no Supabase Storage (Bucket products)!');
        showAdminToast('Foto enviada para o Supabase Storage!');
      } else {
        setUploadStatusMsg(
          '✅ Foto otimizada e pronta! (Para usar links públicos do Storage, ative o SQL de Fotos na aba Supabase).'
        );
        showAdminToast('Foto carregada e otimizada com sucesso!');
      }
    } catch (err) {
      setUploadStatusMsg(`Erro ao processar imagem: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // ============================================================================
  // FUNÇÕES REST DO SUPABASE (SEM DEPENDÊNCIAS EXTERNAS)
  // ============================================================================
  const sbHeaders = (prefer = 'return=representation') => ({
    apikey: supabaseKey.trim(),
    Authorization: `Bearer ${supabaseKey.trim()}`,
    'Content-Type': 'application/json',
    Prefer: prefer
  });

  const fetchFromSupabase = async (silent = false) => {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseKey.trim();
    if (!cleanUrl || !cleanKey) {
      setSbStatus({
        connected: false,
        loading: false,
        message: 'Cole sua Publishable Key do Supabase para conectar.'
      });
      return;
    }

    if (!silent) {
      setSbStatus({ connected: false, loading: true, message: 'Testando conexão com o Supabase...' });
    }

    try {
      const prodRes = await fetch(`${cleanUrl}/rest/v1/products?select=*&order=created_at.asc`, {
        headers: sbHeaders()
      });

      if (!prodRes.ok) {
        const errText = await prodRes.text();
        throw new Error(
          prodRes.status === 404 || errText.includes('relation')
            ? 'Tabelas ainda não encontradas. Rode o SQL no SQL Editor do Supabase.'
            : `Erro (${prodRes.status}): verifique se já executou o SQL no Supabase.`
        );
      }

      const dbProducts = await prodRes.json();

      const ordRes = await fetch(`${cleanUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: sbHeaders()
      });
      const dbOrders = ordRes.ok ? await ordRes.json() : [];

      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        const mappedProducts = dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'infusoes',
          price: Number(p.price),
          stock: Number(p.stock),
          badge: p.badge,
          badgeType: p.badge_type || 'star',
          featured: Boolean(p.featured),
          active: p.active !== false,
          rating: Number(p.rating || 5),
          reviews: Number(p.reviews || 12),
          image: p.image,
          gallery: Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.image],
          variations: Array.isArray(p.variations) && p.variations.length ? p.variations : ['Padrão'],
          description: p.description || ''
        }));
        setProducts(mappedProducts);
      }

      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        const mappedOrders = dbOrders.map((o) => ({
          id: o.id,
          customerName: o.customer_name,
          phone: o.phone,
          deliveryMethod: o.delivery_method,
          address: o.address,
          cep: o.cep,
          paymentMethod: o.payment_method,
          status: o.status,
          total: Number(o.total),
          createdAt: new Date(o.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          items: Array.isArray(o.items) ? o.items : []
        }));
        setOrders(mappedOrders);
      }

      setSbStatus({
        connected: true,
        loading: false,
        message: `Conectado com sucesso! (${dbProducts.length} produtos e ${dbOrders.length} pedidos encontrados no banco).`
      });
      if (!silent) showAdminToast('Conectado ao Supabase com sucesso!');
    } catch (err) {
      setSbStatus({
        connected: false,
        loading: false,
        message: err.message || 'Não foi possível conectar ao Supabase.'
      });
    }
  };

  // Envia todos os 8 grupos de categorias e 16 produtos iniciais para o Supabase com 1 clique
  const seedInitialDataToSupabase = async () => {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseKey.trim();
    if (!cleanUrl || !cleanKey) {
      showAdminToast('Preencha a URL e a Publishable Key primeiro!');
      return;
    }

    setSbStatus({
      connected: false,
      loading: true,
      message: 'Enviando 8 categorias e 16 produtos para o seu Supabase...'
    });

    try {
      const catPayload = categories.map((c) => ({
        id: c.id,
        name: c.name,
        short_name: c.shortName,
        icon_type: c.iconType,
        description: c.description
      }));

      const catRes = await fetch(`${cleanUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: sbHeaders('resolution=merge-duplicates,return=representation'),
        body: JSON.stringify(catPayload)
      });

      if (!catRes.ok) {
        const errBody = await catRes.text();
        throw new Error(`Erro Supabase (${catRes.status}): ${errBody}`);
      }

      const prodPayload = products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        badge: p.badge || null,
        badge_type: p.badgeType || 'star',
        featured: Boolean(p.featured),
        active: p.active !== false,
        rating: Number(p.rating || 5.0),
        reviews: Number(p.reviews || 15),
        image: p.image,
        gallery: p.gallery || [p.image],
        variations: p.variations || ['Padrão'],
        description: p.description || ''
      }));

      const prodRes = await fetch(`${cleanUrl}/rest/v1/products`, {
        method: 'POST',
        headers: sbHeaders('resolution=merge-duplicates,return=representation'),
        body: JSON.stringify(prodPayload)
      });

      if (!prodRes.ok) {
        const errBody = await prodRes.text();
        throw new Error(`Erro ao gravar produtos: ${errBody}`);
      }

      setSbStatus({
        connected: true,
        loading: false,
        message: 'Sucesso! As 8 categorias e 16 produtos da Mimo Rosas estão gravados no Supabase!'
      });
      showAdminToast('16 Produtos e 8 Categorias enviados ao Supabase!');
    } catch (err) {
      setSbStatus({
        connected: false,
        loading: false,
        message: `Erro ao enviar dados: ${err.message}`
      });
    }
  };

  const syncSingleProductToSupabase = async (prod) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');

      // 1. Garante que a categoria existe para não dar erro 400 de Foreign Key
      const catObj = categories.find((c) => c.id === prod.category);
      if (catObj) {
        await fetch(`${cleanUrl}/rest/v1/categories?on_conflict=id`, {
          method: 'POST',
          headers: sbHeaders('resolution=merge-duplicates,return=minimal'),
          body: JSON.stringify({
            id: catObj.id,
            name: catObj.name,
            short_name: catObj.shortName,
            icon_type: catObj.iconType,
            description: catObj.description || ''
          })
        });
      }

      const payload = {
        id: String(prod.id),
        name: prod.name,
        category: prod.category,
        price: Number(prod.price) || 0,
        stock: Math.round(Number(prod.stock) || 0),
        badge: prod.badge || null,
        badge_type: prod.badgeType || 'star',
        featured: Boolean(prod.featured),
        active: prod.active !== false,
        rating: Number(prod.rating || 5),
        reviews: Math.round(Number(prod.reviews || 10)),
        image: prod.image,
        gallery: Array.isArray(prod.gallery) ? prod.gallery : [prod.image],
        variations: Array.isArray(prod.variations) ? prod.variations : ['Padrão'],
        description: prod.description || ''
      };

      // 2. Faz UPSERT explícito com ?on_conflict=id
      const res = await fetch(`${cleanUrl}/rest/v1/products?on_conflict=id`, {
        method: 'POST',
        headers: sbHeaders('resolution=merge-duplicates,return=minimal'),
        body: JSON.stringify(payload)
      });

      // 3. Fallback caso a tabela do Supabase tenha menos colunas
      if (!res.ok) {
        await fetch(
          `${cleanUrl}/rest/v1/products?id=eq.${encodeURIComponent(prod.id)}`,
          {
            method: 'PATCH',
            headers: sbHeaders('return=minimal'),
            body: JSON.stringify({
              name: payload.name,
              price: payload.price,
              stock: payload.stock,
              image: payload.image,
              description: payload.description
            })
          }
        );
      }
    } catch {
      // fallback local
    }
  };

  const syncNewOrderToSupabase = async (orderObj) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      await fetch(`${cleanUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: sbHeaders('resolution=merge-duplicates,return=representation'),
        body: JSON.stringify({
          id: orderObj.id,
          customer_name: orderObj.customerName,
          phone: orderObj.phone,
          delivery_method: orderObj.deliveryMethod,
          address: orderObj.address,
          cep: orderObj.cep,
          payment_method: orderObj.paymentMethod,
          status: orderObj.status,
          total: Number(orderObj.total),
          items: orderObj.items
        })
      });
    } catch {
      // fallback local
    }
  };

  // Conecta automaticamente ao carregar se a chave já estiver configurada
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      fetchFromSupabase(true);
    }
  }, []);

  // Rotação do Banner
  useEffect(() => {
    if (activeView !== 'home' || appMode !== 'store') return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeView, appMode]);

  useEffect(() => {
    if (isAssistantOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAssistantOpen, isBotTyping]);

  // Cálculos do Carrinho
  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (checkoutData.deliveryMethod === 'pickup') return 0;
    if (cartSubtotal >= Number(storeConfig.freeShippingMin || 120)) return 0;
    return Number(storeConfig.defaultShippingFee || 14.9);
  }, [cart.length, checkoutData.deliveryMethod, cartSubtotal, storeConfig]);

  const cartTotal = cartSubtotal + shippingFee;

  // Produtos ativos na Vitrine
  const visibleProducts = useMemo(
    () => products.filter((p) => p.active !== false),
    [products]
  );

  const featuredProducts = useMemo(
    () => visibleProducts.filter((p) => p.featured),
    [visibleProducts]
  );

  const filteredProducts = useMemo(() => {
    let list = [...visibleProducts];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [visibleProducts, selectedCategory, searchQuery, sortBy]);

  // Funções da Loja
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setProductQty(1);
    setSelectedVariation(product.variations?.[0] || 'Padrão');
    setActiveGalleryIdx(0);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateCategory = (catId) => {
    setSelectedCategory(catId);
    setActiveView('catalog');
    setIsSideMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product, qty = 1, variation = null, e = null) => {
    if (e) e.stopPropagation();
    const chosenVar = variation || product.variations?.[0] || 'Padrão';
    const cartKey = `${product.id}__${chosenVar}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          cartKey,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          variation: chosenVar,
          quantity: qty
        }
      ];
    });

    setAddedFeedbackId(product.id);
    setCartBounce(true);
    setTimeout(() => setAddedFeedbackId(null), 1100);
    setTimeout(() => setCartBounce(false), 600);
  };

  const updateCartQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const scrollCategoriesRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  // Assistente Virtual Inteligente
  const handleAssistantOption = (optionType, customQuestion = null) => {
    const userLabel =
      customQuestion ||
      {
        produtos: 'Conhecer produtos',
        precos: 'Consultar preços',
        presentes: 'Encontrar presentes',
        duvidas: 'Tirar dúvidas',
        pedidos: 'Ajuda com pedidos'
      }[optionType];

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userLabel,
      time: 'Agora'
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsBotTyping(true);

    setTimeout(() => {
      let botReply = '';
      let suggestedProducts = [];

      if (optionType === 'produtos') {
        botReply =
          'Trabalhamos com uma linha artesanal completa: Infusões e Blends para Chimarrão, Cápsulas de Chá em formato de Rosa, Cápsulas de Café, Cuias Resinadas, Enfeites, Chaveiros e Bombas Personalizadas! 🌹 Veja nossos queridinhos:';
        suggestedProducts = visibleProducts.slice(0, 2);
      } else if (optionType === 'precos') {
        botReply = `Nossos produtos têm valores super acessíveis: Enfeites a partir de R$ 14,90, Cápsulas de Chá Rosa por R$ 19,90, Infusões por R$ 24,90 e Cuias Resinadas a partir de R$ 119,90. Compras acima de ${formatBRL(
          storeConfig.freeShippingMin
        )} ganham Frete Grátis! ✨`;
        suggestedProducts = [visibleProducts[1], visibleProducts[3]].filter(Boolean);
      } else if (optionType === 'presentes') {
        botReply =
          'Para presentear com emoção, recomendo as nossas Cápsulas de Chá – Rosa e os Chaveiros em Resina com Pétalas Reais. Todos vão embalados com cheirinho Mimo Rosas! 🎁💖';
        suggestedProducts = visibleProducts
          .filter((p) => p.category === 'capsulas-cha' || p.category === 'chaveiros')
          .slice(0, 2);
      } else if (optionType === 'duvidas') {
        botReply =
          'Como usar as Cápsulas de Chá Rosa? 🌹 Basta colocar 1 rosa em 200ml de água quente (85°C) e aguardar 3 minutinhos: ela derrete e libera as pétalas e o aroma natural!';
      } else if (optionType === 'pedidos') {
        botReply =
          cart.length > 0
            ? `Você já tem ${cartCount} ${
                cartCount === 1 ? 'item' : 'itens'
              } na sacola (${formatBRL(
                cartSubtotal
              )}). Posso te levar direto para o Checkout agora mesmo!`
            : 'Para fazer seu pedido é muito simples: escolha seus produtos, clique em "Adicionar ao carrinho" e preencha seus dados de Entrega ou Retirada.';
      } else {
        const q = (customQuestion || '').toLowerCase();
        const found = visibleProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
        if (found.length > 0) {
          botReply = `Encontrei ${found.length} ${
            found.length === 1 ? 'opção especial' : 'opções especiais'
          } para você na Mimo Rosas! 🌹 Toque no card abaixo para ver os detalhes:`;
          suggestedProducts = found.slice(0, 2);
        } else {
          botReply =
            'Que carinho receber sua mensagem! 🌹 Todas as nossas peças são produzidas artesanalmente. Escolha uma das opções abaixo ou explore nossas categorias!';
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          products: suggestedProducts,
          time: 'Agora'
        }
      ]);
      setIsBotTyping(false);
    }, 600);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    handleAssistantOption('custom', text);
  };

  // Finalizar Pedido (Salva no Admin + Sincroniza com o Supabase em Tempo Real)
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutData.name.trim() || !checkoutData.phone.trim()) return;

    const code = `MR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: code,
      customerName: checkoutData.name,
      phone: checkoutData.phone,
      deliveryMethod: checkoutData.deliveryMethod,
      address:
        checkoutData.deliveryMethod === 'delivery'
          ? `${checkoutData.address}, ${checkoutData.number || 'S/N'} - ${
              checkoutData.city || ''
            }`
          : 'Retirada no Ateliê Mimo Rosas',
      cep: checkoutData.cep || '-',
      paymentMethod: checkoutData.paymentMethod,
      status: checkoutData.paymentMethod === 'pix' ? 'Aguardando PIX' : 'Pago',
      total: cartTotal,
      createdAt: 'Agora mesmo',
      items: cart.map((item) => ({
        id: item.id,
        name: `${item.name} (${item.variation})`,
        qty: item.quantity,
        price: item.price
      }))
    };

    // 1. Adiciona no Painel Admin local
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Baixa estoque dos produtos comprados
    setProducts((prev) =>
      prev.map((prod) => {
        const bought = cart
          .filter((c) => c.id === prod.id)
          .reduce((sum, c) => sum + c.quantity, 0);
        if (bought > 0) {
          const updated = { ...prod, stock: Math.max(0, prod.stock - bought) };
          syncSingleProductToSupabase(updated);
          return updated;
        }
        return prod;
      })
    );

    // 3. Salva o pedido diretamente no Supabase
    await syncNewOrderToSupabase(newOrder);

    setOrderSuccess({
      code,
      customer: checkoutData.name,
      total: cartTotal,
      method: checkoutData.paymentMethod,
      delivery: checkoutData.deliveryMethod
    });
    setCart([]);
  };

  // Funções do Painel Admin (CRUD de Produtos + Pedidos)
  const handleAdminUnlock = (e) => {
    e.preventDefault();
    const expected = storeConfig.adminPassword || 'mimo2026';
    if (adminPinInput.trim() === expected) {
      setIsAdminUnlocked(true);
      setAdminPinError('');
      try {
        localStorage.setItem('mimo_admin_unlocked', 'true');
      } catch {
        // ignore
      }
    } else {
      setAdminPinError('Senha incorreta. (Dica inicial: mimo2026)');
    }
  };

  const handleSaveProductAdmin = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) return;

    const cleanGallery =
      Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 0
        ? editingProduct.gallery
        : [editingProduct.image];

    const formattedProduct = {
      ...editingProduct,
      price: Number(editingProduct.price) || 0,
      stock: Number(editingProduct.stock) || 0,
      image: editingProduct.image || cleanGallery[0],
      gallery: cleanGallery,
      variations:
        typeof editingProduct.variationsText === 'string'
          ? editingProduct.variationsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : editingProduct.variations || ['Padrão']
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === formattedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === formattedProduct.id ? formattedProduct : p));
      }
      return [formattedProduct, ...prev];
    });

    syncSingleProductToSupabase(formattedProduct);
    setEditingProduct(null);
    showAdminToast('Produto salvo e sincronizado com o Supabase!');
  };

  const handleDeleteProductAdmin = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: sbHeaders()
        });
      } catch {
        // ignore
      }
    }
    showAdminToast('Produto removido do catálogo.');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: sbHeaders(),
          body: JSON.stringify({ status: newStatus })
        });
      } catch {
        // ignore
      }
    }
    showAdminToast(`Pedido ${orderId} atualizado para "${newStatus}"!`);
  };

  // Card de Produto Fiel à Imagem de Referência
  const renderProductCard = (product) => {
    const isFav = favorites.includes(product.id);
    const isAdded = addedFeedbackId === product.id;

    return (
      <div
        key={product.id}
        onClick={() => openProductDetail(product)}
        className="group bg-[#FFF9F3] rounded-[22px] overflow-hidden border border-[#F0DCD6] shadow-[0_6px_20px_rgba(121,83,68,0.07)] hover:shadow-[0_10px_26px_rgba(169,15,77,0.13)] transition-all duration-300 flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-[#F6E9E5]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {product.badge && (
            <div className="absolute top-2.5 left-2.5 bg-[#FFF9F3]/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-[#F2DFDA]">
              {product.badgeType === 'star' ? (
                <Star className="w-3.5 h-3.5 text-[#A90F4D]" strokeWidth={2.2} />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#A90F4D]" strokeWidth={2.2} />
              )}
              <span className="text-[11px] font-medium text-[#5A382E] leading-none">
                {product.badge}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => toggleFavorite(product.id, e)}
            aria-label="Favoritar produto"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FFF9F3]/85 backdrop-blur-xs flex items-center justify-center text-[#A90F4D] hover:scale-110 active:scale-95 transition-transform shadow-xs"
          >
            <Heart
              className="w-4 h-4"
              fill={isFav ? '#A90F4D' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between text-center bg-gradient-to-b from-[#FFF9F3] to-[#FDF3EE]">
          <div>
            <h3 className="font-serif-display text-[15px] sm:text-[16px] font-medium text-[#4A2C23] leading-snug line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>
            <p className="mt-1.5 text-[18px] sm:text-[20px] font-bold text-[#A90F4D] tracking-tight">
              {formatBRL(product.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => addToCart(product, 1, null, e)}
            className={`mt-2.5 w-full py-2.5 px-3 rounded-full text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 ${
              isAdded
                ? 'bg-[#2E7D32] text-white'
                : 'bg-[#A90F4D] hover:bg-[#8E0B3F] text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Adicionar ao carrinho</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6E9E5] text-[#5A382E] flex flex-col items-center selection:bg-[#A90F4D] selection:text-white">
      {/* Fontes Google elegantes idênticas à referência */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .font-script {
          font-family: 'Allura', cursive;
        }
        .font-serif-display {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-clean {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* BARRA DE MODO (ALTERNAR ENTRE VITRINE E PAINEL ADMIN) */}
      <div className="w-full bg-[#3A1C28] text-[#FFF9F3] px-3 py-1.5 text-xs flex items-center justify-between z-50 border-b border-[#A90F4D]/30">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              sbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-medium truncate">
            Mimo Rosas •{' '}
            <span className="opacity-80 hidden sm:inline">
              {sbStatus.connected ? 'Supabase Conectado' : 'Loja + Sistema Admin'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAppMode('store')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
              appMode === 'store'
                ? 'bg-[#A90F4D] text-white shadow-xs'
                : 'bg-white/10 text-[#F6E9E5] hover:bg-white/20'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Vitrine (Loja)</span>
          </button>
          <button
            type="button"
            onClick={() => setAppMode('admin')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
              appMode === 'admin'
                ? 'bg-[#A90F4D] text-white shadow-xs'
                : 'bg-white/10 text-[#F6E9E5] hover:bg-white/20'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Painel Admin ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          MODO 2: PAINEL ADMINISTRATIVO INTEGRADO (COM SENHA PARA VERCEL)
      ===================================================================== */}
      {appMode === 'admin' ? (
        !isAdminUnlocked ? (
          <div className="w-full max-w-md my-auto p-6 font-sans-clean">
            <div className="bg-[#FFF9F3] rounded-3xl p-6 border border-[#EAD6D0] shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F6E9E5] text-[#A90F4D] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif-display text-2xl font-bold text-[#4A2532]">
                  Acesso Restrito • Mimo Rosas
                </h2>
                <p className="text-xs text-[#795344] mt-1">
                  Digite a senha de administradora para gerenciar produtos, preços, pedidos e banco Supabase.
                </p>
              </div>

              <form onSubmit={handleAdminUnlock} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#5A382E] mb-1">
                    Senha do Painel Admin
                  </label>
                  <input
                    type="password"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="Digite a senha (padrão: mimo2026)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]"
                  />
                </div>
                {adminPinError && (
                  <p className="text-xs text-red-600 font-medium">{adminPinError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm shadow-md"
                >
                  Entrar no Painel Administrativo
                </button>
                <button
                  type="button"
                  onClick={() => setAppMode('store')}
                  className="w-full py-2 rounded-full text-xs text-[#795344] hover:underline text-center"
                >
                  Voltar para a Loja
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl min-h-screen bg-[#F6E9E5] p-4 sm:p-6 font-sans-clean space-y-6">
            {adminToast && (
              <div className="fixed bottom-5 right-5 z-50 bg-[#2E7D32] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>{adminToast}</span>
              </div>
            )}

            {/* Topo do Sistema Admin */}
            <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-6 border border-[#EAD6D0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MimoRoseOutlineSVG className="w-10 h-11" />
                <div>
                  <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#4A2532]">
                    Sistema Mimo Rosas • Gestão Integrada
                  </h1>
                  <p className="text-xs text-[#795344]">
                    Todas as edições salvam na Vitrine e no seu banco Supabase ({supabaseUrl.replace('https://', '')}).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAppMode('store')}
                  className="px-4 py-2 rounded-full bg-[#F6E9E5] text-[#A90F4D] border border-[#E5CFC9] text-xs font-semibold hover:bg-[#A90F4D] hover:text-white transition-colors"
                >
                  Ver Loja ao Vivo →
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                <span className="text-[11px] text-[#795344] font-medium">Produtos Ativos</span>
                <p className="text-2xl font-bold text-[#A90F4D] mt-1">
                  {products.filter((p) => p.active !== false).length}
                </p>
              </div>
              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                <span className="text-[11px] text-[#795344] font-medium">Pedidos Recebidos</span>
                <p className="text-2xl font-bold text-[#4A2532] mt-1">{orders.length}</p>
              </div>
              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                <span className="text-[11px] text-[#795344] font-medium">Faturamento Total</span>
                <p className="text-2xl font-bold text-[#2E7D32] mt-1">
                  {formatBRL(orders.reduce((acc, o) => acc + Number(o.total || 0), 0))}
                </p>
              </div>
              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                <span className="text-[11px] text-[#795344] font-medium">Status Supabase</span>
                <p
                  className={`text-sm font-bold mt-2 flex items-center gap-1.5 ${
                    sbStatus.connected ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {sbStatus.connected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Online e Sincronizado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" /> Aguardando Sincronia
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Abas do Sistema */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'products', label: 'Produtos & Estoque', icon: Package },
                { id: 'orders', label: `Pedidos (${orders.length})`, icon: ClipboardList },
                { id: 'assistant', label: 'IA Vendedora & Atendimento', icon: Bot },
                { id: 'supabase', label: 'Banco Supabase & Publicação', icon: Database }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                      adminTab === tab.id
                        ? 'bg-[#A90F4D] text-white shadow-sm'
                        : 'bg-[#FFF9F3] text-[#5A382E] border border-[#E5CFC9]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ABA 1: GESTÃO DE PRODUTOS */}
            {adminTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                  <div>
                    <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">
                      Catálogo de Produtos ({products.length})
                    </h2>
                    <p className="text-xs text-[#795344]">
                      Adicione novos produtos, envie fotos do celular/computador ou altere preços e estoque.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadStatusMsg('');
                      setEditingProduct({
                        id: `prod-${Date.now()}`,
                        name: '',
                        category: 'infusoes',
                        price: 24.9,
                        stock: 15,
                        badge: 'Novo',
                        badgeType: 'leaf',
                        featured: true,
                        active: true,
                        image:
                          'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
                        gallery: [
                          'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85'
                        ],
                        variationsText: 'Padrão, Edição Presente',
                        description: ''
                      });
                    }}
                    className="px-4 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={`bg-[#FFF9F3] rounded-2xl p-3.5 border flex gap-3.5 items-center ${
                        p.active !== false ? 'border-[#EAD6D0]' : 'border-red-200 opacity-60'
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E5CFC9]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {p.featured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]">
                              Destaque
                            </span>
                          )}
                          {p.badge && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif-display font-bold text-base text-[#4A2532] truncate mt-0.5">
                          {p.name}
                        </h3>
                        <p className="text-xs font-bold text-[#A90F4D]">{formatBRL(p.price)}</p>
                        <p className="text-[11px] text-[#795344]">
                          Estoque: <strong>{p.stock} un.</strong>
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            setUploadStatusMsg('');
                            setEditingProduct({
                              ...p,
                              gallery:
                                Array.isArray(p.gallery) && p.gallery.length > 0
                                  ? p.gallery
                                  : [p.image],
                              variationsText: (p.variations || []).join(', ')
                            });
                          }}
                          className="p-2 rounded-xl bg-[#F6E9E5] text-[#A90F4D] hover:bg-[#A90F4D] hover:text-white transition-colors"
                          title="Editar produto e enviar fotos"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductAdmin(p.id)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 2: PEDIDOS RECEBIDOS */}
            {adminTab === 'orders' && (
              <div className="space-y-3.5">
                <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#EAD6D0]">
                  <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">
                    Central de Pedidos
                  </h2>
                  <p className="text-xs text-[#795344]">
                    Quando um cliente finaliza uma compra no Checkout da Loja, o pedido entra aqui e na tabela <code>orders</code> do seu Supabase.
                  </p>
                </div>

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#FFF9F3] rounded-2xl p-4 border border-[#EAD6D0] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2DFDA] pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-[#A90F4D]">{order.id}</span>
                        <span className="text-xs text-[#795344] ml-2">• {order.createdAt}</span>
                        <h3 className="font-bold text-sm text-[#4A2532] mt-0.5">
                          {order.customerName} — {order.phone}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D] border border-[#DFC3BC]"
                        >
                          <option value="Aguardando PIX">Aguardando PIX</option>
                          <option value="Pago">Pago</option>
                          <option value="Em Produção">Em Produção</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                        <a
                          href={`https://wa.me/55${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${order.customerName}! 🌹 Aqui é da Mimo Rosas sobre seu pedido ${order.id} (${order.status}).`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold"
                        >
                          Chamar no WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="text-xs text-[#795344] space-y-1">
                      <p>
                        <strong>Entrega:</strong> {order.address} ({order.cep})
                      </p>
                      <p>
                        <strong>Itens:</strong>{' '}
                        {order.items.map((i) => `${i.qty}x ${i.name}`).join(' | ')}
                      </p>
                      <p className="text-sm font-bold text-[#A90F4D] pt-1">
                        Total do Pedido: {formatBRL(order.total)} ({order.paymentMethod.toUpperCase()})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ABA 3: CONFIGURAÇÃO DA IA VENDEDORA & LOJA */}
            {adminTab === 'assistant' && (
              <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] space-y-4">
                <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">
                  Configurações da Assistente Virtual, Senha & Frete
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">
                      WhatsApp Oficial (com DDD)
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappNumber}
                      onChange={(e) =>
                        setStoreConfig({ ...storeConfig, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Frete Grátis acima de (R$)
                    </label>
                    <input
                      type="number"
                      value={storeConfig.freeShippingMin}
                      onChange={(e) =>
                        setStoreConfig({
                          ...storeConfig,
                          freeShippingMin: Number(e.target.value)
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Senha do Painel Admin
                    </label>
                    <input
                      type="text"
                      value={storeConfig.adminPassword || 'mimo2026'}
                      onChange={(e) =>
                        setStoreConfig({
                          ...storeConfig,
                          adminPassword: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                </div>
                <div className="text-xs">
                  <label className="block font-semibold mb-1">
                    Mensagem de Boas-vindas da Assistente Mimo Rosas
                  </label>
                  <textarea
                    rows={3}
                    value={storeConfig.assistantGreeting}
                    onChange={(e) =>
                      setStoreConfig({ ...storeConfig, assistantGreeting: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                  />
                </div>
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: `welcome-${Date.now()}`,
                        sender: 'bot',
                        text: storeConfig.assistantGreeting,
                        time: 'Agora'
                      }
                    ]);
                    showAdminToast('Configurações atualizadas com sucesso!');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                >
                  Salvar Configurações
                </button>
              </div>
            )}

            {/* ABA 4: BANCO SUPABASE & PUBLICAÇÃO DIRETO PELO GITHUB + VERCEL */}
            {adminTab === 'supabase' && (
              <div className="space-y-5">
                {/* CARD NOVO: ATIVAR UPLOAD DE FOTOS NO SUPABASE STORAGE */}
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#2E7D32] shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        1.º Passo Recomendado • Upload de Fotos Reais
                      </span>
                      <h2 className="font-serif-display text-xl font-bold text-[#4A2532] mt-1">
                        Ativar Galeria de Fotos no Supabase (Storage Bucket)
                      </h2>
                      <p className="text-xs text-[#795344]">
                        Copie o comando abaixo e rode 1 vez no <strong>SQL Editor</strong> do seu Supabase para criar a pasta pública <code>products</code>. (Mesmo sem rodar, o painel já conta com compressão automática de fotos!)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        safeCopyText(
                          SUPABASE_STORAGE_SQL_ONLY,
                          'SQL do Bucket de Fotos (Storage)'
                        )
                      }
                      className="px-4 py-2.5 rounded-full bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL do Storage
                    </button>
                  </div>
                  <pre className="p-3 rounded-2xl bg-[#1D0C13] text-emerald-300 text-[11px] font-mono overflow-x-auto">
                    {SUPABASE_STORAGE_SQL_ONLY}
                  </pre>
                </div>

                {/* CARD 1: CONECTOR DIRETO DO SUPABASE */}
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#A90F4D] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]">
                        Conector em Tempo Real • Supabase Ativo
                      </span>
                      <h2 className="font-serif-display text-xl font-bold text-[#4A2532] mt-1">
                        Conexão Direta com seu Projeto Supabase
                      </h2>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 self-start ${
                        sbStatus.connected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sbStatus.connected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Conectado ao Supabase
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" /> Aguardando Sincronia
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-[#4A2532] mb-1">
                        1. URL do seu Projeto Supabase
                      </label>
                      <input
                        type="text"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#DFC3BC] font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#4A2532] mb-1">
                        2. Sua Chave Pública (Publishable Key)
                      </label>
                      <input
                        type="text"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#DFC3BC] font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#4A2532] flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#A90F4D] shrink-0" />
                      <span>{sbStatus.message}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fetchFromSupabase(false)}
                        disabled={sbStatus.loading}
                        className="px-4 py-2 rounded-full bg-white text-[#A90F4D] border border-[#A90F4D] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F6E9E5] transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${sbStatus.loading ? 'animate-spin' : ''}`} />
                        Testar / Recarregar
                      </button>

                      <button
                        type="button"
                        onClick={seedInitialDataToSupabase}
                        disabled={sbStatus.loading}
                        className="px-4 py-2 rounded-full bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Enviar os 16 Produtos e 8 Categorias para o Supabase
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 2: PUBLICAR DIRETO PELO SITE DO GITHUB + VERCEL */}
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#4A2532] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#4A2532] text-white">
                        Sem precisar instalar nada no computador
                      </span>
                      <h3 className="font-serif-display text-lg font-bold text-[#4A2532] mt-1">
                        Publicar Direto pelo Site do GitHub + Vercel
                      </h3>
                      <p className="text-xs text-[#795344]">
                        Clique em qualquer um dos 4 botões abaixo para copiar o código ou selecionar direto na caixa abaixo:
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-[#24292F] text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>1. Abrir GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="https://vercel.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>2. Abrir Vercel</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilePreview({
                          title: 'Arquivo 1: package.json',
                          code: GITHUB_FILES.packageJson
                        });
                        safeCopyText(GITHUB_FILES.packageJson, 'package.json');
                      }}
                      className="p-3 rounded-2xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#DFC3BC] text-left transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#A90F4D] uppercase">
                          Arquivo 1
                        </span>
                        <p className="font-mono font-bold text-sm text-[#4A2532] mt-0.5">
                          package.json
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#A90F4D]">
                        <Copy className="w-3 h-3" /> Copiar / Mostrar código
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilePreview({
                          title: 'Arquivo 2: index.html',
                          code: GITHUB_FILES.indexHtml
                        });
                        safeCopyText(GITHUB_FILES.indexHtml, 'index.html');
                      }}
                      className="p-3 rounded-2xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#DFC3BC] text-left transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#A90F4D] uppercase">
                          Arquivo 2
                        </span>
                        <p className="font-mono font-bold text-sm text-[#4A2532] mt-0.5">
                          index.html
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#A90F4D]">
                        <Copy className="w-3 h-3" /> Copiar / Mostrar código
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilePreview({
                          title: 'Arquivo 3: vite.config.js',
                          code: GITHUB_FILES.viteConfig
                        });
                        safeCopyText(GITHUB_FILES.viteConfig, 'vite.config.js');
                      }}
                      className="p-3 rounded-2xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#DFC3BC] text-left transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#A90F4D] uppercase">
                          Arquivo 3
                        </span>
                        <p className="font-mono font-bold text-sm text-[#4A2532] mt-0.5">
                          vite.config.js
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#A90F4D]">
                        <Copy className="w-3 h-3" /> Copiar / Mostrar código
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilePreview({
                          title: 'Arquivo 4: src/main.jsx',
                          code: GITHUB_FILES.mainJsx
                        });
                        safeCopyText(GITHUB_FILES.mainJsx, 'src/main.jsx');
                      }}
                      className="p-3 rounded-2xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#DFC3BC] text-left transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#A90F4D] uppercase">
                          Arquivo 4
                        </span>
                        <p className="font-mono font-bold text-sm text-[#4A2532] mt-0.5">
                          src/main.jsx
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#A90F4D]">
                        <Copy className="w-3 h-3" /> Copiar / Mostrar código
                      </span>
                    </button>
                  </div>

                  {/* CAIXA DE CÓDIGO VISÍVEL E SELECIONÁVEL */}
                  <div className="bg-[#1D0C13] rounded-2xl p-3.5 text-pink-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-300 font-mono">
                        {selectedFilePreview.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (codePreviewTextareaRef.current) {
                            codePreviewTextareaRef.current.select();
                          }
                          safeCopyText(selectedFilePreview.code, selectedFilePreview.title);
                        }}
                        className="px-3 py-1 rounded-full bg-[#A90F4D] text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Selecionar e Copiar
                      </button>
                    </div>
                    <textarea
                      ref={codePreviewTextareaRef}
                      readOnly
                      value={selectedFilePreview.code}
                      onClick={(e) => e.target.select()}
                      rows={8}
                      className="w-full bg-[#2A121C] text-pink-100 font-mono text-[11px] p-3 rounded-xl border border-pink-900/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* CARD 2.5: CONECTAR DOMÍNIO PRÓPRIO MIMOROSAS.COM.BR */}
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#A90F4D] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A90F4D] text-white">
                        Domínio Próprio Oficial
                      </span>
                      <h3 className="font-serif-display text-lg font-bold text-[#4A2532] mt-1">
                        Como ativar o seu domínio <code>mimorosas.com.br</code> na Vercel
                      </h3>
                      <p className="text-xs text-[#795344]">
                        Em <strong>Settings &gt; Domains</strong> na Vercel, adicione <code>mimorosas.com.br</code> e configure estes 2 apontamentos no painel onde você comprou o domínio (ex: Registro.br, Hostinger, GoDaddy):
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#F6E9E5] border border-[#DFC3BC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#A90F4D] uppercase text-[10px]">
                          Apontamento 1 • Domínio Raiz
                        </span>
                        <button
                          type="button"
                          onClick={() => safeCopyText('216.198.79.1', 'IP 216.198.79.1')}
                          className="px-2.5 py-1 rounded-full bg-[#A90F4D] text-white text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copiar IP
                        </button>
                      </div>
                      <p className="text-[#4A2532]">
                        <strong>Tipo:</strong> <code>A</code> &nbsp;|&nbsp; <strong>Nome:</strong>{' '}
                        <code>@</code> (ou em branco no Registro.br)
                      </p>
                      <p className="font-mono font-bold text-sm text-[#4A2532]">
                        Valor / Destino: 216.198.79.1
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F6E9E5] border border-[#DFC3BC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#A90F4D] uppercase text-[10px]">
                          Apontamento 2 • Subdomínio WWW
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            safeCopyText(
                              'e05a5a12a124d8d9.vercel-dns-017.com.',
                              'CNAME da Vercel'
                            )
                          }
                          className="px-2.5 py-1 rounded-full bg-[#A90F4D] text-white text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copiar CNAME
                        </button>
                      </div>
                      <p className="text-[#4A2532]">
                        <strong>Tipo:</strong> <code>CNAME</code> &nbsp;|&nbsp;{' '}
                        <strong>Nome:</strong> <code>www</code>
                      </p>
                      <p className="font-mono font-bold text-xs text-[#4A2532] break-all">
                        Valor / Destino: e05a5a12a124d8d9.vercel-dns-017.com.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD 3: SCRIPT SQL COMPLETO DO SUPABASE */}
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif-display text-base font-bold text-[#4A2532]">
                        Script SQL Completo (Tabelas + Storage de Fotos)
                      </h3>
                      <p className="text-xs text-[#795344]">
                        Use apenas se precisar recriar as tabelas no menu <strong>SQL Editor</strong> do Supabase.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => safeCopyText(SUPABASE_SQL_SCHEMA, 'SQL do Supabase')}
                      className="px-4 py-2 rounded-full bg-[#A90F4D] text-white text-xs font-semibold flex items-center gap-1.5 self-start"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL do Supabase
                    </button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-[#1D0C13] text-pink-100 text-[11px] font-mono overflow-x-auto max-h-60">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              </div>
            )}

            {/* MODAL DE CRIAR / EDITAR PRODUTO NO PAINEL ADMIN COM UPLOAD DE FOTOS */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveProductAdmin}
                  className="bg-[#FFF9F3] w-full max-w-lg rounded-3xl p-5 border border-[#EAD6D0] shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#F2DFDA] pb-2.5">
                    <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                      Editar / Cadastrar Produto
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-full bg-[#F6E9E5] text-[#4A2532]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Categoria</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.shortName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Estoque (un.)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stock}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, stock: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">
                        Selo (Ex: Mais Vendido, Novo)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.badge || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, badge: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>
                  </div>

                  {/* SEÇÃO DE UPLOAD DE FOTOS DIRETO DO CELULAR OU COMPUTADOR */}
                  <div className="p-3.5 rounded-2xl bg-[#F6E9E5] border border-[#DFC3BC] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#4A2532] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#A90F4D]" />
                        <span>Fotos do Produto (Capa + Galeria)</span>
                      </label>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF9F3] text-[#A90F4D]">
                        Supabase Storage + Auto-Compressão
                      </span>
                    </div>

                    {/* Preview da Foto Principal + Botões de Upload */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#FFF9F3] border-2 border-[#A90F4D] shrink-0 shadow-xs">
                        {editingProduct.image ? (
                          <img
                            src={editingProduct.image}
                            alt="Preview Capa"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#795344]">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 right-1 bg-[#A90F4D]/90 text-white text-[9px] font-bold text-center py-0.5 rounded-md">
                          Foto Principal
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Input oculto para Foto Principal */}
                        <input
                          ref={mainImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadProductPhoto(file, 'main');
                            e.target.value = '';
                          }}
                        />

                        {/* Input oculto para Adicionar na Galeria */}
                        <input
                          ref={galleryImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadProductPhoto(file, 'gallery');
                            e.target.value = '';
                          }}
                        />

                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => mainImageInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
                        >
                          <Upload className="w-4 h-4" />
                          <span>
                            {uploadingImage
                              ? 'Enviando foto...'
                              : 'Enviar Foto do Celular / Computador'}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => galleryImageInputRef.current?.click()}
                          className="w-full py-1.5 px-3 rounded-xl bg-[#FFF9F3] hover:bg-white text-[#A90F4D] border border-[#D4B2AA] font-semibold flex items-center justify-center gap-1.5 text-[11px]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar foto extra na galeria</span>
                        </button>
                      </div>
                    </div>

                    {uploadStatusMsg && (
                      <div className="px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-[11px] font-medium text-[#4A2532]">
                        {uploadStatusMsg}
                      </div>
                    )}

                    {/* Miniaturas da Galeria do Produto */}
                    {Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 1 && (
                      <div className="space-y-1">
                        <span className="text-[10.5px] font-semibold text-[#795344]">
                          Galeria ({editingProduct.gallery.length} fotos — toque para definir como principal):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {editingProduct.gallery.map((imgUrl, idx) => {
                            const isMain = editingProduct.image === imgUrl;
                            return (
                              <div
                                key={idx}
                                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                                  isMain ? 'border-[#A90F4D]' : 'border-white'
                                }`}
                                onClick={() =>
                                  setEditingProduct({ ...editingProduct, image: imgUrl })
                                }
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Galeria ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = editingProduct.gallery.filter(
                                      (_, i) => i !== idx
                                    );
                                    setEditingProduct({
                                      ...editingProduct,
                                      gallery: filtered,
                                      image:
                                        editingProduct.image === imgUrl
                                          ? filtered[0] || ''
                                          : editingProduct.image
                                    });
                                  }}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[9px]"
                                  title="Remover foto"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Campo opcional para colar link externo se desejar */}
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#795344] mb-1">
                        Ou cole o link (URL) da imagem manualmente:
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.image}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, image: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Variações (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.variationsText || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          variationsText: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Descrição</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.featured)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            featured: e.target.checked
                          })
                        }
                      />
                      <span>Exibir em "Nossos Destaques"</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-full bg-[#F6E9E5] text-[#5A382E] font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#A90F4D] text-white font-semibold"
                    >
                      Salvar no Catálogo
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )
      ) : (
        /* =====================================================================
           MODO 1: VITRINE DA LOJA VIRTUAL (100% FIEL À IMAGEM DE REFERÊNCIA)
        ===================================================================== */
        <div className="w-full max-w-[480px] md:max-w-[960px] min-h-screen bg-[#F6E9E5] shadow-[0_0_50px_rgba(121,83,68,0.15)] flex flex-col relative pb-24 font-sans-clean">
          {/* 1. CABEÇALHO FIEL À IMAGEM */}
          <header className="sticky top-0 z-30 bg-[#FFF9F3]/95 backdrop-blur-md border-b border-[#EFE0DC] px-4 py-2.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSideMenuOpen(true)}
                aria-label="Abrir menu"
                className="p-2 -ml-1 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition"
              >
                <Menu className="w-6 h-6" strokeWidth={1.9} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setSelectedCategory('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 focus:outline-none group"
              >
                <MimoRoseOutlineSVG className="w-10 h-11 sm:w-11 sm:h-12 group-hover:scale-105 transition-transform" />
                <span className="font-script text-[36px] sm:text-[42px] text-[#A90F4D] leading-none tracking-wide pt-1">
                  Mimo Rosas
                </span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  aria-label="Pesquisar produtos"
                  className="p-2 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition"
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Abrir carrinho"
                  className={`relative p-2 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition ${
                    cartBounce ? 'scale-125' : ''
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  <span className="absolute top-0.5 right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#A90F4D] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>

            {isSearchOpen && (
              <div className="mt-2.5 pb-1 animate-fadeIn">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#A90F4D] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (activeView !== 'catalog' && activeView !== 'home') {
                        setActiveView('catalog');
                      }
                    }}
                    placeholder="Buscar infusões, cápsulas de rosa, cuias..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#F6E9E5] border border-[#E6CFC8] text-sm text-[#4A2C23] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D]"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-[#795344] hover:text-[#A90F4D]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* CONTEÚDO PRINCIPAL DA VITRINE */}
          <main className="flex-1">
            {activeView === 'home' && (
              <div>
                {/* 2. BANNER PRINCIPAL FIEL À IMAGEM */}
                <section className="relative w-full overflow-hidden bg-[#F2D7D3]">
                  <div className="relative min-h-[290px] sm:min-h-[340px] w-full flex items-center">
                    <img
                      src={HERO_SLIDES[heroIndex].image}
                      alt="Banner Mimo Rosas"
                      className="absolute inset-0 w-full h-full object-cover object-right transition-all duration-700"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(246,226,223,0.98) 0%, rgba(246,226,223,0.92) 48%, rgba(246,226,223,0.25) 78%, rgba(246,226,223,0.05) 100%)'
                      }}
                    />

                    <div className="relative z-10 w-[68%] sm:w-[60%] pl-4 sm:pl-8 py-6">
                      <h1 className="font-serif-display italic text-[25px] sm:text-[34px] text-[#A90F4D] leading-[1.15]">
                        {HERO_SLIDES[heroIndex].titleLine1}
                        <br />
                        <span>{HERO_SLIDES[heroIndex].titleLine2} </span>
                        <span className="font-script not-italic text-[37px] sm:text-[48px] leading-none">
                          {HERO_SLIDES[heroIndex].titleScript}
                        </span>
                      </h1>

                      <div className="-ml-2 my-1">
                        <HeartFlourishSVG className="w-52 sm:w-64 h-7" />
                      </div>

                      <p className="text-[12.5px] sm:text-[14px] text-[#4E2F26] leading-snug max-w-[240px] sm:max-w-[300px] font-normal">
                        {HERO_SLIDES[heroIndex].subtitle}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          const target = HERO_SLIDES[heroIndex].targetCategory;
                          if (target === 'all') {
                            catalogSectionRef.current?.scrollIntoView({
                              behavior: 'smooth'
                            });
                          } else {
                            navigateCategory(target);
                          }
                        }}
                        className="mt-4 inline-flex items-center gap-2 bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-[13px] sm:text-[14px] font-medium px-5 py-2.5 rounded-full shadow-[0_6px_16px_rgba(169,15,77,0.32)] active:scale-95 transition-all"
                      >
                        <span>{HERO_SLIDES[heroIndex].cta}</span>
                        <span className="text-base leading-none">→</span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                      {HERO_SLIDES.map((slide, idx) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setHeroIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`rounded-full transition-all ${
                            heroIndex === idx
                              ? 'w-2.5 h-2.5 bg-[#A90F4D]'
                              : 'w-2 h-2 bg-[#FFF9F3]/80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. CATEGORIAS COM ROLAGEM HORIZONTAL */}
                <section className="relative px-3.5 pt-4 pb-2">
                  <div className="relative">
                    <div
                      ref={categoryScrollRef}
                      className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pr-8 py-1"
                    >
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(
                                selectedCategory === cat.id ? 'all' : cat.id
                              );
                            }}
                            className={`flex-shrink-0 w-[96px] sm:w-[116px] rounded-[20px] p-2.5 flex flex-col items-center justify-start text-center transition-all duration-200 border ${
                              isSelected
                                ? 'bg-[#FFF9F3] border-[#A90F4D] shadow-md -translate-y-0.5'
                                : 'bg-[#F9ECE8] hover:bg-[#FFF9F3] border-[#F0DCD6] shadow-[0_4px_12px_rgba(121,83,68,0.06)]'
                            }`}
                          >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-1">
                              <CategoryIconSVG type={cat.iconType} />
                            </div>
                            <span className="text-[11px] sm:text-[12px] font-medium text-[#4E2F26] leading-[1.2] line-clamp-3">
                              {cat.shortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={scrollCategoriesRight}
                      aria-label="Rolar categorias"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF9F3] border border-[#EBD5CF] shadow-md flex items-center justify-center text-[#A90F4D] hover:scale-105 active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>

                {/* 4. SEÇÃO "NOSSOS DESTAQUES" */}
                <section ref={catalogSectionRef} className="px-3.5 pt-4 pb-4">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-[1px] flex-1 bg-[#E2B8C4]" />
                    <h2 className="text-center flex items-baseline gap-2">
                      <span className="font-serif-display text-[22px] sm:text-[26px] text-[#4E2F26] font-normal">
                        Nossos
                      </span>
                      <span className="font-script text-[40px] sm:text-[46px] text-[#A90F4D] leading-none">
                        Destaques
                      </span>
                    </h2>
                    <div className="h-[1px] flex-1 bg-[#E2B8C4]" />
                  </div>

                  {(selectedCategory !== 'all' || searchQuery.trim() !== '') && (
                    <div className="mb-3 flex items-center justify-between bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF] text-xs">
                      <span className="text-[#5A382E] font-medium truncate">
                        Filtro:{' '}
                        <strong className="text-[#A90F4D]">
                          {selectedCategory === 'all'
                            ? `"${searchQuery}"`
                            : categories.find((c) => c.id === selectedCategory)?.name}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                        }}
                        className="text-[#A90F4D] font-semibold hover:underline ml-2 shrink-0"
                      >
                        Ver todos
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {(selectedCategory === 'all' && !searchQuery
                      ? featuredProducts
                      : filteredProducts
                    ).map((product) => renderProductCard(product))}
                  </div>

                  {selectedCategory === 'all' && !searchQuery && (
                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveView('catalog')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9F3] border border-[#D9B2BE] text-[#A90F4D] text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#A90F4D] hover:text-white transition-colors"
                      >
                        <span>Ver todos os {visibleProducts.length} produtos da loja</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </section>

                {/* 5. BANNER INSTITUCIONAL "ARTESANAL, COM MUITO AMOR" */}
                <section className="px-3.5 pt-1 pb-4">
                  <div
                    className="relative rounded-[26px] overflow-hidden p-4 sm:p-6 text-[#FFF9F3] shadow-[0_10px_28px_rgba(169,15,77,0.25)]"
                    style={{
                      background:
                        'linear-gradient(100deg, #980B44 0%, #A90F4D 58%, #C43B6E 100%)'
                    }}
                  >
                    <div className="relative z-10 flex items-center gap-3.5 sm:gap-6">
                      <div className="shrink-0">
                        <MimoRoseOutlineSVG
                          className="w-16 h-20 sm:w-20 sm:h-24"
                          strokeColor="#FFF9F3"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-serif-display text-[17px] sm:text-[22px] leading-tight">
                            Artesanal,{' '}
                            <span className="italic font-normal">com muito</span>{' '}
                            <span className="font-script text-[29px] sm:text-[36px] leading-none">
                              amor
                            </span>
                          </h3>
                          <Heart className="w-4 h-4 text-[#FAD4E0] inline shrink-0" />
                        </div>

                        <div className="w-44 h-[1px] bg-[#F6B8CC]/60 my-1.5" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-1">
                          <p className="text-[11.5px] sm:text-[13px] text-[#FCEEF2] leading-snug max-w-[210px]">
                            Cuidados em cada detalhe para encantar em cada escolha.
                          </p>

                          <button
                            type="button"
                            onClick={() => setIsAboutModalOpen(true)}
                            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 bg-[#FCE5EC] hover:bg-white text-[#A90F4D] text-[11.5px] sm:text-[12.5px] font-semibold px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition"
                          >
                            <span>Sobre a Mimo Rosas</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW: CATÁLOGO COMPLETO */}
            {activeView === 'catalog' && (
              <div className="px-3.5 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveView('home')}
                      className="inline-flex items-center gap-1 text-xs text-[#A90F4D] font-semibold mb-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar ao Início</span>
                    </button>
                    <h1 className="font-serif-display text-2xl text-[#4E2F26] font-semibold">
                      {selectedCategory === 'all'
                        ? 'Catálogo Completo'
                        : categories.find((c) => c.id === selectedCategory)?.name}
                    </h1>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FFF9F3] px-3 py-1.5 rounded-full border border-[#EBD5CF] text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#A90F4D]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-[#4E2F26] font-medium focus:outline-none"
                    >
                      <option value="featured">Destaques</option>
                      <option value="price-asc">Menor Preço</option>
                      <option value="price-desc">Maior Preço</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                      selectedCategory === 'all'
                        ? 'bg-[#A90F4D] text-white'
                        : 'bg-[#FFF9F3] text-[#5A382E] border border-[#EBD5CF]'
                    }`}
                  >
                    Todos ({visibleProducts.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                        selectedCategory === cat.id
                          ? 'bg-[#A90F4D] text-white'
                          : 'bg-[#FFF9F3] text-[#5A382E] border border-[#EBD5CF]'
                      }`}
                    >
                      {cat.shortName}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredProducts.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}

            {/* VIEW: PÁGINA INDIVIDUAL DO PRODUTO */}
            {activeView === 'product' && selectedProduct && (
              <div className="px-3.5 py-4 space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveView('home')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A90F4D] bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(selectedProduct.id, e)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A90F4D] bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF]"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={favorites.includes(selectedProduct.id) ? '#A90F4D' : 'none'}
                    />
                    <span>
                      {favorites.includes(selectedProduct.id) ? 'Salvo' : 'Favoritar'}
                    </span>
                  </button>
                </div>

                <div className="bg-[#FFF9F3] rounded-[28px] p-4 sm:p-6 border border-[#EBD5CF] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <div className="aspect-square rounded-[22px] overflow-hidden bg-[#F6E9E5] relative">
                      <img
                        src={
                          selectedProduct.gallery?.[activeGalleryIdx] ||
                          selectedProduct.image
                        }
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
                      <div className="flex gap-2">
                        {selectedProduct.gallery.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveGalleryIdx(i)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                              activeGalleryIdx === i
                                ? 'border-[#A90F4D]'
                                : 'border-transparent opacity-70'
                            }`}
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A90F4D]">
                        {categories.find((c) => c.id === selectedProduct.category)?.name}
                      </span>

                      <h1 className="font-serif-display text-2xl sm:text-3xl text-[#4A2532] font-semibold leading-tight">
                        {selectedProduct.name}
                      </h1>

                      <p className="text-3xl font-bold text-[#A90F4D] pt-1">
                        {formatBRL(selectedProduct.price)}
                      </p>

                      <p className="text-xs sm:text-sm text-[#6D493B] leading-relaxed pt-1">
                        {selectedProduct.description}
                      </p>

                      {selectedProduct.variations &&
                        selectedProduct.variations.length > 0 && (
                          <div className="pt-2">
                            <label className="block text-xs font-semibold text-[#4A2532] mb-2">
                              Escolha a opção:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.variations.map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setSelectedVariation(v)}
                                  className={`px-3.5 py-2 rounded-full text-xs font-medium border transition ${
                                    selectedVariation === v
                                      ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                                      : 'bg-[#F6E9E5] text-[#5A382E] border-[#E2C7C0]'
                                  }`}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="pt-3 space-y-3 border-t border-[#F0DCD6]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#4A2532]">
                          Quantidade:
                        </span>
                        <div className="flex items-center gap-3 bg-[#F6E9E5] px-3 py-1.5 rounded-full border border-[#E2C7C0]">
                          <button
                            type="button"
                            onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                            className="w-6 h-6 rounded-full bg-[#FFF9F3] flex items-center justify-center text-[#A90F4D]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">
                            {productQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setProductQty((q) => q + 1)}
                            className="w-6 h-6 rounded-full bg-[#FFF9F3] flex items-center justify-center text-[#A90F4D]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(selectedProduct, productQty, selectedVariation)
                          }
                          className="flex-1 py-3.5 px-5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>
                            Adicionar • {formatBRL(selectedProduct.price * productQty)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: FAVORITOS */}
            {activeView === 'favorites' && (
              <div className="px-3.5 py-4 space-y-4">
                <h1 className="font-serif-display text-2xl text-[#4E2F26] font-semibold">
                  Meus Favoritos ({favorites.length})
                </h1>
                {favorites.length === 0 ? (
                  <div className="bg-[#FFF9F3] rounded-3xl p-8 text-center border border-[#EBD5CF]">
                    <Heart className="w-10 h-10 text-[#A90F4D] mx-auto mb-2 opacity-60" />
                    <p className="text-sm text-[#795344]">
                      Sua lista de desejos ainda está vazia.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                    {visibleProducts
                      .filter((p) => favorites.includes(p.id))
                      .map((product) => renderProductCard(product))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: MINHA CONTA */}
            {activeView === 'account' && (
              <div className="px-3.5 py-4 space-y-4">
                <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EBD5CF] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-[#F6E9E5] border border-[#E2B8C4] flex items-center justify-center text-[#A90F4D]">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="font-serif-display text-xl font-bold text-[#4A2532]">
                        Espaço Cliente Mimo Rosas
                      </h1>
                      <p className="text-xs text-[#795344]">
                        Acompanhe seus pedidos e favoritos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAppMode('admin')}
                    className="px-3.5 py-2 rounded-full bg-[#A90F4D] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Abrir Painel Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: CHECKOUT */}
            {activeView === 'checkout' && (
              <div className="px-3.5 py-4 space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A90F4D]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Continuar comprando</span>
                </button>

                <h1 className="font-serif-display text-2xl text-[#4A2532] font-bold">
                  Finalizar Pedido
                </h1>

                {orderSuccess ? (
                  <div className="bg-[#FFF9F3] rounded-3xl p-6 border border-[#EBD5CF] text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h2 className="font-serif-display text-2xl text-[#4A2532] font-bold">
                      Pedido Registrado com Carinho! 🌹
                    </h2>
                    <p className="text-xs text-[#795344] max-w-md mx-auto">
                      Obrigada, <strong>{orderSuccess.customer}</strong>! Seu pedido{' '}
                      <strong className="text-[#A90F4D]">{orderSuccess.code}</strong> já foi salvo no Painel Administrativo e no banco Supabase.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSuccess(null);
                          setActiveView('home');
                        }}
                        className="px-6 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                      >
                        Voltar para a Vitrine
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSuccess(null);
                          setAppMode('admin');
                          setAdminTab('orders');
                        }}
                        className="px-6 py-2.5 rounded-full bg-[#FFF9F3] border border-[#A90F4D] text-[#A90F4D] text-xs font-semibold"
                      >
                        Ver Pedido no Painel Admin →
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-3">
                      <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">
                        1. Seus Dados
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={checkoutData.name}
                          onChange={(e) =>
                            setCheckoutData({ ...checkoutData, name: e.target.value })
                          }
                          placeholder="Seu nome completo *"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                        />
                        <input
                          type="tel"
                          required
                          value={checkoutData.phone}
                          onChange={(e) =>
                            setCheckoutData({ ...checkoutData, phone: e.target.value })
                          }
                          placeholder="WhatsApp (DDD) 99999-9999 *"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-3">
                      <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">
                        2. Entrega ou Retirada
                      </h2>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutData({
                              ...checkoutData,
                              deliveryMethod: 'delivery'
                            })
                          }
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 ${
                            checkoutData.deliveryMethod === 'delivery'
                              ? 'border-[#A90F4D] bg-[#FCEEF2]'
                              : 'border-[#E5CFC9] bg-[#F6E9E5]'
                          }`}
                        >
                          <Truck className="w-5 h-5 text-[#A90F4D]" />
                          <div>
                            <p className="text-xs font-bold text-[#4A2532]">Entrega</p>
                            <p className="text-[10px] text-[#795344]">Correios / Motoboy</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutData({ ...checkoutData, deliveryMethod: 'pickup' })
                          }
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 ${
                            checkoutData.deliveryMethod === 'pickup'
                              ? 'border-[#A90F4D] bg-[#FCEEF2]'
                              : 'border-[#E5CFC9] bg-[#F6E9E5]'
                          }`}
                        >
                          <Store className="w-5 h-5 text-[#A90F4D]" />
                          <div>
                            <p className="text-xs font-bold text-[#4A2532]">Retirada</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              Grátis no Ateliê
                            </p>
                          </div>
                        </button>
                      </div>

                      {checkoutData.deliveryMethod === 'delivery' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                          <input
                            type="text"
                            required
                            value={checkoutData.cep}
                            onChange={(e) =>
                              setCheckoutData({ ...checkoutData, cep: e.target.value })
                            }
                            placeholder="CEP *"
                            className="px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                          />
                          <input
                            type="text"
                            required
                            value={checkoutData.address}
                            onChange={(e) =>
                              setCheckoutData({
                                ...checkoutData,
                                address: e.target.value
                              })
                            }
                            placeholder="Rua / Avenida e Número *"
                            className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-3">
                      <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">
                        3. Pagamento e Resumo ({formatBRL(cartTotal)})
                      </h2>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutData({ ...checkoutData, paymentMethod: 'pix' })
                          }
                          className={`p-3 rounded-2xl border flex items-center gap-2 ${
                            checkoutData.paymentMethod === 'pix'
                              ? 'border-[#A90F4D] bg-[#FCEEF2]'
                              : 'border-[#E5CFC9] bg-[#F6E9E5]'
                          }`}
                        >
                          <QrCode className="w-5 h-5 text-[#A90F4D]" />
                          <span className="text-xs font-bold">PIX Instantâneo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutData({ ...checkoutData, paymentMethod: 'card' })
                          }
                          className={`p-3 rounded-2xl border flex items-center gap-2 ${
                            checkoutData.paymentMethod === 'card'
                              ? 'border-[#A90F4D] bg-[#FCEEF2]'
                              : 'border-[#E5CFC9] bg-[#F6E9E5]'
                          }`}
                        >
                          <CreditCard className="w-5 h-5 text-[#A90F4D]" />
                          <span className="text-xs font-bold">Cartão de Crédito</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm shadow-lg"
                      >
                        Confirmar Pedido • {formatBRL(cartTotal)}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </main>

          {/* 6. BOTÃO FLUTUANTE DE ATENDIMENTO "VAMOS CONVERSAR?" */}
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-[76px] right-3 sm:right-6 z-30 bg-[#FFF9F3] hover:bg-white text-[#3B231C] pl-2 pr-4 py-2 rounded-full shadow-[0_8px_24px_rgba(89,40,58,0.22)] border border-[#EBD5CF] flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="relative w-8 h-8 rounded-full bg-[#38C958] flex items-center justify-center text-white shadow-xs">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16Z" />
              </svg>
            </span>
            <span className="text-[12.5px] font-semibold tracking-tight">
              Vamos conversar?
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#38C958]" />
          </button>

          {/* 7. MENU INFERIOR FIXO NO CELULAR */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] md:max-w-[960px] z-30 bg-[#FFF9F3] border-t border-[#EAD6D0] px-2 pt-1.5 pb-2 shadow-[0_-4px_20px_rgba(121,83,68,0.08)]">
            <div className="grid grid-cols-5 items-center">
              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setSelectedCategory('all');
                }}
                className={`flex flex-col items-center gap-0.5 py-1 relative ${
                  activeView === 'home' ? 'text-[#A90F4D]' : 'text-[#795344]'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[11px] font-medium">Início</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('catalog')}
                className={`flex flex-col items-center gap-0.5 py-1 relative ${
                  activeView === 'catalog' ? 'text-[#A90F4D]' : 'text-[#795344]'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[11px] font-medium">Categorias</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('favorites')}
                className={`flex flex-col items-center gap-0.5 py-1 relative ${
                  activeView === 'favorites' ? 'text-[#A90F4D]' : 'text-[#795344]'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-[11px] font-medium">Favoritos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('account')}
                className={`flex flex-col items-center gap-0.5 py-1 relative ${
                  activeView === 'account' ? 'text-[#A90F4D]' : 'text-[#795344]'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[11px] font-medium">Minha Conta</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="flex flex-col items-center gap-0.5 py-1 text-[#795344]"
              >
                <Sparkles className="w-5 h-5 text-[#A90F4D]" />
                <span className="text-[11px] font-medium">Atendimento</span>
              </button>
            </div>
          </nav>

          {/* MENU LATERAL */}
          {isSideMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsSideMenuOpen(false)}
              />
              <aside className="relative z-10 w-[82%] max-w-[330px] bg-[#FFF9F3] h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#EFE0DC] pb-3">
                    <div className="flex items-center gap-2">
                      <MimoRoseOutlineSVG className="w-8 h-9" />
                      <span className="font-script text-3xl text-[#A90F4D]">
                        Mimo Rosas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSideMenuOpen(false)}
                      className="p-1.5 rounded-full text-[#795344]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#9A7468] font-semibold px-2 mb-1.5">
                      Categorias da Loja
                    </p>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => navigateCategory(cat.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#4E2F26] hover:bg-[#F6E9E5]"
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="w-4 h-4 text-[#A90F4D]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFE0DC]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSideMenuOpen(false);
                      setAppMode('admin');
                    }}
                    className="w-full py-2.5 rounded-full bg-[#3A1C28] text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Acessar Painel Admin</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* GAVETA DO CARRINHO */}
          {isCartOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsCartOpen(false)}
              />
              <aside className="relative z-10 w-full max-w-[390px] bg-[#FFF9F3] h-full shadow-2xl flex flex-col justify-between">
                <div className="p-4 border-b border-[#EFE0DC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#A90F4D]" />
                    <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">
                      Sua Sacola ({cartCount})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full text-[#795344]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-14 space-y-3">
                      <ShoppingCart className="w-10 h-10 text-[#A90F4D] mx-auto opacity-50" />
                      <p className="text-xs text-[#795344]">Sua sacola está vazia.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.cartKey}
                        className="flex gap-3 bg-[#F6E9E5]/60 p-2.5 rounded-2xl border border-[#EFE0DC]"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#4A2532] line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#795344]">{item.variation}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#A90F4D]">
                              {formatBRL(item.price * item.quantity)}
                            </span>
                            <div className="flex items-center gap-2 bg-[#FFF9F3] px-2 py-0.5 rounded-full border border-[#E5CFC9]">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartKey, -1)}
                              >
                                <Minus className="w-3 h-3 text-[#A90F4D]" />
                              </button>
                              <span className="text-xs font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartKey, 1)}
                              >
                                <Plus className="w-3 h-3 text-[#A90F4D]" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartKey)}
                          className="text-[#9A7468] hover:text-red-600 self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 bg-[#F6E9E5] border-t border-[#E5CFC9] space-y-3">
                    <div className="flex justify-between text-sm font-bold text-[#4A2532]">
                      <span>Subtotal</span>
                      <span className="text-[#A90F4D]">{formatBRL(cartSubtotal)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setOrderSuccess(null);
                        setActiveView('checkout');
                      }}
                      className="w-full py-3.5 rounded-full bg-[#A90F4D] text-white font-semibold text-sm shadow-md"
                    >
                      Finalizar Compra →
                    </button>
                  </div>
                )}
              </aside>
            </div>
          )}

          {/* ASSISTENTE VIRTUAL MIMO ROSAS */}
          {isAssistantOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div
                className="fixed inset-0 bg-black/45 backdrop-blur-xs"
                onClick={() => setIsAssistantOpen(false)}
              />
              <div className="relative z-10 w-full max-w-[430px] h-[84vh] sm:h-[620px] bg-[#FFF9F3] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-[#EBD5CF]">
                <div
                  className="p-4 text-white flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(90deg, #980B44 0%, #A90F4D 100%)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF9F3] flex items-center justify-center">
                      <MimoRoseOutlineSVG className="w-6 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif-display font-bold text-base leading-tight">
                        Assistente Mimo Rosas
                      </h3>
                      <p className="text-[11px] text-[#FAD4E0]">
                        Atendimento Virtual Online
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssistantOpen(false)}
                    className="p-1.5 rounded-full bg-white/15 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6E9E5]/60">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          msg.sender === 'user'
                            ? 'bg-[#A90F4D] text-white rounded-br-xs'
                            : 'bg-[#FFF9F3] text-[#4A2532] border border-[#EBD5CF] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-[90%]">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setIsAssistantOpen(false);
                                openProductDetail(p);
                              }}
                              className="bg-[#FFF9F3] p-2 rounded-xl border border-[#EBD5CF] cursor-pointer hover:border-[#A90F4D] transition"
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-20 object-cover rounded-lg mb-1"
                              />
                              <p className="text-[11px] font-semibold text-[#4A2532] line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-xs font-bold text-[#A90F4D]">
                                {formatBRL(p.price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="px-3 py-2 bg-[#FFF9F3] border-t border-[#EFE0DC] flex gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'produtos', label: '🌹 Conhecer produtos' },
                    { id: 'precos', label: '💰 Consultar preços' },
                    { id: 'presentes', label: '🎁 Encontrar presentes' },
                    { id: 'duvidas', label: '✨ Tirar dúvidas' },
                    { id: 'pedidos', label: '🛍️ Ajuda com pedidos' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAssistantOption(opt.id)}
                      className="px-3 py-1.5 rounded-full bg-[#F6E9E5] hover:bg-[#A90F4D] hover:text-white text-[#A90F4D] text-[11px] font-semibold shrink-0 border border-[#E5CFC9] transition"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleChatSubmit}
                  className="p-3 bg-[#FFF9F3] border-t border-[#EFE0DC] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua dúvida para a Mimo Rosas..."
                    className="flex-1 px-3.5 py-2.5 rounded-full bg-[#F6E9E5] border border-[#E5CFC9] text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-full bg-[#A90F4D] text-white flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL SOBRE A MIMO ROSAS */}
          {isAboutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/45 backdrop-blur-xs"
                onClick={() => setIsAboutModalOpen(false)}
              />
              <div className="relative z-10 bg-[#FFF9F3] max-w-md w-full rounded-[28px] p-6 border border-[#EBD5CF] shadow-2xl text-center space-y-3">
                <MimoRoseOutlineSVG className="w-12 h-14 mx-auto" />
                <h3 className="font-script text-4xl text-[#A90F4D]">Mimo Rosas</h3>
                <p className="text-xs sm:text-sm text-[#5A382E] leading-relaxed">
                  Nascemos da paixão por transformar rituais diários — como o chimarrão, o chá da tarde e o café — em momentos de afeto e beleza.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                >
                  Continuar navegando
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
