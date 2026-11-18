import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Menu, Search, ShoppingCart, Heart, User, Home, LayoutGrid,
  ChevronRight, ChevronLeft, Star, Plus, Minus, Trash2, X, Check,
  Sparkles, Send, MapPin, Truck, Store, CreditCard, QrCode,
  ShieldCheck, SlidersHorizontal, Settings, Package, ClipboardList,
  Database, Bot, Edit3, Copy, RefreshCw, Eye, Lock, CheckCircle2,
  AlertCircle, ExternalLink, Upload, Image as ImageIcon, Camera,
  Loader2, LogIn
} from 'lucide-react';
import { useAuth } from './auth/useAuth';
import AuthPanel from './auth/AuthPanel';
import AccountArea from './account/AccountArea';

// ============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================================
const DEFAULT_SUPABASE_URL = 'https://dktpnqekuxtsqmazelox.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7WyhLNtUeEMNnbE_MyTo2g_IYrCA8AU';
const STORE_CONFIG_CATEGORY_ID = '__mimo_store_config__';

// ============================================================================
// DADOS INICIAIS
// ============================================================================
const INITIAL_CATEGORIES = [
  { id: 'infusoes', name: 'Infusões para Chimarrão, Drinks e Tererê', shortName: 'Infusões para Chimarrão, Drinks e Tererê', iconType: 'cuia', description: 'Pétalas, especiarias e frutas desidratadas para transformar seu ritual.' },
  { id: 'blend', name: 'Blend para Chimarrão', shortName: 'Blend para Chimarrão', iconType: 'leaves', description: 'Combinações autorais de ervas aromáticas e flores selecionadas.' },
  { id: 'capsulas-cafe', name: 'Cápsulas de Café', shortName: 'Cápsulas de Café', iconType: 'coffee-bean', description: 'Cafés especiais com notas florais, caramelo e chocolate.' },
  { id: 'capsulas-cha', name: 'Cápsulas de Chá', shortName: 'Cápsulas de Chá', iconType: 'tea-cup', description: 'Cápsulas artesanais em formato de rosa que desabrocham na xícara.' },
  { id: 'enfeites', name: 'Enfeites de Cuia', shortName: 'Enfeites de Cuia', iconType: 'gift', description: 'Detalhes delicados em resina, pérolas e flores para decorar seu mate.' },
  { id: 'cuias', name: 'Cuias Resinadas', shortName: 'Cuias Resinadas', iconType: 'cuia-resin', description: 'Cuias exclusivas revestidas à mão com acabamento em resina.' },
  { id: 'chaveiros', name: 'Chaveiros em Resina', shortName: 'Chaveiros em Resina', iconType: 'keychain', description: 'Lembranças afetivas com iniciais, pétalas naturais e folha de ouro.' },
  { id: 'bombas', name: 'Bombas de Chimarrão Personalizadas', shortName: 'Bombas Personalizadas', iconType: 'bomba', description: 'Bombas em inox e banhadas com pingentes e pedrarias exclusivas.' }
];

const INITIAL_PRODUCTS = [
  { id: 'prod-1', name: 'Infusões para Chimarrão, Drinks e Tererê', category: 'infusoes', price: 24.9, stock: 32, badge: 'Mais Vendido', badgeType: 'star', featured: true, active: true, rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'], variations: ['Rosas & Hibisco (50g)', 'Cítrico Imperial (50g)', 'Maçã & Canela (50g)'], description: 'Mix artesanal de botões de rosas rubras, hibisco selecionado, cascas de laranja doce e especiarias. Perfeito para decorar e aromatizar seu chimarrão, tererê ou criar drinks autorais.' },
  { id: 'prod-2', name: 'Cápsulas de Chá – Rosa', category: 'capsulas-cha', price: 19.9, stock: 45, badge: 'Novo', badgeType: 'leaf', featured: true, active: true, rating: 5.0, reviews: 94, image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'], variations: ['Caixa com 2 Rosas', 'Caixa Presente com 4 Rosas'], description: 'Nossas icônicas rosas artesanais de chá! Moldadas delicadamente à mão com pétalas comestíveis, ervas aromáticas e brilho perolado próprio para infusão.' },
  { id: 'prod-3', name: 'Blend para Chimarrão – Jardim de Rosas', category: 'blend', price: 22.9, stock: 20, badge: 'Artesanal', badgeType: 'leaf', featured: true, active: true, rating: 4.9, reviews: 67, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'], variations: ['Pote 60g', 'Refil 100g'], description: 'Combinação suave de camomila, erva-doce, capim-limão e pétalas de rosas cor-de-rosa. Deixa o seu mate leve, perfumado e com visual encantador.' },
  { id: 'prod-4', name: 'Cuia Resinada Quartzo Rosa & Ouro', category: 'cuias', price: 119.9, stock: 8, badge: 'Exclusivo', badgeType: 'star', featured: true, active: true, rating: 5.0, reviews: 52, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85'], variations: ['Rosa Porcelana', 'Framboesa Imperial'], description: 'Cuia de porongo selecionado revestida artesanalmente em resina epóxi de alto brilho, com efeito marmorizado quartzo rosa e detalhes em folha de ouro.' },
  { id: 'prod-5', name: 'Cápsulas de Café Gourmet – Flor de Baunilha', category: 'capsulas-cafe', price: 28.9, stock: 26, badge: 'Edição Especial', badgeType: 'star', featured: false, active: true, rating: 4.8, reviews: 41, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85'], variations: ['Caixa c/ 10 Cápsulas (Compatível Nespresso)'], description: 'Café 100% Arábica de torra média com notas naturais de baunilha, caramelo e toque floral aveludado.' },
  { id: 'prod-6', name: 'Kit Enfeites de Cuia – Rosa & Pérola', category: 'enfeites', price: 18.5, stock: 38, badge: 'Delicado', badgeType: 'leaf', featured: false, active: true, rating: 4.9, reviews: 83, image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85'], variations: ['Kit 3 Enfeites Rosé', 'Kit 3 Enfeites Framboesa'], description: 'Trio de enfeites modelados em resina com mini rosas esculpidas, ponto de luz e acabamento perolado para deixar seu chimarrão único.' },
  { id: 'prod-7', name: 'Chaveiro em Resina Inicial com Pétalas Reais', category: 'chaveiros', price: 26.9, stock: 30, badge: 'Presenteável', badgeType: 'star', featured: false, active: true, rating: 5.0, reviews: 112, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85'], variations: ['Letra A–M (Dourado)', 'Letra N–Z (Rosé Gold)', 'Formato Coração'], description: 'Chaveiro artesanal eternizado em resina cristal com pétalas de rosas naturais desidratadas, flocos de ouro e tassel de seda.' },
  { id: 'prod-8', name: 'Bomba de Chimarrão Inox Rosé com Pedra Quartzo', category: 'bombas', price: 64.9, stock: 14, badge: 'Mais Vendido', badgeType: 'star', featured: false, active: true, rating: 4.9, reviews: 76, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'], variations: ['21cm Bico Torto', '23cm Tradicional'], description: 'Bomba em aço inox 304 com acabamento Rosé Gold, anel cravejado com pedra em tom quartzo rosa e bojo desmontável com escovinha.' },
  { id: 'prod-9', name: 'Infusão Frutas Vermelhas & Rosas', category: 'infusoes', price: 26.9, stock: 25, badge: 'Novo', badgeType: 'leaf', featured: false, active: true, rating: 4.9, reviews: 39, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85'], variations: ['Tubo de Vidro 45g', 'Pote Presente 70g'], description: 'Morangos, amoras, mirtilos desidratados e pétalas de rosas. Sabor adocicado e aroma irresistível para gin tônica, chimarrão ou chá gelado.' },
  { id: 'prod-10', name: 'Blend para Chimarrão – Brisa da Manhã', category: 'blend', price: 21.9, stock: 19, badge: null, badgeType: null, featured: false, active: true, rating: 4.8, reviews: 29, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85'], variations: ['Pote 60g'], description: 'Blend refrescante com hortelã-pimenta, Marcela do campo, anis-estrelado e flores de jasmim.' },
  { id: 'prod-11', name: 'Cápsulas de Café – Avelã & Cacau', category: 'capsulas-cafe', price: 29.9, stock: 22, badge: null, badgeType: null, featured: false, active: true, rating: 4.9, reviews: 34, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85'], variations: ['Caixa c/ 10 Cápsulas'], description: 'Espresso encorpado e cremoso com aroma envolvente de avelãs tostadas e fundo de cacau nobre.' },
  { id: 'prod-12', name: 'Cápsulas de Chá – Rosa Branca & Pêssego', category: 'capsulas-cha', price: 21.9, stock: 30, badge: 'Artesanal', badgeType: 'leaf', featured: false, active: true, rating: 5.0, reviews: 61, image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85'], variations: ['Caixa com 2 Rosas'], description: 'Cápsula em formato de rosa esculpida com chá branco, pedacinhos de pêssego e pétalas aromáticas.' },
  { id: 'prod-13', name: 'Enfeite de Cuia Borboleta Cristal Rosé', category: 'enfeites', price: 14.9, stock: 40, badge: null, badgeType: null, featured: false, active: true, rating: 4.9, reviews: 48, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85'], variations: ['Unidade Rosé', 'Dupla Borboleta + Rosa'], description: 'Enfeite de cuia com haste em inox e borboleta em resina translúcida com glitter fino furta-cor.' },
  { id: 'prod-14', name: 'Cuia Resinada Pérola Imperial Personalizada', category: 'cuias', price: 129.9, stock: 10, badge: 'Personalizável', badgeType: 'star', featured: false, active: true, rating: 5.0, reviews: 44, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85'], variations: ['Com Inicial Dourada', 'Sem Inicial'], description: 'Cuia artesanal com bocal em inox e acabamento perolado creme e rosa antigo.' },
  { id: 'prod-15', name: 'Chaveiro Resina Mini Rosa Eternizada', category: 'chaveiros', price: 29.9, stock: 18, badge: 'Novo', badgeType: 'leaf', featured: false, active: true, rating: 5.0, reviews: 57, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85'], variations: ['Redondo Dourado', 'Hexagonal Rosé'], description: 'Pingente de chaveiro com um botão de rosa real desidratado e preservado dentro da resina cristalina.' },
  { id: 'prod-16', name: 'Bomba de Chimarrão Banhada Ouro c/ Pingente Rosa', category: 'bombas', price: 79.9, stock: 12, badge: 'Premium', badgeType: 'star', featured: false, active: true, rating: 5.0, reviews: 63, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85', gallery: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85'], variations: ['19cm', '21cm', '23cm'], description: 'Bomba de chimarrão com banho dourado verniz italiano e pingente exclusivo da rosa Mimo Rosas.' }
];

const INITIAL_ORDERS = [
  { id: 'MR-94821', customerName: 'Carolina Mendes', phone: '(54) 99912-3456', deliveryMethod: 'delivery', address: 'Rua das Hortênsias, 420 - Gramado/RS', cep: '95670-000', paymentMethod: 'pix', status: 'Pago', total: 64.7, createdAt: 'Hoje, 14:20', items: [{ name: 'Infusões para Chimarrão, Drinks e Tererê', qty: 1, price: 24.9 }, { name: 'Cápsulas de Chá – Rosa', qty: 2, price: 19.9 }] }
];

const HERO_SLIDES = [
  { id: 1, titleLine1: 'Pequenos detalhes,', titleLine2: 'grandes', titleScript: 'momentos.', subtitle: 'Presentes, aromas e sabores para tornar a vida mais especial.', cta: 'Conheça nossos produtos', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85', targetCategory: 'all' },
  { id: 2, titleLine1: 'Seu chimarrão com', titleLine2: 'toque de', titleScript: 'poesia.', subtitle: 'Infusões florais, blends selecionados e cuias resinadas feitas à mão.', cta: 'Ver linha Chimarrão', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85', targetCategory: 'infusoes' },
  { id: 3, titleLine1: 'Presentes que', titleLine2: 'encantam', titleScript: 'corações.', subtitle: 'Cápsulas de chá em formato de rosa e chaveiros personalizados.', cta: 'Escolher um presente', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85', targetCategory: 'capsulas-cha' }
];

// ============================================================================
// ARQUIVOS PARA PUBLICAR NO GITHUB
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

const SUPABASE_SQL_SCHEMA = `-- SCRIPT SQL COMPLETO - MIMO ROSAS
drop table if exists public.orders cascade;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  short_name text,
  icon_type text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  badge text,
  badge_type text default 'star',
  featured boolean default false,
  active boolean default true,
  rating numeric(3,2) default 5.0,
  reviews integer default 10,
  image text,
  gallery jsonb default '[]'::jsonb,
  variations jsonb default '["Padrão"]'::jsonb,
  description text,
  created_at timestamptz default now()
);

create table public.orders (
  id text primary key,
  customer text not null,
  customer_name text,
  phone text,
  email text,
  delivery_method text default 'delivery',
  address text,
  city text,
  cep text,
  notes text,
  total numeric(10,2) not null default 0,
  shipping numeric(10,2) default 0,
  status text default 'Aguardando PIX',
  payment_method text default 'pix',
  date text,
  items jsonb default '[]'::jsonb,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Acesso total categories" on public.categories;
create policy "Acesso total categories" on public.categories for all using (true) with check (true);

drop policy if exists "Acesso total products" on public.products;
create policy "Acesso total products" on public.products for all using (true) with check (true);

drop policy if exists "Acesso total orders" on public.orders;
create policy "Acesso total orders" on public.orders for all using (true) with check (true);

notify pgrst, 'reload schema';`;

const SUPABASE_STORAGE_SQL_ONLY = `-- DESTRAVAR TABELA DE PEDIDOS (ORDERS)
drop table if exists public.orders cascade;

create table public.orders (
  id text primary key,
  customer text not null,
  customer_name text,
  phone text,
  email text,
  delivery_method text default 'delivery',
  address text,
  city text,
  cep text,
  notes text,
  total numeric(10,2) not null default 0,
  shipping numeric(10,2) default 0,
  status text default 'Aguardando PIX',
  payment_method text default 'pix',
  date text,
  items jsonb default '[]'::jsonb,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Acesso total orders" on public.orders
  for all using (true) with check (true);

notify pgrst, 'reload schema';`;

// ============================================================================
// SVGs DA MARCA
// ============================================================================
const MimoRoseOutlineSVG = ({ className = 'w-11 h-12', strokeColor = '#A90F4D' }) => (
  <svg viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Símbolo Rosa Mimo Rosas">
    <path d="M24 18C24 11 32 8 41 8C50 8 59 11 59 18C59 24 49 27 40 27C30 27 24 23 24 18Z" stroke={strokeColor} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M31 17C34 14 46 14 49 17C51 19 46 22 40 22C34 22 29 19 31 17Z" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M36 17.5C38 16.5 42 16.5 44 17.5" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M23 16C18 19 16 27 18 36C20 46 28 56 41 56C53 56 61 46 63 35C65 26 62 19 58 16" stroke={strokeColor} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 24C27 31 38 34 52 29" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 33C26 42 40 44 58 31" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M25 46C33 49 48 48 56 41" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M40.5 56V89" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M40.5 76C32 71 23 67 16 69C22 75 31 78 40.5 77Z" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40.5 78C48 74 56 71 63 73C57 79 49 80 40.5 79Z" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartFlourishSVG = ({ className = 'w-64 h-8' }) => (
  <svg viewBox="0 0 260 36" fill="none" className={className}>
    <path d="M8 29C55 18 96 22 130 26C164 22 205 14 252 6" stroke="#A90F4D" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M130 25C126 19 120 12 124 8C127 5 130 9 130 13C130 9 134 5 137 8C141 12 135 19 130 25Z" stroke="#A90F4D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CATEGORY_ICON_OPTIONS = [
  { id: 'gift', label: 'Presente' },
  { id: 'cuia', label: 'Cuia' },
  { id: 'leaves', label: 'Ervas/Blend' },
  { id: 'coffee-bean', label: 'Café' },
  { id: 'tea-cup', label: 'Chá/Xícara' },
  { id: 'cuia-resin', label: 'Resina' },
  { id: 'keychain', label: 'Chaveiro' },
  { id: 'bomba', label: 'Bomba' },
  { id: 'rose', label: 'Rosa' },
  { id: 'candle', label: 'Vela' },
  { id: 'diffuser', label: 'Difusor' },
  { id: 'drink', label: 'Drinks/Gin' },
  { id: 'thermos', label: 'Térmica' },
  { id: 'butterfly', label: 'Borboleta' },
  { id: 'heart-sparkle', label: 'Afeto/Amor' },
  { id: 'jar', label: 'Pote/Tubo' },
  { id: 'jewelry', label: 'Pingente' },
  { id: 'mateira', label: 'Mateira' },
  { id: 'chocolate', label: 'Doces' },
  { id: 'crown', label: 'Imperial' },
  { id: 'star-wand', label: 'Personalizado' },
  { id: 'coaster', label: 'Porta-Copo' },
  { id: 'bouquet', label: 'Buquê' },
  { id: 'spoon', label: 'Colher/Mimo' }
];

const CategoryIconSVG = ({ type }) => {
  const stroke = '#A90F4D';
  switch (type) {
    case 'cuia':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M29 9L34 5" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M25 18L31 7" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M15 18H33" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M14 20C12 25 13 33 19 36C22 37.5 26 37.5 29 36C35 33 36 25 34 20H14Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M18 40H30" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M20 36.5L19 40M28 36.5L29 40" stroke={stroke} strokeWidth="2" strokeLinecap="round" /></svg>);
    case 'leaves':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M24 36C24 25 18 16 9 14C9 24 14 33 24 36Z" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M24 36C24 24 30 15 39 13C39 23 34 33 24 36Z" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M24 39V22" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M15 21L24 31" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" /><path d="M33 20L24 30" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" /></svg>);
    case 'coffee-bean':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><ellipse cx="21" cy="24" rx="9" ry="12" transform="rotate(-18 21 24)" stroke={stroke} strokeWidth="2" /><path d="M18 13C22 19 19 28 23 35" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M28 14C33 15 37 20 36 27C35 33 31 36 26 35" stroke={stroke} strokeWidth="2" strokeLinecap="round" /></svg>);
    case 'tea-cup':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M20 12C20 10 22 9 22 7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M26 12C26 10 28 9 28 7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M12 18H32V24C32 30 27.5 34 22 34C16.5 34 12 30 12 24V18Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M32 20H35.5C37.5 20 39 21.5 39 23.5C39 25.5 37.5 27 35.5 27H31.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M10 37H35" stroke={stroke} strokeWidth="2" strokeLinecap="round" /></svg>);
    case 'gift':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><rect x="11" y="18" width="26" height="7" rx="1.5" stroke={stroke} strokeWidth="2" /><path d="M13 25V37C13 38.1 13.9 39 15 39H33C34.1 39 35 38.1 35 37V25" stroke={stroke} strokeWidth="2" /><path d="M24 18V39" stroke={stroke} strokeWidth="2" /><path d="M24 18C20 18 16 15.5 16 12.5C16 10.5 18 9 20 9C22.5 9 24 12 24 18Z" stroke={stroke} strokeWidth="2" /><path d="M24 18C28 18 32 15.5 32 12.5C32 10.5 30 9 28 9C25.5 9 24 12 24 18Z" stroke={stroke} strokeWidth="2" /></svg>);
    case 'cuia-resin':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M14 16H34L32 30C31 34 27.5 37 24 37C20.5 37 17 34 16 30L14 16Z" stroke={stroke} strokeWidth="2" /><path d="M15 24C20 27 27 22 33 25" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M19 40H29" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M35 10L36 13L39 14L36 15L35 18L34 15L31 14L34 13L35 10Z" fill={stroke} /></svg>);
    case 'keychain':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><circle cx="24" cy="13" r="5" stroke={stroke} strokeWidth="2" /><path d="M24 18V23" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M24 39C18 34 14 29.5 14 25.5C14 22.5 16.5 20.5 19 20.5C21 20.5 23 22 24 23.5C25 22 27 20.5 29 20.5C31.5 20.5 34 22.5 34 25.5C34 29.5 30 34 24 39Z" stroke={stroke} strokeWidth="2" /></svg>);
    case 'bomba':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M31 9L19 31" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" /><path d="M31 9L35 7" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" /><circle cx="25" cy="20" r="3" fill="#F6E9E5" stroke={stroke} strokeWidth="1.8" /><ellipse cx="17" cy="35" rx="5" ry="6" transform="rotate(25 17 35)" stroke={stroke} strokeWidth="2" /></svg>);
    case 'rose':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M16 14C16 10 20 8 24 8C28 8 32 10 32 14C32 17 28 19 24 19C20 19 16 17 16 14Z" stroke={stroke} strokeWidth="2" /><path d="M15 13C12 16 12 24 17 28C21 31 27 31 31 28C36 24 36 16 33 13" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M24 30V41" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M24 36C20 33 16 32 13 34C16 37 20 38 24 37" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M24 37C28 34 32 33 35 35C32 38 28 39 24 38" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /></svg>);
    case 'candle':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M24 8C21 12 20 14.5 22 17C23.2 18.2 24.8 18.2 26 17C28 14.5 27 12 24 8Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M24 18V21" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><rect x="14" y="21" width="20" height="18" rx="3" stroke={stroke} strokeWidth="2" /><path d="M14 27H34" stroke={stroke} strokeWidth="1.8" /><circle cx="35" cy="12" r="1.5" fill={stroke} /></svg>);
    case 'diffuser':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M19 8L23 21M29 8L25 21M24 7V21" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><rect x="20" y="20" width="8" height="4" rx="1" stroke={stroke} strokeWidth="2" /><path d="M16 28C16 25.5 18 24 20 24H28C30 24 32 25.5 32 28V37C32 38.7 30.7 40 29 40H19C17.3 40 16 38.7 16 37V28Z" stroke={stroke} strokeWidth="2" /><path d="M19 32H29" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" /></svg>);
    case 'drink':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M13 14H35L24 27L13 14Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M24 27V38" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M18 38H30" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M28 9L23 20" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><circle cx="16" cy="14" r="4" stroke={stroke} strokeWidth="1.8" /></svg>);
    case 'thermos':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><rect x="19" y="8" width="10" height="5" rx="1.5" stroke={stroke} strokeWidth="2" /><path d="M16 17C16 14.8 17.8 13 20 13H28C30.2 13 32 14.8 32 17V37C32 38.7 30.7 40 29 40H19C17.3 40 16 38.7 16 37V17Z" stroke={stroke} strokeWidth="2" /><path d="M32 19H35C36.7 19 38 20.3 38 22V29C38 30.7 36.7 32 35 32H32" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M16 24H32" stroke={stroke} strokeWidth="1.8" /></svg>);
    case 'butterfly':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M24 14V35" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M24 19C19 11 10 12 10 20C10 25 16 26 24 25C17 27 13 32 16 36C18 39 22 36 24 31" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M24 19C29 11 38 12 38 20C38 25 32 26 24 25C31 27 35 32 32 36C30 39 26 36 24 31" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'heart-sparkle':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M24 38C16 32 11 26.5 11 20.5C11 16.5 14 13.5 18 13.5C20.5 13.5 22.8 15 24 17C25.2 15 27.5 13.5 30 13.5C34 13.5 37 16.5 37 20.5C37 26.5 32 32 24 38Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M36 8L37 11L40 12L37 13L36 16L35 13L32 12L35 11L36 8Z" fill={stroke} /></svg>);
    case 'jar':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><rect x="18" y="9" width="12" height="5" rx="1.5" stroke={stroke} strokeWidth="2" /><path d="M16 14H32L34 18V36C34 38.2 32.2 40 30 40H18C15.8 40 14 38.2 14 36V18L16 14Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M19 25C21 23 27 23 29 25M21 30C23 32 25 32 27 30" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /></svg>);
    case 'jewelry':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M14 10C16 18 20 22 24 22C28 22 32 18 34 10" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /><path d="M24 22L17 31L24 40L31 31L24 22Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M17 31H31" stroke={stroke} strokeWidth="1.6" /></svg>);
    case 'mateira':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M18 18V14C18 10.7 20.7 8 24 8C27.3 8 30 10.7 30 14V18" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><path d="M13 18H35L33 38C32.8 39.1 31.9 40 30.8 40H17.2C16.1 40 15.2 39.1 15 38L13 18Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M24 25C22 25 20.5 26.5 20.5 28.2C20.5 30.5 24 33 24 33C24 33 27.5 30.5 27.5 28.2C27.5 26.5 26 25 24 25Z" stroke={stroke} strokeWidth="1.8" /></svg>);
    case 'chocolate':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><rect x="14" y="10" width="20" height="28" rx="2.5" stroke={stroke} strokeWidth="2" /><path d="M24 10V38M14 19H34M14 28H34" stroke={stroke} strokeWidth="1.8" /></svg>);
    case 'crown':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M10 34L13 16L20 24L24 13L28 24L35 16L38 34H10Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><path d="M11 38H37" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><circle cx="24" cy="10" r="1.5" fill={stroke} /></svg>);
    case 'star-wand':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M11 37L26 22" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" /><path d="M31 10L33 15L38 17L33 19L31 24L29 19L24 17L29 15L31 10Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" /><circle cx="19" cy="13" r="1.5" fill={stroke} /><circle cx="36" cy="29" r="1.5" fill={stroke} /></svg>);
    case 'coaster':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M24 10C32 10 38 15 39 23C40 31 33 38 25 38C16 38 10 33 10 24C10 16 16 10 24 10Z" stroke={stroke} strokeWidth="2" /><path d="M16 22C21 26 27 19 33 24" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" /><circle cx="22" cy="17" r="1.5" fill={stroke} /><circle cx="28" cy="30" r="1.5" fill={stroke} /></svg>);
    case 'bouquet':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><path d="M16 18L24 38L32 18" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 31H29" stroke={stroke} strokeWidth="2" strokeLinecap="round" /><circle cx="19" cy="14" r="3.5" stroke={stroke} strokeWidth="1.8" /><circle cx="29" cy="14" r="3.5" stroke={stroke} strokeWidth="1.8" /><circle cx="24" cy="11" r="3.5" stroke={stroke} strokeWidth="1.8" /></svg>);
    case 'spoon':
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><ellipse cx="29" cy="16" rx="6" ry="8" transform="rotate(35 29 16)" stroke={stroke} strokeWidth="2" /><path d="M24 22L12 38" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" /><path d="M15 31L19 34" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /></svg>);
    default:
      return (<svg viewBox="0 0 48 48" fill="none" className="w-8 h-8"><rect x="11" y="18" width="26" height="7" rx="1.5" stroke={stroke} strokeWidth="2" /><path d="M13 25V37C13 38.1 13.9 39 15 39H33C34.1 39 35 38.1 35 37V25" stroke={stroke} strokeWidth="2" /><path d="M24 18V39" stroke={stroke} strokeWidth="2" /></svg>);
  }
};

const formatBRL = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Normaliza variações (aceita strings antigas ou objetos { name, image, price }, ignorando o item de metadados __mimo_meta__)
const normalizeVariationItem = (v) => {
  if (!v || v.__mimo_meta__) return null;
  if (typeof v === 'string') return { name: v.trim() || 'Padrão', image: '', price: '' };
  return {
    name: String(v.name || v.label || 'Padrão').trim(),
    image: String(v.image || '').trim(),
    price: v.price !== undefined && v.price !== null && v.price !== '' ? Number(v.price) : ''
  };
};

const normalizeVariationsList = (variations) => {
  if (!Array.isArray(variations) || variations.length === 0) {
    return [{ name: 'Padrão', image: '', price: '' }];
  }
  const list = variations
    .map(normalizeVariationItem)
    .filter((item) => item && item.name.length > 0);
  return list.length > 0 ? list : [{ name: 'Padrão', image: '', price: '' }];
};

// Extrai as configurações de Personalização e Grupos de Combinação (ex: Decoração / Enfeite ao redor)
const DEFAULT_CUSTOMIZATION = {
  enabled: false,
  askInitial: true,
  askName: true,
  askNotes: false,
  required: true,
  promptLabel: 'Informe a letra inicial e/ou o nome para personalizar sua peça:',
  addonGroups: []
};

const extractProductCustomization = (productOrVariations) => {
  if (!productOrVariations) return { ...DEFAULT_CUSTOMIZATION, addonGroups: [] };
  if (productOrVariations.customization && typeof productOrVariations.customization === 'object') {
    const c = productOrVariations.customization;
    return {
      ...DEFAULT_CUSTOMIZATION,
      ...c,
      addonGroups: Array.isArray(c.addonGroups) ? c.addonGroups : []
    };
  }
  const arr = Array.isArray(productOrVariations)
    ? productOrVariations
    : (Array.isArray(productOrVariations.variations) ? productOrVariations.variations : []);
  const meta = arr.find((item) => item && typeof item === 'object' && item.__mimo_meta__ === true);
  if (!meta) {
    // Ativa por padrão no chaveiro de inicial do catálogo demonstrativo
    if (productOrVariations?.id === 'prod-7') {
      return {
        ...DEFAULT_CUSTOMIZATION,
        enabled: true,
        askInitial: true,
        askName: true,
        required: true,
        addonGroups: [
          {
            id: 'grp-decor',
            title: 'Decoração / Enfeite ao redor',
            options: [
              { name: 'Pétalas Naturais + Folha de Ouro', image: '', extraPrice: '' },
              { name: 'Pérolas + Mini Rosas Brancas', image: '', extraPrice: '' },
              { name: 'Glitter Rosé + Borboleta', image: '', extraPrice: '' }
            ]
          }
        ]
      };
    }
    return { ...DEFAULT_CUSTOMIZATION, addonGroups: [] };
  }
  return {
    enabled: Boolean(meta.enabled),
    askInitial: meta.askInitial !== false,
    askName: meta.askName !== false,
    askNotes: Boolean(meta.askNotes),
    required: meta.required !== false,
    promptLabel: String(meta.promptLabel || DEFAULT_CUSTOMIZATION.promptLabel),
    addonGroups: Array.isArray(meta.addonGroups)
      ? meta.addonGroups.map((g, gIdx) => ({
          id: g.id || `grp-${gIdx}`,
          title: String(g.title || 'Decoração / Enfeite').trim(),
          options: Array.isArray(g.options)
            ? g.options
                .map((o) => ({
                  name: String(o?.name || '').trim(),
                  image: String(o?.image || '').trim(),
                  extraPrice: o?.extraPrice !== undefined && o?.extraPrice !== null && o?.extraPrice !== '' ? Number(o.extraPrice) : ''
                }))
                .filter((o) => o.name.length > 0)
            : []
        }))
      : []
  };
};

const packVariationsWithMeta = (variationItems, customization) => {
  const cleanVars = normalizeVariationsList(variationItems);
  if (!customization) return cleanVars;
  const cleanGroups = (Array.isArray(customization.addonGroups) ? customization.addonGroups : [])
    .map((g, idx) => ({
      id: g.id || `grp-${idx}`,
      title: String(g.title || 'Decoração / Enfeite ao redor').trim(),
      options: (Array.isArray(g.options) ? g.options : [])
        .map((o) => ({
          name: String(o?.name || '').trim(),
          image: String(o?.image || '').trim(),
          extraPrice: o?.extraPrice !== undefined && o?.extraPrice !== null && o?.extraPrice !== '' && Number(o.extraPrice) > 0
            ? Number(String(o.extraPrice).replace(',', '.'))
            : ''
        }))
        .filter((o) => o.name.length > 0)
    }))
    .filter((g) => g.title.length > 0 && g.options.length > 0);

  const hasCustom = Boolean(customization.enabled) || cleanGroups.length > 0;
  if (!hasCustom) return cleanVars;
  return [
    ...cleanVars,
    {
      __mimo_meta__: true,
      enabled: Boolean(customization.enabled),
      askInitial: customization.askInitial !== false,
      askName: customization.askName !== false,
      askNotes: Boolean(customization.askNotes),
      required: customization.required !== false,
      promptLabel: String(customization.promptLabel || DEFAULT_CUSTOMIZATION.promptLabel).trim(),
      addonGroups: cleanGroups
    }
  ];
};

const getVariationName = (v) => (typeof v === 'string' ? v : (v?.name || 'Padrão'));

const findVariationObj = (product, variationName) => {
  const list = normalizeVariationsList(product?.variations);
  if (!variationName) return list[0];
  return list.find((item) => item.name === variationName) || list[0];
};

const generatePixCopyPaste = (pixKey, merchantName, merchantCity, amount, txid = 'MIMOROSAS') => {
  const cleanKey = (pixKey || 'mimorosas@pix.com.br').trim();
  const cleanName = (merchantName || 'MIMO ROSAS').normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25).toUpperCase();
  const cleanCity = (merchantCity || 'GRAMADO').normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15).toUpperCase();
  const valStr = Number(amount || 0).toFixed(2);
  const f = (id, val) => `${id}${String(val.length).padStart(2, '0')}${val}`;
  const gui = f('00', 'br.gov.bcb.pix') + f('01', cleanKey);
  const merchantAccount = f('26', gui);
  const additionalData = f('62', f('05', txid));
  const payload = '000201' + merchantAccount + '52040000' + '5303986' + f('54', valStr) + '5802BR' + f('59', cleanName) + f('60', cleanCity) + additionalData + '6304';
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021; else crc <<= 1;
    }
  }
  const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return payload + crcHex;
};

// ============================================================================
// ROTAS SIMPLES (SPA, sem dependências)
//   /admin  ou  /painel  ->  Painel Administrativo
//   qualquer outra URL   ->  Vitrine
// Funciona também em subpasta (ex.: /mimo-rosas/admin).
// ============================================================================
const ADMIN_SEGMENTS = ['admin', 'painel'];

const stripTrailingSlash = (value) => (value || '/').replace(/\/+$/, '');

const readModeFromUrl = () => {
  try {
    const segments = stripTrailingSlash(window.location.pathname).split('/').filter(Boolean);
    const lastSegment = (segments[segments.length - 1] || '').toLowerCase();
    if (ADMIN_SEGMENTS.includes(lastSegment)) return 'admin';
    if (new URLSearchParams(window.location.search).get('admin') === '1') return 'admin';
    if (stripTrailingSlash(window.location.hash).replace(/^#?\/?/, '').toLowerCase() === 'admin') return 'admin';
  } catch { /* ignora */ }
  return 'store';
};

const modeUrl = (mode) => {
  let segments = [];
  try {
    segments = stripTrailingSlash(window.location.pathname).split('/').filter(Boolean);
    const lastSegment = (segments[segments.length - 1] || '').toLowerCase();
    if (ADMIN_SEGMENTS.includes(lastSegment)) segments.pop();
  } catch { /* ignora */ }
  const basePath = segments.length ? `/${segments.join('/')}` : '';
  return mode === 'admin' ? `${basePath}/admin` : (basePath || '/');
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  const [appMode, setAppMode] = useState(readModeFromUrl);
  const [adminTab, setAdminTab] = useState('products');

  // Troca de "tela" refletindo na URL (permite /admin, botão voltar do navegador, link direto)
  const goToMode = (mode) => {
    setAppMode(mode);
    try {
      const target = modeUrl(mode);
      if (window.location.pathname !== target) window.history.pushState({ mode }, '', target);
    } catch { /* ignora */ }
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch { /* ignora */ }
  };

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try { return localStorage.getItem('mimo_admin_unlocked') === 'true'; } catch { return false; }
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [profilesProbed, setProfilesProbed] = useState(false);

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    try { return localStorage.getItem('mimo_sb_url') || DEFAULT_SUPABASE_URL; } catch { return DEFAULT_SUPABASE_URL; }
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    try { return localStorage.getItem('mimo_sb_key') || DEFAULT_SUPABASE_ANON_KEY; } catch { return DEFAULT_SUPABASE_ANON_KEY; }
  });

  // Autenticação (clientes + administração) via Supabase Auth
  const auth = useAuth({ url: supabaseUrl, key: supabaseKey });

  const [sbStatus, setSbStatus] = useState({ connected: false, loading: false, message: 'Verificando conexão com o Supabase...' });

  const [categories, setCategories] = useState(() => {
    try { const s = localStorage.getItem('mimo_db_categories'); return s ? JSON.parse(s) : INITIAL_CATEGORIES; } catch { return INITIAL_CATEGORIES; }
  });
  const [products, setProducts] = useState(() => {
    try { const s = localStorage.getItem('mimo_db_products'); return s ? JSON.parse(s) : INITIAL_PRODUCTS; } catch { return INITIAL_PRODUCTS; }
  });
  const [orders, setOrders] = useState(() => {
    try { const s = localStorage.getItem('mimo_db_orders'); return s ? JSON.parse(s) : INITIAL_ORDERS; } catch { return INITIAL_ORDERS; }
  });
  const [storeConfig, setStoreConfig] = useState(() => {
    const defaults = {
      whatsappNumber: '5549999999999',
      pixKey: '5549999999999',
      pixHolderName: 'Mimo Rosas Artesanal',
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      maxInstallments: 3,
      autoApproveDemoSeconds: 0,
      freeShippingMin: 120,
      defaultShippingFee: 12,
      shippingBaseFee: 6,
      shippingPerKm: 1.5,
      shippingMaxKm: 50,
      storeLocationText: 'Ateliê Mimo Rosas - Chapecó/SC',
      assistantGreeting: 'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais em Chapecó e região.',
      adminPassword: 'mimo2026'
    };
    try { const s = localStorage.getItem('mimo_db_config'); return s ? { ...defaults, ...JSON.parse(s) } : defaults; } catch { return defaults; }
  });

  const [activeView, setActiveView] = useState(() => {
    // Links diretos: /?conta=1, #conta e retornos do Supabase Auth
    // (confirmação de e-mail, recuperação de senha)
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = String(window.location.hash || '').toLowerCase();
      if (params.get('conta') === '1' || hash === '#conta') return 'account';
      if (hash.includes('type=recovery') || hash.includes('type=signup') || hash.includes('error=')) return 'account';
    } catch { /* ignora */ }
    return 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQty, setProductQty] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedVariationImage, setSelectedVariationImage] = useState('');
  const [unitConfigs, setUnitConfigs] = useState([]);
  const [productCustomError, setProductCustomError] = useState('');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

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

  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVariationIndex, setUploadingVariationIndex] = useState(null);
  const [uploadingAddonTarget, setUploadingAddonTarget] = useState(null);
  const [galleryPickerVarIdx, setGalleryPickerVarIdx] = useState(null);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminProductCategory, setAdminProductCategory] = useState('all');
  const [adminProductFilter, setAdminProductFilter] = useState('all'); // all | featured | low-stock | hidden
  const [adminOrderFilter, setAdminOrderFilter] = useState('all'); // all | paid | pending | production | shipped | done
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState({ id: '', name: '', shortName: '', iconType: 'gift', description: '', isEditing: false });
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [adminToast, setAdminToast] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState({ title: 'Arquivo 1: package.json', code: GITHUB_FILES.packageJson });

  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem('mimo_rosas_cart'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      localStorage.removeItem('mimo_rosas_favs');
      const s = localStorage.getItem('mimo_rosas_favs_v2');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [checkoutData, setCheckoutData] = useState({
    name: '', phone: '', email: '', document: '',
    cep: '', address: '', number: '', complement: '', neighborhood: '', city: '',
    notes: '', deliveryMethod: 'delivery', paymentMethod: 'pix'
  });
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
    cpfCnpj: '',
    installments: 1
  });
  const [cardError, setCardError] = useState('');
  // Pagamento online via Asaas: o site pergunta ao servidor se as chaves já estão configuradas.
  const [asaasConfig, setAsaasConfig] = useState({ enabled: false, env: null });
  const [orderSuccess, setOrderSuccess] = useState(() => {
    try { const s = localStorage.getItem('mimo_active_order'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [pixCheckCount, setPixCheckCount] = useState(0);

  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', sender: 'bot', text: storeConfig.assistantGreeting, time: 'Agora' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const categoryScrollRef = useRef(null);
  const catalogSectionRef = useRef(null);
  const chatEndRef = useRef(null);
  const codePreviewTextareaRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);
  const variationImageInputRef = useRef(null);

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
    } catch { copied = false; }
    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => showAdminToast(`${label} copiado!`))
        .catch(() => showAdminToast(`${label} exibido abaixo para selecionar e copiar.`));
      return;
    }
    showAdminToast(`${label} copiado para a área de transferência!`);
  };

  useEffect(() => {
    const syncFromUrl = () => setAppMode(readModeFromUrl());
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  useEffect(() => { try { localStorage.setItem('mimo_db_categories', JSON.stringify(categories)); } catch { /* ignore */ } }, [categories]);
  useEffect(() => { try { localStorage.setItem('mimo_db_products', JSON.stringify(products)); } catch { /* ignore */ } }, [products]);
  useEffect(() => {
    try {
      localStorage.setItem('mimo_db_orders', JSON.stringify(orders));
      localStorage.setItem('mimo_orders', JSON.stringify(orders));
    } catch { /* ignore */ }
  }, [orders]);
  useEffect(() => {
    try {
      if (orderSuccess) localStorage.setItem('mimo_active_order', JSON.stringify(orderSuccess));
      else localStorage.removeItem('mimo_active_order');
    } catch { /* ignore */ }
  }, [orderSuccess]);
  useEffect(() => { try { localStorage.setItem('mimo_db_config', JSON.stringify(storeConfig)); } catch { /* ignore */ } }, [storeConfig]);
  useEffect(() => { try { localStorage.setItem('mimo_rosas_cart', JSON.stringify(cart)); } catch { /* ignore */ } }, [cart]);
  useEffect(() => { try { localStorage.setItem('mimo_rosas_favs_v2', JSON.stringify(favorites)); } catch { /* ignore */ } }, [favorites]);
  useEffect(() => {
    try {
      localStorage.setItem('mimo_sb_url', supabaseUrl);
      localStorage.setItem('mimo_sb_key', supabaseKey);
    } catch { /* ignore */ }
  }, [supabaseUrl, supabaseKey]);

  const showAdminToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3200);
  };

  // ---------------------------------------------------------------------------
  // Favoritos: localStorage para visitante, tabela `favorites` para quem tem conta
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;
    const syncFavorites = async () => {
      if (!auth.client) return;
      if (!auth.user) {
        // Se saiu de uma conta logada, limpa os favoritos locais daquela conta
        try {
          const prevOwner = localStorage.getItem('mimo_rosas_favs_owner') || '';
          if (prevOwner && prevOwner !== 'guest') {
            localStorage.removeItem('mimo_rosas_favs_owner');
            localStorage.removeItem('mimo_rosas_favs_v2');
            if (active) setFavorites([]);
          }
        } catch { /* ignora */ }
        return;
      }
      try {
        const { data: rows, error } = await auth.client
          .from('favorites')
          .select('product_id')
          .eq('user_id', auth.user.id);
        if (error || !active) return;
        let remote = (rows || []).map((r) => r.product_id);

        // Limpa uma única vez os 2 favoritos ("prod-1" e "prod-2") que vinham hardcoded por padrão
        // nas contas criadas antes desta correção
        const cleanKey = `mimo_rosas_cleaned_defaults_${auth.user.id}`;
        let alreadyCleaned = false;
        try { alreadyCleaned = localStorage.getItem(cleanKey) === '1'; } catch { alreadyCleaned = false; }
        if (!alreadyCleaned) {
          const legacyDefaults = remote.filter((id) => id === 'prod-1' || id === 'prod-2');
          if (legacyDefaults.length > 0) {
            await auth.client
              .from('favorites')
              .delete()
              .eq('user_id', auth.user.id)
              .in('product_id', legacyDefaults);
            remote = remote.filter((id) => id !== 'prod-1' && id !== 'prod-2');
          }
          try { localStorage.setItem(cleanKey, '1'); } catch { /* ignora */ }
        }

        let local = [];
        try { local = JSON.parse(localStorage.getItem('mimo_rosas_favs_v2') || '[]'); } catch { local = []; }

        // Só mescla os favoritos do navegador se a pessoa clicou em favoritar como visitante ('guest')
        let owner = '';
        try { owner = localStorage.getItem('mimo_rosas_favs_owner') || ''; } catch { owner = ''; }
        const shouldMergeGuest = owner === 'guest';
        const merged = shouldMergeGuest ? Array.from(new Set([...remote, ...local])) : remote;
        const toInsert = merged.filter((id) => !remote.includes(id));
        if (toInsert.length > 0) {
          await auth.client.from('favorites').insert(toInsert.map((product_id) => ({ user_id: auth.user.id, product_id })));
        }
        try { localStorage.setItem('mimo_rosas_favs_owner', auth.user.id); } catch { /* ignora */ }
        if (active) setFavorites(merged);
      } catch { /* ignora */ }
    };
    syncFavorites();
    return () => { active = false; };
  }, [auth.client, auth.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preenche o checkout com os dados da conta
  useEffect(() => {
    if (!auth.user) return;
    const meta = auth.user.user_metadata || {};
    setCheckoutData((prev) => ({
      ...prev,
      name: prev.name || auth.profile?.full_name || meta.full_name || '',
      phone: prev.phone || auth.profile?.phone || meta.phone || '',
      email: prev.email || auth.user.email || ''
    }));
  }, [auth.user?.id, auth.profile?.full_name, auth.profile?.phone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // UPLOAD DE FOTOS
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
            if (width > height) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
            else { width = Math.round((width * maxWidth) / height); height = maxWidth; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const uploadSinglePhotoFile = async (file) => {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeFileName = `mimo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext || 'jpg'}`;
    let finalImageUrl = '';
    let usedStorageBucket = false;
    if (cleanUrl && supabaseKey) {
      try {
        const uploadRes = await fetch(`${cleanUrl}/storage/v1/object/products/${safeFileName}`, {
          method: 'POST',
          headers: { apikey: supabaseKey.trim(), Authorization: `Bearer ${supabaseKey.trim()}`, 'Content-Type': file.type || 'image/jpeg', 'x-upsert': 'true' },
          body: file
        });
        if (uploadRes.ok) {
          finalImageUrl = `${cleanUrl}/storage/v1/object/public/products/${safeFileName}`;
          usedStorageBucket = true;
        }
      } catch { /* fallback */ }
    }
    if (!finalImageUrl) finalImageUrl = await compressImageToDataUrl(file, 900, 0.82);
    return { finalImageUrl, usedStorageBucket };
  };

  const uploadProductPhoto = async (fileOrFiles, target = 'main') => {
    if (!fileOrFiles || !editingProduct) return;
    const files = Array.isArray(fileOrFiles)
      ? fileOrFiles
      : (fileOrFiles instanceof FileList ? Array.from(fileOrFiles) : [fileOrFiles]);
    if (files.length === 0) return;

    setUploadingImage(true);
    setUploadStatusMsg(files.length > 1 ? `Enviando ${files.length} fotos...` : 'Enviando e otimizando foto...');
    try {
      let lastBucketUsed = false;
      for (const file of files) {
        const { finalImageUrl, usedStorageBucket } = await uploadSinglePhotoFile(file);
        lastBucketUsed = usedStorageBucket;
        setEditingProduct((prev) => {
          if (!prev) return prev;
          const currentGallery = Array.isArray(prev.gallery) && prev.gallery.length > 0 ? prev.gallery : (prev.image ? [prev.image] : []);
          if (target && typeof target === 'object' && target.type === 'variation') {
            const vIdx = target.index;
            const currentVars = normalizeVariationsList(prev.variationItems || prev.variations);
            const nextVars = currentVars.map((v, i) => (i === vIdx ? { ...v, image: finalImageUrl } : v));
            const nextGallery = currentGallery.includes(finalImageUrl) ? currentGallery : [...currentGallery, finalImageUrl];
            return {
              ...prev,
              image: prev.image || finalImageUrl,
              gallery: nextGallery,
              variationItems: nextVars,
              variations: nextVars
            };
          }
          if (target && typeof target === 'object' && target.type === 'addon') {
            const { groupIndex, optionIndex } = target;
            const currCustom = prev.customization || extractProductCustomization(prev);
            const nextGroups = (currCustom.addonGroups || []).map((grp, gI) => {
              if (gI !== groupIndex) return grp;
              return {
                ...grp,
                options: (grp.options || []).map((opt, oI) => (oI === optionIndex ? { ...opt, image: finalImageUrl } : opt))
              };
            });
            const nextGallery = currentGallery.includes(finalImageUrl) ? currentGallery : [...currentGallery, finalImageUrl];
            return {
              ...prev,
              image: prev.image || finalImageUrl,
              gallery: nextGallery,
              customization: { ...currCustom, addonGroups: nextGroups }
            };
          }
          if (target === 'main') {
            return { ...prev, image: finalImageUrl, gallery: [finalImageUrl, ...currentGallery.filter((u) => u !== finalImageUrl)] };
          }
          const nextGallery = currentGallery.includes(finalImageUrl) ? currentGallery : [...currentGallery, finalImageUrl];
          return { ...prev, image: prev.image || finalImageUrl, gallery: nextGallery };
        });
      }
      setUploadStatusMsg(lastBucketUsed ? '✅ Foto(s) salva(s) no Supabase Storage!' : '✅ Foto(s) otimizada(s) e pronta(s)!');
      showAdminToast(lastBucketUsed ? 'Foto enviada para o Supabase Storage!' : 'Foto carregada com sucesso!');
    } catch (err) {
      setUploadStatusMsg(`Erro ao processar imagem: ${err.message}`);
    } finally {
      setUploadingImage(false);
      setUploadingVariationIndex(null);
    }
  };

  // ============================================================================
  // SUPABASE REST
  // ============================================================================
  const sbHeaders = (prefer = 'return=representation') => ({
    apikey: supabaseKey.trim(),
    // Com sessão ativa, o RLS enxerga o usuário (auth.uid()). Sem sessão, cai na chave pública.
    Authorization: `Bearer ${(auth.accessToken || supabaseKey).trim()}`,
    'Content-Type': 'application/json',
    Prefer: prefer
  });

  const syncStoreConfigToSupabase = async (cfgToSave) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const payload = {
        id: STORE_CONFIG_CATEGORY_ID,
        name: '__CONFIG_SISTEMA_MIMO_ROSAS__',
        short_name: 'Config',
        icon_type: 'config',
        description: JSON.stringify(cfgToSave)
      };
      await fetch(`${cleanUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: sbHeaders('resolution=merge-duplicates,return=representation'),
        body: JSON.stringify([payload])
      });
    } catch { /* ignora */ }
  };

  const verifyOrderPaymentOnMercadoPago = async (orderId, paymentIdParam = null, customToken = null) => {
    const token = (customToken || storeConfig.mercadoPagoAccessToken || '').trim();
    try {
      const srvRes = await fetch('/api/asaas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mp_check',
          orderId,
          paymentId: paymentIdParam,
          accessToken: token || undefined
        })
      });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData?.ok && srvData?.status) {
          return { status: srvData.status, paymentId: srvData.paymentId || paymentIdParam };
        }
      }
    } catch { /* fallback navegador */ }

    if (!token.startsWith('APP_USR-') && !token.startsWith('TEST-')) return null;
    try {
      if (paymentIdParam && paymentIdParam !== 'null') {
        const directRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentIdParam)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (directRes.ok) {
          const d = await directRes.json();
          if (d && d.status) return { status: d.status, paymentId: String(d.id || paymentIdParam) };
        }
      }
      if (orderId) {
        const s = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc`, { headers: { Authorization: `Bearer ${token}` } });
        if (s.ok) {
          const d = await s.json();
          const results = Array.isArray(d.results) ? d.results : [];
          const ap = results.find((p) => p.status === 'approved');
          if (ap) return { status: 'approved', paymentId: String(ap.id) };
          if (results.length > 0) return { status: results[0].status, paymentId: String(results[0].id) };
        }
      }
    } catch { /* falha silenciosa */ }
    return null;
  };

  const fetchFromSupabase = async (silent = false) => {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseKey.trim();
    if (!cleanUrl || !cleanKey) {
      setSbStatus({ connected: false, loading: false, message: 'Cole sua Publishable Key do Supabase para conectar.' });
      return;
    }
    if (!silent) setSbStatus({ connected: false, loading: true, message: 'Testando conexão com o Supabase...' });
    try {
      try {
        const catRes = await fetch(`${cleanUrl}/rest/v1/categories?select=*&order=created_at.asc`, { headers: sbHeaders() });
        if (catRes.ok) {
          const catRows = await catRes.json();
          if (Array.isArray(catRows)) {
            const cfgRow = catRows.find((r) => r.id === STORE_CONFIG_CATEGORY_ID);
            if (cfgRow?.description) {
              try { setStoreConfig((prev) => ({ ...prev, ...JSON.parse(cfgRow.description) })); } catch { /* ignore */ }
            }
            const realCats = catRows
              .filter((r) => r.id && r.id !== STORE_CONFIG_CATEGORY_ID)
              .map((r) => ({
                id: r.id,
                name: r.name || r.short_name || 'Categoria',
                shortName: r.short_name || r.name || 'Categoria',
                iconType: r.icon_type || 'gift',
                description: r.description || ''
              }));
            if (realCats.length > 0) setCategories(realCats);
          }
        }
      } catch { /* segue */ }

      const prodRes = await fetch(`${cleanUrl}/rest/v1/products?select=*&order=created_at.asc`, { headers: sbHeaders() });
      if (!prodRes.ok) {
        const errText = await prodRes.text();
        throw new Error(prodRes.status === 404 || errText.includes('relation') ? 'Tabelas ainda não encontradas. Rode o SQL no SQL Editor do Supabase.' : `Erro (${prodRes.status}): execute o SQL no Supabase.`);
      }
      const dbProducts = await prodRes.json();
      const ordRes = await fetch(`${cleanUrl}/rest/v1/orders?select=*&order=created_at.desc`, { headers: sbHeaders() });
      const dbOrders = ordRes.ok ? await ordRes.json() : [];

      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts.map((p) => ({
          id: p.id, name: p.name, category: p.category || p.category_id || 'infusoes',
          price: Number(p.price), stock: Number(p.stock), badge: p.badge,
          badgeType: p.badge_type || 'star', featured: Boolean(p.featured),
          active: p.active !== false, rating: Number(p.rating || 5), reviews: Number(p.reviews || 12),
          image: p.image,
          gallery: Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.image],
          variations: Array.isArray(p.variations) && p.variations.length ? p.variations : ['Padrão'],
          description: p.description || ''
        })));
      }
      if (Array.isArray(dbOrders)) {
        const EXPIRATION_MS = 30 * 60 * 1000;
        const isExpiredPending = (o) => {
          const st = String(o?.status || 'Aguardando PIX');
          if (!/aguardando/i.test(st) || !o?.created_at) return false;
          const age = Date.now() - new Date(o.created_at).getTime();
          return !Number.isNaN(age) && age > EXPIRATION_MS;
        };

        const expiredOrders = dbOrders.filter(isExpiredPending);
        if (expiredOrders.length > 0) {
          expiredOrders.forEach((exp) => {
            fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(exp.id)}`, {
              method: 'DELETE',
              headers: sbHeaders('return=minimal')
            }).catch(() => {});
          });
        }

        const activeDbOrders = dbOrders.filter((o) => !isExpiredPending(o));
        const mappedOrders = activeDbOrders.map((o) => ({
          id: o.id,
          customer: o.customer || o.customer_name || 'Cliente Mimo Rosas',
          customerName: o.customer || o.customer_name || 'Cliente Mimo Rosas',
          phone: o.phone || '', email: o.email || '',
          deliveryMethod: o.delivery_method || 'delivery',
          address: o.address || '', city: o.city || '', cep: o.cep || '', notes: o.notes || '',
          paymentMethod: o.payment_method || 'pix',
          status: o.status || 'Aguardando PIX',
          total: Number(o.total || 0), shipping: Number(o.shipping || 0),
          mpPaymentId: o.mp_payment_id || null, mpPreferenceId: o.mp_preference_id || null,
          createdAt: o.date || (o.created_at ? new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Recente'),
          items: Array.isArray(o.items) ? o.items : []
        }));
        setOrders(mappedOrders);
      }
      setSbStatus({ connected: true, loading: false, message: `Conectado! (${dbProducts.length} produtos e ${dbOrders.length} pedidos no banco).` });
      if (!silent) showAdminToast('Conectado ao Supabase com sucesso!');
    } catch (err) {
      setSbStatus({ connected: false, loading: false, message: err.message || 'Não foi possível conectar ao Supabase.' });
    }
  };

  const seedInitialDataToSupabase = async () => {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseKey.trim();
    if (!cleanUrl || !cleanKey) { showAdminToast('Preencha a URL e a Publishable Key primeiro!'); return; }
    setSbStatus({ connected: false, loading: true, message: 'Enviando categorias e produtos para o seu Supabase...' });
    try {
      const catPayload = categories.map((c) => ({ id: c.id, name: c.name, short_name: c.shortName, icon_type: c.iconType, description: c.description }));
      const catRes = await fetch(`${cleanUrl}/rest/v1/categories`, { method: 'POST', headers: sbHeaders('resolution=merge-duplicates,return=representation'), body: JSON.stringify(catPayload) });
      if (!catRes.ok) throw new Error(`Erro Supabase (${catRes.status}): ${await catRes.text()}`);
      const prodPayload = products.map((p) => ({
        id: p.id, name: p.name, category: p.category, price: Number(p.price), stock: Number(p.stock),
        badge: p.badge || null, badge_type: p.badgeType || 'star', featured: Boolean(p.featured),
        active: p.active !== false, rating: Number(p.rating || 5.0), reviews: Number(p.reviews || 15),
        image: p.image, gallery: p.gallery || [p.image], variations: p.variations || ['Padrão'], description: p.description || ''
      }));
      const prodRes = await fetch(`${cleanUrl}/rest/v1/products`, { method: 'POST', headers: sbHeaders('resolution=merge-duplicates,return=representation'), body: JSON.stringify(prodPayload) });
      if (!prodRes.ok) throw new Error(`Erro ao gravar produtos: ${await prodRes.text()}`);
      setSbStatus({ connected: true, loading: false, message: 'Sucesso! Categorias e produtos gravados no Supabase!' });
      showAdminToast('Produtos e Categorias enviados ao Supabase!');
    } catch (err) {
      setSbStatus({ connected: false, loading: false, message: `Erro ao enviar dados: ${err.message}` });
    }
  };

  const syncSingleProductToSupabase = async (prod) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const catObj = categories.find((c) => c.id === prod.category) || categories[0];
      let currentPayload = {
        id: String(prod.id || `prod-${Date.now()}`),
        name: String(prod.name || 'Novo Produto').trim(),
        category: catObj ? catObj.id : 'infusoes',
        price: Number(String(prod.price).replace(',', '.')) || 0,
        stock: Math.round(Number(prod.stock) || 0),
        badge: prod.badge && String(prod.badge).trim() !== '' ? String(prod.badge).trim() : null,
        badge_type: prod.badgeType || 'star',
        featured: Boolean(prod.featured),
        active: prod.active !== false,
        rating: Number(prod.rating || 5.0),
        reviews: Math.round(Number(prod.reviews || 15)),
        image: prod.image || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
        gallery: Array.isArray(prod.gallery) && prod.gallery.length > 0 ? prod.gallery : [prod.image || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85'],
        variations: Array.isArray(prod.variations) && prod.variations.length > 0 ? prod.variations : ['Padrão'],
        description: prod.description || ''
      };
      for (let attempt = 0; attempt < 6; attempt++) {
        const res = await fetch(`${cleanUrl}/rest/v1/products`, { method: 'POST', headers: sbHeaders('resolution=merge-duplicates,return=representation'), body: JSON.stringify([currentPayload]) });
        if (res.ok) return;
        const errText = await res.text();
        const m = errText.match(/Could not find the '([^']+)' column/);
        if (m && m[1]) { const n = { ...currentPayload }; delete n[m[1]]; currentPayload = n; continue; }
        console.error('Erro Supabase ao salvar produto:', errText);
        break;
      }
    } catch (err) { console.error('Erro de conexão ao salvar produto:', err); }
  };

  const saveOrderToSupabase = async (orderObj) => {
    if (!supabaseUrl || !supabaseKey) return false;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      let currentPayload = {
        id: String(orderObj.id),
        customer: String(orderObj.customer || orderObj.customerName || 'Cliente'),
        customer_name: String(orderObj.customerName || orderObj.customer || 'Cliente'),
        phone: String(orderObj.phone || ''), email: String(orderObj.email || ''),
        delivery_method: String(orderObj.deliveryMethod || 'delivery'),
        address: String(orderObj.address || ''), city: String(orderObj.city || ''),
        cep: String(orderObj.cep || ''), notes: String(orderObj.notes || ''),
        payment_method: String(orderObj.paymentMethod || 'pix'),
        status: String(orderObj.status || 'Aguardando PIX'),
        total: Number(orderObj.total || 0), shipping: Number(orderObj.shipping || 0),
        date: String(orderObj.date || orderObj.createdAt || new Date().toLocaleString('pt-BR')),
        items: Array.isArray(orderObj.items) ? orderObj.items : [],
        mp_payment_id: orderObj.mpPaymentId ? String(orderObj.mpPaymentId) : null,
        mp_preference_id: orderObj.mpPreferenceId ? String(orderObj.mpPreferenceId) : null,
        user_id: orderObj.userId || (auth.user ? auth.user.id : null)
      };
      for (let attempt = 0; attempt < 12; attempt++) {
        // return=minimal: com o RLS fechado o cliente anônimo não pode reler o pedido
        // (RETURNING exigiria permissão de SELECT), então não pedimos a linha de volta.
        const res = await fetch(`${cleanUrl}/rest/v1/orders`, { method: 'POST', headers: sbHeaders('return=minimal'), body: JSON.stringify([currentPayload]) });
        if (res.ok) return true;
        // 409 = pedido já gravado com esse id
        if (res.status === 409) return true;
        const errText = await res.text();
        const m = errText.match(/Could not find the '([^']+)' column/);
        if (m && m[1]) { const n = { ...currentPayload }; delete n[m[1]]; currentPayload = n; continue; }
        console.error('Erro Supabase ao salvar pedido:', errText);
        break;
      }
    } catch (err) { console.error('Erro de rede ao salvar pedido:', err); }
    return false;
  };

  useEffect(() => { if (supabaseUrl && supabaseKey) fetchFromSupabase(true); }, []); // eslint-disable-line

  // ---------------------------------------------------------------------------
  // Asaas: descobre se o pagamento online (PIX/cartão com confirmação
  // automática) está ligado no servidor. Em `npm run dev` o /api não existe,
  // então cai automaticamente no fluxo antigo.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/asaas/config', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setAsaasConfig({ enabled: Boolean(data?.enabled), env: data?.env || null });
      } catch { /* dev local / offline: mantém desligado */ }
    })();
    return () => { alive = false; };
  }, []);

  // Link direto para o pedido em aberto: /?pedido=MR-12345
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pedido = params.get('pedido');
      if (pedido && orderSuccess?.code === pedido) setActiveView('checkout');
    } catch { /* ignora */ }
  }, []); // eslint-disable-line

  // Consulta o Asaas pelo status do pedido (usado na tela de acompanhamento).
  const verifyAsaasPayment = async (orderCode) => {
    if (!orderCode) return null;
    try {
      const res = await fetch(`/api/asaas/status?order=${encodeURIComponent(orderCode)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  // ---------------------------------------------------------------------------
  // Status do pedido sem expor dados pessoais (função `order_status` no Supabase).
  // Usado pelo acompanhamento de PIX/Mercado Pago, inclusive para visitantes.
  // ---------------------------------------------------------------------------
  const fetchOrderStatus = async (orderId) => {
    if (!supabaseUrl || !supabaseKey || !orderId) return null;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/rpc/order_status`, {
        method: 'POST',
        headers: sbHeaders('return=representation'),
        body: JSON.stringify({ p_order_id: String(orderId) })
      });
      if (!res.ok) return null;
      const value = await res.json();
      return typeof value === 'string' ? value : null;
    } catch { return null; }
  };

  // Marca o próprio pedido como "Pago" (função `claim_order_paid`).
  // Só funciona para o dono do pedido; visitantes são confirmados pela loja.
  const markOwnOrderPaid = async (orderId) => {
    if (!supabaseUrl || !supabaseKey || !orderId) return false;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/rpc/claim_order_paid`, {
        method: 'POST',
        headers: sbHeaders('return=representation'),
        body: JSON.stringify({ p_order_id: String(orderId) })
      });
      if (!res.ok) return false;
      return (await res.json()) === true;
    } catch { return false; }
  };

  // Dispara e-mail automático de atualização de status do pedido via Resend (/api/asaas/config)
  const notifyCustomerOrderStatusEmail = async (orderOrId, status) => {
    try {
      const code = typeof orderOrId === 'object' && orderOrId ? (orderOrId.id || orderOrId.code) : String(orderOrId || '');
      if (!code || !status) return false;
      const dedupKey = `mimo_email_sent_${code}_${status}`;
      try {
        if (localStorage.getItem(dedupKey) === '1') return false;
      } catch { /* ignore */ }

      let fullOrder = typeof orderOrId === 'object' && orderOrId?.email ? orderOrId : null;
      if (!fullOrder) {
        fullOrder = orders.find((o) => o.id === code) || null;
      }
      if (!fullOrder) {
        try {
          const saved = JSON.parse(localStorage.getItem('mimo_db_orders') || '[]');
          fullOrder = saved.find((o) => o.id === code) || null;
        } catch { /* ignore */ }
      }
      if (!fullOrder && supabaseUrl && supabaseKey) {
        try {
          const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
          const res = await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(code)}&select=*&limit=1`, { headers: sbHeaders() });
          if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows) && rows[0]) fullOrder = rows[0];
          }
        } catch { /* ignore */ }
      }
      if (!fullOrder && auth.user?.email) {
        fullOrder = {
          id: code,
          customer: orderSuccess?.customer || auth.profile?.full_name || 'Cliente Mimo Rosas',
          email: auth.user.email,
          total: orderSuccess?.total || 0,
          items: []
        };
      }

      const res = await fetch('/api/asaas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_order_status',
          orderId: code,
          order: fullOrder,
          status,
          resendApiKey: storeConfig.resendApiKey || '',
          resendFrom: storeConfig.resendFromEmail || '',
          siteOrigin: window.location.origin
        })
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        try { localStorage.setItem(dedupKey, '1'); } catch { /* ignore */ }
        return true;
      }
    } catch { /* ignore */ }
    return false;
  };

  // Marca o pedido como "Pago" tanto na memória quanto no Supabase (via RPC do cliente, API e PATCH)
  const persistOrderPaidEverywhere = async (orderId) => {
    if (!orderId) return false;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'Pago' } : o)));
    try {
      await Promise.allSettled([
        markOwnOrderPaid(orderId),
        fetch('/api/asaas/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_paid', orderId: String(orderId) })
        }),
        supabaseUrl && supabaseKey
          ? fetch(`${supabaseUrl.trim().replace(/\/$/, '')}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
              method: 'PATCH',
              headers: sbHeaders('return=minimal'),
              body: JSON.stringify({ status: 'Pago' })
            })
          : Promise.resolve(),
        notifyCustomerOrderStatusEmail(orderId, 'Pago')
      ]);
      return true;
    } catch {
      return false;
    }
  };

  // Ao entrar como administradora, recarrega os dados que o RLS libera só para admin
  useEffect(() => {
    if (auth.isAdmin && appMode === 'admin') fetchFromSupabase(true);
  }, [auth.isAdmin, appMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // RETORNO DO CHECKOUT PRO MERCADO PAGO
  // ============================================================================
  useEffect(() => {
    if (auth.loading) return;
    const handleMercadoPagoReturn = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const mpReturn = params.get('mp_return');
        const collectionStatus = params.get('collection_status') || params.get('status') || params.get('mp_status');
        const orderRef = params.get('external_reference') || params.get('order_id');
        const paymentId = params.get('payment_id') || params.get('collection_id');
        if (!orderRef && !mpReturn && !collectionStatus) return;
        setActiveView('checkout');

        let savedOrdersList = [];
        try { savedOrdersList = JSON.parse(localStorage.getItem('mimo_db_orders') || '[]'); } catch { savedOrdersList = []; }
        let foundOrder = savedOrdersList.find((o) => o.id === orderRef);

        if (!foundOrder && supabaseUrl && supabaseKey && orderRef) {
          try {
            const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
            const res = await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderRef)}&select=*`, { headers: sbHeaders() });
            if (res.ok) {
              const rows = await res.json();
              if (Array.isArray(rows) && rows[0]) {
                const o = rows[0];
                foundOrder = { id: o.id, customer: o.customer || o.customer_name || 'Cliente Mimo Rosas', customerName: o.customer || o.customer_name || 'Cliente Mimo Rosas', phone: o.phone || '', total: Number(o.total || 0), paymentMethod: o.payment_method || 'mercadopago', deliveryMethod: o.delivery_method || 'delivery', status: o.status || 'Aguardando PIX', items: Array.isArray(o.items) ? o.items : [] };
              }
            }
          } catch { /* fallback */ }
        }
        const totalVal = foundOrder ? Number(foundOrder.total || 0) : Number(orderSuccess?.total || 0);
        const customerName = foundOrder ? (foundOrder.customerName || foundOrder.customer) : (orderSuccess?.customer || 'Cliente Mimo Rosas');

        let isReallyApproved = collectionStatus === 'approved' || mpReturn === 'success' && collectionStatus === 'approved' || foundOrder?.status === 'Pago';
        if (!isReallyApproved && orderRef) {
          const mpCheck = await verifyOrderPaymentOnMercadoPago(orderRef, paymentId);
          if (mpCheck && mpCheck.status === 'approved') isReallyApproved = true;
        }
        if (isReallyApproved && orderRef) {
          await persistOrderPaidEverywhere(orderRef);
        }

        const pixCode = generatePixCopyPaste(storeConfig.pixKey || storeConfig.whatsappNumber, storeConfig.pixHolderName || 'MIMO ROSAS', 'BRASIL', totalVal || 1, (orderRef || 'MIMOROSAS').replace(/[^A-Z0-9]/g, ''));

        setOrderSuccess((prev) => ({
          ...(prev || {}), code: orderRef || prev?.code || 'MR-PEDIDO', customer: customerName,
          total: totalVal, method: 'mercadopago',
          delivery: foundOrder?.deliveryMethod || prev?.delivery || 'delivery',
          paymentConfirmed: isReallyApproved,
          mpPaymentId: (paymentId && paymentId !== 'null') ? paymentId : (prev?.mpPaymentId || null),
          mpCheckoutProUrl: prev?.mpCheckoutProUrl || null,
          pixCode: prev?.pixCode || pixCode,
          qrCodeUrl: prev?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(pixCode)}`,
          whatsappUrl: `https://wa.me/${(storeConfig.whatsappNumber || '5554999999999').replace(/\D/g, '')}?text=${encodeURIComponent(isReallyApproved ? `Olá Mimo Rosas! 🌹 Meu pagamento do pedido *${orderRef}* (${formatBRL(totalVal)}) já foi confirmado automaticamente!` : `Olá Mimo Rosas! 🌹 Fiz o pedido *${orderRef}* (${formatBRL(totalVal)}) e estou finalizando o pagamento.`)}`
        }));
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch { /* ignora */ }
    };
    handleMercadoPagoReturn();
  }, [supabaseUrl, supabaseKey, auth.loading, auth.accessToken]); // eslint-disable-line

  useEffect(() => {
    if (activeView !== 'home' || appMode !== 'store') return;
    const interval = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(interval);
  }, [activeView, appMode]);

  useEffect(() => { if (isAssistantOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isAssistantOpen, isBotTyping]);

  // ============================================================================
  // CARRINHO E CÁLCULO DE FRETE POR KM (CHAPECÓ/SC E REGIÃO PRÓXIMA)
  // ============================================================================
  const CHAPECO_REGION_ZONES = [
    { id: 'chapeco-centro', label: 'Chapecó • Centro', city: 'Chapecó/SC', km: 2, keywords: ['centro'] },
    { id: 'chapeco-goretti', label: 'Chapecó • Maria Goretti / Jardim Itália / Bela Vista', city: 'Chapecó/SC', km: 3, keywords: ['goretti', 'jardim italia', 'jardim itália', 'bela vista', 'presidente medici', 'presidente médici'] },
    { id: 'chapeco-passo', label: 'Chapecó • Passo dos Fortes / Líder / Santa Maria', city: 'Chapecó/SC', km: 4, keywords: ['passo dos fortes', 'lider', 'líder', 'santa maria', 'sao cristovao', 'são cristóvão', 'santo antonio', 'santo antônio', 'saic'] },
    { id: 'chapeco-univ', label: 'Chapecó • Universitário / Esplanada / Jardins', city: 'Chapecó/SC', km: 4.5, keywords: ['universitario', 'universitário', 'esplanada', 'jardins', 'boa vista'] },
    { id: 'chapeco-palmeiras', label: 'Chapecó • Parque das Palmeiras / Palmital / Cristo Rei', city: 'Chapecó/SC', km: 5.5, keywords: ['palmeiras', 'palmital', 'cristo rei', 'eldorado'] },
    { id: 'chapeco-pinheirinho', label: 'Chapecó • Pinheirinho / Alvorada / Engenho Braun', city: 'Chapecó/SC', km: 6, keywords: ['pinheirinho', 'alvorada', 'engenho braun', 'sao pedro', 'são pedro', 'bom pastor', 'vila real', 'paraiso', 'paraíso'] },
    { id: 'chapeco-seminario', label: 'Chapecó • Seminário / Quedas do Palmital / Belvedere', city: 'Chapecó/SC', km: 7.5, keywords: ['seminario', 'seminário', 'quedas', 'belvedere', 'trevo'] },
    { id: 'chapeco-efapi', label: 'Chapecó • Efapi / Loteamento Universitário / Colatto', city: 'Chapecó/SC', km: 8.5, keywords: ['efapi', 'colatto', 'desbravador', 'alta floresta'] },
    { id: 'chapeco-bormann', label: 'Chapecó • Marechal Bormann / Goio-Ên / Interior', city: 'Chapecó/SC', km: 14, keywords: ['bormann', 'goio-en', 'goio-ên', 'linha', 'interior'] },
    { id: 'cordilheira-alta', label: 'Região • Cordilheira Alta / SC (~14 km)', city: 'Cordilheira Alta/SC', km: 14, keywords: ['cordilheira alta'] },
    { id: 'guatambu', label: 'Região • Guatambu / SC (~18 km)', city: 'Guatambu/SC', km: 18, keywords: ['guatambu'] },
    { id: 'coronel-freitas', label: 'Região • Coronel Freitas / SC (~23 km)', city: 'Coronel Freitas/SC', km: 23, keywords: ['coronel freitas'] },
    { id: 'xaxim', label: 'Região • Xaxim / SC (~24 km)', city: 'Xaxim/SC', km: 24, keywords: ['xaxim'] },
    { id: 'nova-itaberaba', label: 'Região • Nova Itaberaba / SC (~29 km)', city: 'Nova Itaberaba/SC', km: 29, keywords: ['nova itaberaba'] },
    { id: 'planalto-alegre', label: 'Região • Planalto Alegre / SC (~30 km)', city: 'Planalto Alegre/SC', km: 30, keywords: ['planalto alegre'] },
    { id: 'caxambu-do-sul', label: 'Região • Caxambu do Sul / SC (~36 km)', city: 'Caxambu do Sul/SC', km: 36, keywords: ['caxambu do sul'] },
    { id: 'aguas-de-chapeco', label: 'Região • Águas de Chapecó / SC (~40 km)', city: 'Águas de Chapecó/SC', km: 40, keywords: ['aguas de chapeco', 'águas de chapecó'] },
    { id: 'nonoai', label: 'Região • Nonoai / RS (~42 km)', city: 'Nonoai/RS', km: 42, keywords: ['nonoai'] },
    { id: 'xanxere', label: 'Região • Xanxerê / SC (~43 km)', city: 'Xanxerê/SC', km: 43, keywords: ['xanxere', 'xanxerê'] },
    { id: 'sao-carlos', label: 'Região • São Carlos / SC (~44 km)', city: 'São Carlos/SC', km: 44, keywords: ['sao carlos', 'são carlos'] },
    { id: 'pinhalzinho', label: 'Região • Pinhalzinho / SC (~45 km)', city: 'Pinhalzinho/SC', km: 45, keywords: ['pinhalzinho'] }
  ];

  const normalizeStr = (s = '') =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const matchZoneByCityAndNeighborhood = (cityStr = '', neighborhoodStr = '', cepStr = '') => {
    const cNorm = normalizeStr(cityStr);
    const nNorm = normalizeStr(neighborhoodStr);
    const cepDigits = String(cepStr || '').replace(/\D/g, '');

    // Verifica primeiro se é uma das cidades vizinhas de Chapecó
    for (const z of CHAPECO_REGION_ZONES) {
      if (!z.id.startsWith('chapeco-') && z.keywords.some((k) => cNorm.includes(normalizeStr(k)))) {
        return { zone: z, outOfArea: false };
      }
    }

    // Se a cidade é Chapecó (ou CEP 89800-000 a 89816-999)
    const isChapeco =
      cNorm.includes('chapeco') ||
      (cepDigits.length >= 5 && Number(cepDigits.slice(0, 5)) >= 89800 && Number(cepDigits.slice(0, 5)) <= 89816);

    if (isChapeco) {
      for (const z of CHAPECO_REGION_ZONES) {
        if (z.id.startsWith('chapeco-') && z.keywords.some((k) => nNorm.includes(normalizeStr(k)))) {
          return { zone: z, outOfArea: false };
        }
      }
      // Se é Chapecó mas o bairro não está listado especificamente, usa distância média de 4 km
      return { zone: CHAPECO_REGION_ZONES[2], outOfArea: false };
    }

    // Se o CEP começa com 898 (Oeste de SC próximo a Chapecó) ou 99600 (Nonoai)
    if (cepDigits.startsWith('898') || cepDigits.startsWith('99600')) {
      return { zone: { id: 'regiao-proxima', label: `${cityStr || 'Região de Chapecó'} (~25 km)`, city: cityStr || 'Região de Chapecó/SC', km: 25 }, outOfArea: false };
    }

    // Se digitou outra cidade fora da região de Chapecó
    if (cNorm && !isChapeco) {
      return { zone: null, outOfArea: true };
    }

    return { zone: CHAPECO_REGION_ZONES[2], outOfArea: false };
  };

  const handleCepLookup = async (rawCep) => {
    const digits = String(rawCep || '').replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCheckoutData((prev) => ({ ...prev, cep: formatted }));

    if (digits.length !== 8) return;
    setCheckoutData((prev) => ({ ...prev, cepLoading: true, outOfArea: false }));
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data && !data.erro) {
        const cityUf = `${data.localidade}/${data.uf}`;
        const bairro = data.bairro || '';
        const rua = data.logradouro || '';
        const matched = matchZoneByCityAndNeighborhood(cityUf, bairro, digits);
        setCheckoutData((prev) => ({
          ...prev,
          cepLoading: false,
          city: cityUf,
          neighborhood: bairro || prev.neighborhood,
          address: rua || prev.address,
          distanceKm: matched.zone ? matched.zone.km : prev.distanceKm || 4,
          regionZoneId: matched.zone ? matched.zone.id : 'out-of-area',
          outOfArea: matched.outOfArea
        }));
      } else {
        setCheckoutData((prev) => ({ ...prev, cepLoading: false }));
      }
    } catch {
      setCheckoutData((prev) => ({ ...prev, cepLoading: false }));
    }
  };

  const cartCount = useMemo(() => cart.reduce((a, i) => a + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);
  const activeDistanceKm = useMemo(() => {
    const d = Number(checkoutData.distanceKm);
    return Number.isFinite(d) && d > 0 ? d : 4;
  }, [checkoutData.distanceKm]);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (checkoutData.deliveryMethod === 'pickup') return 0;
    const freeMin = Number(storeConfig.freeShippingMin ?? 120);
    // Frete grátis acima do mínimo para entregas dentro de Chapecó (até 12 km)
    if (freeMin > 0 && cartSubtotal >= freeMin && activeDistanceKm <= 12) return 0;
    const baseFee = Number(storeConfig.shippingBaseFee ?? 6);
    const perKm = Number(storeConfig.shippingPerKm ?? 1.5);
    const calculated = baseFee + activeDistanceKm * perKm;
    return Number(Math.max(baseFee, calculated).toFixed(2));
  }, [cart.length, checkoutData.deliveryMethod, cartSubtotal, storeConfig, activeDistanceKm]);
  const cartTotal = cartSubtotal + shippingFee;

  const visibleProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const featuredProducts = useMemo(() => visibleProducts.filter((p) => p.featured), [visibleProducts]);
  const favoriteProducts = useMemo(() => visibleProducts.filter((p) => favorites.includes(p.id)), [visibleProducts, favorites]);
  const filteredProducts = useMemo(() => {
    let list = [...visibleProducts];
    if (selectedCategory !== 'all') list = list.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [visibleProducts, selectedCategory, searchQuery, sortBy]);

  // ============================================================================
  // FUNÇÕES DA LOJA
  // ============================================================================
  const buildDefaultUnitConfig = (product, preferredVariation = '') => {
    const vars = normalizeVariationsList(product?.variations);
    const firstVar = vars.find((v) => v.name === preferredVariation) || vars[0] || { name: 'Padrão', image: '', price: '' };
    const custom = extractProductCustomization(product);
    const defaultAddons = {};
    (custom.addonGroups || []).forEach((grp) => {
      if (grp.options && grp.options[0]) {
        defaultAddons[grp.title] = grp.options[0].name;
      }
    });
    return {
      variation: firstVar.name,
      addons: defaultAddons,
      initial: '',
      customName: '',
      notes: ''
    };
  };

  const openProductDetail = (product) => {
    const vars = normalizeVariationsList(product?.variations);
    const firstVar = vars[0] || { name: 'Padrão', image: '', price: '' };
    setSelectedProduct(product);
    setProductQty(1);
    setSelectedVariation(firstVar.name);
    setSelectedVariationImage(firstVar.image || '');
    setUnitConfigs([buildDefaultUnitConfig(product, firstVar.name)]);
    setProductCustomError('');
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
    const willAdd = !favorites.includes(productId);
    setFavorites((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);

    if (auth.client && auth.user) {
      const request = willAdd
        ? auth.client.from('favorites').insert({ user_id: auth.user.id, product_id: productId })
        : auth.client.from('favorites').delete().eq('user_id', auth.user.id).eq('product_id', productId);
      Promise.resolve(request).then(({ error }) => {
        if (error) console.warn('Favoritos (Supabase):', error.message);
      });
    } else {
      try { localStorage.setItem('mimo_rosas_favs_owner', 'guest'); } catch { /* ignora */ }
    }
  };
  const addToCart = (product, qty = 1, variation = null, e = null, customUnits = null) => {
    if (e) e.stopPropagation();
    const custom = extractProductCustomization(product);

    // Se clicou no card da vitrine e o produto exige personalização ou escolha de decoração, abre a página do produto
    if (e && (custom.enabled || (custom.addonGroups && custom.addonGroups.length > 0))) {
      openProductDetail(product);
      return;
    }

    // Se veio da tela de detalhes com unidades configuradas (ex: múltiplas unidades ou personalização/combinações)
    if (Array.isArray(customUnits) && customUnits.length > 0) {
      setCart((prev) => {
        let nextCart = [...prev];
        customUnits.forEach((u) => {
          const varObj = findVariationObj(product, u.variation);
          let unitPrice = varObj?.price !== '' && varObj?.price !== null && Number(varObj?.price) > 0
            ? Number(varObj.price)
            : Number(product.price || 0);
          let unitImage = varObj?.image || product.image;

          const parts = [varObj.name];
          (custom.addonGroups || []).forEach((grp) => {
            const chosenOptName = u.addons?.[grp.title] || grp.options?.[0]?.name;
            if (chosenOptName) {
              parts.push(`${grp.title}: ${chosenOptName}`);
              const optObj = (grp.options || []).find((o) => o.name === chosenOptName);
              if (optObj?.extraPrice && Number(optObj.extraPrice) > 0) {
                unitPrice += Number(optObj.extraPrice);
              }
              if (optObj?.image && !varObj?.image) {
                unitImage = optObj.image;
              }
            }
          });

          if (custom.enabled) {
            if (custom.askInitial && String(u.initial || '').trim()) {
              parts.push(`Inicial: ${String(u.initial).trim().toUpperCase()}`);
            }
            if (custom.askName && String(u.customName || '').trim()) {
              parts.push(`Nome: ${String(u.customName).trim()}`);
            }
            if (custom.askNotes && String(u.notes || '').trim()) {
              parts.push(`Obs: ${String(u.notes).trim()}`);
            }
          }

          const fullVariationLabel = parts.join(' • ');
          const cartKey = `${product.id}__${fullVariationLabel}`;
          const existing = nextCart.find((i) => i.cartKey === cartKey);
          if (existing) {
            nextCart = nextCart.map((i) => (
              i.cartKey === cartKey
                ? { ...i, quantity: i.quantity + 1, price: unitPrice, image: unitImage }
                : i
            ));
          } else {
            nextCart.push({
              cartKey,
              id: product.id,
              name: product.name,
              price: unitPrice,
              image: unitImage,
              variation: fullVariationLabel,
              quantity: 1
            });
          }
        });
        return nextCart;
      });
      setAddedFeedbackId(product.id);
      setCartBounce(true);
      setTimeout(() => setAddedFeedbackId(null), 1100);
      setTimeout(() => setCartBounce(false), 600);
      return;
    }

    const chosenName = typeof variation === 'string' && variation
      ? variation
      : getVariationName(variation || product.variations?.[0]);
    const varObj = findVariationObj(product, chosenName);
    const effectivePrice = varObj?.price !== '' && varObj?.price !== null && Number(varObj?.price) > 0
      ? Number(varObj.price)
      : Number(product.price || 0);
    const effectiveImage = varObj?.image || product.image;
    const cartKey = `${product.id}__${varObj.name}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) return prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty, price: effectivePrice, image: effectiveImage } : i);
      return [...prev, { cartKey, id: product.id, name: product.name, price: effectivePrice, image: effectiveImage, variation: varObj.name, quantity: qty }];
    });
    setAddedFeedbackId(product.id);
    setCartBounce(true);
    setTimeout(() => setAddedFeedbackId(null), 1100);
    setTimeout(() => setCartBounce(false), 600);
  };
  const updateCartQty = (cartKey, delta) => {
    setCart((prev) => prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));
  };
  const removeFromCart = (cartKey) => setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
  const scrollCategoriesRight = () => { if (categoryScrollRef.current) categoryScrollRef.current.scrollBy({ left: 220, behavior: 'smooth' }); };

  // ============================================================================
  // ASSISTENTE VIRTUAL
  // ============================================================================
  const handleAssistantOption = (optionType, customQuestion = null) => {
    const userLabel = customQuestion || ({ produtos: 'Conhecer produtos', precos: 'Consultar preços', presentes: 'Encontrar presentes', duvidas: 'Tirar dúvidas', pedidos: 'Ajuda com pedidos' })[optionType];

    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userLabel, time: 'Agora' }]);
    setIsBotTyping(true);

    setTimeout(() => {
      let botReply = '';
      let suggestedProducts = [];

      if (optionType === 'produtos') {
        const catNames = categories.map((c) => c.shortName).slice(0, 6).join(', ');
        botReply = `Trabalhamos com uma linha artesanal feita com muito carinho: ${catNames}! 🌹 Veja alguns dos nossos destaques:`;
        suggestedProducts = (featuredProducts.length > 0 ? featuredProducts : visibleProducts).slice(0, 2);
      } else if (optionType === 'precos') {
        const prices = visibleProducts.map((p) => Number(p.price || 0)).filter((n) => n > 0);
        const minPrice = prices.length ? Math.min(...prices) : 14.9;
        const maxPrice = prices.length ? Math.max(...prices) : 129.9;
        const topLines = visibleProducts.slice(0, 5).map((p) => `🌹 ${p.name}: ${formatBRL(p.price)}`).join('\n');
        botReply =
          `Nossos produtos vão de ${formatBRL(minPrice)} a ${formatBRL(maxPrice)}:\n\n` +
          `${topLines}\n\n` +
          `🚚 Entrega em Chapecó e região (FRETE GRÁTIS em Chapecó acima de ${formatBRL(storeConfig.freeShippingMin || 120)})!`;
        suggestedProducts = visibleProducts.slice(0, 2);
      } else if (optionType === 'presentes') {
        botReply = 'Que delícia presentear com a Mimo Rosas! 🎁 Nossas peças artesanais e personalizáveis encantam em qualquer ocasião. Separei sugestões especiais para você:';
        suggestedProducts = visibleProducts.filter((p) => ['capsulas-cha', 'chaveiros', 'cuias'].includes(p.category)).slice(0, 2);
        if (suggestedProducts.length < 2) suggestedProducts = visibleProducts.slice(0, 2);
      } else if (optionType === 'duvidas') {
        const prodTime = storeConfig.productionTimeText || '2 a 5 dias úteis';
        const extraNote = storeConfig.assistantExtraNote ? `\n✨ *Recado da loja:* ${storeConfig.assistantExtraNote}\n` : '';
        botReply =
          'Claro, estou aqui para ajudar 💕 Dúvidas frequentes:\n\n' +
          '🚚 *Entrega (Chapecó/SC e Região):* Calculada por KM (' + formatBRL(storeConfig.shippingBaseFee ?? 6) + ' + ' + formatBRL(storeConfig.shippingPerKm ?? 1.5) + '/km) — Grátis em Chapecó acima de ' + formatBRL(storeConfig.freeShippingMin || 120) + '\n' +
          '⏱️ *Prazo de produção:* ' + prodTime + '\n' +
          '💳 *Pagamento:* PIX com aprovação imediata e Cartão de Crédito na loja\n' +
          '📍 *Retirada:* Grátis no ' + (storeConfig.storeLocationText || 'Ateliê Mimo Rosas - Chapecó/SC') +
          extraNote + '\n' +
          'Se tiver outra dúvida é só me perguntar!';
      } else if (optionType === 'pedidos') {
        botReply =
          'Posso te ajudar com seu pedido! 📋\n\n' +
          '• Para *acompanhar um pedido*, me informe o código (ex: MR-12345).\n' +
          '• Para *alterar endereço*, chame a equipe no WhatsApp.\n' +
          '• Para *status de pagamento*, verifique se o PIX já foi compensado.\n\n' +
          'Nossa equipe também está no WhatsApp: ' + (storeConfig.whatsappNumber || '5549999999999') + ' 💕';
      } else {
        botReply = 'Como posso te ajudar hoje? Escolha uma das opções abaixo ou digite sua dúvida que te respondo com todo carinho! 🌹';
      }

      setChatMessages((prev) => [...prev, { id: `b-${Date.now()}`, sender: 'bot', text: botReply, products: suggestedProducts, time: 'Agora' }]);
      setIsBotTyping(false);
    }, 900);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const userText = chatInput.trim();
    if (!userText || isBotTyping) return;
    setChatInput('');

    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userText, time: 'Agora' }]);
    setIsBotTyping(true);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botReply = '';
      let suggestedProducts = [];

      if (lower.includes('frete') || lower.includes('entrega') || lower.includes('envio') || lower.includes('chapec')) {
        botReply = 'Realizamos entregas exclusivamente para *Chapecó/SC e região próxima*! 🚚 O frete é calculado por KM (' + formatBRL(storeConfig.shippingBaseFee ?? 6) + ' + ' + formatBRL(storeConfig.shippingPerKm ?? 1.5) + '/km) e fica *GRÁTIS* em Chapecó nas compras acima de ' + formatBRL(storeConfig.freeShippingMin || 120) + '. Você também pode retirar grátis no nosso ateliê em Chapecó!';
      } else if (lower.includes('prazo') || lower.includes('demora')) {
        botReply = 'O prazo de produção artesanal é de ' + (storeConfig.productionTimeText || '2 a 5 dias úteis') + '. Assim que fica pronto, entregamos rapidinho em Chapecó e região ou avisamos para retirada no ateliê! 📦';
      } else if (lower.includes('pix')) {
        botReply = 'Aceitamos PIX! O QR Code é gerado automaticamente no checkout e a confirmação é automática. 💚';
      } else if (['cartão', 'cartao', 'parcel', 'crédito', 'credito'].some((k) => lower.includes(k))) {
        botReply = 'Aceitamos Cartão de Crédito direto na tela do site (sem redirecionar) em até ' + (storeConfig.maxInstallments || 3) + 'x! 💳';
      } else if (['preço', 'preco', 'valor', 'quanto'].some((k) => lower.includes(k))) {
        botReply = 'Nossos produtos vão de R$ 14,90 (enfeites) até R$ 129,90 (cuias personalizadas). O que você procura? 🌹';
      } else if (['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'].some((k) => lower.includes(k))) {
        botReply = 'Como posso te ajudar hoje? Você pode conhecer produtos, consultar preços, encontrar presentes ou tirar dúvidas! 💕';
      } else if (['cuia', 'chimarrão', 'chimarrao', 'mate'].some((k) => lower.includes(k))) {
        botReply = 'Temos uma linha linda para chimarrão! Veja alguns:';
        suggestedProducts = visibleProducts.filter((p) => ['cuias', 'infusoes', 'blend'].includes(p.category)).slice(0, 2);
      } else if (lower.includes('presente') || lower.includes('gift')) {
        botReply = 'Para presente, sugiro as Cápsulas de Chá em formato de rosa, os chaveiros personalizados e as cuias resinadas. 🎁';
        suggestedProducts = visibleProducts.filter((p) => ['capsulas-cha', 'chaveiros', 'cuias'].includes(p.category)).slice(0, 2);
      } else if (lower.includes('obrigad') || lower.includes('valeu')) {
        botReply = 'Por nada! 💕 Fico feliz em ajudar. Volte sempre à Mimo Rosas! 🌹';
      } else {
        botReply = 'Para uma resposta mais detalhada, chame nossa equipe no WhatsApp. Ou escolha uma das opções abaixo que te mostro mais detalhes! 💕';
      }

      setChatMessages((prev) => [...prev, { id: `b-${Date.now()}`, sender: 'bot', text: botReply, products: suggestedProducts, time: 'Agora' }]);
      setIsBotTyping(false);
    }, 1000);
  };

  // ============================================================================
  // CHECKOUT TRANSPARENTE: PIX DINÂMICO + CARTÃO DIRETO NA TELA (SEM REDIRECIONAR)
  // ============================================================================
  const detectCardBrandFrontend = (numStr = '') => {
    const d = String(numStr).replace(/\D/g, '');
    if (/^4/.test(d)) return { id: 'visa', label: 'VISA', color: 'bg-[#1A1F71] text-white' };
    if (/^(5[1-5]|2[2-7])/.test(d)) return { id: 'master', label: 'MASTERCARD', color: 'bg-[#EB001B] text-white' };
    if (/^3[47]/.test(d)) return { id: 'amex', label: 'AMEX', color: 'bg-[#006FCF] text-white' };
    if (/^(606282|3841)/.test(d)) return { id: 'hipercard', label: 'HIPERCARD', color: 'bg-[#822124] text-white' };
    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) return { id: 'elo', label: 'ELO', color: 'bg-[#00A4E0] text-white' };
    return null;
  };

  const formatCardNumberInput = (val = '') => {
    const digits = String(val).replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatCardExpiryInput = (val = '') => {
    const digits = String(val).replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const formatCpfCnpjInput = (val = '') => {
    const d = String(val).replace(/\D/g, '').slice(0, 14);
    if (d.length <= 11) {
      return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutData.name.trim() || !checkoutData.phone.trim() || isSubmittingCheckout) return;
    setCardError('');

    if (checkoutData.deliveryMethod === 'delivery' && checkoutData.outOfArea) {
      showAdminToast('Realizamos entregas apenas em Chapecó/SC e região próxima. Selecione Retirada no Ateliê ou uma cidade da região.');
      return;
    }

    const isCardMethod = ['card', 'mercadopago'].includes(checkoutData.paymentMethod);
    const activeMpToken = (storeConfig.mercadoPagoAccessToken || '').trim();
    const activeMpPublicKey = (storeConfig.mercadoPagoPublicKey || '').trim();
    const hasMpToken = activeMpToken.startsWith('APP_USR-') || activeMpToken.startsWith('TEST-');

    // Validação de CPF quando Asaas está ativo
    if (asaasConfig.enabled) {
      const docDigits = String(checkoutData.document || '').replace(/\D/g, '');
      if (docDigits.length !== 11 && docDigits.length !== 14) {
        showAdminToast('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) para o pagamento online.');
        return;
      }
    }

    // Validação do formulário de Cartão Transparente antes de fechar a sacola
    if (!asaasConfig.enabled && isCardMethod) {
      const numDigits = String(cardData.number || '').replace(/\D/g, '');
      const expDigits = String(cardData.expiry || '').replace(/\D/g, '');
      const cvvDigits = String(cardData.cvv || '').replace(/\D/g, '');
      const docDigits = String(cardData.cpfCnpj || checkoutData.document || '').replace(/\D/g, '');
      if (numDigits.length < 13) {
        setCardError('Digite os 16 dígitos do número do cartão.');
        return;
      }
      if (!String(cardData.holderName || '').trim()) {
        setCardError('Digite o nome impresso no cartão.');
        return;
      }
      if (expDigits.length < 4 || Number(expDigits.slice(0, 2)) < 1 || Number(expDigits.slice(0, 2)) > 12) {
        setCardError('Informe a validade do cartão no formato MM/AA.');
        return;
      }
      if (cvvDigits.length < 3) {
        setCardError('Informe o código de segurança (CVV) de 3 ou 4 dígitos.');
        return;
      }
      if (docDigits.length !== 11 && docDigits.length !== 14) {
        setCardError('Informe um CPF válido (11 dígitos) do titular do cartão.');
        return;
      }
    }

    setIsSubmittingCheckout(true);

    try {
      const code = `MR-${Math.floor(10000 + Math.random() * 90000)}`;
      const nowFormatted = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

      const fullAddress = checkoutData.deliveryMethod === 'delivery'
        ? `${checkoutData.address}${checkoutData.number ? `, ${checkoutData.number}` : ''}${checkoutData.complement ? ` - ${checkoutData.complement}` : ''}${checkoutData.neighborhood ? ` - ${checkoutData.neighborhood}` : ''}${checkoutData.city ? ` - ${checkoutData.city}` : ''}`
        : 'Retirada no Ateliê Mimo Rosas';

      const newOrder = {
        id: code,
        customer: checkoutData.name.trim(),
        customerName: checkoutData.name.trim(),
        phone: checkoutData.phone.trim(),
        email: (checkoutData.email || auth.user?.email || '').trim(),
        document: (checkoutData.document || cardData.cpfCnpj || '').replace(/\D/g, ''),
        userId: auth.user?.id || null,
        deliveryMethod: checkoutData.deliveryMethod,
        address: fullAddress,
        city: checkoutData.city || '',
        cep: checkoutData.cep || '-',
        notes: checkoutData.notes || '',
        paymentMethod: isCardMethod ? 'card' : 'pix',
        status: isCardMethod ? 'Aguardando Pagamento' : 'Aguardando PIX',
        total: Number(cartTotal.toFixed(2)),
        shipping: Number(shippingFee.toFixed(2)),
        date: nowFormatted,
        createdAt: nowFormatted,
        mpPaymentId: null,
        mpPreferenceId: null,
        items: cart.map((item) => ({ id: item.id, name: `${item.name} (${item.variation})`, qty: item.quantity, price: item.price }))
      };

      let pixCode = generatePixCopyPaste(storeConfig.pixKey || storeConfig.whatsappNumber, storeConfig.pixHolderName || 'MIMO ROSAS', 'BRASIL', cartTotal, code.replace(/[^A-Z0-9]/g, ''));
      let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(pixCode)}`;
      let mpPaymentId = null;
      let mpCheckoutProUrl = null;
      let mpPreferenceId = null;
      let asaasPaymentId = null;
      let asaasInvoiceUrl = null;
      let paymentAlreadyConfirmed = false;

      // =========================================================================
      // 1. CHECKOUT TRANSPARENTE DE CARTÃO (MERCADO PAGO DIRETO NA TELA)
      // =========================================================================
      if (!asaasConfig.enabled && isCardMethod) {
        let browserCardToken = '';
        const numDigits = String(cardData.number || '').replace(/\D/g, '');
        const expDigits = String(cardData.expiry || '').replace(/\D/g, '');
        const expMonth = expDigits.slice(0, 2);
        const rawYear = expDigits.slice(2);
        const expYear = rawYear.length === 2 ? `20${rawYear}` : rawYear;
        const cvvDigits = String(cardData.cvv || '').replace(/\D/g, '');
        const docDigits = String(cardData.cpfCnpj || checkoutData.document || '').replace(/\D/g, '');
        const holder = String(cardData.holderName || checkoutData.name || 'CLIENTE MIMO ROSAS').trim();

        // Gera o token do cartão direto no navegador da cliente (com IP e fingerprint do dispositivo)
        if (activeMpPublicKey) {
          try {
            if (typeof window !== 'undefined' && typeof window.MercadoPago === 'function') {
              const mpSdk = new window.MercadoPago(activeMpPublicKey, { locale: 'pt-BR' });
              const sdkToken = await mpSdk.createCardToken({
                cardNumber: numDigits,
                cardholderName: holder,
                cardExpirationMonth: expMonth,
                cardExpirationYear: expYear,
                securityCode: cvvDigits,
                identificationType: docDigits.length === 14 ? 'CNPJ' : 'CPF',
                identificationNumber: docDigits
              });
              if (sdkToken?.id) browserCardToken = sdkToken.id;
            }
            if (!browserCardToken) {
              const bTokRes = await fetch(
                `https://api.mercadopago.com/v1/card_tokens?public_key=${encodeURIComponent(activeMpPublicKey)}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    card_number: numDigits,
                    expiration_month: Number(expMonth),
                    expiration_year: Number(expYear),
                    security_code: cvvDigits,
                    cardholder: {
                      name: holder,
                      identification: {
                        type: docDigits.length === 14 ? 'CNPJ' : 'CPF',
                        number: docDigits
                      }
                    }
                  })
                }
              );
              const bTokData = await bTokRes.json().catch(() => null);
              if (bTokRes.ok && bTokData?.id) browserCardToken = bTokData.id;
            }
          } catch { /* fallback no servidor */ }
        }

        const deviceId = (typeof window !== 'undefined' && window.MP_DEVICE_SESSION_ID)
          ? String(window.MP_DEVICE_SESSION_ID)
          : undefined;

        const cardRes = await fetch('/api/asaas/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'mp_card',
            order: newOrder,
            card: {
              token: browserCardToken || undefined,
              deviceId,
              number: cardData.number,
              holderName: holder,
              expiry: cardData.expiry,
              cvv: cardData.cvv,
              cpfCnpj: cardData.cpfCnpj || checkoutData.document,
              installments: cardData.installments
            },
            accessToken: activeMpToken || undefined,
            publicKey: activeMpPublicKey || undefined
          })
        });
        const cardResult = await cardRes.json().catch(() => ({}));

        if (!cardRes.ok || !cardResult?.ok) {
          setCardError(
            cardResult?.message ||
            'Não foi possível aprovar o cartão agora. Confira os dados digitados ou escolha o PIX Instantâneo.'
          );
          return;
        }

        mpPaymentId = cardResult.paymentId || null;
        newOrder.mpPaymentId = mpPaymentId;
        if (cardResult.paid || cardResult.status === 'approved') {
          paymentAlreadyConfirmed = true;
          newOrder.status = 'Pago';
        }
      }

      // =========================================================================
      // 2. CHECKOUT TRANSPARENTE DE PIX (QR CODE DINÂMICO OFICIAL MERCADO PAGO)
      // =========================================================================
      if (!asaasConfig.enabled && !isCardMethod && hasMpToken) {
        try {
          const mpPixRes = await fetch('/api/asaas/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'mp_pix',
              order: newOrder,
              cpfCnpj: checkoutData.document,
              accessToken: activeMpToken
            })
          });
          const mpPixData = await mpPixRes.json().catch(() => null);
          if (mpPixRes.ok && mpPixData?.ok && mpPixData?.pix?.payload) {
            mpPaymentId = mpPixData.paymentId || null;
            newOrder.mpPaymentId = mpPaymentId;
            pixCode = mpPixData.pix.payload;
            qrCodeUrl = mpPixData.pix.encodedImage
              ? `data:image/png;base64,${mpPixData.pix.encodedImage}`
              : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(pixCode)}`;
            if (mpPixData.alreadyPaid) {
              paymentAlreadyConfirmed = true;
              newOrder.status = 'Pago';
            }
          }
        } catch { /* fallback PIX chave da loja */ }
      }

      // =========================================================================
      // 3. FLUXO ASAAS (SE CONFIGURADO NAS VARIÁVEIS DO SERVIDOR)
      // =========================================================================
      if (asaasConfig.enabled) {
        try {
          const payRes = await fetch('/api/asaas/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: code,
              billingType: checkoutData.paymentMethod === 'pix' ? 'PIX' : 'CARD',
              cpfCnpj: checkoutData.document
            })
          });
          const payData = await payRes.json().catch(() => null);

          if (payRes.ok && payData?.ok) {
            asaasPaymentId = payData.paymentId || null;
            if (payData.alreadyPaid) {
              paymentAlreadyConfirmed = true;
              newOrder.status = 'Pago';
            }
            if (payData.billingType === 'PIX' && payData.pix?.payload) {
              pixCode = payData.pix.payload;
              qrCodeUrl = payData.pix.encodedImage
                ? `data:image/png;base64,${payData.pix.encodedImage}`
                : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(pixCode)}`;
            } else if (payData.billingType === 'UNDEFINED') {
              asaasInvoiceUrl = payData.invoiceUrl || null;
            }
          } else if (payData?.message) {
            showAdminToast(payData.message);
          }
        } catch {
          showAdminToast('Pagamento online indisponível agora. Use o PIX abaixo ou fale com a loja no WhatsApp.');
        }
      }

      // Salva o pedido no estado local, reduz estoque, grava no Supabase e envia o e-mail correspondente
      const updatedOrdersList = [newOrder, ...orders];
      setOrders(updatedOrdersList);
      try {
        localStorage.setItem('mimo_db_orders', JSON.stringify(updatedOrdersList));
        localStorage.setItem('mimo_orders', JSON.stringify(updatedOrdersList));
      } catch { /* ignore */ }

      setProducts((prev) => prev.map((prod) => {
        const bought = cart.filter((c) => c.id === prod.id).reduce((s, c) => s + c.quantity, 0);
        if (bought > 0) { const updated = { ...prod, stock: Math.max(0, prod.stock - bought) }; syncSingleProductToSupabase(updated); return updated; }
        return prod;
      }));

      await saveOrderToSupabase(newOrder);
      notifyCustomerOrderStatusEmail(newOrder, newOrder.status);

      const itemsSummaryText = newOrder.items.map((i) => `• ${i.qty}x ${i.name} (${formatBRL(i.price * i.qty)})`).join('\n');
      const waMessage =
        `Olá Mimo Rosas! 🌹 Acabei de fazer o pedido *${code}* no site:\n\n` +
        `*Cliente:* ${checkoutData.name}\n` +
        `*Telefone:* ${checkoutData.phone}\n` +
        `*Recebimento:* ${newOrder.address} (CEP: ${newOrder.cep})\n` +
        `*Pagamento:* ${isCardMethod ? `Cartão de Crédito (${cardData.installments}x)` : 'PIX'}${paymentAlreadyConfirmed ? ' — PAGO ✅' : ''}\n\n` +
        `*Itens do Pedido:*\n${itemsSummaryText}\n\n` +
        `*Total:* ${formatBRL(cartTotal)}`;

      const successObj = {
        code, customer: checkoutData.name, total: cartTotal,
        method: isCardMethod ? 'card' : 'pix', delivery: checkoutData.deliveryMethod,
        paymentConfirmed: paymentAlreadyConfirmed,
        mpPaymentId, mpPreferenceId, mpCheckoutProUrl, pixCode, qrCodeUrl,
        asaasPaymentId, asaasInvoiceUrl,
        whatsappUrl: `https://wa.me/${(storeConfig.whatsappNumber || '5554999999999').replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`
      };
      setPixCheckCount(0);
      setOrderSuccess(successObj);
      try { localStorage.setItem('mimo_active_order', JSON.stringify(successObj)); } catch { /* ignore */ }
      setCart([]);

      if (asaasInvoiceUrl) {
        try { window.open(asaasInvoiceUrl, '_blank', 'noopener'); } catch { /* bloqueado */ }
      }
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // ============================================================================
  // CONFIRMAÇÃO AUTOMÁTICA DO PAGAMENTO
  // Fica no escopo do componente porque o botão "Já pagou?" também usa.
  // ============================================================================
  const markOrderAsPaidAutomatically = async (order = orderSuccess) => {
    if (!order) return;
    await persistOrderPaidEverywhere(order.code);
    const confirmedWaText = `Olá Mimo Rosas! 🌹 O sistema já confirmou automaticamente meu pagamento do pedido *${order.code}* (${formatBRL(order.total)})!\n\n*Cliente:* ${order.customer}`;
    setOrderSuccess((prev) => prev ? { ...prev, paymentConfirmed: true, whatsappUrl: `https://wa.me/${(storeConfig.whatsappNumber || '5554999999999').replace(/\D/g, '')}?text=${encodeURIComponent(confirmedWaText)}` } : null);
  };

  // ============================================================================
  // POLLING AUTOMÁTICO DE PIX + VISIBILITY CHANGE
  // ============================================================================
  useEffect(() => {
    const payableMethods = ['pix', 'card', 'mercadopago'];
    if (!orderSuccess || !payableMethods.includes(orderSuccess.method) || orderSuccess.paymentConfirmed) return;

    const checkPayment = async () => {
      setPixCheckCount((c) => c + 1);

      // 1. Asaas (PIX e cartão): o servidor pergunta ao Asaas e já marca como Pago
      if (asaasConfig.enabled || orderSuccess.asaasPaymentId) {
        const asaasCheck = await verifyAsaasPayment(orderSuccess.code);
        if (asaasCheck?.paid) { await markOrderAsPaidAutomatically(); return; }
      }

      // 2. Mercado Pago (só no fluxo antigo, enquanto o Asaas não estiver ligado)
      if (!asaasConfig.enabled) {
        try {
          const mpCheck = await verifyOrderPaymentOnMercadoPago(orderSuccess.code, orderSuccess.mpPaymentId);
          if (mpCheck && mpCheck.status === 'approved') { await markOrderAsPaidAutomatically(); return; }
        } catch (e) { /* ignora erro CORS do MP */ }
      }

      // 3. Verifica no Supabase (webhook do Asaas ou admin marcando "Pago" na mão)
      if (supabaseUrl && supabaseKey) {
        try {
          const remoteStatus = await fetchOrderStatus(orderSuccess.code);
          if (remoteStatus === 'Pago') { await markOrderAsPaidAutomatically(); return; }
        } catch { /* ignora */ }
      }

      // 4. Simulador de testes (Se ativado no admin)
      const demoSecs = Number(storeConfig.autoApproveDemoSeconds || 0);
      if (demoSecs > 0) {
        setPixCheckCount((currentCount) => { if (currentCount * 3 >= demoSecs) markOrderAsPaidAutomatically(); return currentCount; });
      }
    };

    const interval = setInterval(checkPayment, asaasConfig.enabled ? 4000 : 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkPayment();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [orderSuccess, supabaseUrl, supabaseKey, storeConfig, asaasConfig]); // eslint-disable-line

  const syncAllPendingOrdersWithMercadoPago = async (silent = false) => {
    const pendingList = orders.filter((o) => o.status === 'Aguardando PIX' || o.status === 'Pendente');
    if (pendingList.length === 0) { if (!silent) showAdminToast('Não há pedidos pendentes para verificar.'); return; }
    let approvedCount = 0;
    for (const ord of pendingList) {
      const check = await verifyOrderPaymentOnMercadoPago(ord.id, ord.mpPaymentId);
      if (check && check.status === 'approved') { await handleUpdateOrderStatus(ord.id, 'Pago'); approvedCount++; }
    }
    if (!silent) showAdminToast(approvedCount > 0 ? `${approvedCount} pedido(s) confirmado(s) como PAGO!` : 'Nenhum novo pagamento aprovado ainda.');
  };

  // ============================================================================
  // ADMIN
  // ============================================================================
  const handleAdminUnlock = (e) => {
    e.preventDefault();
    const expected = storeConfig.adminPassword || 'mimo2026';
    if (adminPinInput.trim() === expected) {
      setIsAdminUnlocked(true);
      setAdminPinError('');
      try { localStorage.setItem('mimo_admin_unlocked', 'true'); } catch { /* ignore */ }
    } else {
      setAdminPinError('Senha incorreta. (Dica inicial: mimo2026)');
    }
  };

  const handleSaveProductAdmin = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) return;
    const rawVars = Array.isArray(editingProduct.variationItems)
      ? editingProduct.variationItems
      : normalizeVariationsList(editingProduct.variations);
    const cleanedVariations = rawVars
      .map((v) => ({
        name: String(v?.name || '').trim(),
        image: String(v?.image || '').trim(),
        price: v?.price !== undefined && v?.price !== null && v?.price !== '' && Number(v.price) > 0
          ? Number(String(v.price).replace(',', '.'))
          : ''
      }))
      .filter((v) => v.name.length > 0);
    const finalVariations = cleanedVariations.length > 0
      ? cleanedVariations
      : [{ name: 'Padrão', image: '', price: '' }];

    const customCfg = editingProduct.customization || extractProductCustomization(editingProduct);
    const addonImages = (customCfg.addonGroups || [])
      .flatMap((g) => (g.options || []).map((o) => o.image))
      .filter(Boolean);

    const baseGallery = Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 0
      ? editingProduct.gallery.filter(Boolean)
      : [editingProduct.image].filter(Boolean);
    // Garante que fotos de variações e decorações também fiquem disponíveis na galeria do produto
    const varImages = finalVariations.map((v) => v.image).filter(Boolean);
    const cleanGallery = Array.from(new Set([...baseGallery, ...varImages, ...addonImages]));
    const mainImg = editingProduct.image || cleanGallery[0] || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85';

    const packedVariations = packVariationsWithMeta(finalVariations, customCfg);

    const formattedProduct = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      price: Number(String(editingProduct.price).replace(',', '.')) || 0,
      stock: Math.max(0, Math.round(Number(editingProduct.stock) || 0)),
      active: editingProduct.active !== false,
      image: mainImg,
      gallery: cleanGallery.length > 0 ? cleanGallery : [mainImg],
      variations: packedVariations,
      customization: customCfg
    };
    delete formattedProduct.variationItems;
    delete formattedProduct.variationsText;

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === formattedProduct.id);
      if (exists) return prev.map((p) => p.id === formattedProduct.id ? formattedProduct : p);
      return [formattedProduct, ...prev];
    });
    syncSingleProductToSupabase(formattedProduct);
    setEditingProduct(null);
    setGalleryPickerVarIdx(null);
    setShowManualUrlInput(false);
    showAdminToast('Produto salvo e sincronizado com o Supabase!');
  };

  const handleDeleteProductAdmin = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: sbHeaders() });
      } catch { /* ignore */ }
    }
    showAdminToast('Produto removido do catálogo.');
  };

  const handleSaveCategoryAdmin = async (e) => {
    e.preventDefault();
    const cleanName = String(editingCategory.name || '').trim();
    if (!cleanName) return;
    const cleanShort = String(editingCategory.shortName || cleanName).trim();
    const slugId = editingCategory.isEditing && editingCategory.id
      ? editingCategory.id
      : cleanShort
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

    const catObj = {
      id: slugId,
      name: cleanName,
      shortName: cleanShort,
      iconType: editingCategory.iconType || 'gift',
      description: String(editingCategory.description || '').trim()
    };

    setCategories((prev) => {
      const exists = prev.some((c) => c.id === catObj.id);
      if (exists) return prev.map((c) => (c.id === catObj.id ? catObj : c));
      return [...prev, catObj];
    });

    if (editingProduct) {
      setEditingProduct((prev) => (prev ? { ...prev, category: catObj.id } : prev));
    }

    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/categories`, {
          method: 'POST',
          headers: sbHeaders('resolution=merge-duplicates,return=representation'),
          body: JSON.stringify([{
            id: catObj.id,
            name: catObj.name,
            short_name: catObj.shortName,
            icon_type: catObj.iconType,
            description: catObj.description
          }])
        });
      } catch { /* ignore */ }
    }

    setEditingCategory({ id: '', name: '', shortName: '', iconType: 'gift', description: '', isEditing: false });
    showAdminToast(editingCategory.isEditing ? `Categoria "${catObj.shortName}" atualizada!` : `Categoria "${catObj.shortName}" criada!`);
  };

  const handleDeleteCategoryAdmin = async (catId) => {
    if (categories.length <= 1) {
      showAdminToast('A loja precisa ter pelo menos 1 categoria.');
      return;
    }
    const fallbackCat = categories.find((c) => c.id !== catId)?.id || 'infusoes';
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    setProducts((prev) => prev.map((p) => (p.category === catId ? { ...p, category: fallbackCat } : p)));
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/categories?id=eq.${encodeURIComponent(catId)}`, {
          method: 'DELETE',
          headers: sbHeaders('return=minimal')
        });
      } catch { /* ignore */ }
    }
    showAdminToast('Categoria removida.');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: sbHeaders(), body: JSON.stringify({ status: newStatus }) });
      } catch { /* ignore */ }
    }
    const emailSent = await notifyCustomerOrderStatusEmail(targetOrder || orderId, newStatus);
    showAdminToast(
      emailSent
        ? `Pedido #${orderId} atualizado para "${newStatus}" e e-mail enviado para a cliente!`
        : `Pedido #${orderId} atualizado para "${newStatus}"!`
    );
  };

  const handleDeleteOrderAdmin = async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
        await fetch(`${cleanUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'DELETE',
          headers: sbHeaders('return=minimal')
        });
      } catch { /* ignore */ }
    }
    showAdminToast(`Pedido #${orderId} removido.`);
  };

  const renderProductCard = (product) => {
    const isFav = favorites.includes(product.id);
    const isAdded = addedFeedbackId === product.id;
    const normVars = normalizeVariationsList(product.variations);
    const hasMultipleVars = normVars.length > 1 || (normVars.length === 1 && normVars[0].name.toLowerCase() !== 'padrão');
    const varsWithPhotos = normVars.filter((v) => v.image);
    return (
      <div key={product.id} onClick={() => openProductDetail(product)} className="group bg-[#FFF9F3] rounded-[22px] overflow-hidden border border-[#F0DCD6] shadow-[0_6px_20px_rgba(121,83,68,0.07)] hover:shadow-[0_10px_26px_rgba(169,15,77,0.13)] transition-all duration-300 flex flex-col cursor-pointer">
        <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-[#F6E9E5]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 bg-[#FFF9F3]/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-[#F2DFDA]">
              {product.badgeType === 'star' ? <Star className="w-3.5 h-3.5 text-[#A90F4D]" strokeWidth={2.2} /> : <Sparkles className="w-3.5 h-3.5 text-[#A90F4D]" strokeWidth={2.2} />}
              <span className="text-[11px] font-medium text-[#5A382E] leading-none">{product.badge}</span>
            </div>
          )}
          <button type="button" onClick={(e) => toggleFavorite(product.id, e)} aria-label="Favoritar produto" className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FFF9F3]/85 backdrop-blur-xs flex items-center justify-center text-[#A90F4D] hover:scale-110 active:scale-95 transition-transform shadow-xs">
            <Heart className="w-4 h-4" fill={isFav ? '#A90F4D' : 'none'} strokeWidth={2} />
          </button>
          {varsWithPhotos.length > 0 && (
            <div className="absolute bottom-2 left-2.5 flex items-center -space-x-1.5 bg-[#FFF9F3]/90 backdrop-blur-xs px-2 py-1 rounded-full border border-[#F0DCD6] shadow-xs">
              {varsWithPhotos.slice(0, 4).map((v, i) => (
                <img key={i} src={v.image} alt={v.name} title={v.name} className="w-4 h-4 rounded-full object-cover border border-white" />
              ))}
              <span className="text-[10px] font-semibold text-[#5A382E] pl-2.5">{normVars.length} {normVars.length === 1 ? 'opção' : 'opções'}</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between text-center bg-gradient-to-b from-[#FFF9F3] to-[#FDF3EE]">
          <div>
            <h3 className="font-serif-display text-[15px] sm:text-[16px] font-medium text-[#4A2C23] leading-snug line-clamp-2 min-h-[40px]">{product.name}</h3>
            <p className="mt-1.5 text-[18px] sm:text-[20px] font-bold text-[#A90F4D] tracking-tight">{formatBRL(product.price)}</p>
            {hasMultipleVars && varsWithPhotos.length === 0 && (
              <p className="text-[10.5px] text-[#8B6456] mt-0.5 truncate">{normVars.length} opções: {normVars.map((v) => v.name).join(', ')}</p>
            )}
          </div>
          <button type="button" onClick={(e) => addToCart(product, 1, null, e)} className={`mt-2.5 w-full py-2.5 px-3 rounded-full text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 ${isAdded ? 'bg-[#2E7D32] text-white' : 'bg-[#A90F4D] hover:bg-[#8E0B3F] text-white'}`}>
            {isAdded ? (
              <><Check className="w-4 h-4 stroke-[2.5]" /><span>Adicionado!</span></>
            ) : (extractProductCustomization(product).enabled || extractProductCustomization(product).addonGroups?.length > 0) ? (
              <><Sparkles className="w-3.5 h-3.5" /><span>Personalizar / Escolher</span></>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /><span>Adicionar ao carrinho</span></>
            )}
          </button>
        </div>
      </div>
    );
  };

  const isEmailInAdminList = Boolean(
    auth.user?.email
    && Array.isArray(storeConfig.adminEmails)
    && storeConfig.adminEmails.some((em) => String(em || '').trim().toLowerCase() === String(auth.user.email).trim().toLowerCase())
  );
  const isEffectiveAdmin = Boolean(auth.isAdmin || isEmailInAdminList);

  const handleAddAdminEmail = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = String(newAdminEmailInput || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showAdminToast('Digite um e-mail válido.');
      return;
    }
    const currentList = Array.isArray(storeConfig.adminEmails) ? storeConfig.adminEmails : [];
    const merged = Array.from(new Set([
      ...currentList.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean),
      ...(auth.user?.email ? [String(auth.user.email).trim().toLowerCase()] : []),
      cleanEmail
    ]));
    const nextCfg = { ...storeConfig, adminEmails: merged };
    setStoreConfig(nextCfg);
    setNewAdminEmailInput('');
    await syncStoreConfigToSupabase(nextCfg);
    if (auth.client) {
      try {
        await auth.client.rpc('set_admin_by_email', { p_email: cleanEmail, p_is_admin: true });
      } catch { /* ignora se a RPC ainda não tiver sido rodada */ }
    }
    showAdminToast(`Acesso de administrador liberado para ${cleanEmail}!`);
  };

  const handleRemoveAdminEmail = async (targetEmail) => {
    const cleanTarget = String(targetEmail || '').trim().toLowerCase();
    if (!cleanTarget) return;
    if (auth.user?.email && cleanTarget === String(auth.user.email).trim().toLowerCase()) {
      showAdminToast('Você não pode remover o seu próprio acesso.');
      return;
    }
    const currentList = Array.isArray(storeConfig.adminEmails) ? storeConfig.adminEmails : [];
    const filtered = currentList
      .map((item) => String(item || '').trim().toLowerCase())
      .filter((em) => em && em !== cleanTarget);
    const nextCfg = { ...storeConfig, adminEmails: filtered };
    setStoreConfig(nextCfg);
    await syncStoreConfigToSupabase(nextCfg);
    if (auth.client) {
      try {
        await auth.client.rpc('set_admin_by_email', { p_email: cleanTarget, p_is_admin: false });
      } catch { /* ignora */ }
    }
    showAdminToast(`Acesso administrativo removido de ${cleanTarget}.`);
  };

  // Portão do painel: loading -> login -> permissão -> painel
  // Antes do SQL rodar, cai na senha legada para não travar o acesso.
  useEffect(() => {
    if (appMode !== 'admin' || auth.loading || auth.user) return undefined;
    let active = true;
    Promise.resolve(auth.probeProfiles?.()).then(() => { if (active) setProfilesProbed(true); });
    return () => { active = false; };
  }, [appMode, auth.loading, auth.user, auth.probeProfiles]);

  const adminGate = (() => {
    if (auth.loading) return 'loading';
    if (!auth.user && !profilesProbed) return 'loading';
    // Banco ainda sem a tabela profiles: mantém o acesso legado por senha
    if (!auth.profilesReady) return isAdminUnlocked ? 'open' : 'legacyPassword';
    if (!auth.user) return 'login';
    return isEffectiveAdmin ? 'open' : 'forbidden';
  })();

  return (
    <div className="min-h-screen bg-[#F6E9E5] text-[#5A382E] flex flex-col items-center selection:bg-[#A90F4D] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-script { font-family: 'Allura', cursive; }
        .font-serif-display { font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        @keyframes bounceDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }
        .typing-dot { animation: bounceDot 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {adminToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[60] max-w-[92vw] bg-[#2E7D32] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4 shrink-0" /><span>{adminToast}</span>
        </div>
      )}

      {appMode === 'admin' ? (
        adminGate === 'loading' ? (
          <div className="w-full min-h-screen flex flex-col items-center justify-center gap-3 text-[#A90F4D]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs text-[#795344]">Verificando acesso...</p>
          </div>
        ) : adminGate === 'login' ? (
          <AuthPanel variant="admin" auth={auth} onBack={() => goToMode('store')} />
        ) : adminGate === 'forbidden' ? (
          <div className="w-full min-h-screen flex items-center justify-center p-4 font-sans-clean">
            <div className="bg-[#FFF9F3] max-w-md w-full rounded-3xl p-6 border border-[#EAD6D0] shadow-xl text-center space-y-3">
              <AlertCircle className="w-9 h-9 text-amber-600 mx-auto" />
              <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">Conta sem permissão de administrador</h2>
              <p className="text-xs text-[#795344]">{auth.user?.email} está conectada, mas não tem acesso ao painel.</p>
              <p className="text-[11px] text-[#9A7468]">Para liberar, rode no Supabase: <code className="break-all">update public.profiles set is_admin = true where id = (select id from auth.users where email = &apos;{auth.user?.email}&apos;);</code></p>
              <button type="button" onClick={() => auth.signOut()} className="w-full py-3 rounded-full bg-[#A90F4D] text-white text-sm font-semibold">Sair e entrar com outra conta</button>
              <button type="button" onClick={() => goToMode('store')} className="w-full py-2 rounded-full text-xs text-[#795344] hover:underline">Voltar para a loja</button>
            </div>
          </div>
        ) : adminGate === 'legacyPassword' ? (
          <div className="w-full max-w-md my-auto p-6 font-sans-clean">
            <div className="bg-[#FFF9F3] rounded-3xl p-6 border border-[#EAD6D0] shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F6E9E5] text-[#A90F4D] flex items-center justify-center mx-auto"><Lock className="w-7 h-7" /></div>
              <div>
                <h2 className="font-serif-display text-2xl font-bold text-[#4A2532]">Acesso Restrito • Mimo Rosas</h2>
                <p className="text-xs text-[#795344] mt-1">Digite a senha de administradora para gerenciar produtos, preços, pedidos e banco Supabase.</p>
              </div>
              <form onSubmit={handleAdminUnlock} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#5A382E] mb-1">Senha do Painel Admin</label>
                  <input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} placeholder="Digite a senha (padrão: mimo2026)" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]" />
                </div>
                {adminPinError && <p className="text-xs text-red-600 font-medium">{adminPinError}</p>}
                <button type="submit" className="w-full py-3 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm shadow-md">Entrar no Painel Administrativo</button>
                <button type="button" onClick={() => goToMode('store')} className="w-full py-2 rounded-full text-xs text-[#795344] hover:underline text-center">Voltar para a Loja</button>
              </form>
            </div>
          </div>
        ) : (() => {
          const activeProductsCount = products.filter((p) => p.active !== false).length;
          const lowStockCount = products.filter((p) => p.active !== false && Number(p.stock) <= 3).length;
          const confirmedStatuses = ['Pago', 'Em Produção', 'Enviado', 'Concluído', 'Entregue'];
          const confirmedOrders = orders.filter((o) => confirmedStatuses.includes(o.status));
          const toProduceCount = orders.filter((o) => o.status === 'Pago' || o.status === 'Em Produção').length;
          const pendingPixCount = orders.filter((o) => /aguardando|pendente/i.test(o.status || '')).length;
          const confirmedRevenue = confirmedOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);

          const filteredAdminProducts = products
            .filter((p) => adminProductCategory === 'all' || p.category === adminProductCategory)
            .filter((p) => {
              if (adminProductFilter === 'featured') return Boolean(p.featured);
              if (adminProductFilter === 'customizable') {
                const c = extractProductCustomization(p);
                return Boolean(c.enabled) || (c.addonGroups && c.addonGroups.length > 0);
              }
              if (adminProductFilter === 'low-stock') return Number(p.stock) <= 3;
              if (adminProductFilter === 'hidden') return p.active === false;
              return true;
            })
            .filter((p) => !adminProductSearch.trim() || p.name.toLowerCase().includes(adminProductSearch.trim().toLowerCase()));

          const filteredAdminOrders = orders
            .filter((o) => {
              if (adminOrderFilter === 'paid') return o.status === 'Pago';
              if (adminOrderFilter === 'production') return o.status === 'Em Produção';
              if (adminOrderFilter === 'shipped') return o.status === 'Enviado';
              if (adminOrderFilter === 'done') return o.status === 'Concluído' || o.status === 'Entregue';
              if (adminOrderFilter === 'pending') return /aguardando|pendente/i.test(o.status || '');
              return true;
            })
            .filter((o) => {
              if (!adminOrderSearch.trim()) return true;
              const q = adminOrderSearch.trim().toLowerCase();
              return (
                String(o.id || '').toLowerCase().includes(q)
                || String(o.customerName || o.customer || '').toLowerCase().includes(q)
                || String(o.phone || '').toLowerCase().includes(q)
              );
            });

          const adjustQuickStock = (prod, delta) => {
            const nextStock = Math.max(0, Number(prod.stock || 0) + delta);
            const updated = { ...prod, stock: nextStock };
            setProducts((prev) => prev.map((item) => (item.id === prod.id ? updated : item)));
            syncSingleProductToSupabase(updated);
          };

          const orderStatusBadgeStyle = (st) => {
            if (st === 'Pago') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            if (st === 'Em Produção') return 'bg-[#FCEEF2] text-[#A90F4D] border-[#E5B8C7]';
            if (st === 'Enviado') return 'bg-sky-100 text-sky-800 border-sky-200';
            if (st === 'Concluído' || st === 'Entregue') return 'bg-emerald-50 text-emerald-900 border-emerald-200';
            return 'bg-amber-100 text-amber-800 border-amber-200';
          };

          const buildOrderWhatsAppMessage = (order) => {
            const name = order.customerName || order.customer || 'cliente';
            if (order.status === 'Pago') {
              return `Olá, ${name}! 🌹 Aqui é da Mimo Rosas! Passando para confirmar que recebemos o pagamento do seu pedido *#${order.id}* e já vamos iniciar a preparação com todo carinho! 💕`;
            }
            if (order.status === 'Em Produção') {
              return `Olá, ${name}! 🌹 Seu pedido *#${order.id}* da Mimo Rosas já está sendo produzido artesanalmente no nosso ateliê! Assim que ficar pronto te avisamos por aqui. ✨`;
            }
            if (order.status === 'Enviado') {
              return `Olá, ${name}! 🌹 Boas notícias: seu pedido *#${order.id}* da Mimo Rosas já saiu para entrega! 🚚💕`;
            }
            if (order.status === 'Concluído') {
              return `Olá, ${name}! 🌹 Esperamos que você tenha amado o seu pedido *#${order.id}* da Mimo Rosas! Muito obrigada pela preferência! 💕`;
            }
            return `Olá, ${name}! 🌹 Aqui é da Mimo Rosas sobre o seu pedido *#${order.id}* (${formatBRL(order.total)}). Posso te ajudar a finalizar?`;
          };

          return (
            <div className="w-full max-w-7xl min-h-screen bg-[#F6E9E5] p-4 sm:p-6 lg:p-8 font-sans-clean space-y-6">
              {/* Cabeçalho Clean & Elegante da Loja */}
              <div className="bg-[#FFF9F3] rounded-[28px] p-5 sm:p-6 border border-[#EAD6D0] shadow-[0_8px_28px_rgba(121,83,68,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FCEEF2] border border-[#E5B8C7] flex items-center justify-center shrink-0">
                    <MimoRoseOutlineSVG className="w-8 h-9" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#4A2532]">Painel Mimo Rosas</h1>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Loja Sincronizada
                      </span>
                    </div>
                    <p className="text-xs text-[#795344] mt-0.5">
                      Gerencie seus produtos artesanais, acompanhe a produção dos pedidos e personalize o atendimento.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchFromSupabase(false)}
                    className="px-3.5 py-2 rounded-full bg-[#F6E9E5] hover:bg-[#EAD6D0] text-[#5A382E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Atualizar pedidos e catálogo"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#A90F4D] ${sbStatus.loading ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToMode('store')}
                    className="px-4 py-2 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Ver Vitrine da Loja →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try { localStorage.removeItem('mimo_admin_unlocked'); } catch { /* ignore */ }
                      setIsAdminUnlocked(false);
                      setAdminPinInput('');
                      auth.signOut();
                      goToMode('store');
                    }}
                    className="px-4 py-2 rounded-full bg-[#FFF9F3] text-[#795344] border border-[#E5CFC9] text-xs font-semibold hover:bg-[#3A1C28] hover:text-white transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>

              {/* Cards de Indicadores (KPIs Executivos) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#795344] font-medium">Vendas Confirmadas</span>
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-[#2E7D32] tracking-tight">{formatBRL(confirmedRevenue)}</p>
                    <p className="text-[11px] text-[#8B6456] mt-0.5">
                      {confirmedOrders.length} {confirmedOrders.length === 1 ? 'pedido pago' : 'pedidos pagos'}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('orders')}
                  className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs flex flex-col justify-between cursor-pointer hover:border-[#A90F4D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#795344] font-medium">Para Produzir / Enviar</span>
                    <span className="w-8 h-8 rounded-xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-[#4A2532]">{toProduceCount}</p>
                    <p className="text-[11px] text-[#8B6456] mt-0.5">
                      {pendingPixCount > 0 ? `+ ${pendingPixCount} aguardando PIX` : `${orders.length} pedidos no total`}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('products')}
                  className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs flex flex-col justify-between cursor-pointer hover:border-[#A90F4D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#795344] font-medium">Produtos Ativos</span>
                    <span className="w-8 h-8 rounded-xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-[#A90F4D]">{activeProductsCount}</p>
                    <p className={`text-[11px] mt-0.5 ${lowStockCount > 0 ? 'text-amber-700 font-semibold' : 'text-[#8B6456]'}`}>
                      {lowStockCount > 0 ? `${lowStockCount} com estoque baixo (≤ 3 un.)` : 'Estoque em dia'}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('assistant')}
                  className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs flex flex-col justify-between cursor-pointer hover:border-[#A90F4D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#795344] font-medium">Frete & Atendimento</span>
                    <span className="w-8 h-8 rounded-xl bg-[#F6E9E5] text-[#5A382E] flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl sm:text-2xl font-bold text-[#4A2532]">{formatBRL(storeConfig.defaultShippingFee || 14.9)}</p>
                    <p className="text-[11px] text-[#8B6456] mt-0.5">
                      Grátis acima de {formatBRL(storeConfig.freeShippingMin || 120)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navegação Principal (3 Abas Limpas) */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex p-1.5 rounded-full bg-[#FFF9F3] border border-[#EAD6D0] shadow-2xs overflow-x-auto no-scrollbar max-w-full">
                  {[
                    { id: 'products', label: `Produtos & Estoque (${products.length})`, icon: Package },
                    { id: 'orders', label: `Pedidos & Produção (${orders.length})`, icon: ClipboardList, badge: toProduceCount },
                    { id: 'assistant', label: 'Atendimento, IA & Loja', icon: Sparkles }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = adminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAdminTab(tab.id)}
                        className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-[#A90F4D] text-white shadow-sm'
                            : 'text-[#5A382E] hover:text-[#A90F4D] hover:bg-[#F6E9E5]/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.badge > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isCurrent ? 'bg-white text-[#A90F4D]' : 'bg-[#A90F4D] text-white'}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================================================================ */}
              {/* ABA 1: PRODUTOS & ESTOQUE                                        */}
              {/* ================================================================ */}
              {adminTab === 'products' && (
                <div className="space-y-4">
                  <div className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">Catálogo & Controle de Estoque</h2>
                        <p className="text-xs text-[#795344]">
                          Gerencie preços, ajuste quantidades em 1 clique ou cadastre produtos com variações e personalização.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory({ id: '', name: '', shortName: '', iconType: 'gift', description: '', isEditing: false });
                            setIsCategoryModalOpen(true);
                          }}
                          className="px-4 py-3 rounded-full bg-[#FCEEF2] hover:bg-[#FAD4E0] text-[#A90F4D] border border-[#E5B8C7] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span>Categorias ({categories.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadStatusMsg('');
                            setShowManualUrlInput(false);
                            setGalleryPickerVarIdx(null);
                            setEditingProduct({
                              id: `prod-${Date.now()}`,
                              isNew: true,
                              name: '',
                              category: categories[0]?.id || 'infusoes',
                              price: 24.9,
                              stock: 15,
                              badge: 'Novo',
                              badgeType: 'leaf',
                              featured: true,
                              active: true,
                              rating: 5.0,
                              reviews: 15,
                              image: '',
                              gallery: [],
                              variationItems: [{ name: 'Padrão', image: '', price: '' }],
                              customization: { ...DEFAULT_CUSTOMIZATION, addonGroups: [] },
                              description: ''
                            });
                          }}
                          className="px-5 py-3 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Cadastrar Novo Produto</span>
                        </button>
                      </div>
                    </div>

                    {/* Barra de Busca, Categoria e Filtros Rápidos */}
                    <div className="flex flex-col lg:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={adminProductSearch}
                          onChange={(e) => setAdminProductSearch(e.target.value)}
                          placeholder="Buscar produto por nome..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white transition-colors"
                        />
                      </div>
                      <select
                        value={adminProductCategory}
                        onChange={(e) => setAdminProductCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs font-medium text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                      >
                        <option value="all">Todas as categorias ({products.length})</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.shortName}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'all', label: 'Todos' },
                          { id: 'featured', label: 'Destaques ⭐' },
                          { id: 'customizable', label: 'Personalizáveis ✨' },
                          { id: 'low-stock', label: `Estoque Baixo (${lowStockCount})` },
                          { id: 'hidden', label: 'Ocultos' }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setAdminProductFilter(f.id)}
                            className={`px-3 py-2 rounded-2xl text-[11px] font-semibold shrink-0 border transition-colors ${
                              adminProductFilter === f.id
                                ? 'bg-[#4A2532] text-white border-[#4A2532]'
                                : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9] hover:border-[#A90F4D]'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredAdminProducts.length === 0 ? (
                    <div className="bg-[#FFF9F3] rounded-3xl p-10 text-center border border-[#EAD6D0] space-y-2">
                      <Package className="w-10 h-10 text-[#A90F4D] mx-auto opacity-50" />
                      <p className="text-sm font-semibold text-[#4A2532]">Nenhum produto encontrado neste filtro</p>
                      <p className="text-xs text-[#795344]">Tente limpar a busca ou cadastre um novo produto acima.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAdminProducts.map((p) => {
                        const normVars = normalizeVariationsList(p.variations);
                        const custom = extractProductCustomization(p);
                        const isCustomizable = Boolean(custom.enabled) || (custom.addonGroups && custom.addonGroups.length > 0);
                        const isActive = p.active !== false;
                        const isLowStock = Number(p.stock) <= 3;

                        return (
                          <div
                            key={p.id}
                            className={`bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between gap-4 shadow-2xs ${
                              isActive ? 'border-[#EAD6D0] hover:border-[#D4B2AA] hover:shadow-md' : 'border-red-200 bg-[#FFF9F3]/60 opacity-75'
                            }`}
                          >
                            <div className="flex gap-4 items-start">
                              {/* Foto do Produto */}
                              <div
                                onClick={() => {
                                  setUploadStatusMsg('');
                                  setShowManualUrlInput(false);
                                  setGalleryPickerVarIdx(null);
                                  setEditingProduct({
                                    ...p,
                                    isNew: false,
                                    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : []),
                                    variationItems: normalizeVariationsList(p.variations),
                                    customization: extractProductCustomization(p)
                                  });
                                }}
                                className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-[#E5CFC9] bg-[#F6E9E5] cursor-pointer group"
                              >
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#9A7468]">
                                    <ImageIcon className="w-7 h-7" />
                                  </div>
                                )}
                                {!isActive && (
                                  <span className="absolute inset-x-0 bottom-0 bg-red-700/90 text-white text-[9px] font-bold text-center py-0.5">
                                    Oculto na Loja
                                  </span>
                                )}
                              </div>

                              {/* Informações e Estoque Rápido */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A90F4D]">
                                    {categories.find((c) => c.id === p.category)?.shortName || 'Catálogo'}
                                  </span>
                                  {p.featured && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEF2] text-[#A90F4D]">
                                      ★ Destaque
                                    </span>
                                  )}
                                  {isCustomizable && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                      ✨ Personalizável
                                    </span>
                                  )}
                                  {p.badge && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#4A2532] leading-snug truncate">
                                  {p.name}
                                </h3>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                  <p className="text-lg font-bold text-[#A90F4D]">{formatBRL(p.price)}</p>

                                  {/* Controle Rápido de Estoque (- / +) */}
                                  <div className="inline-flex items-center gap-1.5 bg-[#F6E9E5] px-2 py-1 rounded-full border border-[#E5CFC9]">
                                    <button
                                      type="button"
                                      onClick={() => adjustQuickStock(p, -1)}
                                      className="w-5 h-5 rounded-full bg-white hover:bg-[#EAD6D0] text-[#4A2532] flex items-center justify-center text-xs font-bold shadow-2xs"
                                      title="Diminuir 1 unidade"
                                    >
                                      -
                                    </button>
                                    <span className={`text-[11px] font-semibold px-1.5 ${isLowStock ? 'text-red-600 font-bold' : 'text-[#4A2532]'}`}>
                                      {p.stock} un.
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => adjustQuickStock(p, 1)}
                                      className="w-5 h-5 rounded-full bg-white hover:bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center text-xs font-bold shadow-2xs"
                                      title="Adicionar 1 unidade"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Variações e Combinações */}
                                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                  {normVars.slice(0, 4).map((v, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F6E9E5] border border-[#E5CFC9] text-[10px] text-[#5A382E]"
                                    >
                                      {v.image && <img src={v.image} alt={v.name} className="w-3.5 h-3.5 rounded-full object-cover" />}
                                      <span className="truncate max-w-[95px]">{v.name}</span>
                                    </span>
                                  ))}
                                  {normVars.length > 4 && (
                                    <span className="text-[10px] text-[#9A7468] font-medium">+{normVars.length - 4}</span>
                                  )}
                                  {custom.addonGroups?.length > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FCEEF2] text-[#A90F4D] font-semibold">
                                      + {custom.addonGroups.length} {custom.addonGroups.length === 1 ? 'combinação' : 'combinações'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Barra de Ações Limpa no Rodapé do Card */}
                            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F2DFDA]">
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadStatusMsg('');
                                  setShowManualUrlInput(false);
                                  setGalleryPickerVarIdx(null);
                                  setEditingProduct({
                                    ...p,
                                    isNew: false,
                                    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : []),
                                    variationItems: normalizeVariationsList(p.variations),
                                    customization: extractProductCustomization(p)
                                  });
                                }}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#FCEEF2] hover:bg-[#A90F4D] text-[#A90F4D] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar Produto / Variações</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const toggled = { ...p, featured: !p.featured };
                                  setProducts((prev) => prev.map((item) => (item.id === p.id ? toggled : item)));
                                  syncSingleProductToSupabase(toggled);
                                  showAdminToast(toggled.featured ? `"${p.name}" adicionado aos Destaques!` : `"${p.name}" removido dos Destaques.`);
                                }}
                                className={`p-2 rounded-xl border transition-colors ${
                                  p.featured
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-[#F6E9E5] border-[#E5CFC9] text-[#795344] hover:text-[#A90F4D]'
                                }`}
                                title={p.featured ? 'Remover dos Destaques' : 'Colocar em Destaques'}
                              >
                                <Star className="w-4 h-4" fill={p.featured ? 'currentColor' : 'none'} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const toggled = { ...p, active: !isActive };
                                  setProducts((prev) => prev.map((item) => (item.id === p.id ? toggled : item)));
                                  syncSingleProductToSupabase(toggled);
                                  showAdminToast(toggled.active ? `"${p.name}" visível na vitrine!` : `"${p.name}" ocultado da vitrine.`);
                                }}
                                className={`p-2 rounded-xl border transition-colors ${
                                  isActive
                                    ? 'bg-[#F6E9E5] border-[#E5CFC9] text-[#5A382E] hover:bg-[#4A2532] hover:text-white'
                                    : 'bg-amber-100 border-amber-300 text-amber-900'
                                }`}
                                title={isActive ? 'Ocultar temporariamente da vitrine' : 'Tornar visível na vitrine'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const copyProd = {
                                    ...p,
                                    id: `prod-${Date.now()}`,
                                    isNew: true,
                                    name: `${p.name} (Cópia)`,
                                    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? [...p.gallery] : (p.image ? [p.image] : []),
                                    variationItems: normalizeVariationsList(p.variations),
                                    customization: extractProductCustomization(p)
                                  };
                                  setUploadStatusMsg('');
                                  setShowManualUrlInput(false);
                                  setGalleryPickerVarIdx(null);
                                  setEditingProduct(copyProd);
                                }}
                                className="p-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#5A382E] hover:bg-[#A90F4D] hover:text-white transition-colors"
                                title="Duplicar produto"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteProductAdmin(p.id)}
                                className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================ */}
              {/* ABA 2: PEDIDOS & PRODUÇÃO (UI/UX COMPLETA)                       */}
              {/* ================================================================ */}
              {adminTab === 'orders' && (
                <div className="space-y-4">
                  <div className="bg-[#FFF9F3] p-4 sm:p-5 rounded-3xl border border-[#EAD6D0] shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">Gestão de Pedidos & Produção</h2>
                        <p className="text-xs text-[#795344]">
                          Confira os itens personalizados de cada pedido, mude a etapa de produção e avise a cliente pelo WhatsApp com 1 clique.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => syncAllPendingOrdersWithMercadoPago(false)}
                          className="px-4 py-2.5 rounded-full bg-[#FCEEF2] hover:bg-[#FAD4E0] text-[#A90F4D] border border-[#E5B8C7] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Verificar Pagamentos</span>
                        </button>
                      </div>
                    </div>

                    {/* Filtros por Etapa + Busca de Pedido */}
                    <div className="flex flex-col lg:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={adminOrderSearch}
                          onChange={(e) => setAdminOrderSearch(e.target.value)}
                          placeholder="Buscar por nome da cliente, WhatsApp ou código #MR..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'all', label: `Todos (${orders.length})` },
                          { id: 'paid', label: `Pagos (${orders.filter((o) => o.status === 'Pago').length})` },
                          { id: 'production', label: `Em Produção (${orders.filter((o) => o.status === 'Em Produção').length})` },
                          { id: 'shipped', label: `Enviados (${orders.filter((o) => o.status === 'Enviado').length})` },
                          { id: 'done', label: `Concluídos (${orders.filter((o) => o.status === 'Concluído').length})` },
                          { id: 'pending', label: `Aguardando PIX (${pendingPixCount})` }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setAdminOrderFilter(f.id)}
                            className={`px-3.5 py-2 rounded-2xl text-[11px] font-semibold shrink-0 border transition-colors ${
                              adminOrderFilter === f.id
                                ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                                : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9] hover:border-[#A90F4D]'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredAdminOrders.length === 0 ? (
                    <div className="bg-[#FFF9F3] p-10 rounded-3xl border border-[#EAD6D0] text-center space-y-2">
                      <ClipboardList className="w-10 h-10 text-[#A90F4D] mx-auto opacity-50" />
                      <p className="text-sm font-semibold text-[#4A2532]">Nenhum pedido nesta etapa</p>
                      <p className="text-xs text-[#795344]">Quando novos pedidos chegarem, eles aparecerão aqui com todos os detalhes.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAdminOrders.map((order) => {
                        const isPickup = order.deliveryMethod === 'pickup' || /retirada/i.test(order.address || '');
                        const stages = ['Aguardando PIX', 'Pago', 'Em Produção', 'Enviado', 'Concluído'];
                        return (
                          <div key={order.id} className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-6 border border-[#EAD6D0] shadow-2xs space-y-4">
                            {/* Cabeçalho do Pedido */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0DCD6] pb-3.5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-serif-display text-lg font-bold text-[#4A2532]">#{order.id}</span>
                                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${orderStatusBadgeStyle(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#F6E9E5] text-[#5A382E] text-[10.5px] font-semibold">
                                    {(order.paymentMethod || 'PIX').toUpperCase()}
                                  </span>
                                  <span className="text-[11px] text-[#9A7468]">• {order.createdAt}</span>
                                </div>
                                <p className="text-sm font-bold text-[#4A2532]">
                                  Cliente: <span className="text-[#A90F4D]">{order.customerName}</span>
                                  {order.phone && <span className="text-xs font-normal text-[#795344]"> • {order.phone}</span>}
                                  {order.email && <span className="text-xs font-normal text-[#9A7468]"> • {order.email}</span>}
                                </p>
                              </div>

                              {/* Pipeline de Etapa em 1 Clique */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {stages.map((st) => {
                                  const activeStage = order.status === st;
                                  return (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => handleUpdateOrderStatus(order.id, st)}
                                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                        activeStage
                                          ? 'bg-[#A90F4D] text-white border-[#A90F4D] shadow-xs'
                                          : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9] hover:border-[#A90F4D]'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Corpo do Pedido: Itens Detalhados + Entrega */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Ficha de Produção dos Itens (2 colunas no desktop) */}
                              <div className="lg:col-span-2 space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#795344] block">
                                  Itens para separar / produzir ({(order.items || []).reduce((s, i) => s + Number(i.qty || i.quantity || 1), 0)} un.)
                                </span>
                                <div className="space-y-2">
                                  {(order.items || []).map((item, idx) => {
                                    const rawName = String(item.name || '');
                                    const parenMatch = rawName.match(/^(.*?)\s*\((.*)\)$/);
                                    const baseTitle = parenMatch ? parenMatch[1] : rawName;
                                    const detailsStr = parenMatch ? parenMatch[2] : (item.variation || '');
                                    const detailBadges = detailsStr
                                      ? detailsStr.split('•').map((s) => s.trim()).filter(Boolean)
                                      : [];
                                    const qtyNum = Number(item.qty || item.quantity || 1);

                                    return (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-2xl bg-[#F6E9E5]/70 border border-[#E5CFC9] flex items-start justify-between gap-3"
                                      >
                                        <div className="space-y-1.5 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-lg bg-[#A90F4D] text-white text-xs font-bold shrink-0">
                                              {qtyNum}×
                                            </span>
                                            <span className="font-serif-display font-bold text-sm text-[#4A2532]">
                                              {baseTitle}
                                            </span>
                                          </div>
                                          {detailBadges.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pl-1">
                                              {detailBadges.map((b, bIdx) => {
                                                const isHighlight = /inicial:|nome:|obs:|decoração/i.test(b);
                                                return (
                                                  <span
                                                    key={bIdx}
                                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                      isHighlight
                                                        ? 'bg-[#FCEEF2] text-[#A90F4D] border-[#E5B8C7]'
                                                        : 'bg-white text-[#5A382E] border-[#E5CFC9]'
                                                    }`}
                                                  >
                                                    {b}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-xs font-bold text-[#4A2532] shrink-0">
                                          {formatBRL(Number(item.price || 0) * qtyNum)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Dados de Entrega / Retirada */}
                              <div className="p-3.5 rounded-2xl bg-white border border-[#EAD6D0] flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A2532]">
                                      {isPickup ? (
                                        <><Store className="w-4 h-4 text-[#A90F4D]" />Retirada no Ateliê</>
                                      ) : (
                                        <><Truck className="w-4 h-4 text-[#A90F4D]" />Endereço de Entrega</>
                                      )}
                                    </span>
                                    {!isPickup && order.address && (
                                      <button
                                        type="button"
                                        onClick={() => safeCopyText(`${order.customerName} - ${order.address} - CEP: ${order.cep}`, 'Endereço')}
                                        className="text-[10.5px] font-semibold text-[#A90F4D] hover:underline flex items-center gap-1"
                                      >
                                        <Copy className="w-3 h-3" />Copiar
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#5A382E] leading-relaxed">
                                    {order.address || 'Retirada no Ateliê Mimo Rosas'}
                                  </p>
                                  {!isPickup && order.cep && order.cep !== '-' && (
                                    <p className="text-[11px] text-[#795344]">
                                      <strong>CEP:</strong> {order.cep}
                                    </p>
                                  )}
                                  {order.notes && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                                      <strong>Observação da cliente:</strong> {order.notes}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2.5 border-t border-[#F0DCD6] flex items-center justify-between">
                                  <span className="text-xs text-[#795344]">Total do Pedido</span>
                                  <span className="text-lg font-bold text-[#A90F4D]">{formatBRL(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rodapé do Pedido: WhatsApp Inteligente + Excluir */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0DCD6]">
                              <button
                                type="button"
                                onClick={() => handleDeleteOrderAdmin(order.id)}
                                className="px-3 py-1.5 rounded-full text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />Remover pedido
                              </button>

                              <a
                                href={`https://wa.me/55${(order.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                              >
                                <span>Avisar Cliente no WhatsApp ({order.status})</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================ */}
              {/* ABA 3: ATENDIMENTO, IA VENDEDORA & CONFIGURAÇÕES DA LOJA         */}
              {/* ================================================================ */}
              {adminTab === 'assistant' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                  {/* Coluna de Configurações (2/3) */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Card 1: Assistente Virtual IA */}
                    <div className="bg-[#FFF9F3] rounded-3xl p-5 sm:p-6 border border-[#EAD6D0] shadow-2xs space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center border border-[#E5B8C7]">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#4A2532]">
                            Assistente Virtual Mimo Rosas
                          </h2>
                          <p className="text-xs text-[#795344]">
                            Personalize como a assistente recebe suas clientes, apresenta produtos e tira dúvidas de prazos.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="font-semibold text-[#4A2532]">Mensagem de Boas-vindas</label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              {
                                label: '🌹 Acolhedora',
                                text: 'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a escolher presentes, cuias e aromas especiais.'
                              },
                              {
                                label: '🎁 Foco em Presentes',
                                text: 'Oi, que alegria ter você na Mimo Rosas! 🎁 Procurando um presente personalizado com inicial ou um mimo especial para o seu chimarrão? Me conta como posso ajudar!'
                              },
                              {
                                label: '🚚 Destacar Frete Grátis',
                                text: `Olá! 🌹 Bem-vinda à Mimo Rosas! Aproveite nosso Frete Grátis em compras acima de ${formatBRL(storeConfig.freeShippingMin || 120)}. Como posso te ajudar hoje?`
                              }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setStoreConfig({ ...storeConfig, assistantGreeting: preset.text })}
                                className="px-2.5 py-1 rounded-full bg-[#F6E9E5] hover:bg-[#FCEEF2] text-[#5A382E] hover:text-[#A90F4D] border border-[#E5CFC9] text-[10.5px] font-medium transition-colors"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          value={storeConfig.assistantGreeting}
                          onChange={(e) => setStoreConfig({ ...storeConfig, assistantGreeting: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Prazo de Produção Artesanal</label>
                          <input
                            type="text"
                            placeholder="Ex: 2 a 5 dias úteis"
                            value={storeConfig.productionTimeText || '2 a 5 dias úteis'}
                            onChange={(e) => setStoreConfig({ ...storeConfig, productionTimeText: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Local de Retirada / Cidade</label>
                          <input
                            type="text"
                            placeholder="Ex: Ateliê Mimo Rosas - Chapecó/SC"
                            value={storeConfig.storeLocationText || 'Ateliê Mimo Rosas - Chapecó/SC'}
                            onChange={(e) => setStoreConfig({ ...storeConfig, storeLocationText: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-semibold text-[#4A2532] mb-1">
                          Aviso / Promoção Especial nas Dúvidas (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Todos os pedidos acompanham embalagem presenteável e mimo perfumado!"
                          value={storeConfig.assistantExtraNote || ''}
                          onChange={(e) => setStoreConfig({ ...storeConfig, assistantExtraNote: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Card 2: WhatsApp, Frete por KM (Chapecó e Região) & Pagamentos */}
                    <div className="bg-[#FFF9F3] rounded-3xl p-5 sm:p-6 border border-[#EAD6D0] shadow-2xs space-y-4">
                      <div>
                        <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                          WhatsApp, Frete por KM (Chapecó e Região) e Recebimento
                        </h3>
                        <p className="text-xs text-[#795344]">
                          Entregas configuradas exclusivamente para <strong>Chapecó/SC e cidades próximas</strong>, com cálculo automático por quilometragem.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">WhatsApp (55 + DDD)</label>
                          <input
                            type="text"
                            value={storeConfig.whatsappNumber}
                            onChange={(e) => setStoreConfig({ ...storeConfig, whatsappNumber: e.target.value })}
                            placeholder="Ex: 5549999999999"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Taxa Base de Saída (R$)</label>
                          <input
                            type="number"
                            step="0.50"
                            value={storeConfig.shippingBaseFee ?? 6}
                            onChange={(e) => setStoreConfig({ ...storeConfig, shippingBaseFee: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Valor por KM (R$/km)</label>
                          <input
                            type="number"
                            step="0.10"
                            value={storeConfig.shippingPerKm ?? 1.5}
                            onChange={(e) => setStoreConfig({ ...storeConfig, shippingPerKm: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Frete Grátis Chapecó (R$)</label>
                          <input
                            type="number"
                            value={storeConfig.freeShippingMin}
                            onChange={(e) => setStoreConfig({ ...storeConfig, freeShippingMin: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FCEEF2]/70 border border-[#E5B8C7] text-[11px] text-[#4A2532] flex flex-wrap items-center justify-between gap-2">
                        <span>
                          🚚 <strong>Simulação da regra atual:</strong> Taxa base {formatBRL(storeConfig.shippingBaseFee ?? 6)} + {formatBRL(storeConfig.shippingPerKm ?? 1.5)}/km
                        </span>
                        <div className="flex flex-wrap gap-2 text-[10.5px]">
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5B8C7] font-semibold">
                            Centro (2 km): {formatBRL(Number(storeConfig.shippingBaseFee ?? 6) + 2 * Number(storeConfig.shippingPerKm ?? 1.5))}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5B8C7] font-semibold">
                            Bairros (4 km): {formatBRL(Number(storeConfig.shippingBaseFee ?? 6) + 4 * Number(storeConfig.shippingPerKm ?? 1.5))}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5B8C7] font-semibold">
                            Efapi (8.5 km): {formatBRL(Number(storeConfig.shippingBaseFee ?? 6) + 8.5 * Number(storeConfig.shippingPerKm ?? 1.5))}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Chave PIX da Loja</label>
                          <input
                            type="text"
                            value={storeConfig.pixKey || ''}
                            onChange={(e) => setStoreConfig({ ...storeConfig, pixKey: e.target.value })}
                            placeholder="CPF, CNPJ, E-mail ou Celular"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A2532] mb-1">Nome do Titular no PIX</label>
                          <input
                            type="text"
                            value={storeConfig.pixHolderName || 'Mimo Rosas'}
                            onChange={(e) => setStoreConfig({ ...storeConfig, pixHolderName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F0F8FF]/70 border border-[#BBDDF8] space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-bold text-[#005B8F] flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-[#009EE3]" />
                              <span>Checkout Transparente Mercado Pago (PIX Oficial + Cartão na Loja)</span>
                            </p>
                            <p className="text-[11px] text-[#35637C]">
                              A cliente paga com PIX dinâmico ou digita o Cartão de Crédito <strong>direto dentro do site da Mimo Rosas</strong> (sem redirecionar para fora) e o status muda para <strong>Pago</strong> sozinho.
                            </p>
                          </div>
                          {(storeConfig.mercadoPagoAccessToken || '').trim().startsWith('APP_USR-') && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                              ✓ Transparente Ativo
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block font-semibold text-[#4A2532] mb-1">Access Token (APP_USR-...)</label>
                            <input
                              type="password"
                              placeholder="APP_USR-..."
                              value={storeConfig.mercadoPagoAccessToken || ''}
                              onChange={(e) => setStoreConfig({ ...storeConfig, mercadoPagoAccessToken: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#BBDDF8] font-mono text-[11px] text-[#4A2532] focus:outline-none focus:border-[#009EE3]"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="block font-semibold text-[#4A2532] mb-1">Public Key (APP_USR-...)</label>
                            <input
                              type="text"
                              placeholder="APP_USR-..."
                              value={storeConfig.mercadoPagoPublicKey || ''}
                              onChange={(e) => setStoreConfig({ ...storeConfig, mercadoPagoPublicKey: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#BBDDF8] font-mono text-[11px] text-[#4A2532] focus:outline-none focus:border-[#009EE3]"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="block font-semibold text-[#4A2532] mb-1">Máx. Parcelas no Cartão</label>
                            <select
                              value={storeConfig.maxInstallments || 3}
                              onChange={(e) => setStoreConfig({ ...storeConfig, maxInstallments: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#BBDDF8] text-xs font-semibold text-[#4A2532] focus:outline-none focus:border-[#009EE3]"
                            >
                              {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                                <option key={n} value={n}>Até {n}x no cartão</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F6E9E5]/70 border border-[#E5CFC9] space-y-3 text-xs">
                        <div>
                          <p className="font-bold text-[#4A2532]">E-mails Automáticos de Status do Pedido (Resend)</p>
                          <p className="text-[11px] text-[#795344]">
                            Envia automaticamente um e-mail personalizado da Mimo Rosas quando o cliente faz o pedido, quando o pagamento é confirmado e quando você muda para <em>Em Produção</em>, <em>Enviado</em> ou <em>Concluído</em>.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-[#4A2532] mb-1">Chave de API do Resend (re_...)</label>
                            <input
                              type="password"
                              placeholder="re_..."
                              value={storeConfig.resendApiKey || ''}
                              onChange={(e) => setStoreConfig({ ...storeConfig, resendApiKey: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] font-mono text-[11px] text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#4A2532] mb-1">E-mail Remetente (verificado no Resend)</label>
                            <input
                              type="text"
                              placeholder="Mimo Rosas <contato@seudominio.com.br>"
                              value={storeConfig.resendFromEmail || ''}
                              onChange={(e) => setStoreConfig({ ...storeConfig, resendFromEmail: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-xs text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            setChatMessages([{ id: `welcome-${Date.now()}`, sender: 'bot', text: storeConfig.assistantGreeting, time: 'Agora' }]);
                            await syncStoreConfigToSupabase(storeConfig);
                            showAdminToast('Configurações da loja salvas com sucesso!');
                          }}
                          className="px-6 py-3 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Salvar Configurações da Loja</span>
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Equipe & Acesso Administrativo (/admin) */}
                    <div className="bg-[#FFF9F3] rounded-3xl p-5 sm:p-6 border border-[#EAD6D0] shadow-2xs space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center border border-[#E5B8C7]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                            Equipe & Acesso Administrativo
                          </h3>
                          <p className="text-xs text-[#795344]">
                            Libere acesso ao painel <code>/admin</code> para outra conta (ex: e-mail da proprietária da loja). Basta que ela crie a conta no site com o mesmo e-mail abaixo!
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddAdminEmail} className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          required
                          placeholder="Digite o e-mail da conta para tornar Admin (ex: cliente@gmail.com)"
                          value={newAdminEmailInput}
                          onChange={(e) => setNewAdminEmailInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-full bg-[#4A2532] hover:bg-[#A90F4D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Conceder Acesso Admin</span>
                        </button>
                      </form>

                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#795344] block">
                          Contas com permissão de Administrador
                        </span>
                        <div className="space-y-2">
                          {Array.from(
                            new Set([
                              ...(auth.user?.email ? [String(auth.user.email).trim().toLowerCase()] : []),
                              ...((Array.isArray(storeConfig.adminEmails) ? storeConfig.adminEmails : []).map((em) => String(em || '').trim().toLowerCase()).filter(Boolean))
                            ])
                          ).map((adminEm) => {
                            const isSelf = auth.user?.email && adminEm === String(auth.user.email).trim().toLowerCase();
                            return (
                              <div
                                key={adminEm}
                                className="px-3.5 py-2.5 rounded-2xl bg-[#F6E9E5]/70 border border-[#E5CFC9] flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-7 h-7 rounded-full bg-[#A90F4D] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {adminEm.charAt(0).toUpperCase()}
                                  </span>
                                  <span className="font-semibold text-[#4A2532] truncate">{adminEm}</span>
                                  {isSelf && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      Sua conta atual
                                    </span>
                                  )}
                                </div>
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAdminEmail(adminEm)}
                                    className="px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-[10.5px] font-semibold transition-colors shrink-0"
                                  >
                                    Remover acesso
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna de Preview ao Vivo da Assistente (1/3) */}
                  <div className="bg-[#FFF9F3] rounded-3xl border border-[#EAD6D0] shadow-md overflow-hidden">
                    <div className="p-4 text-white flex items-center gap-3" style={{ background: 'linear-gradient(90deg, #980B44 0%, #A90F4D 100%)' }}>
                      <div className="w-9 h-9 rounded-full bg-[#FFF9F3] flex items-center justify-center shrink-0">
                        <MimoRoseOutlineSVG className="w-5 h-6" />
                      </div>
                      <div>
                        <p className="font-serif-display font-bold text-sm leading-tight">Prévia da Assistente</p>
                        <p className="text-[10.5px] text-[#FAD4E0]">Como sua cliente vê na loja</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#F6E9E5]/60 space-y-3 text-xs">
                      <div className="bg-[#FFF9F3] text-[#4A2532] border border-[#EBD5CF] rounded-2xl rounded-bl-xs p-3 leading-relaxed shadow-2xs">
                        {storeConfig.assistantGreeting}
                      </div>
                      <div className="bg-[#FFF9F3] text-[#4A2532] border border-[#EBD5CF] rounded-2xl rounded-bl-xs p-3 leading-relaxed shadow-2xs space-y-1">
                        <p className="font-bold text-[#A90F4D]">Resumo automático nas respostas:</p>
                        <p>🚚 Entrega (Chapecó/SC e Região): {formatBRL(storeConfig.shippingBaseFee ?? 6)} + {formatBRL(storeConfig.shippingPerKm ?? 1.5)}/km (Grátis em Chapecó acima de {formatBRL(storeConfig.freeShippingMin || 120)})</p>
                        <p>⏱️ Produção: {storeConfig.productionTimeText || '2 a 5 dias úteis'}</p>
                        <p>📍 Retirada: {storeConfig.storeLocationText || 'Ateliê Mimo Rosas - Chapecó/SC'}</p>
                        {storeConfig.assistantExtraNote && <p>✨ {storeConfig.assistantExtraNote}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {editingProduct && (() => {
              const varItems = Array.isArray(editingProduct.variationItems)
                ? editingProduct.variationItems
                : normalizeVariationsList(editingProduct.variations);
              const updateVarItems = (nextList) => setEditingProduct((prev) => ({
                ...prev,
                variationItems: nextList,
                variations: nextList
              }));
              const customCfg = editingProduct.customization || extractProductCustomization(editingProduct);
              const updateCustomCfg = (patch) => setEditingProduct((prev) => {
                const curr = prev.customization || extractProductCustomization(prev);
                return { ...prev, customization: { ...curr, ...patch } };
              });
              const addonGroups = Array.isArray(customCfg.addonGroups) ? customCfg.addonGroups : [];
              const updateAddonGroups = (nextGroups) => updateCustomCfg({ addonGroups: nextGroups });

              const badgeSuggestions = ['', 'Novo', 'Mais Vendido', 'Artesanal', 'Exclusivo', 'Personalizável', 'Presenteável', 'Edição Especial'];
              const galleryList = Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 0
                ? editingProduct.gallery.filter(Boolean)
                : (editingProduct.image ? [editingProduct.image] : []);

              return (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <form
                    onSubmit={handleSaveProductAdmin}
                    className="bg-[#FFF9F3] w-full max-w-3xl rounded-t-[28px] sm:rounded-[28px] border border-[#EAD6D0] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-xs"
                  >
                    {/* Cabeçalho Fixo */}
                    <div className="px-5 py-4 bg-gradient-to-r from-[#FFF9F3] to-[#FCEEF2]/60 border-b border-[#F0DCD6] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center border border-[#E5B8C7]">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#4A2532]">
                            {editingProduct.isNew ? 'Cadastrar Novo Produto' : 'Editar Produto'}
                          </h3>
                          <p className="text-[11px] text-[#795344]">
                            Configure fotos, variações, combinações de enfeite/decoração e personalização por unidade.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-2 rounded-full bg-[#F6E9E5] hover:bg-[#EAD6D0] text-[#4A2532] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Input oculto para upload de foto de variação ou de opção de decoração */}
                    <input
                      ref={variationImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (uploadingAddonTarget) {
                            uploadProductPhoto(file, {
                              type: 'addon',
                              groupIndex: uploadingAddonTarget.groupIndex,
                              optionIndex: uploadingAddonTarget.optionIndex
                            });
                            setUploadingAddonTarget(null);
                          } else if (uploadingVariationIndex !== null) {
                            uploadProductPhoto(file, { type: 'variation', index: uploadingVariationIndex });
                          }
                        }
                        e.target.value = '';
                      }}
                    />

                    {/* Corpo Rolável */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                      {/* SEÇÃO 1: Dados Principais */}
                      <div className="bg-white/80 rounded-2xl p-4 border border-[#EAD6D0] space-y-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#4A2532] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#A90F4D]" />1. Informações Principais
                          </span>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={editingProduct.active !== false}
                                onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                                className="accent-[#A90F4D] w-3.5 h-3.5"
                              />
                              <span className="text-[11px] font-semibold text-[#4A2532]">Visível na loja</span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.featured)}
                                onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                                className="accent-[#A90F4D] w-3.5 h-3.5"
                              />
                              <span className="text-[11px] font-semibold text-[#A90F4D]">Destaque</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-semibold text-[#5A382E] mb-1">Nome do Produto *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Cuia Resinada Quartzo Rosa & Ouro"
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white transition-colors"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-semibold text-[#5A382E]">Categoria</label>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory({ id: '', name: '', shortName: '', iconType: 'gift', description: '', isEditing: false });
                                  setIsCategoryModalOpen(true);
                                }}
                                className="text-[10.5px] font-bold text-[#A90F4D] hover:underline flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />Nova categoria
                              </button>
                            </div>
                            <select
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs font-medium text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                            >
                              {categories.map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-[#5A382E] mb-1">Preço Base (R$) *</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A90F4D]">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm font-bold text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#5A382E] mb-1">Estoque Disponível (un.)</label>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, stock: Math.max(0, Number(editingProduct.stock || 0) - 1) })}
                                className="px-2.5 py-2.5 rounded-xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#E5CFC9] text-[#4A2532] font-bold"
                              >
                                -1
                              </button>
                              <input
                                type="number"
                                min="0"
                                required
                                value={editingProduct.stock}
                                onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm font-bold text-center text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, stock: Number(editingProduct.stock || 0) + 1 })}
                                className="px-2.5 py-2.5 rounded-xl bg-[#F6E9E5] hover:bg-[#EAD6D0] border border-[#E5CFC9] text-[#4A2532] font-bold"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, stock: Number(editingProduct.stock || 0) + 5 })}
                                className="px-2.5 py-2.5 rounded-xl bg-[#FCEEF2] hover:bg-[#FAD4E0] border border-[#E5B8C7] text-[#A90F4D] font-bold"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Selo rápido */}
                        <div className="pt-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="font-semibold text-[#5A382E]">Selo de Destaque na Foto (opcional)</label>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, badgeType: 'star' })}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${editingProduct.badgeType !== 'leaf' ? 'bg-[#A90F4D] text-white border-[#A90F4D]' : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9]'}`}
                              >
                                <Star className="w-3 h-3" />Estrela
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, badgeType: 'leaf' })}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${editingProduct.badgeType === 'leaf' ? 'bg-[#A90F4D] text-white border-[#A90F4D]' : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9]'}`}
                              >
                                <Sparkles className="w-3 h-3" />Brilho
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {badgeSuggestions.map((b) => {
                              const activeBadge = (editingProduct.badge || '') === b;
                              return (
                                <button
                                  key={b || 'none'}
                                  type="button"
                                  onClick={() => setEditingProduct({ ...editingProduct, badge: b })}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${activeBadge ? 'bg-[#A90F4D] text-white border-[#A90F4D]' : 'bg-[#F6E9E5] text-[#5A382E] border-[#E5CFC9] hover:border-[#A90F4D]'}`}
                                >
                                  {b || 'Sem selo'}
                                </button>
                              );
                            })}
                            <input
                              type="text"
                              placeholder="Ou digite um selo..."
                              value={editingProduct.badge || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                              className="px-3 py-1 rounded-full bg-[#F6E9E5] border border-[#E5CFC9] text-[11px] text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white w-36"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SEÇÃO 2: Fotos do Produto (Capa + Galeria) */}
                      <div className="p-4 rounded-2xl bg-[#F6E9E5] border border-[#DFC3BC] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="font-bold text-[#4A2532] uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#A90F4D]" /><span>2. Fotos do Produto (Capa + Galeria)</span>
                          </label>
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF9F3] text-[#A90F4D] border border-[#EAD6D0]">
                            Upload direto + Compressão automática
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                          <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#FFF9F3] border-2 border-[#A90F4D] shrink-0 shadow-xs mx-auto sm:mx-0">
                            {editingProduct.image ? (
                              <img src={editingProduct.image} alt="Preview Capa" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[#9A7468] gap-1">
                                <ImageIcon className="w-6 h-6" />
                                <span className="text-[9px]">Sem capa</span>
                              </div>
                            )}
                            <span className="absolute bottom-1 left-1 right-1 bg-[#A90F4D]/90 text-white text-[9px] font-bold text-center py-0.5 rounded-md">
                              Foto de Capa
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
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
                            <input
                              ref={galleryImageInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) uploadProductPhoto(files, 'gallery');
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              disabled={uploadingImage}
                              onClick={() => mainImageInputRef.current?.click()}
                              className="w-full py-2.5 px-3.5 rounded-xl bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
                            >
                              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              <span>{uploadingImage ? 'Enviando e otimizando...' : 'Enviar Foto Principal (Celular / PC)'}</span>
                            </button>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={uploadingImage}
                                onClick={() => galleryImageInputRef.current?.click()}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#FFF9F3] hover:bg-white text-[#A90F4D] border border-[#D4B2AA] font-semibold flex items-center justify-center gap-1.5 text-[11px]"
                              >
                                <Plus className="w-3.5 h-3.5" /><span>Adicionar fotos na galeria (várias)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowManualUrlInput((v) => !v)}
                                className="py-2 px-3 rounded-xl bg-[#FFF9F3] hover:bg-white text-[#795344] border border-[#E5CFC9] font-medium text-[11px]"
                              >
                                {showManualUrlInput ? 'Ocultar link' : 'Colar URL'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {uploadStatusMsg && (
                          <div className="px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-[11px] font-medium text-[#4A2532]">
                            {uploadStatusMsg}
                          </div>
                        )}

                        {galleryList.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-[#5A382E]">
                              Galeria do produto ({galleryList.length} {galleryList.length === 1 ? 'foto' : 'fotos'} — clique numa foto para torná-la a Capa Principal):
                            </span>
                            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                              {galleryList.map((imgUrl, idx) => {
                                const isMain = editingProduct.image === imgUrl;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setEditingProduct({ ...editingProduct, image: imgUrl })}
                                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${isMain ? 'border-[#A90F4D] ring-2 ring-[#A90F4D]/30' : 'border-white opacity-85 hover:opacity-100'}`}
                                  >
                                    <img src={imgUrl} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover" />
                                    {isMain && (
                                      <span className="absolute bottom-0 inset-x-0 bg-[#A90F4D] text-white text-[8px] font-bold text-center py-0.5">
                                        Capa
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const filtered = galleryList.filter((_, i) => i !== idx);
                                        setEditingProduct({
                                          ...editingProduct,
                                          gallery: filtered,
                                          image: editingProduct.image === imgUrl ? (filtered[0] || '') : editingProduct.image
                                        });
                                      }}
                                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center text-[10px] hover:bg-red-600"
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

                        {showManualUrlInput && (
                          <div className="pt-1">
                            <label className="block text-[10.5px] font-semibold text-[#795344] mb-1">Link (URL) da imagem de capa:</label>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={editingProduct.image || ''}
                              onChange={(e) => {
                                const url = e.target.value;
                                const nextGal = url && !galleryList.includes(url) ? [url, ...galleryList] : galleryList;
                                setEditingProduct({ ...editingProduct, image: url, gallery: nextGal });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-[11px]"
                            />
                          </div>
                        )}
                      </div>

                      {/* SEÇÃO 3: Variações com Foto e Preço por Variação */}
                      <div className="bg-white/90 rounded-2xl p-4 border-2 border-[#EAD6D0] space-y-3.5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#4A2532] uppercase tracking-wider flex items-center gap-1.5">
                              <LayoutGrid className="w-3.5 h-3.5 text-[#A90F4D]" />3. Variações do Produto (com Foto por Variação)
                            </span>
                            <p className="text-[11px] text-[#795344] mt-0.5">
                              Adicione opções (cores, aromas, tamanhos ou kits) e coloque uma foto específica para cada uma! Quando a cliente clicar na variação, a foto do produto muda na hora.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateVarItems([...varItems, { name: '', image: '', price: '' }])}
                            className="px-3.5 py-2 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 self-start sm:self-auto shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />Adicionar Variação
                          </button>
                        </div>

                        {/* Sugestões rápidas de variação */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10.5px] text-[#8B6456] font-medium">Adicionar rápido:</span>
                          {['Padrão', 'Edição Presente', 'Caixa c/ 2 un.', 'Caixa c/ 4 un.', 'Rosé Gold', 'Dourado', 'Com Inicial'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                if (varItems.length === 1 && !varItems[0].name.trim()) {
                                  updateVarItems([{ ...varItems[0], name: preset }]);
                                } else {
                                  updateVarItems([...varItems, { name: preset, image: '', price: '' }]);
                                }
                              }}
                              className="px-2.5 py-1 rounded-full bg-[#F6E9E5] hover:bg-[#FCEEF2] text-[#5A382E] hover:text-[#A90F4D] border border-[#E5CFC9] text-[10.5px] font-medium transition-colors"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>

                        {/* Lista de Cards de Variação */}
                        <div className="space-y-2.5">
                          {varItems.map((item, vIdx) => (
                            <div key={vIdx} className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#E5CFC9] space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Miniatura / Botão de Foto da Variação */}
                                <div className="flex items-center gap-2.5 shrink-0">
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F6E9E5] border-2 border-[#D4B2AA] shrink-0 group">
                                    {item.image ? (
                                      <>
                                        <img src={item.image} alt={item.name || 'Variação'} className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = varItems.map((v, i) => (i === vIdx ? { ...v, image: '' } : v));
                                            updateVarItems(next);
                                          }}
                                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 text-white text-[10px] flex items-center justify-center hover:bg-red-600"
                                          title="Remover foto desta variação"
                                        >
                                          ×
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setUploadingVariationIndex(vIdx);
                                          variationImageInputRef.current?.click();
                                        }}
                                        className="w-full h-full flex flex-col items-center justify-center text-[#A90F4D] hover:bg-[#FCEEF2] transition-colors p-1 text-center"
                                        title="Enviar foto desta variação"
                                      >
                                        <Camera className="w-4 h-4 mb-0.5" />
                                        <span className="text-[8.5px] font-bold leading-tight">Adicionar Foto</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1 sm:hidden">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadingVariationIndex(vIdx);
                                        variationImageInputRef.current?.click();
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#FCEEF2] text-[#A90F4D] text-[10px] font-semibold flex items-center gap-1"
                                    >
                                      <Upload className="w-3 h-3" />Enviar foto
                                    </button>
                                    {galleryList.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setGalleryPickerVarIdx(galleryPickerVarIdx === vIdx ? null : vIdx)}
                                        className="px-2.5 py-1 rounded-lg bg-[#F6E9E5] text-[#5A382E] text-[10px] font-medium"
                                      >
                                        Usar da galeria
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Nome e Preço Opcional da Variação */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-semibold text-[#795344] mb-0.5">
                                      Nome da Variação #{vIdx + 1} *
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ex: Rosa Porcelana, Caixa c/ 4 Rosas..."
                                      value={item.name}
                                      onChange={(e) => {
                                        const next = varItems.map((v, i) => (i === vIdx ? { ...v, name: e.target.value } : v));
                                        updateVarItems(next);
                                      }}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs font-medium text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[#795344] mb-0.5">
                                      Preço próprio (opcional)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder={`Padrão: ${formatBRL(editingProduct.price)}`}
                                      value={item.price !== undefined && item.price !== null ? item.price : ''}
                                      onChange={(e) => {
                                        const next = varItems.map((v, i) => (i === vIdx ? { ...v, price: e.target.value } : v));
                                        updateVarItems(next);
                                      }}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Ações de Foto e Excluir no Desktop */}
                                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadingVariationIndex(vIdx);
                                      variationImageInputRef.current?.click();
                                    }}
                                    className="px-2.5 py-2 rounded-xl bg-[#FCEEF2] hover:bg-[#FAD4E0] text-[#A90F4D] text-[10.5px] font-semibold flex items-center gap-1 transition-colors"
                                    title="Enviar foto do celular ou computador para esta variação"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>{item.image ? 'Trocar foto' : 'Foto'}</span>
                                  </button>
                                  {galleryList.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setGalleryPickerVarIdx(galleryPickerVarIdx === vIdx ? null : vIdx)}
                                      className="px-2.5 py-2 rounded-xl bg-[#F6E9E5] hover:bg-[#EAD6D0] text-[#5A382E] text-[10.5px] font-medium transition-colors"
                                      title="Escolher uma foto já enviada na galeria"
                                    >
                                      Galeria
                                    </button>
                                  )}
                                  {varItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => updateVarItems(varItems.filter((_, i) => i !== vIdx))}
                                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                      title="Remover variação"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                {varItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => updateVarItems(varItems.filter((_, i) => i !== vIdx))}
                                    className="sm:hidden self-end px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-semibold inline-flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />Remover variação
                                  </button>
                                )}
                              </div>

                              {/* Seletor rápido de fotos da galeria para esta variação */}
                              {galleryPickerVarIdx === vIdx && galleryList.length > 0 && (
                                <div className="pt-2 border-t border-[#EFE0DC] space-y-1.5">
                                  <span className="text-[10px] font-semibold text-[#795344]">
                                    Toque em uma foto da galeria para usar na variação &quot;{item.name || `#${vIdx + 1}`}&quot;:
                                  </span>
                                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    {galleryList.map((gUrl, gIdx) => (
                                      <button
                                        key={gIdx}
                                        type="button"
                                        onClick={() => {
                                          const next = varItems.map((v, i) => (i === vIdx ? { ...v, image: gUrl } : v));
                                          updateVarItems(next);
                                          setGalleryPickerVarIdx(null);
                                        }}
                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${item.image === gUrl ? 'border-[#A90F4D]' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                      >
                                        <img src={gUrl} alt="" className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SEÇÃO 3.1: Combinações Extras (Ex: Decoração / Enfeite ao redor, Tassel, Ferragem) */}
                      <div className="bg-white/90 rounded-2xl p-4 border-2 border-[#EAD6D0] space-y-3.5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#4A2532] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#A90F4D]" />4. Combinações Extras (Decoração / Enfeite ao redor / Acabamento)
                            </span>
                            <p className="text-[11px] text-[#795344] mt-0.5">
                              Use quando a cliente puder combinar a variação principal (ex: Chaveiro Azul ou Preto) com uma decoração/enfeite ao redor!
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateAddonGroups([
                              ...addonGroups,
                              {
                                id: `grp-${Date.now()}`,
                                title: 'Decoração / Enfeite ao redor',
                                options: [
                                  { name: 'Pétalas + Folha de Ouro', image: '', extraPrice: '' },
                                  { name: 'Pérolas + Rosas Brancas', image: '', extraPrice: '' }
                                ]
                              }
                            ])}
                            className="px-3.5 py-2 rounded-full bg-[#FCEEF2] hover:bg-[#FAD4E0] text-[#A90F4D] border border-[#E5B8C7] text-[11px] font-semibold flex items-center gap-1 shrink-0 self-start sm:self-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />Adicionar Grupo de Escolha
                          </button>
                        </div>

                        {/* Atalhos rápidos para criar grupos comuns */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10.5px] text-[#8B6456] font-medium">Criar grupo rápido:</span>
                          {[
                            { title: 'Decoração / Enfeite ao redor', opts: ['Pétalas + Folha de Ouro', 'Pérolas + Mini Rosas', 'Glitter Rosé + Borboleta'] },
                            { title: 'Cor do Tassel / Pingente', opts: ['Tassel Rosa', 'Tassel Creme', 'Tassel Preto'] },
                            { title: 'Cor da Ferragem / Argola', opts: ['Dourada', 'Rosé Gold', 'Prata'] }
                          ].map((preset) => (
                            <button
                              key={preset.title}
                              type="button"
                              onClick={() => updateAddonGroups([
                                ...addonGroups,
                                {
                                  id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                  title: preset.title,
                                  options: preset.opts.map((name) => ({ name, image: '', extraPrice: '' }))
                                }
                              ])}
                              className="px-2.5 py-1 rounded-full bg-[#F6E9E5] hover:bg-[#FCEEF2] text-[#5A382E] hover:text-[#A90F4D] border border-[#E5CFC9] text-[10.5px] font-medium transition-colors"
                            >
                              + {preset.title}
                            </button>
                          ))}
                        </div>

                        {addonGroups.length === 0 ? (
                          <p className="text-[11px] text-[#9A7468] italic">
                            Nenhum grupo extra adicionado. Clique em um dos botões acima se o produto tiver escolha de decoração/enfeite ao redor.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {addonGroups.map((grp, gIdx) => (
                              <div key={grp.id || gIdx} className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#DFC3BC] space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-[#A90F4D] uppercase mb-0.5">
                                      Título da Escolha Extra #{gIdx + 1}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ex: Decoração / Enfeite ao redor"
                                      value={grp.title}
                                      onChange={(e) => {
                                        const next = addonGroups.map((g, i) => (i === gIdx ? { ...g, title: e.target.value } : g));
                                        updateAddonGroups(next);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5CFC9] text-xs font-bold text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateAddonGroups(addonGroups.filter((_, i) => i !== gIdx))}
                                    className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[10.5px] font-semibold flex items-center gap-1 mt-4"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />Remover grupo
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {(grp.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#EFE0DC]">
                                      {/* Foto da opção de decoração */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F6E9E5] border border-[#D4B2AA] shrink-0">
                                          {opt.image ? (
                                            <>
                                              <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const next = addonGroups.map((g, i) => (
                                                    i === gIdx
                                                      ? { ...g, options: g.options.map((o, j) => (j === oIdx ? { ...o, image: '' } : o)) }
                                                      : g
                                                  ));
                                                  updateAddonGroups(next);
                                                }}
                                                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/75 text-white text-[9px] flex items-center justify-center"
                                              >
                                                ×
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setUploadingAddonTarget({ groupIndex: gIdx, optionIndex: oIdx });
                                                variationImageInputRef.current?.click();
                                              }}
                                              className="w-full h-full flex flex-col items-center justify-center text-[#A90F4D] hover:bg-[#FCEEF2] text-[8px] font-bold"
                                              title="Enviar foto desta decoração"
                                            >
                                              <Camera className="w-3.5 h-3.5" />
                                              <span>Foto</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="sm:col-span-2">
                                          <input
                                            type="text"
                                            placeholder="Ex: Pétalas Naturais + Folha de Ouro"
                                            value={opt.name}
                                            onChange={(e) => {
                                              const next = addonGroups.map((g, i) => (
                                                i === gIdx
                                                  ? { ...g, options: g.options.map((o, j) => (j === oIdx ? { ...o, name: e.target.value } : o)) }
                                                  : g
                                              ));
                                              updateAddonGroups(next);
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                                          />
                                        </div>
                                        <div>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Valor extra (+R$ 0)"
                                            value={opt.extraPrice !== undefined && opt.extraPrice !== null ? opt.extraPrice : ''}
                                            onChange={(e) => {
                                              const next = addonGroups.map((g, i) => (
                                                i === gIdx
                                                  ? { ...g, options: g.options.map((o, j) => (j === oIdx ? { ...o, extraPrice: e.target.value } : o)) }
                                                  : g
                                              ));
                                              updateAddonGroups(next);
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                                          />
                                        </div>
                                      </div>

                                      {(grp.options || []).length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = addonGroups.map((g, i) => (
                                              i === gIdx ? { ...g, options: g.options.filter((_, j) => j !== oIdx) } : g
                                            ));
                                            updateAddonGroups(next);
                                          }}
                                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 self-end sm:self-center"
                                          title="Remover opção"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = addonGroups.map((g, i) => (
                                      i === gIdx
                                        ? { ...g, options: [...(g.options || []), { name: '', image: '', extraPrice: '' }] }
                                        : g
                                    ));
                                    updateAddonGroups(next);
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-[#F6E9E5] hover:bg-[#FCEEF2] text-[#A90F4D] text-[11px] font-semibold inline-flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />Adicionar opção em &quot;{grp.title || 'grupo'}&quot;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SEÇÃO 3.2: Personalização pelo Cliente (Letra Inicial / Nome / Quantidade > 1) */}
                      <div className={`rounded-2xl p-4 border-2 transition-colors space-y-3 ${customCfg.enabled ? 'bg-[#FCEEF2]/60 border-[#A90F4D]' : 'bg-white/90 border-[#EAD6D0]'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(customCfg.enabled)}
                                onChange={(e) => updateCustomCfg({ enabled: e.target.checked })}
                                className="accent-[#A90F4D] w-4 h-4"
                              />
                              <span className="text-xs sm:text-sm font-bold text-[#4A2532]">
                                ✨ Produto Personalizável (Pedir Letra Inicial e/ou Nome ao comprador)
                              </span>
                            </label>
                            <p className="text-[11px] text-[#795344] mt-1 pl-6">
                              Ideal para Chaveiros com Inicial/Nome, Cuias Personalizadas, Kits Presente etc. Se o cliente escolher <strong>2 ou mais unidades</strong>, o site abre automaticamente os campos separados para cada unidade!
                            </p>
                          </div>
                        </div>

                        {customCfg.enabled && (
                          <div className="pl-0 sm:pl-6 pt-2 space-y-3 border-t border-[#E5B8C7]/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={customCfg.askInitial !== false}
                                  onChange={(e) => updateCustomCfg({ askInitial: e.target.checked })}
                                  className="accent-[#A90F4D]"
                                />
                                <div>
                                  <span className="block font-semibold text-[#4A2532]">Pedir Letra Inicial (A–Z)</span>
                                  <span className="text-[10px] text-[#795344]">Mostra seletor de letra para cada peça</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={customCfg.askName !== false}
                                  onChange={(e) => updateCustomCfg({ askName: e.target.checked })}
                                  className="accent-[#A90F4D]"
                                />
                                <div>
                                  <span className="block font-semibold text-[#4A2532]">Pedir Nome ou Texto para gravar</span>
                                  <span className="text-[10px] text-[#795344]">Campo para o cliente digitar o nome</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(customCfg.askNotes)}
                                  onChange={(e) => updateCustomCfg({ askNotes: e.target.checked })}
                                  className="accent-[#A90F4D]"
                                />
                                <div>
                                  <span className="block font-semibold text-[#4A2532]">Campo de Observação Extra</span>
                                  <span className="text-[10px] text-[#795344]">Ex: detalhes de cor, recado ou preferência</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={customCfg.required !== false}
                                  onChange={(e) => updateCustomCfg({ required: e.target.checked })}
                                  className="accent-[#A90F4D]"
                                />
                                <div>
                                  <span className="block font-semibold text-[#A90F4D]">Preenchimento Obrigatório</span>
                                  <span className="text-[10px] text-[#795344]">Impede adicionar sem informar a inicial/nome</span>
                                </div>
                              </label>
                            </div>

                            <div>
                              <label className="block text-[10.5px] font-semibold text-[#5A382E] mb-1">
                                Instrução exibida para o cliente na tela do produto:
                              </label>
                              <input
                                type="text"
                                value={customCfg.promptLabel || ''}
                                onChange={(e) => updateCustomCfg({ promptLabel: e.target.value })}
                                placeholder="Informe a letra inicial e/ou o nome para personalizar sua peça:"
                                className="w-full px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] text-xs text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SEÇÃO 5: Descrição */}
                      <div className="bg-white/80 rounded-2xl p-4 border border-[#EAD6D0] space-y-2">
                        <label className="block font-bold text-[#4A2532] uppercase tracking-wider">5. Descrição do Produto</label>
                        <textarea
                          rows={3}
                          placeholder="Conte os detalhes encantadores do produto: aromas, ingredientes, acabamento artesanal, medidas ou sugestões de uso..."
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Rodapé Fixo com Resumo e Botão Salvar */}
                    <div className="px-5 py-3.5 bg-[#FFF9F3] border-t border-[#EAD6D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F6E9E5] border border-[#E5CFC9] shrink-0">
                          {editingProduct.image ? (
                            <img src={editingProduct.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9A7468]"><ImageIcon className="w-4 h-4" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif-display font-bold text-sm text-[#4A2532] truncate">
                            {editingProduct.name || 'Novo Produto Mimo Rosas'}
                          </p>
                          <p className="text-[11px] text-[#795344]">
                            <strong className="text-[#A90F4D]">{formatBRL(editingProduct.price)}</strong> • {varItems.filter((v) => v.name.trim()).length || 1} {varItems.filter((v) => v.name.trim()).length === 1 ? 'variação' : 'variações'} • {galleryList.length} {galleryList.length === 1 ? 'foto' : 'fotos'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2.5 rounded-full bg-[#F6E9E5] hover:bg-[#EAD6D0] text-[#5A382E] font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={uploadingImage}
                          className="px-6 py-2.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-60"
                        >
                          <Check className="w-4 h-4" />
                          <span>Salvar no Catálogo</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              );
            })()}

            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="bg-[#FFF9F3] w-full max-w-2xl rounded-t-[28px] sm:rounded-[28px] border border-[#EAD6D0] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-xs">
                  <div className="px-5 py-4 bg-gradient-to-r from-[#FFF9F3] to-[#FCEEF2]/60 border-b border-[#F0DCD6] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FCEEF2] text-[#A90F4D] flex items-center justify-center border border-[#E5B8C7]">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#4A2532]">
                          Categorias da Loja ({categories.length})
                        </h3>
                        <p className="text-[11px] text-[#795344]">
                          Crie novas categorias, escolha o ícone da vitrine ou edite as existentes.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="p-2 rounded-full bg-[#F6E9E5] hover:bg-[#EAD6D0] text-[#4A2532] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                    {/* Formulário para Criar / Editar Categoria */}
                    <form onSubmit={handleSaveCategoryAdmin} className="bg-white/90 rounded-2xl p-4 border-2 border-[#EAD6D0] space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4A2532] uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-[#A90F4D]" />
                          {editingCategory.isEditing ? `Editando: ${editingCategory.shortName}` : 'Cadastrar Nova Categoria'}
                        </span>
                        {editingCategory.isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditingCategory({ id: '', name: '', shortName: '', iconType: 'gift', description: '', isEditing: false })}
                            className="text-[11px] font-semibold text-[#A90F4D] hover:underline"
                          >
                            + Criar nova em vez de editar
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-[#5A382E] mb-1">Nome da Categoria *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Velas Aromáticas Artesanais"
                            value={editingCategory.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingCategory((prev) => ({
                                ...prev,
                                name: val,
                                shortName: prev.shortName === prev.name || !prev.shortName ? val : prev.shortName
                              }));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#5A382E] mb-1">Nome Curto (para botões do menu)</label>
                          <input
                            type="text"
                            placeholder="Ex: Velas Aromáticas"
                            value={editingCategory.shortName}
                            onChange={(e) => setEditingCategory((prev) => ({ ...prev, shortName: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#5A382E] mb-1.5">
                          Ícone na Vitrine ({CATEGORY_ICON_OPTIONS.length} opções)
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                          {CATEGORY_ICON_OPTIONS.map((ic) => {
                            const selectedIcon = (editingCategory.iconType || 'gift') === ic.id;
                            return (
                              <button
                                key={ic.id}
                                type="button"
                                onClick={() => setEditingCategory((prev) => ({ ...prev, iconType: ic.id }))}
                                className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                  selectedIcon
                                    ? 'bg-[#FCEEF2] border-[#A90F4D] ring-2 ring-[#A90F4D]/25'
                                    : 'bg-[#FFF9F3] border-[#E5CFC9] hover:border-[#A90F4D]'
                                }`}
                              >
                                <CategoryIconSVG type={ic.id} />
                                <span className="text-[9.5px] font-semibold text-[#4A2532] truncate max-w-full">{ic.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#5A382E] mb-1">Descrição curta (opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: Aromas aconchegantes feitos à mão para perfumar seu lar."
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>{editingCategory.isEditing ? 'Salvar Alterações da Categoria' : 'Adicionar Categoria'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Lista de Categorias Atuais */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#795344] block">
                        Categorias Cadastradas ({categories.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {categories.map((cat) => {
                          const prodCount = products.filter((p) => p.category === cat.id).length;
                          return (
                            <div
                              key={cat.id}
                              className="p-3 rounded-2xl bg-white border border-[#EAD6D0] flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#F6E9E5] flex items-center justify-center shrink-0">
                                  <CategoryIconSVG type={cat.iconType} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-serif-display font-bold text-sm text-[#4A2532] truncate">{cat.shortName}</p>
                                  <p className="text-[10.5px] text-[#795344]">
                                    {prodCount} {prodCount === 1 ? 'produto' : 'produtos'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingCategory({
                                    id: cat.id,
                                    name: cat.name,
                                    shortName: cat.shortName,
                                    iconType: cat.iconType || 'gift',
                                    description: cat.description || '',
                                    isEditing: true
                                  })}
                                  className="p-2 rounded-xl bg-[#F6E9E5] text-[#A90F4D] hover:bg-[#A90F4D] hover:text-white transition-colors"
                                  title="Editar categoria"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {categories.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategoryAdmin(cat.id)}
                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    title="Excluir categoria"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-[#FFF9F3] border-t border-[#EAD6D0] flex justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-5 py-2 rounded-full bg-[#4A2532] text-white font-semibold"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          );
        })()
      ) : (
        <div className="w-full min-h-screen bg-[#F6E9E5] flex flex-col relative pb-24 lg:pb-0 font-sans-clean">
          <header className="sticky top-0 z-30 bg-[#FFF9F3]/95 backdrop-blur-md border-b border-[#EFE0DC]">
            <div className="mx-auto w-full max-w-[1320px] px-4 lg:px-8 py-2.5 lg:py-3">
              <div className="flex items-center justify-between gap-3 lg:gap-8">
                <button type="button" onClick={() => setIsSideMenuOpen(true)} aria-label="Abrir menu" className="lg:hidden p-2 -ml-1 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition"><Menu className="w-6 h-6" strokeWidth={1.9} /></button>
                <button type="button" onClick={() => { setActiveView('home'); setSelectedCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 focus:outline-none group shrink-0">
                  <MimoRoseOutlineSVG className="w-10 h-11 sm:w-11 sm:h-12 group-hover:scale-105 transition-transform" />
                  <span className="font-script text-[34px] sm:text-[42px] text-[#A90F4D] leading-none tracking-wide pt-1">Mimo Rosas</span>
                </button>

                <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                  {[
                    { id: 'home', label: 'Início' },
                    { id: 'catalog', label: 'Categorias' },
                    { id: 'favorites', label: 'Favoritos' },
                    { id: 'account', label: 'Minha Conta' }
                  ].map((link) => (
                    <button key={link.id} type="button" onClick={() => setActiveView(link.id)} className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${activeView === link.id ? 'bg-[#FCEEF2] text-[#A90F4D]' : 'text-[#5A382E] hover:bg-[#F6E9E5] hover:text-[#A90F4D]'}`}>{link.label}</button>
                  ))}
                  <button type="button" onClick={() => setIsAssistantOpen(true)} className="px-3.5 py-2 rounded-full text-sm font-medium text-[#5A382E] hover:bg-[#F6E9E5] hover:text-[#A90F4D] transition-colors flex items-center gap-1.5"><Sparkles className="w-4 h-4" />Atendimento</button>
                </nav>

                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="hidden lg:flex relative items-center w-[240px] xl:w-[300px]">
                    <Search className="w-4 h-4 text-[#A90F4D] absolute left-3.5 pointer-events-none" />
                    <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (activeView !== 'catalog' && activeView !== 'home') setActiveView('catalog'); }} placeholder="Buscar produtos..." className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F6E9E5] border border-[#E6CFC8] text-sm text-[#4A2C23] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white transition-colors" />
                  </div>
                  <button type="button" onClick={() => setIsSearchOpen((prev) => !prev)} aria-label="Pesquisar produtos" className="lg:hidden p-2 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition"><Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} /></button>
                  <button type="button" onClick={() => setActiveView('account')} aria-label="Minha conta" className="p-2 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition flex items-center gap-1.5">
                    {auth.user ? (
                      <span className="w-7 h-7 rounded-full bg-[#A90F4D] text-white text-[11px] font-bold flex items-center justify-center">
                        {String(auth.profile?.full_name || auth.user.email || 'M').trim().charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                        <span className="hidden xl:inline text-xs font-semibold">Entrar</span>
                      </>
                    )}
                  </button>
                  <button type="button" onClick={() => setIsCartOpen(true)} aria-label="Abrir carrinho" className={`relative p-2 rounded-full text-[#A90F4D] hover:bg-[#F6E9E5] active:scale-95 transition ${cartBounce ? 'scale-125' : ''}`}>
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <span className="absolute top-0.5 right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#A90F4D] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">{cartCount}</span>
                  </button>
                </div>
              </div>
              {isSearchOpen && (
                <div className="mt-2.5 pb-1 animate-fadeIn lg:hidden">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-[#A90F4D] absolute left-3.5 pointer-events-none" />
                    <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (activeView !== 'catalog' && activeView !== 'home') setActiveView('catalog'); }} placeholder="Buscar infusões, cápsulas de rosa, cuias..." className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#F6E9E5] border border-[#E6CFC8] text-sm text-[#4A2C23] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D]" autoFocus />
                    {searchQuery && (<button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 text-[#795344] hover:text-[#A90F4D]"><X className="w-4 h-4" /></button>)}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1">
            {activeView === 'home' && (
              <div>
                <section className="relative w-full overflow-hidden bg-[#F2D7D3]">
                  <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[470px] xl:min-h-[520px] w-full flex items-center">
                    <img src={HERO_SLIDES[heroIndex].image} alt="Banner Mimo Rosas" className="absolute inset-0 w-full h-full object-cover object-[75%_center] lg:object-[80%_center] transition-all duration-700" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(246,226,223,0.98) 0%, rgba(246,226,223,0.92) 48%, rgba(246,226,223,0.25) 78%, rgba(246,226,223,0.05) 100%)' }} />
                    <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-6 lg:py-14">
                      <div className="w-full sm:w-[62%] lg:w-[48%]">
                        <h1 className="font-serif-display italic text-[26px] sm:text-[34px] lg:text-[46px] xl:text-[54px] text-[#A90F4D] leading-[1.15]">
                          {HERO_SLIDES[heroIndex].titleLine1}<br />
                          <span>{HERO_SLIDES[heroIndex].titleLine2} </span>
                          <span className="font-script not-italic text-[38px] sm:text-[48px] lg:text-[64px] xl:text-[72px] leading-none">{HERO_SLIDES[heroIndex].titleScript}</span>
                        </h1>
                        <div className="-ml-2 my-1"><HeartFlourishSVG className="w-52 sm:w-64 lg:w-80 h-7" /></div>
                        <p className="text-[12.5px] sm:text-[14px] lg:text-[16px] text-[#4E2F26] leading-snug max-w-[240px] sm:max-w-[300px] lg:max-w-[420px] font-normal">{HERO_SLIDES[heroIndex].subtitle}</p>
                        <button type="button" onClick={() => {
                          const target = HERO_SLIDES[heroIndex].targetCategory;
                          if (target === 'all') catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                          else navigateCategory(target);
                        }} className="mt-4 lg:mt-6 inline-flex items-center gap-2 bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-[13px] sm:text-[14px] lg:text-[15px] font-medium px-5 py-2.5 lg:px-7 lg:py-3.5 rounded-full shadow-[0_6px_16px_rgba(169,15,77,0.32)] active:scale-95 transition-all">
                          <span>{HERO_SLIDES[heroIndex].cta}</span><span className="text-base leading-none">→</span>
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-3 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                      {HERO_SLIDES.map((slide, idx) => (
                        <button key={slide.id} type="button" onClick={() => setHeroIndex(idx)} aria-label={`Slide ${idx + 1}`} className={`rounded-full transition-all ${heroIndex === idx ? 'w-2.5 h-2.5 bg-[#A90F4D]' : 'w-2 h-2 bg-[#FFF9F3]/80'}`} />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="relative pt-4 lg:pt-8 pb-2">
                  <div className="relative mx-auto w-full max-w-[1320px] px-4 lg:px-8">
                    <div ref={categoryScrollRef} className="flex lg:grid lg:grid-cols-8 items-stretch gap-2.5 lg:gap-4 overflow-x-auto lg:overflow-visible no-scrollbar pr-8 lg:pr-0 py-1">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button key={cat.id} type="button" onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)} className={`flex-shrink-0 w-[96px] sm:w-[116px] lg:w-auto rounded-[20px] p-2.5 lg:p-4 flex flex-col items-center justify-start text-center transition-all duration-200 border ${isSelected ? 'bg-[#FFF9F3] border-[#A90F4D] shadow-md -translate-y-0.5' : 'bg-[#F9ECE8] hover:bg-[#FFF9F3] border-[#F0DCD6] shadow-[0_4px_12px_rgba(121,83,68,0.06)]'}`}>
                            <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center mb-1 lg:mb-2"><CategoryIconSVG type={cat.iconType} /></div>
                            <span className="text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-[#4E2F26] leading-[1.2] line-clamp-3">{cat.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={scrollCategoriesRight} aria-label="Rolar categorias" className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF9F3] border border-[#EBD5CF] shadow-md flex items-center justify-center text-[#A90F4D] hover:scale-105 active:scale-95 transition"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </section>

                <section ref={catalogSectionRef} className="mx-auto w-full max-w-[1320px] px-4 lg:px-8 pt-4 lg:pt-10 pb-4">
                  <div className="flex items-center justify-center gap-3 mb-4 lg:mb-7">
                    <div className="h-[1px] flex-1 bg-[#E2B8C4]" />
                    <h2 className="text-center flex items-baseline gap-2">
                      <span className="font-serif-display text-[22px] sm:text-[26px] lg:text-[30px] text-[#4E2F26] font-normal">Nossos</span>
                      <span className="font-script text-[40px] sm:text-[46px] lg:text-[56px] text-[#A90F4D] leading-none">Destaques</span>
                    </h2>
                    <div className="h-[1px] flex-1 bg-[#E2B8C4]" />
                  </div>
                  {(selectedCategory !== 'all' || searchQuery.trim() !== '') && (
                    <div className="mb-3 flex items-center justify-between bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF] text-xs">
                      <span className="text-[#5A382E] font-medium truncate">Filtro: <strong className="text-[#A90F4D]">{selectedCategory === 'all' ? `"${searchQuery}"` : categories.find((c) => c.id === selectedCategory)?.name}</strong></span>
                      <button type="button" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="text-[#A90F4D] font-semibold hover:underline ml-2 shrink-0">Ver todos</button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {(selectedCategory === 'all' && !searchQuery ? featuredProducts : filteredProducts).map((product) => renderProductCard(product))}
                  </div>
                  {selectedCategory === 'all' && !searchQuery && (
                    <div className="mt-5 text-center">
                      <button type="button" onClick={() => setActiveView('catalog')} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9F3] border border-[#D9B2BE] text-[#A90F4D] text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#A90F4D] hover:text-white transition-colors">
                        <span>Ver todos os {visibleProducts.length} produtos da loja</span><ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </section>

                <section className="mx-auto w-full max-w-[1320px] px-4 lg:px-8 pt-1 lg:pt-6 pb-4 lg:pb-12">
                  <div className="relative rounded-[26px] overflow-hidden p-4 sm:p-6 lg:p-9 text-[#FFF9F3] shadow-[0_10px_28px_rgba(169,15,77,0.25)]" style={{ background: 'linear-gradient(100deg, #980B44 0%, #A90F4D 58%, #C43B6E 100%)' }}>
                    <div className="relative z-10 flex items-center gap-3.5 sm:gap-6 lg:gap-10">
                      <div className="shrink-0"><MimoRoseOutlineSVG className="w-16 h-20 sm:w-20 sm:h-24 lg:w-28 lg:h-32" strokeColor="#FFF9F3" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-serif-display text-[17px] sm:text-[22px] lg:text-[30px] leading-tight">Artesanal, <span className="italic font-normal">com muito</span> <span className="font-script text-[29px] sm:text-[36px] lg:text-[46px] leading-none">amor</span></h3>
                          <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-[#FAD4E0] inline shrink-0" />
                        </div>
                        <div className="w-44 lg:w-64 h-[1px] bg-[#F6B8CC]/60 my-1.5" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 lg:gap-6 mt-1">
                          <p className="text-[11.5px] sm:text-[13px] lg:text-[15px] text-[#FCEEF2] leading-snug max-w-[210px] sm:max-w-[300px] lg:max-w-[420px]">Cuidados em cada detalhe para encantar em cada escolha.</p>
                          <button type="button" onClick={() => setIsAboutModalOpen(true)} className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 bg-[#FCE5EC] hover:bg-white text-[#A90F4D] text-[11.5px] sm:text-[12.5px] lg:text-[14px] font-semibold px-3.5 py-2 lg:px-6 lg:py-3 rounded-full shadow-sm active:scale-95 transition"><span>Sobre a Mimo Rosas</span><span>→</span></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeView === 'catalog' && (
              <div className="mx-auto w-full max-w-[1320px] px-4 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <button type="button" onClick={() => setActiveView('home')} className="inline-flex items-center gap-1 text-xs text-[#A90F4D] font-semibold mb-1"><ChevronLeft className="w-4 h-4" /><span>Voltar ao Início</span></button>
                    <h1 className="font-serif-display text-2xl lg:text-3xl text-[#4E2F26] font-semibold">{selectedCategory === 'all' ? 'Catálogo Completo' : categories.find((c) => c.id === selectedCategory)?.name}</h1>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFF9F3] px-3 py-1.5 rounded-full border border-[#EBD5CF] text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#A90F4D]" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-[#4E2F26] font-medium focus:outline-none">
                      <option value="featured">Destaques</option>
                      <option value="price-asc">Menor Preço</option>
                      <option value="price-desc">Maior Preço</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button type="button" onClick={() => setSelectedCategory('all')} className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${selectedCategory === 'all' ? 'bg-[#A90F4D] text-white' : 'bg-[#FFF9F3] text-[#5A382E] border border-[#EBD5CF]'}`}>Todos ({visibleProducts.length})</button>
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${selectedCategory === cat.id ? 'bg-[#A90F4D] text-white' : 'bg-[#FFF9F3] text-[#5A382E] border border-[#EBD5CF]'}`}>{cat.shortName}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-6">
                  {filteredProducts.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}

            {activeView === 'product' && selectedProduct && (() => {
              const normVars = normalizeVariationsList(selectedProduct.variations);
              const customCfg = extractProductCustomization(selectedProduct);
              const addonGroups = Array.isArray(customCfg.addonGroups) ? customCfg.addonGroups : [];
              const hasAdvancedConfig = Boolean(customCfg.enabled) || addonGroups.length > 0;

              // Garante que unitConfigs tenha exatamente `productQty` itens
              const syncedUnits = Array.from({ length: productQty }, (_, idx) => {
                const existing = unitConfigs[idx];
                if (existing) return existing;
                const template = unitConfigs[0] || buildDefaultUnitConfig(selectedProduct, selectedVariation);
                return {
                  variation: template.variation || selectedVariation || normVars[0]?.name || 'Padrão',
                  addons: { ...(template.addons || {}) },
                  initial: '',
                  customName: '',
                  notes: ''
                };
              });

              const updateUnitAt = (uIdx, patch) => {
                setProductCustomError('');
                const next = syncedUnits.map((u, i) => (i === uIdx ? { ...u, ...patch } : u));
                setUnitConfigs(next);
                if (uIdx === 0 && patch.variation) {
                  setSelectedVariation(patch.variation);
                  const vObj = findVariationObj(selectedProduct, patch.variation);
                  if (vObj?.image) setSelectedVariationImage(vObj.image);
                }
              };

              const computeUnitPrice = (u) => {
                const vObj = findVariationObj(selectedProduct, u.variation);
                let price = vObj?.price !== '' && vObj?.price !== null && Number(vObj?.price) > 0
                  ? Number(vObj.price)
                  : Number(selectedProduct.price || 0);
                addonGroups.forEach((grp) => {
                  const chosen = u.addons?.[grp.title] || grp.options?.[0]?.name;
                  const opt = (grp.options || []).find((o) => o.name === chosen);
                  if (opt?.extraPrice && Number(opt.extraPrice) > 0) {
                    price += Number(opt.extraPrice);
                  }
                });
                return price;
              };

              const firstUnit = syncedUnits[0] || buildDefaultUnitConfig(selectedProduct, selectedVariation);
              const activeVarObj = findVariationObj(selectedProduct, firstUnit.variation || selectedVariation);
              const unit1Price = computeUnitPrice(firstUnit);
              const totalUnitsPrice = syncedUnits.reduce((sum, u) => sum + computeUnitPrice(u), 0);
              const displayedMainImage = selectedVariationImage || selectedProduct.gallery?.[activeGalleryIdx] || selectedProduct.image;

              const changeQty = (nextQty) => {
                const clamped = Math.max(1, nextQty);
                setProductQty(clamped);
                setUnitConfigs((prev) => {
                  return Array.from({ length: clamped }, (_, i) => {
                    if (prev[i]) return prev[i];
                    const base = prev[0] || buildDefaultUnitConfig(selectedProduct, selectedVariation);
                    return {
                      variation: base.variation || selectedVariation || normVars[0]?.name || 'Padrão',
                      addons: { ...(base.addons || {}) },
                      initial: '',
                      customName: '',
                      notes: ''
                    };
                  });
                });
              };

              const handleAddProductToCart = () => {
                setProductCustomError('');
                if (customCfg.enabled && customCfg.required) {
                  for (let i = 0; i < syncedUnits.length; i++) {
                    const u = syncedUnits[i];
                    const missingInitial = customCfg.askInitial !== false && !String(u.initial || '').trim();
                    const missingName = customCfg.askName !== false && !String(u.customName || '').trim();
                    if (missingInitial || missingName) {
                      const labelPiece = syncedUnits.length > 1 ? ` da Peça #${i + 1}` : '';
                      setProductCustomError(
                        `Por favor, preencha ${missingInitial && missingName ? 'a letra inicial e o nome' : missingInitial ? 'a letra inicial' : 'o nome'}${labelPiece} para personalizar seu pedido.`
                      );
                      return;
                    }
                  }
                }
                if (hasAdvancedConfig || syncedUnits.length > 1) {
                  addToCart(selectedProduct, productQty, selectedVariation, null, syncedUnits);
                } else {
                  addToCart(selectedProduct, productQty, selectedVariation);
                }
              };

              const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

              const renderUnitEditor = (u, uIdx, isMulti) => (
                <div
                  key={uIdx}
                  className={`rounded-2xl p-3.5 sm:p-4 space-y-3.5 border ${
                    isMulti ? 'bg-[#FFF9F3] border-[#DFC3BC] shadow-2xs' : 'bg-[#F6E9E5]/60 border-[#E5CFC9]'
                  }`}
                >
                  {isMulti && (
                    <div className="flex items-center justify-between border-b border-[#EFE0DC] pb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A90F4D]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Peça #{uIdx + 1} de {productQty}
                      </span>
                      <span className="text-xs font-bold text-[#4A2532]">{formatBRL(computeUnitPrice(u))}</span>
                    </div>
                  )}

                  {/* Se for múltiplas unidades, permite escolher a variação/cor de cada unidade separadamente */}
                  {isMulti && normVars.length > 1 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A2532] mb-1.5">
                        Cor / Variação da Peça #{uIdx + 1}: <span className="text-[#A90F4D] font-bold">{u.variation}</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {normVars.map((v, vI) => {
                          const chosen = u.variation === v.name;
                          return (
                            <button
                              key={`${v.name}-${vI}`}
                              type="button"
                              onClick={() => {
                                updateUnitAt(uIdx, { variation: v.name });
                                if (v.image) setSelectedVariationImage(v.image);
                              }}
                              className={`p-1 pr-2.5 rounded-xl text-[11px] font-medium border transition flex items-center gap-1.5 ${
                                chosen
                                  ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                                  : 'bg-white text-[#5A382E] border-[#E2C7C0] hover:border-[#A90F4D]'
                              } ${!v.image ? 'pl-2.5 py-1.5 rounded-full' : ''}`}
                            >
                              {v.image && <img src={v.image} alt={v.name} className="w-6 h-6 rounded-lg object-cover" />}
                              <span>{v.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grupos extras de combinação (Ex: Decoração / Enfeite ao redor) */}
                  {addonGroups.map((grp, gIdx) => {
                    const currentChoice = u.addons?.[grp.title] || grp.options?.[0]?.name || '';
                    return (
                      <div key={grp.id || gIdx} className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-[#4A2532]">
                          {grp.title}{isMulti ? ` (Peça #${uIdx + 1})` : ''}:{' '}
                          <span className="text-[#A90F4D] font-bold">{currentChoice}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(grp.options || []).map((opt, oIdx) => {
                            const isOptSelected = currentChoice === opt.name;
                            return (
                              <button
                                key={`${opt.name}-${oIdx}`}
                                type="button"
                                onClick={() => {
                                  updateUnitAt(uIdx, {
                                    addons: { ...(u.addons || {}), [grp.title]: opt.name }
                                  });
                                  if (opt.image) setSelectedVariationImage(opt.image);
                                }}
                                className={`p-1.5 pr-3 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-2 ${
                                  isOptSelected
                                    ? 'bg-[#A90F4D] text-white border-[#A90F4D] shadow-xs'
                                    : 'bg-white text-[#5A382E] border-[#E2C7C0] hover:border-[#A90F4D]'
                                } ${!opt.image ? 'pl-3 py-1.5 rounded-full' : ''}`}
                              >
                                {opt.image && (
                                  <img src={opt.image} alt={opt.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                                )}
                                <div className="text-left leading-tight">
                                  <span className="block font-semibold">{opt.name}</span>
                                  {opt.extraPrice && Number(opt.extraPrice) > 0 && (
                                    <span className={`block text-[9.5px] ${isOptSelected ? 'text-[#FAD4E0]' : 'text-[#A90F4D]'}`}>
                                      + {formatBRL(opt.extraPrice)}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Campos de Personalização (Letra Inicial / Nome / Observação) */}
                  {customCfg.enabled && (
                    <div className="space-y-2.5 pt-1">
                      {!isMulti && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#A90F4D]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{customCfg.promptLabel || 'Personalize sua peça:'}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {customCfg.askInitial !== false && (
                          <div>
                            <label className="block text-[11px] font-semibold text-[#4A2532] mb-1">
                              Letra Inicial {customCfg.required !== false ? '*' : ''}
                            </label>
                            <input
                              type="text"
                              maxLength={3}
                              placeholder="Ex: M"
                              value={u.initial || ''}
                              onChange={(e) => updateUnitAt(uIdx, { initial: e.target.value.toUpperCase() })}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC3BC] text-sm font-bold text-center text-[#A90F4D] uppercase placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D]"
                            />
                          </div>
                        )}

                        {customCfg.askName !== false && (
                          <div className={customCfg.askInitial !== false ? 'sm:col-span-2' : 'sm:col-span-3'}>
                            <label className="block text-[11px] font-semibold text-[#4A2532] mb-1">
                              Nome ou palavra na peça {customCfg.required !== false ? '*' : ''}
                            </label>
                            <input
                              type="text"
                              maxLength={40}
                              placeholder="Ex: Maria Clara"
                              value={u.customName || ''}
                              onChange={(e) => updateUnitAt(uIdx, { customName: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DFC3BC] text-xs sm:text-sm text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Teclado rápido de letras A-Z */}
                      {customCfg.askInitial !== false && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {LETTERS.map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => updateUnitAt(uIdx, { initial: letter })}
                              className={`w-6 h-6 rounded-md text-[10px] font-bold transition ${
                                String(u.initial || '').toUpperCase() === letter
                                  ? 'bg-[#A90F4D] text-white shadow-2xs'
                                  : 'bg-white text-[#5A382E] border border-[#E5CFC9] hover:border-[#A90F4D]'
                              }`}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                      )}

                      {customCfg.askNotes && (
                        <div>
                          <label className="block text-[11px] font-semibold text-[#4A2532] mb-1">
                            Observações desta peça (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Quero com bastante folha de ouro, embalagem para presente..."
                            value={u.notes || ''}
                            onChange={(e) => updateUnitAt(uIdx, { notes: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC3BC] text-xs text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );

              return (
                <div className="mx-auto w-full max-w-[1180px] px-4 lg:px-8 py-4 lg:py-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setActiveView('home')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A90F4D] bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF]"><ChevronLeft className="w-4 h-4" /><span>Voltar</span></button>
                    <button type="button" onClick={(e) => toggleFavorite(selectedProduct.id, e)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A90F4D] bg-[#FFF9F3] px-3.5 py-2 rounded-full border border-[#EBD5CF]">
                      <Heart className="w-4 h-4" fill={favorites.includes(selectedProduct.id) ? '#A90F4D' : 'none'} /><span>{favorites.includes(selectedProduct.id) ? 'Salvo' : 'Favoritar'}</span>
                    </button>
                  </div>
                  <div className="bg-[#FFF9F3] rounded-[28px] p-4 sm:p-6 lg:p-9 border border-[#EBD5CF] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-10">
                    <div className="space-y-2.5">
                      <div className="aspect-square rounded-[22px] overflow-hidden bg-[#F6E9E5] relative border border-[#F0DCD6]">
                        <img src={displayedMainImage} alt={selectedProduct.name} className="w-full h-full object-cover transition-all duration-300" />
                        {activeVarObj?.image && selectedVariationImage === activeVarObj.image && (
                          <span className="absolute bottom-3 left-3 bg-[#FFF9F3]/95 backdrop-blur-xs text-[#4A2532] border border-[#E5CFC9] px-3 py-1 rounded-full text-[11px] font-semibold shadow-xs">
                            Opção: {activeVarObj.name}
                          </span>
                        )}
                      </div>
                      {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {selectedProduct.gallery.map((imgUrl, i) => {
                            const isSelectedThumb = !selectedVariationImage ? activeGalleryIdx === i : selectedVariationImage === imgUrl;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setSelectedVariationImage('');
                                  setActiveGalleryIdx(i);
                                }}
                                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${isSelectedThumb ? 'border-[#A90F4D]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A90F4D]">{categories.find((c) => c.id === selectedProduct.category)?.name}</span>
                          {customCfg.enabled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCEEF2] text-[#A90F4D] text-[10px] font-bold">
                              <Sparkles className="w-3 h-3" />Personalizável
                            </span>
                          )}
                        </div>
                        <h1 className="font-serif-display text-2xl sm:text-3xl text-[#4A2532] font-semibold leading-tight">{selectedProduct.name}</h1>
                        <p className="text-3xl font-bold text-[#A90F4D] pt-0.5">{formatBRL(unit1Price)}</p>
                        <p className="text-xs sm:text-sm text-[#6D493B] leading-relaxed pt-1 whitespace-pre-line">{selectedProduct.description}</p>

                        {/* Variação principal (quando quantidade = 1 ou produto simples) */}
                        {normVars.length > 0 && (productQty === 1 || !hasAdvancedConfig) && (
                          <div className="pt-2">
                            <label className="block text-xs font-semibold text-[#4A2532] mb-2">
                              Escolha a opção: <span className="text-[#A90F4D] font-bold">{firstUnit.variation || selectedVariation}</span>
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                              {normVars.map((v, idx) => {
                                const isChosen = (firstUnit.variation || selectedVariation) === v.name;
                                const hasCustomPrice = v.price !== '' && v.price !== null && Number(v.price) > 0 && Number(v.price) !== Number(selectedProduct.price);
                                return (
                                  <button
                                    key={`${v.name}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      setSelectedVariation(v.name);
                                      updateUnitAt(0, { variation: v.name });
                                      if (v.image) setSelectedVariationImage(v.image);
                                    }}
                                    className={`p-1.5 pr-3.5 rounded-2xl text-xs font-medium border transition-all flex items-center gap-2.5 ${
                                      isChosen
                                        ? 'bg-[#A90F4D] text-white border-[#A90F4D] shadow-sm scale-[1.02]'
                                        : 'bg-[#F6E9E5] text-[#5A382E] border-[#E2C7C0] hover:border-[#A90F4D]'
                                    } ${!v.image ? 'pl-3.5 py-2 rounded-full' : ''}`}
                                  >
                                    {v.image && (
                                      <img
                                        src={v.image}
                                        alt={v.name}
                                        className={`w-9 h-9 rounded-xl object-cover shrink-0 border ${isChosen ? 'border-white/60' : 'border-[#E2C7C0]'}`}
                                      />
                                    )}
                                    <div className="text-left leading-tight">
                                      <span className="block font-semibold">{v.name}</span>
                                      {hasCustomPrice && (
                                        <span className={`block text-[10px] ${isChosen ? 'text-[#FAD4E0]' : 'text-[#A90F4D]'}`}>
                                          {formatBRL(v.price)}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Quando Quantidade = 1 e tem grupos extras ou personalização */}
                        {hasAdvancedConfig && productQty === 1 && renderUnitEditor(firstUnit, 0, false)}

                        {/* Quando Quantidade > 1: abre os campos por unidade! */}
                        {productQty > 1 && (hasAdvancedConfig || normVars.length > 1) && (
                          <div className="space-y-3 pt-2">
                            <div className="p-3 rounded-2xl bg-[#FCEEF2] border border-[#E5B8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-[11.5px] font-semibold text-[#4A2532]">
                                🎁 Você selecionou <strong>{productQty} unidades</strong>. Escolha abaixo a variação, decoração e personalização de cada peça (podem ser iguais ou diferentes!):
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  const first = syncedUnits[0];
                                  setUnitConfigs(syncedUnits.map((u, idx) => (idx === 0 ? u : { ...u, variation: first.variation, addons: { ...first.addons } })));
                                  showAdminToast('Cor e decoração da Peça #1 aplicadas em todas!');
                                }}
                                className="px-3 py-1 rounded-full bg-white text-[#A90F4D] border border-[#E5B8C7] text-[10.5px] font-bold shrink-0 self-start sm:self-auto hover:bg-[#FFF9F3]"
                              >
                                Repetir cor/decoração da #1
                              </button>
                            </div>
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                              {syncedUnits.map((u, uIdx) => renderUnitEditor(u, uIdx, true))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 space-y-3 border-t border-[#F0DCD6]">
                        {productCustomError && (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{productCustomError}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-[#4A2532] block">Quantidade:</span>
                            {(hasAdvancedConfig || normVars.length > 1) && (
                              <span className="text-[10.5px] text-[#795344]">
                                {productQty === 1 ? 'Aumente para personalizar mais peças de uma vez' : `Configurando ${productQty} peças individualmente`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 bg-[#F6E9E5] px-3 py-1.5 rounded-full border border-[#E2C7C0]">
                            <button type="button" onClick={() => changeQty(productQty - 1)} className="w-6 h-6 rounded-full bg-[#FFF9F3] flex items-center justify-center text-[#A90F4D]"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-sm font-bold w-5 text-center">{productQty}</span>
                            <button type="button" onClick={() => changeQty(productQty + 1)} className="w-6 h-6 rounded-full bg-[#FFF9F3] flex items-center justify-center text-[#A90F4D]"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex gap-2.5">
                          <button type="button" onClick={handleAddProductToCart} className="flex-1 py-3.5 px-5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
                            <ShoppingCart className="w-4 h-4" /><span>Adicionar • {formatBRL(totalUnitsPrice)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeView === 'favorites' && (
              <div className="mx-auto w-full max-w-[1320px] px-4 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
                <h1 className="font-serif-display text-2xl lg:text-3xl text-[#4E2F26] font-semibold">Meus Favoritos ({favoriteProducts.length})</h1>
                {favoriteProducts.length === 0 ? (
                  <div className="bg-[#FFF9F3] rounded-3xl p-8 text-center border border-[#EBD5CF]">
                    <Heart className="w-10 h-10 text-[#A90F4D] mx-auto mb-2 opacity-60" />
                    <p className="text-sm text-[#795344]">Sua lista de desejos ainda está vazia.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-6">
                    {favoriteProducts.map((product) => renderProductCard(product))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'account' && (
              auth.loading ? (
                <div className="mx-auto w-full max-w-md px-4 py-16 flex flex-col items-center gap-3 text-[#A90F4D]">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <p className="text-xs text-[#795344]">Carregando sua conta...</p>
                </div>
              ) : !auth.user ? (
                <div className="mx-auto w-full max-w-md px-4 py-8 lg:py-14">
                  <AuthPanel variant="customer" auth={auth} embedded />
                </div>
              ) : isEffectiveAdmin ? (
                <div className="mx-auto w-full max-w-md px-4 py-10">
                  <div className="bg-[#FFF9F3] rounded-3xl p-6 border border-[#EAD6D0] shadow-xl text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#3A1C28] text-[#FAD4E0] flex items-center justify-center mx-auto"><ShieldCheck className="w-7 h-7" /></div>
                    <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">Você está logada como administradora</h2>
                    <p className="text-xs text-[#795344]">A área de cliente é separada do painel de gestão.</p>
                    <button type="button" onClick={() => goToMode('admin')} className="w-full py-3 rounded-full bg-[#A90F4D] text-white text-sm font-semibold">Abrir Painel Administrativo</button>
                    <button type="button" onClick={() => auth.signOut()} className="w-full py-2 rounded-full text-xs text-[#795344] hover:underline">Sair da conta</button>
                  </div>
                </div>
              ) : (
                <AccountArea
                  auth={auth}
                  products={visibleProducts}
                  favoriteIds={favorites}
                  renderProductCard={renderProductCard}
                  onToast={showAdminToast}
                  onCheckPendingOrder={async (order) => {
                    if (!order?.id) return false;
                    try {
                      if (asaasConfig.enabled) {
                        const asaasCheck = await verifyAsaasPayment(order.id);
                        if (asaasCheck?.paid) {
                          await persistOrderPaidEverywhere(order.id);
                          return true;
                        }
                      }
                      const mpCheck = await verifyOrderPaymentOnMercadoPago(order.id, order.mp_payment_id);
                      if (mpCheck && mpCheck.status === 'approved') {
                        await persistOrderPaidEverywhere(order.id);
                        return true;
                      }
                    } catch { /* ignora */ }
                    return false;
                  }}
                  onResumeOrder={(order) => {
                    const code = order.id;
                    const total = Number(order.total || 0);
                    const pixCode = generatePixCopyPaste(
                      storeConfig.pixKey || storeConfig.whatsappNumber,
                      storeConfig.pixHolderName || 'MIMO ROSAS',
                      'BRASIL',
                      total,
                      String(code).replace(/[^A-Z0-9]/g, '')
                    );
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(pixCode)}`;
                    setOrderSuccess({
                      code,
                      customer: order.customer || order.customer_name || 'Cliente Mimo Rosas',
                      total,
                      method: order.payment_method || 'pix',
                      pixCode,
                      qrCodeUrl,
                      paymentConfirmed: false
                    });
                    setActiveView('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )
            )}

            {activeView === 'checkout' && (
              <div className="mx-auto w-full max-w-[1100px] px-4 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setActiveView('home')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#A90F4D]"><ChevronLeft className="w-4 h-4" /><span>Continuar comprando</span></button>
                  <span className="text-xs font-semibold text-[#795344]">Checkout Seguro Mimo Rosas</span>
                </div>

                {orderSuccess ? (
                  <div className="bg-[#FFF9F3] rounded-3xl p-5 sm:p-7 border border-[#EBD5CF] text-center space-y-4 shadow-md">
                    {orderSuccess.paymentConfirmed ? (
                      <div className="flex justify-center"><span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-600" />Pagamento Confirmado • Pedido #{orderSuccess.code}</span></div>
                    ) : (
                      <div className="flex justify-center"><span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse"><QrCode className="w-4 h-4 text-amber-700" />Aguardando Pagamento • Pedido #{orderSuccess.code}</span></div>
                    )}
                    <h2 className="font-serif-display text-2xl text-[#4A2532] font-bold">
                      {orderSuccess.paymentConfirmed ? 'Pagamento Confirmado com Sucesso! 🌹' : orderSuccess.mpCheckoutProUrl ? 'Pague com Segurança no Checkout Pro Mercado Pago 🌹' : orderSuccess.asaasInvoiceUrl ? 'Pague com Cartão de Crédito com Segurança 🌹' : 'Escaneie o QR Code PIX para Pagar 🌹'}
                    </h2>
                    <p className="text-xs text-[#795344] max-w-md mx-auto">
                      Obrigada, <strong>{orderSuccess.customer}</strong>! Seu pedido <strong className="text-[#A90F4D]">{orderSuccess.code}</strong> {orderSuccess.total > 0 && (<>no valor de <strong>{formatBRL(orderSuccess.total)}</strong> </>)}já está salvo no sistema.
                    </p>
                    {!orderSuccess.paymentConfirmed && orderSuccess.mpCheckoutProUrl && (
                      <div className="bg-[#F0F8FF] p-4 rounded-3xl border-2 border-[#009EE3] max-w-md mx-auto space-y-2.5">
                        <p className="text-xs font-bold text-[#005B8F]">Ambiente Oficial Mercado Pago (PIX Instantâneo, Cartão ou Saldo Mercado Livre)</p>
                        <a href={orderSuccess.mpCheckoutProUrl} className="w-full py-3.5 px-5 rounded-full bg-[#009EE3] hover:bg-[#0082BD] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"><ShieldCheck className="w-5 h-5" /><span>Pagar Agora no Checkout Pro Mercado Pago →</span></a>
                        <p className="text-[11px] text-[#005B8F]">Assim que você pagar lá, o Mercado Pago te traz de volta para cá com o pedido aprovado automaticamente!</p>
                      </div>
                    )}
                    {!orderSuccess.paymentConfirmed && orderSuccess.asaasInvoiceUrl && (
                      <div className="bg-[#F0FAF4] p-4 rounded-3xl border-2 border-[#0E9F6E] max-w-md mx-auto space-y-2.5">
                        <p className="text-xs font-bold text-[#046C4E]">Pagamento seguro em ambiente Asaas (Cartão de Crédito em até 3x, PIX ou boleto)</p>
                        <a href={orderSuccess.asaasInvoiceUrl} target="_blank" rel="noreferrer" className="w-full py-3.5 px-5 rounded-full bg-[#0E9F6E] hover:bg-[#0B875D] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"><CreditCard className="w-5 h-5" /><span>Abrir Pagamento Seguro →</span></a>
                        <p className="text-[11px] text-[#046C4E]">Se a aba não abriu, use o botão acima. Esta tela confirma sozinha assim que o pagamento for aprovado — pode deixá-la aberta.</p>
                      </div>
                    )}
                    {!orderSuccess.asaasInvoiceUrl && orderSuccess.pixCode && ['pix', 'card', 'mercadopago'].includes(orderSuccess.method) && (
                      <div className="bg-[#F6E9E5] p-4 sm:p-5 rounded-3xl border border-[#DFC3BC] max-w-md mx-auto space-y-3.5">
                        {!orderSuccess.paymentConfirmed ? (
                          <>
                            <div className="bg-white p-3.5 rounded-2xl border-2 border-[#A90F4D] w-52 h-52 mx-auto flex flex-col items-center justify-center shadow-md">
                              <img src={orderSuccess.qrCodeUrl} alt="QR Code PIX Mimo Rosas" className="w-44 h-44 object-contain" />
                            </div>
                            <p className="text-[11px] text-[#5A382E] font-medium">Abra o aplicativo do seu banco, escolha <strong>Ler QR Code PIX</strong> ou copie o código abaixo:</p>
                            <div className="text-left space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#A90F4D] flex items-center gap-1.5"><QrCode className="w-4 h-4" />PIX Copia e Cola ({formatBRL(orderSuccess.total)})</span>
                                <button type="button" onClick={() => safeCopyText(orderSuccess.pixCode, 'Código PIX Copia e Cola')} className="px-3 py-1 rounded-full bg-[#A90F4D] text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"><Copy className="w-3 h-3" /> Copiar Código PIX</button>
                              </div>
                              <input type="text" readOnly value={orderSuccess.pixCode} onClick={(e) => e.target.select()} className="w-full px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#E5CFC9] font-mono text-[10px] text-[#4A2532]" />
                              {!orderSuccess.asaasPaymentId && !orderSuccess.mpPaymentId && (
                                <p className="text-[11px] text-[#795344] text-center pt-0.5">Recebedor: <strong>{storeConfig.pixHolderName || 'Mimo Rosas'}</strong> • Chave: <strong>{storeConfig.pixKey || storeConfig.whatsappNumber}</strong></p>
                              )}
                              {(orderSuccess.asaasPaymentId || orderSuccess.mpPaymentId) && (
                                <p className="text-[11px] text-emerald-800 text-center pt-0.5 font-semibold">PIX oficial Mimo Rosas • confirmação automática na tela</p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-[#E5CFC9]">
                              <button 
                                onClick={async () => {
                                  showAdminToast('Verificando pagamento...');
                                  const asaasCheck = await verifyAsaasPayment(orderSuccess.code);
                                  if (asaasCheck?.paid) {
                                    await markOrderAsPaidAutomatically();
                                    showAdminToast('Pagamento Confirmado!');
                                    return;
                                  }
                                  if (supabaseUrl && supabaseKey) {
                                    try {
                                      const remoteStatus = await fetchOrderStatus(orderSuccess.code);
                                      if (remoteStatus === 'Pago') {
                                        await markOrderAsPaidAutomatically();
                                        showAdminToast('Pagamento Confirmado!');
                                        return;
                                      }
                                    } catch (e) {}
                                  }
                                  if (!asaasConfig.enabled) {
                                    const mpCheck = await verifyOrderPaymentOnMercadoPago(orderSuccess.code, orderSuccess.mpPaymentId);
                                    if (mpCheck && mpCheck.status === 'approved') {
                                      await markOrderAsPaidAutomatically();
                                      showAdminToast('Pagamento Confirmado!');
                                      return;
                                    }
                                  }
                                  showAdminToast('Ainda não identificamos o pagamento. Aguarde alguns instantes.');
                                }}
                                className="w-full py-3 px-4 rounded-2xl bg-[#FFF9F3] hover:bg-white border border-[#DFC3BC] text-[#4A2532] text-xs font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4 text-[#A90F4D] animate-spin shrink-0" />
                                <span>Já pagou? Clique aqui para verificar agora!</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                            <p className="text-sm font-bold">Pagamento confirmado automaticamente!</p>
                            <p className="text-xs text-emerald-800">O sistema reconheceu o pagamento e o pedido <strong>#{orderSuccess.code}</strong> já está com status <strong>Pago</strong> na Mimo Rosas.</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                      {orderSuccess.whatsappUrl && (
                        <a href={orderSuccess.whatsappUrl} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2">
                          <span>{orderSuccess.paymentConfirmed ? 'Enviar Comprovante no WhatsApp →' : 'Enviar Pedido no WhatsApp da Loja →'}</span>
                        </a>
                      )}
                      <button type="button" onClick={() => { setOrderSuccess(null); setActiveView('home'); }} className="px-6 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold">Voltar para a Vitrine</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="grid gap-4 lg:grid-cols-2 lg:items-start">
                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-3">
                      <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">1. Seus Dados</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required value={checkoutData.name} onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })} placeholder="Seu nome completo *" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm" />
                        <input type="tel" required value={checkoutData.phone} onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })} placeholder="WhatsApp (DDD) 99999-9999 *" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm" />
                        <input type="email" required value={checkoutData.email} onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })} placeholder="E-mail para comprovantes e rastreio *" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm sm:col-span-2" />
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            required={asaasConfig.enabled || ['card', 'mercadopago'].includes(checkoutData.paymentMethod)}
                            value={checkoutData.document}
                            onChange={(e) => {
                              const formatted = formatCpfCnpjInput(e.target.value);
                              setCheckoutData({ ...checkoutData, document: formatted });
                              if (!cardData.cpfCnpj) setCardData((prev) => ({ ...prev, cpfCnpj: formatted }));
                            }}
                            placeholder="CPF do comprador (para emissão do PIX / Cartão) *"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                          />
                        </div>
                      </div>
                      {!auth.user && (
                        <p className="text-[11px] text-[#795344]">
                          Quer acompanhar este pedido na sua conta? <button type="button" onClick={() => setActiveView('account')} className="text-[#A90F4D] font-semibold hover:underline">Entre ou crie uma conta</button> com este mesmo e-mail.
                        </p>
                      )}
                    </div>

                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">2. Entrega (Chapecó e Região) ou Retirada</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FCEEF2] text-[#A90F4D] text-[10.5px] font-bold">
                          📍 Chapecó/SC e Região Próxima
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button type="button" onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'delivery' })} className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 ${checkoutData.deliveryMethod === 'delivery' ? 'border-[#A90F4D] bg-[#FCEEF2]' : 'border-[#E5CFC9] bg-[#F6E9E5]'}`}>
                          <Truck className="w-5 h-5 text-[#A90F4D] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#4A2532]">Entrega por KM</p>
                            <p className="text-[10px] text-[#795344]">Chapecó e cidades próximas</p>
                          </div>
                        </button>
                        <button type="button" onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'pickup', outOfArea: false })} className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 ${checkoutData.deliveryMethod === 'pickup' ? 'border-[#A90F4D] bg-[#FCEEF2]' : 'border-[#E5CFC9] bg-[#F6E9E5]'}`}>
                          <Store className="w-5 h-5 text-[#A90F4D] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#4A2532]">Retirada</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">Grátis no Ateliê (Chapecó)</p>
                          </div>
                        </button>
                      </div>

                      {checkoutData.deliveryMethod === 'delivery' ? (
                        <div className="space-y-3 pt-1">
                          {/* Seletor rápido de Bairro de Chapecó ou Cidade da Região */}
                          <div className="p-3 rounded-2xl bg-[#F6E9E5]/80 border border-[#DFC3BC] space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <label className="font-bold text-[#4A2532]">
                                📍 Selecione seu Bairro (Chapecó) ou Cidade Próxima:
                              </label>
                              <span className="text-[11px] font-bold text-[#A90F4D]">
                                ~{activeDistanceKm} km • {shippingFee === 0 ? 'Frete Grátis!' : formatBRL(shippingFee)}
                              </span>
                            </div>
                            <select
                              value={checkoutData.regionZoneId || 'chapeco-passo'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const found = CHAPECO_REGION_ZONES.find((z) => z.id === val);
                                if (found) {
                                  setCheckoutData((prev) => ({
                                    ...prev,
                                    regionZoneId: found.id,
                                    distanceKm: found.km,
                                    city: found.city,
                                    outOfArea: false
                                  }));
                                }
                              }}
                              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DFC3BC] text-xs font-semibold text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                            >
                              <optgroup label="Bairros de Chapecó/SC">
                                {CHAPECO_REGION_ZONES.filter((z) => z.id.startsWith('chapeco-')).map((z) => {
                                  const fVal = Number(storeConfig.shippingBaseFee ?? 6) + z.km * Number(storeConfig.shippingPerKm ?? 1.5);
                                  return (
                                    <option key={z.id} value={z.id}>
                                      {z.label} ({z.km} km — {formatBRL(fVal)})
                                    </option>
                                  );
                                })}
                              </optgroup>
                              <optgroup label="Cidades Próximas (Região de Chapecó)">
                                {CHAPECO_REGION_ZONES.filter((z) => !z.id.startsWith('chapeco-')).map((z) => {
                                  const fVal = Number(storeConfig.shippingBaseFee ?? 6) + z.km * Number(storeConfig.shippingPerKm ?? 1.5);
                                  return (
                                    <option key={z.id} value={z.id}>
                                      {z.label} ({formatBRL(fVal)})
                                    </option>
                                  );
                                })}
                              </optgroup>
                            </select>
                            <p className="text-[10.5px] text-[#795344]">
                              Cálculo automático: Taxa base {formatBRL(storeConfig.shippingBaseFee ?? 6)} + {formatBRL(storeConfig.shippingPerKm ?? 1.5)}/km
                              {Number(storeConfig.freeShippingMin || 0) > 0 && (
                                <> • <strong className="text-emerald-700">Frete Grátis em Chapecó acima de {formatBRL(storeConfig.freeShippingMin)}</strong></>
                              )}
                            </p>
                          </div>

                          {checkoutData.outOfArea && (
                            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5">
                              <p className="font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Atenção: Entregas somente para Chapecó/SC e cidades próximas</span>
                              </p>
                              <p className="text-[11px]">
                                O CEP informado parece ser de fora da nossa região de entrega. Escolha uma cidade próxima acima, selecione <strong>Retirada Grátis no Ateliê</strong> ou fale conosco no WhatsApp!
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={checkoutData.cep}
                                onChange={(e) => handleCepLookup(e.target.value)}
                                placeholder="CEP (Ex: 89802-110) *"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                              />
                              {checkoutData.cepLoading && (
                                <Loader2 className="w-4 h-4 text-[#A90F4D] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                              )}
                            </div>
                            <input
                              type="text"
                              required
                              value={checkoutData.city || 'Chapecó/SC'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const matched = matchZoneByCityAndNeighborhood(val, checkoutData.neighborhood, checkoutData.cep);
                                setCheckoutData({
                                  ...checkoutData,
                                  city: val,
                                  distanceKm: matched.zone ? matched.zone.km : checkoutData.distanceKm,
                                  regionZoneId: matched.zone ? matched.zone.id : checkoutData.regionZoneId,
                                  outOfArea: matched.outOfArea
                                });
                              }}
                              placeholder="Cidade / UF (Ex: Chapecó/SC) *"
                              className="px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                            />
                            <input type="text" required value={checkoutData.address} onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })} placeholder="Rua / Avenida *" className="sm:col-span-1 px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm" />
                            <input type="text" required value={checkoutData.number} onChange={(e) => setCheckoutData({ ...checkoutData, number: e.target.value })} placeholder="Número *" className="px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm" />
                            <input
                              type="text"
                              required
                              value={checkoutData.neighborhood}
                              onChange={(e) => {
                                const val = e.target.value;
                                const matched = matchZoneByCityAndNeighborhood(checkoutData.city || 'Chapecó/SC', val, checkoutData.cep);
                                setCheckoutData({
                                  ...checkoutData,
                                  neighborhood: val,
                                  distanceKm: matched.zone ? matched.zone.km : checkoutData.distanceKm,
                                  regionZoneId: matched.zone ? matched.zone.id : checkoutData.regionZoneId
                                });
                              }}
                              placeholder="Bairro *"
                              className="px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm"
                            />
                            <input type="text" value={checkoutData.complement} onChange={(e) => setCheckoutData({ ...checkoutData, complement: e.target.value })} placeholder="Complemento (apto, bloco, ponto de ref.)" className="px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-emerald-700" />
                            <span>Retirada Gratuita • {storeConfig.storeLocationText || 'Ateliê Mimo Rosas - Chapecó/SC'}</span>
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Assim que seu pedido ficar pronto, avisamos você por e-mail e WhatsApp com o horário e endereço completo para retirada em Chapecó!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FFF9F3] rounded-3xl p-4 sm:p-5 border border-[#EBD5CF] space-y-4 lg:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE0DC] pb-3">
                        <h2 className="font-serif-display text-lg font-semibold text-[#4A2532]">3. Pagamento Transparente na Loja</h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-[#795344]">Produtos: <strong>{formatBRL(cartSubtotal)}</strong></span>
                          <span className="text-[#795344]">
                            {checkoutData.deliveryMethod === 'pickup'
                              ? <>Retirada: <strong className="text-emerald-700">Grátis</strong></>
                              : <>Frete ({activeDistanceKm} km): <strong className={shippingFee === 0 ? 'text-emerald-700' : 'text-[#4A2532]'}>{shippingFee === 0 ? 'Grátis' : formatBRL(shippingFee)}</strong></>}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#FCEEF2] text-[#A90F4D] font-bold text-sm">
                            Total: {formatBRL(cartTotal)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* BOTÃO PIX TRANSPARENTE */}
                        <button
                          type="button"
                          onClick={() => { setCardError(''); setCheckoutData({ ...checkoutData, paymentMethod: 'pix' }); }}
                          className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                            checkoutData.paymentMethod === 'pix'
                              ? 'border-[#A90F4D] bg-[#FCEEF2] shadow-sm'
                              : 'border-[#E5CFC9] bg-[#F6E9E5] hover:border-[#A90F4D]/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                            <QrCode className="w-5 h-5 text-[#A90F4D]" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold block text-[#4A2532]">PIX Instantâneo</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">QR Code na tela • Aprovação automática</span>
                          </div>
                        </button>

                        {/* BOTÃO CARTÃO TRANSPARENTE */}
                        <button
                          type="button"
                          onClick={() => { setCardError(''); setCheckoutData({ ...checkoutData, paymentMethod: 'card' }); }}
                          className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                            ['card', 'mercadopago'].includes(checkoutData.paymentMethod)
                              ? 'border-[#A90F4D] bg-[#FCEEF2] shadow-sm'
                              : 'border-[#E5CFC9] bg-[#F6E9E5] hover:border-[#A90F4D]/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                            <CreditCard className="w-5 h-5 text-[#A90F4D]" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold block text-[#4A2532]">Cartão de Crédito</span>
                            <span className="text-[10px] text-[#795344]">Pague aqui mesmo sem sair do site</span>
                          </div>
                        </button>
                      </div>

                      {/* FORMULÁRIO DE CARTÃO DE CRÉDITO TRANSPARENTE (DENTRO DO SITE) */}
                      {['card', 'mercadopago'].includes(checkoutData.paymentMethod) && !asaasConfig.enabled && (() => {
                        const detectedBrand = detectCardBrandFrontend(cardData.number);
                        const maxInst = Math.max(1, Number(storeConfig.maxInstallments || 3));
                        return (
                          <div className="p-4 sm:p-5 rounded-2xl bg-[#F6E9E5]/80 border border-[#DFC3BC] space-y-3.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#A90F4D]" />
                                <span className="text-xs font-bold text-[#4A2532]">Dados do Cartão de Crédito (Ambiente Criptografado)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {detectedBrand ? (
                                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${detectedBrand.color}`}>
                                    {detectedBrand.label}
                                  </span>
                                ) : (
                                  <span className="text-[10.5px] text-[#795344] font-medium">Visa • Master • Elo • Hipercard • Amex</span>
                                )}
                              </div>
                            </div>

                            {cardError && (
                              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{cardError}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#4A2532] mb-1">Número do Cartão *</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    value={cardData.number}
                                    onChange={(e) => setCardData({ ...cardData, number: formatCardNumberInput(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] font-mono text-sm text-[#4A2532] tracking-wider focus:outline-none focus:border-[#A90F4D]"
                                  />
                                  <CreditCard className="w-4 h-4 text-[#9A7468] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#4A2532] mb-1">Nome impresso no Cartão *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ex: MARIA C SILVA"
                                  value={cardData.holderName}
                                  onChange={(e) => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] text-sm uppercase text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-[#4A2532] mb-1">Validade (MM/AA) *</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  required
                                  placeholder="MM/AA"
                                  value={cardData.expiry}
                                  onChange={(e) => setCardData({ ...cardData, expiry: formatCardExpiryInput(e.target.value) })}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] font-mono text-sm text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-[#4A2532] mb-1">Código de Segurança (CVV) *</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  required
                                  maxLength={4}
                                  placeholder="123"
                                  value={cardData.cvv}
                                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] font-mono text-sm text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-[#4A2532] mb-1">CPF do Titular do Cartão *</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  required
                                  placeholder="000.000.000-00"
                                  value={cardData.cpfCnpj || checkoutData.document}
                                  onChange={(e) => setCardData({ ...cardData, cpfCnpj: formatCpfCnpjInput(e.target.value) })}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] text-sm text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-[#4A2532] mb-1">Parcelamento *</label>
                                <select
                                  value={cardData.installments}
                                  onChange={(e) => setCardData({ ...cardData, installments: Number(e.target.value) })}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFC3BC] text-sm font-semibold text-[#4A2532] focus:outline-none focus:border-[#A90F4D]"
                                >
                                  {Array.from({ length: maxInst }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>
                                      {n}x de {formatBRL(cartTotal / n)} {n <= 3 ? 'sem juros' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <button type="submit" disabled={isSubmittingCheckout} className="w-full py-3.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2">
                        {isSubmittingCheckout ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando pagamento seguro...</span>
                          </>
                        ) : ['card', 'mercadopago'].includes(checkoutData.paymentMethod) ? (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Finalizar e Pagar com Cartão ({cardData.installments}x de {formatBRL(cartTotal / (cardData.installments || 1))})</span>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            <span>Gerar QR Code PIX • {formatBRL(cartTotal)}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10.5px] text-center text-[#795344] flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Checkout Transparente Mimo Rosas • Processado com criptografia pelo Mercado Pago</span>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </main>

          <footer className="hidden lg:block border-t border-[#EFE0DC] bg-[#FFF9F3] mt-6">
            <div className="mx-auto w-full max-w-[1320px] px-8 py-12 grid grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MimoRoseOutlineSVG className="w-9 h-10" />
                  <span className="font-script text-4xl text-[#A90F4D] leading-none">Mimo Rosas</span>
                </div>
                <p className="text-sm text-[#6D493B] leading-relaxed max-w-[320px]">Presentes, aromas e sabores artesanais para transformar o chimarrão, o chá e o café em pequenos rituais de afeto.</p>
              </div>
              <div className="space-y-2.5">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[#9A7468]">Loja</h3>
                <button type="button" onClick={() => { setActiveView('home'); setSelectedCategory('all'); }} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Início</button>
                <button type="button" onClick={() => setActiveView('catalog')} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Catálogo completo</button>
                <button type="button" onClick={() => setActiveView('favorites')} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Meus favoritos</button>
                <button type="button" onClick={() => setIsAboutModalOpen(true)} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Sobre a Mimo Rosas</button>
              </div>
              <div className="space-y-2.5">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[#9A7468]">Atendimento</h3>
                <button type="button" onClick={() => setIsAssistantOpen(true)} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Assistente virtual</button>
                <a href={`https://wa.me/${String(storeConfig.whatsappNumber || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">WhatsApp da loja</a>
                <button type="button" onClick={() => setActiveView('checkout')} className="block text-sm text-[#5A382E] hover:text-[#A90F4D] transition-colors">Finalizar compra</button>
              </div>
              <div className="space-y-2.5">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[#9A7468]">Pagamento e Entrega</h3>
                <p className="text-sm text-[#6D493B] leading-relaxed">PIX instantâneo e cartão de crédito direto na loja. Entregas exclusivas para Chapecó/SC e região próxima (cálculo por KM) e retirada grátis no ateliê.</p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-[#F6E9E5] text-[11px] font-semibold text-[#A90F4D]">PIX</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F6E9E5] text-[11px] font-semibold text-[#A90F4D]">Cartão</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F6E9E5] text-[11px] font-semibold text-[#A90F4D]">Chapecó e Região</span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EFE0DC] py-4">
              <p className="text-center text-xs text-[#9A7468]">© {new Date().getFullYear()} Mimo Rosas • Presentes, aromas e sabores • Feito com carinho</p>
            </div>
          </footer>

          <button type="button" onClick={() => setIsAssistantOpen(true)} className="fixed bottom-[76px] right-3 sm:right-6 lg:bottom-8 lg:right-8 z-30 bg-[#FFF9F3] hover:bg-white text-[#3B231C] pl-2 pr-4 py-2 rounded-full shadow-[0_8px_24px_rgba(89,40,58,0.22)] border border-[#EBD5CF] flex items-center gap-2 active:scale-95 transition-all">
            <span className="relative w-8 h-8 rounded-full bg-[#38C958] flex items-center justify-center text-white shadow-xs">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" /></svg>
            </span>
            <span className="text-[12.5px] font-semibold tracking-tight">Vamos conversar?</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#38C958]" />
          </button>

          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFF9F3] border-t border-[#EAD6D0] px-2 pt-1.5 pb-2 shadow-[0_-4px_20px_rgba(121,83,68,0.08)]">
            <div className="grid grid-cols-5 items-center">
              <button type="button" onClick={() => { setActiveView('home'); setSelectedCategory('all'); }} className={`flex flex-col items-center gap-0.5 py-1 relative ${activeView === 'home' ? 'text-[#A90F4D]' : 'text-[#795344]'}`}><Home className="w-5 h-5" /><span className="text-[11px] font-medium">Início</span></button>
              <button type="button" onClick={() => setActiveView('catalog')} className={`flex flex-col items-center gap-0.5 py-1 relative ${activeView === 'catalog' ? 'text-[#A90F4D]' : 'text-[#795344]'}`}><LayoutGrid className="w-5 h-5" /><span className="text-[11px] font-medium">Categorias</span></button>
              <button type="button" onClick={() => setActiveView('favorites')} className={`flex flex-col items-center gap-0.5 py-1 relative ${activeView === 'favorites' ? 'text-[#A90F4D]' : 'text-[#795344]'}`}><Heart className="w-5 h-5" /><span className="text-[11px] font-medium">Favoritos</span></button>
              <button type="button" onClick={() => setActiveView('account')} className={`flex flex-col items-center gap-0.5 py-1 relative ${activeView === 'account' ? 'text-[#A90F4D]' : 'text-[#795344]'}`}><User className="w-5 h-5" /><span className="text-[11px] font-medium">Minha Conta</span></button>
              <button type="button" onClick={() => setIsAssistantOpen(true)} className="flex flex-col items-center gap-0.5 py-1 text-[#795344]"><Sparkles className="w-5 h-5 text-[#A90F4D]" /><span className="text-[11px] font-medium">Atendimento</span></button>
            </div>
          </nav>

          {isSideMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsSideMenuOpen(false)} />
              <aside className="relative z-10 w-[82%] max-w-[330px] bg-[#FFF9F3] h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#EFE0DC] pb-3">
                    <div className="flex items-center gap-2">
                      <MimoRoseOutlineSVG className="w-8 h-9" />
                      <span className="font-script text-3xl text-[#A90F4D]">Mimo Rosas</span>
                    </div>
                    <button type="button" onClick={() => setIsSideMenuOpen(false)} className="p-1.5 rounded-full text-[#795344]"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#9A7468] font-semibold px-2 mb-1.5">Categorias da Loja</p>
                    {categories.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => navigateCategory(cat.id)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#4E2F26] hover:bg-[#F6E9E5]">
                        <span>{cat.name}</span><ChevronRight className="w-4 h-4 text-[#A90F4D]" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#EFE0DC]">
                  <a href={`https://wa.me/${String(storeConfig.whatsappNumber || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2">
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </aside>
            </div>
          )}

          {isCartOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
              <aside className="relative z-10 w-full max-w-[390px] bg-[#FFF9F3] h-full shadow-2xl flex flex-col justify-between">
                <div className="p-4 border-b border-[#EFE0DC] flex items-center justify-between">
                  <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#A90F4D]" /><h2 className="font-serif-display text-lg font-bold text-[#4A2532]">Sua Sacola ({cartCount})</h2></div>
                  <button type="button" onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full text-[#795344]"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-14 space-y-3"><ShoppingCart className="w-10 h-10 text-[#A90F4D] mx-auto opacity-50" /><p className="text-xs text-[#795344]">Sua sacola está vazia.</p></div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartKey} className="flex gap-3 bg-[#F6E9E5]/60 p-2.5 rounded-2xl border border-[#EFE0DC]">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#4A2532] line-clamp-1">{item.name}</h4>
                          <p className="text-[11px] text-[#795344]">{item.variation}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#A90F4D]">{formatBRL(item.price * item.quantity)}</span>
                            <div className="flex items-center gap-2 bg-[#FFF9F3] px-2 py-0.5 rounded-full border border-[#E5CFC9]">
                              <button type="button" onClick={() => updateCartQty(item.cartKey, -1)}><Minus className="w-3 h-3 text-[#A90F4D]" /></button>
                              <span className="text-xs font-semibold">{item.quantity}</span>
                              <button type="button" onClick={() => updateCartQty(item.cartKey, 1)}><Plus className="w-3 h-3 text-[#A90F4D]" /></button>
                            </div>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFromCart(item.cartKey)} className="text-[#9A7468] hover:text-red-600 self-start"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="p-4 bg-[#F6E9E5] border-t border-[#E5CFC9] space-y-3">
                    <div className="flex justify-between text-sm font-bold text-[#4A2532]"><span>Subtotal</span><span className="text-[#A90F4D]">{formatBRL(cartSubtotal)}</span></div>
                    <button type="button" onClick={() => { setIsCartOpen(false); setOrderSuccess(null); setActiveView('checkout'); }} className="w-full py-3.5 rounded-full bg-[#A90F4D] text-white font-semibold text-sm shadow-md">Finalizar Compra →</button>
                  </div>
                )}
              </aside>
            </div>
          )}

          {isAssistantOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsAssistantOpen(false)} />
              <div className="relative z-10 w-full max-w-[430px] h-[84vh] sm:h-[620px] bg-[#FFF9F3] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-[#EBD5CF]">
                <div className="p-4 text-white flex items-center justify-between" style={{ background: 'linear-gradient(90deg, #980B44 0%, #A90F4D 100%)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF9F3] flex items-center justify-center"><MimoRoseOutlineSVG className="w-6 h-7" /></div>
                    <div>
                      <h3 className="font-serif-display font-bold text-base leading-tight">Assistente Mimo Rosas</h3>
                      <p className="text-[11px] text-[#FAD4E0]">Atendimento Virtual Online</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsAssistantOpen(false)} className="p-1.5 rounded-full bg-white/15 text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6E9E5]/60">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line ${msg.sender === 'user' ? 'bg-[#A90F4D] text-white rounded-br-xs' : 'bg-[#FFF9F3] text-[#4A2532] border border-[#EBD5CF] rounded-bl-xs'}`}>{msg.text}</div>
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-[90%]">
                          {msg.products.map((p) => (
                            <div key={p.id} onClick={() => { setIsAssistantOpen(false); openProductDetail(p); }} className="bg-[#FFF9F3] p-2 rounded-xl border border-[#EBD5CF] cursor-pointer hover:border-[#A90F4D] transition">
                              <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-1" />
                              <p className="text-[11px] font-semibold text-[#4A2532] line-clamp-1">{p.name}</p>
                              <p className="text-xs font-bold text-[#A90F4D]">{formatBRL(p.price)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.time && <span className="text-[9px] text-[#9A7468] mt-0.5 px-1">{msg.time}</span>}
                    </div>
                  ))}

                  {isBotTyping && (
                    <div className="flex flex-col items-start">
                      <div className="bg-[#FFF9F3] border border-[#EBD5CF] rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A90F4D] typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A90F4D] typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A90F4D] typing-dot" />
                      </div>
                    </div>
                  )}
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
                    <button key={opt.id} type="button" onClick={() => handleAssistantOption(opt.id)} disabled={isBotTyping} className="px-3 py-1.5 rounded-full bg-[#F6E9E5] hover:bg-[#A90F4D] hover:text-white text-[#A90F4D] text-[11px] font-semibold shrink-0 border border-[#E5CFC9] transition disabled:opacity-50">{opt.label}</button>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-3 bg-[#FFF9F3] border-t border-[#EFE0DC] flex items-center gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Digite sua dúvida para a Mimo Rosas..." className="flex-1 px-3.5 py-2.5 rounded-full bg-[#F6E9E5] border border-[#E5CFC9] text-xs focus:outline-none" />
                  <button type="submit" disabled={isBotTyping || !chatInput.trim()} className="w-9 h-9 rounded-full bg-[#A90F4D] text-white flex items-center justify-center shrink-0 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            </div>
          )}

          {isAboutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsAboutModalOpen(false)} />
              <div className="relative z-10 bg-[#FFF9F3] max-w-md w-full rounded-[28px] p-6 border border-[#EBD5CF] shadow-2xl text-center space-y-3">
                <MimoRoseOutlineSVG className="w-12 h-14 mx-auto" />
                <h3 className="font-script text-4xl text-[#A90F4D]">Mimo Rosas</h3>
                <p className="text-xs sm:text-sm text-[#5A382E] leading-relaxed">Nascemos da paixão por transformar rituais diários — como o chimarrão, o chá da tarde e o café — em momentos de afeto e beleza.</p>
                <button type="button" onClick={() => setIsAboutModalOpen(false)} className="mt-2 px-6 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold">Continuar navegando</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
