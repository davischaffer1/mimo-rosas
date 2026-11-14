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
  Plus,
  Minus,
  Trash2,
  X,
  Star,
  Sparkles,
  Check,
  MapPin,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Send,
  ArrowRight,
  ShieldCheck,
  Package,
  Settings,
  Database,
  Bot,
  Edit3,
  Copy,
  RefreshCw,
  Eye,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÃO OFICIAL DO SUPABASE (PRÉ-CONECTADO AO SEU PROJETO)
// ============================================================================
const DEFAULT_SUPABASE_URL = 'https://dktpnqekuxtsqmazelox.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_7WyhLNtUeEMNnbE_MyTo2g_IYrCA8AU';

// ============================================================================
// DADOS INICIAIS: 8 CATEGORIAS E 16 PRODUTOS DEMONSTRATIVOS
// ============================================================================
const INITIAL_CATEGORIES = [
  {
    id: 'infusoes',
    name: 'Infusões para Chimarrão, Drinks e Tererê',
    shortName: 'Infusões para Chimarrão, Drinks e Tererê',
    icon: 'cuia'
  },
  {
    id: 'blend',
    name: 'Blend para Chimarrão',
    shortName: 'Blend para Chimarrão',
    icon: 'leaf'
  },
  {
    id: 'capsulas-cafe',
    name: 'Cápsulas de Café',
    shortName: 'Cápsulas de Café',
    icon: 'bean'
  },
  {
    id: 'capsulas-cha',
    name: 'Cápsulas de Chá',
    shortName: 'Cápsulas de Chá',
    icon: 'teacup'
  },
  {
    id: 'enfeites',
    name: 'Enfeites de Cuia',
    shortName: 'Enfeites de Cuia',
    icon: 'gift'
  },
  {
    id: 'cuias-resinadas',
    name: 'Cuias Resinadas',
    shortName: 'Cuias Resinadas',
    icon: 'sparkles'
  },
  {
    id: 'chaveiros',
    name: 'Chaveiros em Resina',
    shortName: 'Chaveiros em Resina',
    icon: 'keychain'
  },
  {
    id: 'bombas',
    name: 'Bombas de Chimarrão Personalizadas',
    shortName: 'Bombas Personalizadas',
    icon: 'bomba'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Infusões para Chimarrão, Drinks e Tererê',
    category: 'infusoes',
    price: 24.90,
    stock: 28,
    badge: 'Mais Vendido',
    badgeType: 'star',
    featured: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosas & Hibisco (50g)', 'Frutas Vermelhas (50g)', 'Cítrico Floral (50g)'],
    description:
      'Mix artesanal selecionado com pétalas de rosas rubras, hibisco em flor e especiarias aromáticas. Perfeito para transformar seu chimarrão, tererê ou drinks autorais em uma experiência sensorial inesquecível.'
  },
  {
    id: 'prod-2',
    name: 'Cápsulas de Chá – Rosa',
    category: 'capsulas-cha',
    price: 19.90,
    stock: 35,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosa Damascena & Baunilha (2 un.)', 'Rosa & Morango Silvestre (2 un.)', 'Rosa & Camomila (2 un.)'],
    description:
      'Cápsulas artesanais esculpidas em formato de rosa que se dissolvem delicadamente na água quente ou no chimarrão, liberando pétalas naturais, aroma envolvente e um sabor suave e acolhedor.'
  },
  {
    id: 'prod-3',
    name: 'Blend para Chimarrão – Jardim Imperial',
    category: 'blend',
    price: 22.90,
    stock: 20,
    badge: 'Mais Vendido',
    badgeType: 'star',
    featured: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Pote 60g', 'Refil 100g'],
    description:
      'Combinação equilibrada de camomila, anis-estrelado, capim-limão e botões de rosa. Traz leveza e perfume ao seu mate diário sem roubar o protagonismo da erva-mate.'
  },
  {
    id: 'prod-4',
    name: 'Cuia Resinada – Coleção Rosé Gold',
    category: 'cuias-resinadas',
    price: 119.90,
    stock: 8,
    badge: 'Exclusivo',
    badgeType: 'star',
    featured: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosé com Folhas de Ouro', 'Branco Perolado & Framboesa'],
    description:
      'Porongo natural selecionado de alta densidade com acabamento artístico em resina cristal, pigmentos perolados rosé e folhas douradas aplicadas manualmente.'
  },
  {
    id: 'prod-5',
    name: 'Cápsulas de Café – Caramelo & Especiarias',
    category: 'capsulas-cafe',
    price: 26.90,
    stock: 22,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa com 4 Rosas de Café', 'Caixa com 8 Rosas de Café'],
    description:
      'Esferas florais de café arábica especial combinadas com notas de caramelo salgado, canela do Ceilão e cacau. Basta adicionar leite quente ou água.'
  },
  {
    id: 'prod-6',
    name: 'Enfeite de Cuia em Resina – Rosa Eterna',
    category: 'enfeites',
    price: 18.90,
    stock: 40,
    badge: 'Artesanal',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Rosa Framboesa', 'Rosa Porcelana com Glitter Dourado'],
    description:
      'Enfeite delicado com pino inoxidável próprio para decorar o seu chimarrão com elegância e personalidade.'
  },
  {
    id: 'prod-7',
    name: 'Chaveiro em Resina – Inicial com Pétalas Reais',
    category: 'chaveiros',
    price: 29.90,
    stock: 30,
    badge: 'Presente',
    badgeType: 'star',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Letra A–M (informar no pedido)', 'Letra N–Z (informar no pedido)'],
    description:
      'Chaveiro personalizado em resina epóxi cristalina eternizando pétalas de rosas desidratadas e flocos dourados, acompanhado de pingente em tassel de seda.'
  },
  {
    id: 'prod-8',
    name: 'Bomba de Chimarrão Personalizada – Joia Rosé',
    category: 'bombas',
    price: 89.90,
    stock: 14,
    badge: 'Premium',
    badgeType: 'star',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['21cm Inox c/ Pedra Quartzo Rosa', '23cm Inox c/ Pingente Rosa'],
    description:
      'Bomba em aço inox 304 cirúrgico (não enferruja e não transfere gosto) com anel cravejado artesanalmente e pedra natural.'
  },
  {
    id: 'prod-9',
    name: 'Infusão Tropical para Tererê & Gin – Hibisco & Maçã',
    category: 'infusoes',
    price: 24.90,
    stock: 25,
    badge: '',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Lata Presenteável 55g', 'Pacote Zip 50g'],
    description:
      'Frescor cítrico e frutado com maçã desidratada, hibisco, casca de laranja doce e pétalas de rosa. Ideal para infusões geladas e drinks botânicos.'
  },
  {
    id: 'prod-10',
    name: 'Blend para Chimarrão – Doce Aconchego',
    category: 'blend',
    price: 21.90,
    stock: 19,
    badge: '',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Pote 60g'],
    description:
      'Mix suave de erva-doce, cidreira, camomila selecionada e coco em flocos finos para um chimarrão leve no fim da tarde.'
  },
  {
    id: 'prod-11',
    name: 'Cápsulas de Café – Avelã & Chocolate Belga',
    category: 'capsulas-cafe',
    price: 27.90,
    stock: 15,
    badge: '',
    badgeType: 'star',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Caixa com 4 unidades'],
    description:
      'Cápsulas solúveis gourmet em formato de botão de rosa com aroma intenso de avelã tostada e cacau nobre.'
  },
  {
    id: 'prod-12',
    name: 'Cápsulas de Chá – Lavanda & Mel Silvestre',
    category: 'capsulas-cha',
    price: 19.90,
    stock: 28,
    badge: '',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Kit 2 Rosas Relaxantes'],
    description:
      'Infusão calmante em cápsula floral de isomalte natural com flores de lavanda francesa, melissa e pétalas cor-de-rosa.'
  },
  {
    id: 'prod-13',
    name: 'Kit 3 Enfeites de Cuia – Jardim de Rosas',
    category: 'enfeites',
    price: 44.90,
    stock: 18,
    badge: 'Mais Vendido',
    badgeType: 'star',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Trio Clássico (Rosa, Borboleta e Coração)'],
    description:
      'Trio de enfeites modelados à mão com acabamento vitrificado em resina UV e detalhes folheados.'
  },
  {
    id: 'prod-14',
    name: 'Cuia Resinada – Pérola & Pétalas Naturais',
    category: 'cuias-resinadas',
    price: 129.90,
    stock: 6,
    badge: 'Novo',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Bocal Dourado', 'Bocal Inox Polido'],
    description:
      'Cuia artesanal revestida com pétalas de rosas verdadeiras encapsuladas em resina de alto brilho.'
  },
  {
    id: 'prod-15',
    name: 'Chaveiro Coração em Resina – Mimo de Amor',
    category: 'chaveiros',
    price: 26.90,
    stock: 32,
    badge: '',
    badgeType: 'leaf',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Com Argola Dourada', 'Com Fecho Lagosta Rosé'],
    description:
      'Coração abaulado em resina com minirrosas naturais secas em sílica e folhas de ouro 24k decorativas.'
  },
  {
    id: 'prod-16',
    name: 'Bomba de Chimarrão – Medalhão Mimo Rosas',
    category: 'bombas',
    price: 94.90,
    stock: 11,
    badge: '',
    badgeType: 'star',
    featured: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'
    ],
    variations: ['Bojo Redondo Tradicional', 'Bojo Mil Furos Desmontável'],
    description:
      'Bomba de chimarrão artesanal em aço inox com medalhão central resinado contendo uma rosa em miniatura.'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'PED-9041',
    customerName: 'Mariana Silveira',
    customerPhone: '(54) 99912-3456',
    deliveryMethod: 'delivery',
    address: 'Rua das Hortênsias, 420 - Centro',
    cep: '95670-000',
    paymentMethod: 'pix',
    status: 'Pago',
    total: 64.70,
    createdAt: 'Hoje, 14:20',
    items: [
      { id: 'prod-1', name: 'Infusões para Chimarrão, Drinks e Tererê', qty: 1, price: 24.90, variation: 'Rosas & Hibisco (50g)' },
      { id: 'prod-2', name: 'Cápsulas de Chá – Rosa', qty: 2, price: 19.90, variation: 'Rosa Damascena & Baunilha (2 un.)' }
    ]
  }
];

const SUPABASE_SQL_SCRIPT = `-- 1. Tabela de Categorias Mimo Rosas
create table if not exists public.categories (
  id text primary key,
  name text not null,
  short_name text not null,
  icon text not null
);

-- 2. Tabela de Produtos Mimo Rosas
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text references public.categories(id),
  price numeric(10,2) not null,
  stock integer default 10,
  badge text,
  badge_type text default 'star',
  featured boolean default false,
  active boolean default true,
  image text not null,
  description text,
  variations jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 3. Tabela de Pedidos Mimo Rosas
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  delivery_method text not null,
  address text,
  cep text,
  payment_method text not null,
  status text default 'Pendente',
  total numeric(10,2) not null,
  items jsonb not null,
  created_at timestamptz default now()
);

-- 4. Liberar Políticas de Acesso (Row Level Security)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Liberar categorias geral" on public.categories;
create policy "Liberar categorias geral" on public.categories for all using (true) with check (true);

drop policy if exists "Liberar produtos geral" on public.products;
create policy "Liberar produtos geral" on public.products for all using (true) with check (true);

drop policy if exists "Liberar pedidos geral" on public.orders;
create policy "Liberar pedidos geral" on public.orders for all using (true) with check (true);`;

// ============================================================================
// COMPONENTES SVG FIÉIS À IMAGEM DE REFERÊNCIA DA MIMO ROSAS
// ============================================================================
function RoseLogoSVG({ className = 'w-10 h-11', strokeColor = '#A90F4D' }) {
  return (
    <svg viewBox="0 0 80 90" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Pétalas superiores em espiral delicada */}
      <path
        d="M22 25C22 15 32 10 42 10C52 10 62 15 62 24C62 31 53 35 42 35C31 35 24 30 26 23C28 17 36 15 43 16C49 17 53 20 51 24C49 27 42 28 37 26C34 25 34 21 38 20C41 19 45 20 45 22"
        stroke={strokeColor}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cálice / corpo da rosa */}
      <path
        d="M21 24C19 37 23 52 38 59C43 61 48 60 53 56C63 48 65 34 62 23"
        stroke={strokeColor}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dobras internas das pétalas */}
      <path
        d="M23 33C31 39 42 40 53 33"
        stroke={strokeColor}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M28 45C36 49 48 47 58 37"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Caule e folhas inferiores */}
      <path
        d="M41 60V83"
        stroke={strokeColor}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M41 72C33 67 24 67 19 71C25 75 34 75 41 72Z"
        stroke={strokeColor}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41 74C49 69 57 69 62 73C56 77 48 77 41 74Z"
        stroke={strokeColor}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryIllustration({ type }) {
  const stroke = '#A90F4D';
  switch (type) {
    case 'cuia':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M15 21H33C34 29 30 37 24 38C18 37 14 29 15 21Z" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 38H30" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M14 21C18 19 30 19 34 21" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M27 20L33 10C34 8.5 36 9 35.5 11L30 20" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M24 36C24 25 31 15 39 14C39 24 33 33 24 36Z" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 36C24 26 17 17 9 16C9 25 15 33 24 36Z" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 38V24" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );
    case 'bean':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <ellipse cx="21" cy="25" rx="9" ry="12" transform="rotate(-18 21 25)" stroke={stroke} strokeWidth="2.1" />
          <path d="M18 14C22 20 19 29 23 36" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M28 15C34 16 38 22 36 29C35 34 30 37 26 36" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'teacup':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M12 22H32V27C32 32.5 27.5 36 22 36C16.5 36 12 32.5 12 27V22Z" stroke={stroke} strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M32 24H35.5C37.5 24 39 25.5 39 27.5C39 29.5 37.5 31 35.5 31H31.5" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M10 39H34" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M19 17C19 15 21 14 21 12" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M25 17C25 15 27 14 27 12" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'gift':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <rect x="11" y="21" width="26" height="17" rx="2.5" stroke={stroke} strokeWidth="2.1" />
          <rect x="9" y="16" width="30" height="5" rx="1.8" stroke={stroke} strokeWidth="2.1" />
          <path d="M24 16V38" stroke={stroke} strokeWidth="2.1" />
          <path d="M24 16C20 16 17 13.5 18 11C19 8.8 22.5 11 24 16Z" stroke={stroke} strokeWidth="2" />
          <path d="M24 16C28 16 31 13.5 30 11C29 8.8 25.5 11 24 16Z" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M24 11L26.8 20.2L36 23L26.8 25.8L24 35L21.2 25.8L12 23L21.2 20.2L24 11Z" stroke={stroke} strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M35 11V16M32.5 13.5H37.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'keychain':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <circle cx="24" cy="15" r="5" stroke={stroke} strokeWidth="2.1" />
          <path d="M24 20V24" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M24 38C18 33 14 29 14 25.5C14 23 16 21 18.5 21C20.5 21 22.5 22.2 24 24C25.5 22.2 27.5 21 29.5 21C32 21 34 23 34 25.5C34 29 30 33 24 38Z" stroke={stroke} strokeWidth="2.1" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
          <path d="M18 36L31 12" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="25" cy="23" r="3.5" stroke={stroke} strokeWidth="2" />
          <ellipse cx="16.5" cy="37.5" rx="3.5" ry="2.2" transform="rotate(-28 16.5 37.5)" stroke={stroke} strokeWidth="2" />
        </svg>
      );
  }
}

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 14C16.31 13.87 15.09 13.27 14.87 13.19C14.64 13.11 14.48 13.07 14.31 13.31C14.15 13.56 13.67 14.12 13.53 14.28C13.38 14.45 13.24 14.47 12.99 14.34C12.74 14.22 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.6 11.01 9.73 10.89C9.84 10.78 9.98 10.6 10.1 10.46C10.22 10.31 10.27 10.21 10.35 10.04C10.43 9.88 10.39 9.73 10.33 9.61C10.27 9.48 9.77 8.26 9.57 7.77C9.37 7.29 9.16 7.35 9.01 7.34H8.53C8.36 7.34 8.1 7.4 7.87 7.65C7.65 7.9 7.01 8.5 7.01 9.72C7.01 10.94 7.9 12.11 8.02 12.28C8.15 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.54C14.25 16.73 14.79 16.7 15.22 16.64C15.7 16.57 16.68 16.04 16.89 15.46C17.1 14.88 17.1 14.39 17.03 14.28C16.97 14.18 16.81 14.12 16.56 14Z" />
    </svg>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: LOJA VIRTUAL + PAINEL ADMIN + CONECTOR SUPABASE
// ============================================================================
export default function App() {
  // Modo de visualização: 'store' (Vitrine) ou 'admin' (Painel Administrativo)
  const [viewMode, setViewMode] = useState('store');
  const [adminTab, setAdminTab] = useState('products');

  // Autenticação do Painel Admin para quando publicado na Vercel
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => {
    try {
      return localStorage.getItem('mimo_rosas_admin_pwd') || 'mimo2026';
    } catch {
      return 'mimo2026';
    }
  });
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState('');

  // Credenciais do Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    try {
      return localStorage.getItem('mimo_rosas_sb_url') || DEFAULT_SUPABASE_URL;
    } catch {
      return DEFAULT_SUPABASE_URL;
    }
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    try {
      return localStorage.getItem('mimo_rosas_sb_key') || DEFAULT_SUPABASE_KEY;
    } catch {
      return DEFAULT_SUPABASE_KEY;
    }
  });
  const [sbStatus, setSbStatus] = useState({
    connected: false,
    loading: false,
    message: 'Pronto para sincronizar com o Supabase.'
  });

  // Estados principais de Catálogo, Pedidos e Configurações
  const [categories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [storeConfig, setStoreConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_config');
      return saved
        ? JSON.parse(saved)
        : {
            whatsappNumber: '5554999999999',
            freeShippingThreshold: 120,
            shippingFlatRate: 14.9,
            assistantGreeting:
              'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais.'
          };
    } catch {
      return {
        whatsappNumber: '5554999999999',
        freeShippingThreshold: 120,
        shippingFlatRate: 14.9,
        assistantGreeting:
          'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais.'
      };
    }
  });

  // Estados de navegação da Loja
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'categories' | 'favorites' | 'account'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  // Produto individual aberto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [productQty, setProductQty] = useState(1);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  // Favoritos e Carrinho
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_favs');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mimo_rosas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  // Formulário de Checkout Demonstrativo
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    deliveryMethod: 'delivery', // 'delivery' | 'pickup'
    cep: '',
    address: '',
    paymentMethod: 'pix' // 'pix' | 'card'
  });
  const [checkoutError, setCheckoutError] = useState('');

  // Assistente Virtual Mimo Rosas
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá! 🌹 Seja muito bem-vinda à Mimo Rosas! Sou sua assistente virtual e estou aqui para ajudar você a encontrar produtos especiais.',
      recommendedProductId: null
    }
  ]);

  // Estados do Painel Admin (Criação/Edição de Produto)
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminToast, setAdminToast] = useState('');
  const [storeToast, setStoreToast] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState({
    filename: 'package.json',
    content: JSON.stringify(
      {
        name: 'mimo-rosas-loja',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.460.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.1',
          vite: '^5.4.1'
        }
      },
      null,
      2
    )
  });

  const categoryScrollRef = useRef(null);
  const catalogSectionRef = useRef(null);
  const chatEndRef = useRef(null);
  const codePreviewTextareaRef = useRef(null);

  // Função segura de cópia que funciona dentro do Preview sem erro NotAllowedError
  const safeCopyText = (text, label = 'Conteúdo') => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (copied) {
        showAdminToast(`${label} copiado para a área de transferência!`);
        return;
      }
    } catch {
      // Continua para fallback visual
    }
    showAdminToast(`${label} exibido abaixo! Pressione Ctrl+C para copiar.`);
  };

  // Salvar alterações no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mimo_rosas_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('mimo_rosas_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

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
      localStorage.setItem('mimo_rosas_config', JSON.stringify(storeConfig));
    } catch {
      // ignore
    }
  }, [storeConfig]);

  // Suporte a ?admin=1 na URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') {
        setShowAdminLoginModal(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sincronização inicial automática com o Supabase se configurado
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      fetchFromSupabaseSilent();
    }
  }, []);

  useEffect(() => {
    if (assistantOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, assistantOpen]);

  const showStoreNotification = (msg) => {
    setStoreToast(msg);
    setTimeout(() => setStoreToast(''), 2600);
  };

  const showAdminToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3200);
  };

  // ============================================================================
  // FUNÇÕES REST DO SUPABASE (SEM DEPENDÊNCIAS EXTERNAS)
  // ============================================================================
  const getSupabaseHeaders = () => ({
    apikey: supabaseKey.trim(),
    Authorization: `Bearer ${supabaseKey.trim()}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation,resolution=merge-duplicates'
  });

  const fetchFromSupabaseSilent = async () => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const prodRes = await fetch(`${cleanUrl}/rest/v1/products?select=*&order=created_at.asc`, {
        headers: getSupabaseHeaders()
      });
      if (prodRes.ok) {
        const dbProds = await prodRes.json();
        if (Array.isArray(dbProds) && dbProds.length > 0) {
          const mapped = dbProds.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price),
            stock: Number(p.stock ?? 10),
            badge: p.badge || '',
            badgeType: p.badge_type || 'star',
            featured: Boolean(p.featured),
            active: p.active !== false,
            image: p.image,
            gallery: [p.image],
            variations: Array.isArray(p.variations) ? p.variations : ['Padrão'],
            description: p.description || ''
          }));
          setProducts(mapped);
        }
        setSbStatus({
          connected: true,
          loading: false,
          message: `Conectado ao Supabase (${dbProds.length} produtos sincronizados).`
        });
      }

      const ordRes = await fetch(`${cleanUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: getSupabaseHeaders()
      });
      if (ordRes.ok) {
        const dbOrders = await ordRes.json();
        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          const mappedOrders = dbOrders.map((o) => ({
            id: o.id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            deliveryMethod: o.delivery_method,
            address: o.address || '',
            cep: o.cep || '',
            paymentMethod: o.payment_method,
            status: o.status || 'Pendente',
            total: Number(o.total),
            createdAt: o.created_at
              ? new Date(o.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recente',
            items: Array.isArray(o.items) ? o.items : []
          }));
          setOrders(mappedOrders);
        }
      }
    } catch {
      // fallback local
    }
  };

  const testSupabaseConnection = async () => {
    setSbStatus({ connected: false, loading: true, message: 'Testando conexão com o Supabase...' });
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const prodRes = await fetch(`${cleanUrl}/rest/v1/products?select=id`, {
        headers: getSupabaseHeaders()
      });
      const ordRes = await fetch(`${cleanUrl}/rest/v1/orders?select=id`, {
        headers: getSupabaseHeaders()
      });

      if (!prodRes.ok) {
        const errText = await prodRes.text();
        setSbStatus({
          connected: false,
          loading: false,
          message: `Erro Supabase (${prodRes.status}): ${errText}`
        });
        return;
      }

      const prods = await prodRes.json();
      const ords = ordRes.ok ? await ordRes.json() : [];
      setSbStatus({
        connected: true,
        loading: false,
        message: `Conectado com sucesso! (${prods.length} produtos e ${ords.length} pedidos encontrados no banco).`
      });
      fetchFromSupabaseSilent();
    } catch (err) {
      setSbStatus({
        connected: false,
        loading: false,
        message: `Falha na conexão: ${err.message}`
      });
    }
  };

  const seedInitialDataToSupabase = async () => {
    setSbStatus({ connected: false, loading: true, message: 'Enviando 8 categorias e 16 produtos para o Supabase...' });
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');

      // 1. Enviar categorias
      const catPayload = categories.map((c) => ({
        id: c.id,
        name: c.name,
        short_name: c.shortName,
        icon: c.icon
      }));
      const catRes = await fetch(`${cleanUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(catPayload)
      });

      if (!catRes.ok) {
        const errText = await catRes.text();
        setSbStatus({
          connected: false,
          loading: false,
          message: `Erro ao enviar categorias (${catRes.status}): ${errText}`
        });
        return;
      }

      // 2. Enviar produtos
      const prodPayload = products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        badge: p.badge || '',
        badge_type: p.badgeType || 'star',
        featured: Boolean(p.featured),
        active: p.active !== false,
        image: p.image,
        description: p.description || '',
        variations: p.variations || ['Padrão']
      }));

      const prodRes = await fetch(`${cleanUrl}/rest/v1/products`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(prodPayload)
      });

      if (!prodRes.ok) {
        const errText = await prodRes.text();
        setSbStatus({
          connected: false,
          loading: false,
          message: `Erro ao enviar produtos (${prodRes.status}): ${errText}`
        });
        return;
      }

      setSbStatus({
        connected: true,
        loading: false,
        message: 'Sucesso! Todas as 8 categorias e 16 produtos foram gravados no Supabase!'
      });
      showAdminToast('Banco Supabase sincronizado com sucesso!');
    } catch (err) {
      setSbStatus({
        connected: false,
        loading: false,
        message: `Erro de rede: ${err.message}`
      });
    }
  };

  const syncSingleProductToSupabase = async (prod) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      await fetch(`${cleanUrl}/rest/v1/products`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          price: Number(prod.price),
          stock: Number(prod.stock),
          badge: prod.badge || '',
          badge_type: prod.badgeType || 'star',
          featured: Boolean(prod.featured),
          active: prod.active !== false,
          image: prod.image,
          description: prod.description || '',
          variations: prod.variations || ['Padrão']
        })
      });
    } catch {
      // ignore
    }
  };

  const syncOrderToSupabase = async (orderObj) => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      await fetch(`${cleanUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          id: orderObj.id,
          customer_name: orderObj.customerName,
          customer_phone: orderObj.customerPhone,
          delivery_method: orderObj.deliveryMethod,
          address: orderObj.address || '',
          cep: orderObj.cep || '',
          payment_method: orderObj.paymentMethod,
          status: orderObj.status,
          total: Number(orderObj.total),
          items: orderObj.items
        })
      });
    } catch {
      // ignore
    }
  };

  // ============================================================================
  // LÓGICA DE NAVEGAÇÃO, PRODUTOS, CARRINHO E CHECKOUT
  // ============================================================================
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);

  const featuredProducts = useMemo(
    () => activeProducts.filter((p) => p.featured),
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  const favoriteProducts = useMemo(
    () => activeProducts.filter((p) => favorites.includes(p.id)),
    [activeProducts, favorites]
  );

  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showStoreNotification(exists ? 'Removido dos favoritos' : 'Salvo nos seus Favoritos 🌹');
      return updated;
    });
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariation(product.variations?.[0] || 'Padrão');
    setProductQty(1);
    setActiveGalleryIdx(0);
  };

  const addToCart = (product, qty = 1, variation = null, e = null) => {
    if (e) e.stopPropagation();
    const chosenVar = variation || product.variations?.[0] || 'Padrão';
    setCart((prev) => {
      const key = `${product.id}__${chosenVar}`;
      const existingIndex = prev.findIndex((item) => item.cartKey === key);
      if (existingIndex > -1) {
        const clone = [...prev];
        clone[existingIndex].qty += qty;
        return clone;
      }
      return [
        ...prev,
        {
          cartKey: key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          variation: chosenVar,
          qty
        }
      ];
    });
    showStoreNotification(`"${product.name}" adicionado ao carrinho!`);
  };

  const updateCartQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.cartKey === cartKey ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );
  const shippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (checkoutForm.deliveryMethod === 'pickup') return 0;
    if (cartSubtotal >= storeConfig.freeShippingThreshold) return 0;
    return Number(storeConfig.shippingFlatRate || 14.9);
  }, [cart.length, checkoutForm.deliveryMethod, cartSubtotal, storeConfig]);

  const cartTotal = cartSubtotal + shippingCost;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim()) {
      setCheckoutError('Por favor, preencha seu nome e telefone para continuarmos.');
      return;
    }
    if (
      checkoutForm.deliveryMethod === 'delivery' &&
      (!checkoutForm.address.trim() || !checkoutForm.cep.trim())
    ) {
      setCheckoutError('Informe o endereço e CEP para entrega, ou selecione Retirada.');
      return;
    }

    const newOrder = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: checkoutForm.name.trim(),
      customerPhone: checkoutForm.phone.trim(),
      deliveryMethod: checkoutForm.deliveryMethod,
      address: checkoutForm.deliveryMethod === 'delivery' ? checkoutForm.address.trim() : 'Retirada no Ateliê Mimo Rosas',
      cep: checkoutForm.cep.trim(),
      paymentMethod: checkoutForm.paymentMethod,
      status: 'Pendente',
      total: cartTotal,
      createdAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        price: i.price,
        variation: i.variation
      }))
    };

    // Atualizar estoque dos produtos
    setProducts((prev) =>
      prev.map((prod) => {
        const boughtQty = cart
          .filter((c) => c.id === prod.id)
          .reduce((sum, item) => sum + item.qty, 0);
        if (boughtQty > 0) {
          const updatedProd = { ...prod, stock: Math.max(0, prod.stock - boughtQty) };
          syncSingleProductToSupabase(updatedProd);
          return updatedProd;
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToSupabase(newOrder);
    setCheckoutSuccess(newOrder);
    setCart([]);
    setCheckoutError('');
  };

  // ============================================================================
  // ASSISTENTE VIRTUAL MIMO ROSAS
  // ============================================================================
  const handleAssistantOption = (optionType) => {
    let userLabel = '';
    let botReply = '';
    let recommendedProductId = null;

    switch (optionType) {
      case 'conhecer':
        userLabel = 'Conhecer produtos';
        botReply =
          'Na Mimo Rosas criamos peças e infusões artesanais para tornar seu chimarrão e seus momentos ainda mais encantadores! Nossos campeões são as Infusões Florais e as Cápsulas de Chá em formato de Rosa. Veja este destaque:';
        recommendedProductId = 'prod-1';
        break;
      case 'precos':
        userLabel = 'Consultar preços';
        botReply =
          'Nossas Infusões e Cápsulas começam em R$ 19,90, Enfeites de Cuia a partir de R$ 18,90, Chaveiros personalizados por R$ 26,90 e Cuias Resinadas exclusivas a partir de R$ 119,90! 🌹';
        recommendedProductId = 'prod-2';
        break;
      case 'presentes':
        userLabel = 'Encontrar presentes';
        botReply =
          'Para presentear alguém especial, recomendo combinar uma Cuia Resinada Rosé Gold ou o nosso Chaveiro com Inicial e Pétalas Reais junto com as Cápsulas de Chá – Rosa! Olha que mimo encantador:';
        recommendedProductId = 'prod-4';
        break;
      case 'duvidas':
        userLabel = 'Tirar dúvidas';
        botReply =
          'Como usar as Cápsulas de Chá e Infusões? É super simples! Nas cápsulas, basta colocar 1 rosa na xícara com água quente ou sobre a erva do chimarrão. Todas são 100% comestíveis e artesanais.';
        break;
      case 'pedidos':
        userLabel = 'Ajuda com pedidos';
        botReply = `Você pode adicionar seus produtos favoritos ao carrinho e escolher entre Entrega por Transportadora/Correios (Frete Grátis acima de R$ ${storeConfig.freeShippingThreshold},00) ou Retirada. Se já fez um pedido, consulte na aba "Minha Conta"!`;
        break;
      default:
        return;
    }

    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: userLabel },
      { id: `b-${Date.now() + 1}`, sender: 'bot', text: botReply, recommendedProductId }
    ]);
  };

  const handleCustomChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');

    const lower = text.toLowerCase();
    let reply =
      'Que alegria atender você! 🌹 Você pode tocar diretamente em um produto do catálogo para escolher a variação ou usar os botões rápidos acima para ver sugestões de presentes e preços.';
    let recommendedProductId = null;

    if (lower.includes('cuia') || lower.includes('resina')) {
      reply = 'Nossas Cuias Resinadas são feitas à mão com porongo selecionado e folhas douradas! Veja a queridinha da coleção:';
      recommendedProductId = 'prod-4';
    } else if (lower.includes('rosa') || lower.includes('chá') || lower.includes('cha') || lower.includes('cápsula')) {
      reply = 'As Cápsulas de Chá – Rosa derretem na água quente liberando pétalas perfumadas! Você pode adicionar direto por aqui:';
      recommendedProductId = 'prod-2';
    } else if (lower.includes('chimarrão') || lower.includes('infusão') || lower.includes('tererê')) {
      reply = 'Nosso mix de Infusões para Chimarrão, Drinks e Tererê é o mais vendido da loja! Confira:';
      recommendedProductId = 'prod-1';
    }

    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text },
      { id: `b-${Date.now() + 1}`, sender: 'bot', text: reply, recommendedProductId }
    ]);
  };

  // ============================================================================
  // PROTEÇÃO E GESTÃO DO PAINEL ADMIN
  // ============================================================================
  const handleRequestAdminAccess = () => {
    if (adminAuthenticated) {
      setViewMode('admin');
    } else {
      setAdminPassInput('');
      setAdminPassError('');
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (adminPassInput.trim() === adminPassword) {
      setAdminAuthenticated(true);
      setShowAdminLoginModal(false);
      setViewMode('admin');
      setAdminPassError('');
    } else {
      setAdminPassError('Senha incorreta. (Dica: a senha padrão é mimo2026)');
    }
  };

  const handleSaveProductAdmin = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) return;

    const formattedProduct = {
      ...editingProduct,
      price: Number(editingProduct.price) || 0,
      stock: Number(editingProduct.stock) || 0,
      gallery: [editingProduct.image],
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
    showAdminToast('Produto salvo e atualizado na Vitrine!');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          syncOrderToSupabase(updated);
          return updated;
        }
        return o;
      })
    );
    showAdminToast(`Status do pedido ${orderId} atualizado para "${newStatus}"`);
  };

  const formatBRL = (value) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  return (
    <div className="min-h-screen bg-[#F5E6E2] text-[#4A2532] font-sans selection:bg-[#A90F4D] selection:text-white">
      {/* Importação das Fontes Serifadas e Manuscritas Fiéis à Identidade Mimo Rosas */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-script { font-family: 'Allura', cursive; }
        .font-serif-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BARRA SUPERIOR DISCRETA DE ALTERNÂNCIA VITRINE <-> SISTEMA ADMIN */}
      <div className="bg-[#3B1924] text-[#FFF9F3] px-3 py-1.5 text-[11px] flex items-center justify-between border-b border-[#592838]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium truncate">
            Mimo Rosas • Loja + Sistema Integrado
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('store')}
            className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
              viewMode === 'store'
                ? 'bg-[#A90F4D] text-white shadow-xs'
                : 'text-[#F6E9E5]/80 hover:text-white'
            }`}
          >
            🌹 Vitrine (Loja)
          </button>
          <button
            onClick={handleRequestAdminAccess}
            className={`px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'admin'
                ? 'bg-[#A90F4D] text-white shadow-xs'
                : 'text-[#F6E9E5]/80 hover:text-white'
            }`}
          >
            <Settings className="w-3 h-3" />
            Painel Admin ({orders.length})
          </button>
        </div>
      </div>

      {/* =====================================================================
          VISÃO 1: PAINEL ADMINISTRATIVO (SISTEMA INTEGRADO OPÇÃO 1)
      ===================================================================== */}
      {viewMode === 'admin' ? (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-20 space-y-6">
          {/* Cabeçalho do Sistema Admin */}
          <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RoseLogoSVG className="w-10 h-11" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]">
                  Sistema de Gestão Mimo Rosas
                </span>
                <h1 className="font-serif-display text-2xl font-bold text-[#4A2532] mt-0.5">
                  Painel Administrativo Integrado
                </h1>
                <p className="text-xs text-[#795344]">
                  Gerencie produtos, estoque, pedidos e banco de dados Supabase em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('store')}
                className="px-4 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#8E0B3F]"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver Loja ao Vivo
              </button>
            </div>
          </div>

          {adminToast && (
            <div className="bg-[#2E7D32] text-white px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {adminToast}
              </span>
              <button onClick={() => setAdminToast('')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Abas do Painel Admin */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'products', label: `Produtos & Estoque (${products.length})`, icon: Package },
              { id: 'orders', label: `Pedidos (${orders.length})`, icon: ShoppingCart },
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
                      : 'bg-[#FFF9F3] text-[#795344] border border-[#E5CFC9] hover:border-[#A90F4D]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ABA 1: PRODUTOS & ESTOQUE */}
          {adminTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF9F3] p-4 rounded-3xl border border-[#EAD6D0]">
                <div>
                  <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">
                    Catálogo de Produtos ({products.length})
                  </h2>
                  <p className="text-xs text-[#795344]">
                    Qualquer alteração reflete na hora na Vitrine da Loja e no Supabase.
                  </p>
                </div>
                <button
                  onClick={() =>
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
                      variationsText: 'Padrão, Edição Presente',
                      description: ''
                    })
                  }
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
                        onClick={() =>
                          setEditingProduct({
                            ...p,
                            variationsText: (p.variations || []).join(', ')
                          })
                        }
                        className="p-2 rounded-xl bg-[#F6E9E5] text-[#A90F4D] hover:bg-[#A90F4D] hover:text-white transition-colors"
                        title="Editar produto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...p, featured: !p.featured };
                          setProducts((prev) =>
                            prev.map((item) => (item.id === p.id ? updated : item))
                          );
                          syncSingleProductToSupabase(updated);
                          showAdminToast(
                            updated.featured
                              ? 'Adicionado em Nossos Destaques!'
                              : 'Removido dos Destaques.'
                          );
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          p.featured
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#F6E9E5] text-[#795344]'
                        }`}
                        title="Alternar Destaque na Home"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 2: CENTRAL DE PEDIDOS */}
          {adminTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-[#FFF9F3] p-4 rounded-3xl border border-[#EAD6D0] flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">
                    Pedidos Recebidos ({orders.length})
                  </h2>
                  <p className="text-xs text-[#795344]">
                    Acompanhe os pedidos feitos no Checkout da Loja e avise o cliente pelo WhatsApp.
                  </p>
                </div>
                <button
                  onClick={fetchFromSupabaseSilent}
                  className="px-3.5 py-2 rounded-full bg-[#F6E9E5] text-[#A90F4D] text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              </div>

              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#FFF9F3] rounded-3xl p-4 border border-[#EAD6D0] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EFE0DC]">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#A90F4D]">{ord.id}</span>
                      <span className="text-xs text-[#795344] ml-2">• {ord.createdAt}</span>
                      <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                        {ord.customerName} — {ord.customerPhone}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-3 py-1.5 rounded-full bg-[#F6E9E5] border border-[#D4B2AA] text-xs font-bold text-[#A90F4D]"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Em Produção">Em Produção</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                      <a
                        href={`https://wa.me/55${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${ord.customerName}! 🌹 Aqui é da Mimo Rosas sobre o seu pedido ${ord.id} (${ord.status}).`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        Chamar Cliente
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-[#795344] space-y-1">
                    <p>
                      <strong>Entrega:</strong>{' '}
                      {ord.deliveryMethod === 'pickup'
                        ? 'Retirada no Local'
                        : `${ord.address} (CEP: ${ord.cep})`}
                    </p>
                    <p>
                      <strong>Pagamento:</strong> {ord.paymentMethod.toUpperCase()} •{' '}
                      <strong className="text-[#A90F4D]">Total: {formatBRL(ord.total)}</strong>
                    </p>
                  </div>

                  <div className="bg-[#F6E9E5]/60 rounded-2xl p-3 space-y-1">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>
                          {item.qty}x {item.name} ({item.variation})
                        </span>
                        <span className="font-semibold">{formatBRL(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA 3: CONFIGURAÇÃO DA IA VENDEDORA & FRETE */}
          {adminTab === 'assistant' && (
            <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] space-y-4">
              <h2 className="font-serif-display text-xl font-bold text-[#4A2532]">
                Configurações da Assistente Virtual & Frete
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp Oficial da Loja</label>
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
                    Meta de Frete Grátis (R$)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        freeShippingThreshold: Number(e.target.value)
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="block font-semibold mb-1">
                  Mensagem de Boas-vindas da Assistente Virtual Mimo Rosas
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
                onClick={() => showAdminToast('Configurações da Assistente salvas!')}
                className="px-5 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
              >
                Salvar Configurações
              </button>
            </div>
          )}

          {/* ABA 4: BANCO SUPABASE & PUBLICAÇÃO DIRETO PELO GITHUB + VERCEL */}
          {adminTab === 'supabase' && (
            <div className="space-y-5">
              {/* CARD 1: CONECTOR DIRETO DO SUPABASE */}
              <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#A90F4D] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE0DC]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]">
                      Conector Direto Ativo
                    </span>
                    <h2 className="font-serif-display text-xl font-semibold text-[#4A2532] mt-1">
                      Conexão em Tempo Real com seu Supabase
                    </h2>
                  </div>
                  <button
                    onClick={testSupabaseConnection}
                    disabled={sbStatus.loading}
                    className="px-4 py-2 rounded-full bg-[#A90F4D] text-white text-xs font-semibold flex items-center gap-1.5 self-start"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sbStatus.loading ? 'animate-spin' : ''}`} />
                    Testar Conexão
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#4A2532] mb-1">
                      1. URL do seu Projeto Supabase
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => {
                        setSupabaseUrl(e.target.value);
                        try {
                          localStorage.setItem('mimo_rosas_sb_url', e.target.value);
                        } catch {
                          // ignore
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#4A2532] mb-1">
                      2. Sua Chave Pública (Publishable Key)
                    </label>
                    <input
                      type="text"
                      value={supabaseKey}
                      onChange={(e) => {
                        setSupabaseKey(e.target.value);
                        try {
                          localStorage.setItem('mimo_rosas_sb_key', e.target.value);
                        } catch {
                          // ignore
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 ${
                    sbStatus.connected
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-[#F6E9E5] text-[#4A2532] border border-[#E5CFC9]'
                  }`}
                >
                  <span>{sbStatus.message}</span>
                  <button
                    onClick={seedInitialDataToSupabase}
                    disabled={sbStatus.loading}
                    className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-semibold shrink-0 shadow-xs"
                  >
                    Enviar os 16 Produtos e 8 Categorias para o Supabase
                  </button>
                </div>
              </div>

              {/* CARD 2: PUBLICAR NA VERCEL DIRETO PELO GITHUB WEB */}
              <div className="bg-[#FFF9F3] rounded-3xl p-5 border-2 border-[#A90F4D] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE0DC]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2E7D32] text-white">
                      Passo a Passo Direto pelo Site do GitHub (Sem instalar nada)
                    </span>
                    <h2 className="font-serif-display text-xl font-semibold text-[#4A2532] mt-1">
                      Publicar na Vercel direto pelo navegador
                    </h2>
                    <p className="text-xs text-[#795344]">
                      Crie um repositório em github.com/new, clique nos 4 botões abaixo para copiar cada arquivo e importe na Vercel!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] space-y-3">
                  <p className="text-xs font-bold text-[#4A2532]">
                    📋 Clique em cada botão abaixo para copiar o conteúdo e criar o arquivo no GitHub (Add file &gt; Create new file):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const pkg = JSON.stringify(
                          {
                            name: 'mimo-rosas-loja',
                            private: true,
                            version: '1.0.0',
                            type: 'module',
                            scripts: {
                              dev: 'vite',
                              build: 'vite build',
                              preview: 'vite preview'
                            },
                            dependencies: {
                              react: '^18.3.1',
                              'react-dom': '^18.3.1',
                              'lucide-react': '^0.460.0'
                            },
                            devDependencies: {
                              '@vitejs/plugin-react': '^4.3.1',
                              vite: '^5.4.1'
                            }
                          },
                          null,
                          2
                        );
                        setSelectedFilePreview({ filename: 'package.json', content: pkg });
                        safeCopyText(pkg, 'Arquivo package.json');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all group ${
                        selectedFilePreview.filename === 'package.json'
                          ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                          : 'bg-[#FFF9F3] hover:bg-[#A90F4D] hover:text-white border-[#D4B2AA]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase block ${
                          selectedFilePreview.filename === 'package.json'
                            ? 'text-[#F6E9E5]'
                            : 'text-[#A90F4D] group-hover:text-[#F6E9E5]'
                        }`}
                      >
                        Arquivo 1
                      </span>
                      <span className="font-mono font-bold text-xs block mt-0.5">package.json</span>
                      <span className="text-[10px] opacity-80 block mt-1">Clique para copiar/ver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const html = [
                          '<!doctype html>',
                          '<html lang="pt-BR">',
                          '  <head>',
                          '    <meta charset="UTF-8" />',
                          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
                          '    <title>Mimo Rosas • Presentes, Aromas e Sabores</title>',
                          '    <script src="https://cdn.tailwindcss.com"></script>',
                          '  </head>',
                          '  <body class="bg-[#FFF9F3] m-0 p-0">',
                          '    <div id="root"></div>',
                          '    <script type="module" src="/src/main.jsx"></script>',
                          '  </body>',
                          '</html>'
                        ].join('\n');
                        setSelectedFilePreview({ filename: 'index.html', content: html });
                        safeCopyText(html, 'Arquivo index.html');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all group ${
                        selectedFilePreview.filename === 'index.html'
                          ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                          : 'bg-[#FFF9F3] hover:bg-[#A90F4D] hover:text-white border-[#D4B2AA]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase block ${
                          selectedFilePreview.filename === 'index.html'
                            ? 'text-[#F6E9E5]'
                            : 'text-[#A90F4D] group-hover:text-[#F6E9E5]'
                        }`}
                      >
                        Arquivo 2
                      </span>
                      <span className="font-mono font-bold text-xs block mt-0.5">index.html</span>
                      <span className="text-[10px] opacity-80 block mt-1">Clique para copiar/ver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const viteCfg = [
                          "import { defineConfig } from 'vite'",
                          "import react from '@vitejs/plugin-react'",
                          '',
                          'export default defineConfig({',
                          '  plugins: [react()],',
                          '})'
                        ].join('\n');
                        setSelectedFilePreview({ filename: 'vite.config.js', content: viteCfg });
                        safeCopyText(viteCfg, 'Arquivo vite.config.js');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all group ${
                        selectedFilePreview.filename === 'vite.config.js'
                          ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                          : 'bg-[#FFF9F3] hover:bg-[#A90F4D] hover:text-white border-[#D4B2AA]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase block ${
                          selectedFilePreview.filename === 'vite.config.js'
                            ? 'text-[#F6E9E5]'
                            : 'text-[#A90F4D] group-hover:text-[#F6E9E5]'
                        }`}
                      >
                        Arquivo 3
                      </span>
                      <span className="font-mono font-bold text-xs block mt-0.5">
                        vite.config.js
                      </span>
                      <span className="text-[10px] opacity-80 block mt-1">Clique para copiar/ver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const mainJsx = [
                          "import React from 'react'",
                          "import ReactDOM from 'react-dom/client'",
                          "import App from './App.jsx'",
                          '',
                          "ReactDOM.createRoot(document.getElementById('root')).render(",
                          '  <React.StrictMode>',
                          '    <App />',
                          '  </React.StrictMode>,',
                          ')'
                        ].join('\n');
                        setSelectedFilePreview({ filename: 'src/main.jsx', content: mainJsx });
                        safeCopyText(mainJsx, 'Arquivo src/main.jsx');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all group ${
                        selectedFilePreview.filename === 'src/main.jsx'
                          ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                          : 'bg-[#FFF9F3] hover:bg-[#A90F4D] hover:text-white border-[#D4B2AA]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase block ${
                          selectedFilePreview.filename === 'src/main.jsx'
                            ? 'text-[#F6E9E5]'
                            : 'text-[#A90F4D] group-hover:text-[#F6E9E5]'
                        }`}
                      >
                        Arquivo 4
                      </span>
                      <span className="font-mono font-bold text-xs block mt-0.5">
                        src/main.jsx
                      </span>
                      <span className="text-[10px] opacity-80 block mt-1">Clique para copiar/ver</span>
                    </button>
                  </div>

                  {/* Caixa de Código Visível e Selecionável para Cópia Direta */}
                  <div className="bg-[#2B141D] rounded-2xl p-3.5 text-[#F6E9E5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        📄 Conteúdo de: {selectedFilePreview.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (codePreviewTextareaRef.current) {
                            codePreviewTextareaRef.current.select();
                          }
                          safeCopyText(
                            selectedFilePreview.content,
                            `Arquivo ${selectedFilePreview.filename}`
                          );
                        }}
                        className="px-3 py-1 rounded-lg bg-[#A90F4D] hover:bg-[#C2185B] text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Selecionar e Copiar
                      </button>
                    </div>
                    <textarea
                      ref={codePreviewTextareaRef}
                      readOnly
                      rows={8}
                      value={selectedFilePreview.content}
                      onClick={(e) => e.target.select()}
                      className="w-full bg-[#1D0C13] text-[#F6E9E5] font-mono text-[11px] p-3 rounded-xl border border-[#592838] focus:outline-none"
                    />
                  </div>

                  <p className="text-[11px] text-[#795344]">
                    💡 E o <strong>Arquivo 5</strong> é o <code>src/App.jsx</code>: basta copiar o código completo deste editor (na aba Code ao lado de Preview) e colar nele!
                  </p>
                </div>

                {/* Senha do Painel Admin para quando estiver na Vercel */}
                <div className="p-4 rounded-2xl bg-[#F6E9E5] border border-[#E5CFC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-[#4A2532]">
                      🔒 Senha de Acesso ao Painel Admin (Proteção para o site público):
                    </p>
                    <p className="text-[11px] text-[#795344]">
                      Quando clientes acessarem seu link da Vercel, somente quem tiver esta senha poderá abrir o Painel Admin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        try {
                          localStorage.setItem('mimo_rosas_admin_pwd', e.target.value);
                        } catch {
                          // ignore
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#D4B2AA] font-mono text-xs font-bold text-[#A90F4D] w-36"
                    />
                    <button
                      type="button"
                      onClick={() => showAdminToast('Senha do Admin atualizada!')}
                      className="px-3.5 py-2 rounded-xl bg-[#A90F4D] text-white font-semibold"
                    >
                      Salvar Senha
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 3: SCRIPT SQL DO SUPABASE */}
              <div className="bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                    Script SQL das Tabelas (Supabase SQL Editor)
                  </h3>
                  <button
                    onClick={() => safeCopyText(SUPABASE_SQL_SCRIPT, 'Script SQL do Supabase')}
                    className="px-3.5 py-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar SQL do Supabase
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-[#2B141D] text-[#F6E9E5] text-[11px] font-mono overflow-x-auto max-h-56">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PRODUTO NO ADMIN */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FFF9F3] rounded-3xl max-w-lg w-full p-5 border border-[#EAD6D0] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0DC]">
                  <h3 className="font-serif-display text-xl font-bold text-[#4A2532]">
                    Editar / Criar Produto
                  </h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveProductAdmin} className="space-y-3 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Nome do Produto</label>
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
                      <label className="block font-semibold mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.10"
                        required
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Estoque</label>
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
                            {c.name}
                          </option>
                        ))}
                      </select>
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
                  <div>
                    <label className="block font-semibold mb-1">URL da Foto do Produto</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.image}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, image: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Variações (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.variationsText || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, variationsText: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Descrição Detalhada</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, featured: e.target.checked })
                        }
                      />
                      <span>Exibir em "Nossos Destaques"</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-full bg-[#F6E9E5] text-[#4A2532] font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#A90F4D] text-white font-semibold"
                    >
                      Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===================================================================
           VISÃO 2: VITRINE DA LOJA VIRTUAL MIMO ROSAS (FIEL À IMAGEM ANEXADA)
        =================================================================== */
        <div className="max-w-[480px] mx-auto bg-[#FFF9F3] min-h-screen shadow-2xl relative pb-24 overflow-x-hidden border-x border-[#EAD6D0]/60">
          {/* Notificação Flutuante da Loja */}
          {storeToast && (
            <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#4A2532] text-[#FFF9F3] px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-[#F6E9E5]" />
              <span>{storeToast}</span>
            </div>
          )}

          {/* 1. CABEÇALHO FIEL À REFERÊNCIA (Menu, Logo Mimo Rosas, Pesquisa e Carrinho) */}
          <header className="sticky top-0 z-30 bg-[#FFF9F3]/95 backdrop-blur-md px-4 py-2.5 border-b border-[#F0DFDA] flex items-center justify-between">
            <button
              onClick={() => setSideMenuOpen(true)}
              aria-label="Abrir menu"
              className="p-1.5 text-[#A90F4D] hover:bg-[#F6E9E5] rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 stroke-[2]" />
            </button>

            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 group"
            >
              <RoseLogoSVG className="w-9 h-10 transition-transform group-hover:scale-105" />
              <span className="font-script text-[36px] leading-none text-[#A90F4D] tracking-normal pt-1">
                Mimo Rosas
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Pesquisar produtos"
                className="p-1.5 text-[#A90F4D] hover:bg-[#F6E9E5] rounded-xl transition-colors"
              >
                <Search className="w-5 h-5 stroke-[2.1]" />
              </button>

              <button
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrinho"
                className="relative p-1.5 text-[#A90F4D] hover:bg-[#F6E9E5] rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 stroke-[2.1]" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#A90F4D] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </button>
            </div>
          </header>

          {/* BARRA DE PESQUISA EXPANSÍVEL */}
          {searchOpen && (
            <div className="bg-[#F6E9E5] px-4 py-2.5 border-b border-[#E8D2CC] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#A90F4D] shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'home' && activeTab !== 'categories') {
                    setActiveTab('home');
                  }
                }}
                placeholder="Buscar infusões, cápsulas de rosa, cuias..."
                className="w-full bg-transparent text-xs text-[#4A2532] placeholder-[#795344]/70 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-[#A90F4D] font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>
          )}

          {/* CONTEÚDO PRINCIPAL DE ACORDO COM A ABA SELECIONADA */}
          {activeTab === 'home' && (
            <main>
              {/* 2. BANNER PRINCIPAL FIEL À IMAGEM DE REFERÊNCIA */}
              <section className="relative overflow-hidden bg-gradient-to-br from-[#F4DCE0] via-[#F6E9E5] to-[#E8C5C8] pt-5 pb-12 px-4">
                {/* Fundo fotográfico suave à direita */}
                <div className="grid grid-cols-12 items-center gap-2 relative z-10">
                  <div className="col-span-7 pr-1">
                    <h1 className="font-serif-display italic text-[26px] leading-[1.12] text-[#A90F4D] font-medium">
                      Pequenos detalhes,
                      <br />
                      grandes <span className="font-script text-[36px] not-italic">momentos.</span>
                    </h1>

                    {/* Ornamento de linha com coração idêntico à referência */}
                    <div className="flex items-center gap-1.5 my-2 text-[#A90F4D]">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#A90F4D]/60 to-[#A90F4D]" />
                      <Heart className="w-3.5 h-3.5 fill-none stroke-[#A90F4D] stroke-[2]" />
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#A90F4D]/60 to-[#A90F4D]" />
                    </div>

                    <p className="text-[12.5px] leading-snug text-[#4A2532] font-medium mb-3.5">
                      Presentes, aromas e sabores para tornar a vida mais especial.
                    </p>

                    <button
                      onClick={() => {
                        catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#A90F4D] to-[#C4185C] text-white text-xs font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Conheça nossos produtos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Imagem das Rosas de Chá sobre tábua de madeira fiel à foto */}
                  <div className="col-span-5 relative">
                    <div
                      onClick={() => openProductModal(products[1] || products[0])}
                      className="cursor-pointer relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/70 aspect-square group"
                    >
                      <img
                        src={
                          heroSlide === 0
                            ? 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85'
                            : heroSlide === 1
                            ? 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85'
                            : 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=85'
                        }
                        alt="Cápsulas de Chá Rosa Mimo Rosas"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#A90F4D]/25 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Indicadores do Carrossel do Banner */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        heroSlide === idx ? 'bg-[#A90F4D] scale-110' : 'bg-[#FFF9F3]/80'
                      }`}
                    />
                  ))}
                </div>
              </section>

              {/* 3. FAIXA DE CATEGORIAS COM ROLAGEM HORIZONTAL E SETA LATERAL */}
              <section className="relative -mt-7 z-20 px-3">
                <div className="relative flex items-center">
                  <div
                    ref={categoryScrollRef}
                    className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-1 pr-8"
                  >
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setSelectedCategory((prev) => (prev === cat.id ? 'all' : cat.id))
                          }
                          className={`w-[88px] shrink-0 rounded-2xl p-2.5 flex flex-col items-center justify-start text-center border transition-all shadow-xs ${
                            isSelected
                              ? 'bg-[#FFF9F3] border-[#A90F4D] ring-2 ring-[#A90F4D]/25 -translate-y-0.5'
                              : 'bg-[#F6E9E5]/95 border-[#EAD6D0] hover:bg-[#FFF9F3]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                            <CategoryIllustration type={cat.icon} />
                          </div>
                          <span className="text-[10.5px] leading-[1.18] font-medium text-[#4A2532] line-clamp-3">
                            {cat.shortName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Botão redondo de seta à direita idêntico à referência */}
                  <button
                    onClick={() => {
                      if (categoryScrollRef.current) {
                        categoryScrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
                      }
                    }}
                    aria-label="Rolar categorias"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF9F3] text-[#A90F4D] shadow-md border border-[#EAD6D0] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </section>

              {/* 4. SEÇÃO "NOSSOS DESTAQUES" FIEL À REFERÊNCIA */}
              <section ref={catalogSectionRef} className="px-3.5 pt-5 pb-3">
                <div className="flex items-center justify-center gap-3 mb-3.5">
                  <div className="h-[1px] flex-1 bg-[#D9B8B0]" />
                  <h2 className="text-center flex items-baseline gap-1.5">
                    <span className="font-serif-display text-[22px] font-semibold text-[#4A2532]">
                      {selectedCategory === 'all' && !searchQuery
                        ? 'Nossos'
                        : 'Catálogo'}
                    </span>
                    <span className="font-script text-[36px] text-[#A90F4D] leading-none">
                      {selectedCategory === 'all' && !searchQuery
                        ? 'Destaques'
                        : 'Mimo Rosas'}
                    </span>
                  </h2>
                  <div className="h-[1px] flex-1 bg-[#D9B8B0]" />
                </div>

                {/* Filtro ativo caso o cliente tenha clicado em uma categoria */}
                {(selectedCategory !== 'all' || searchQuery) && (
                  <div className="flex items-center justify-between bg-[#F6E9E5] px-3 py-1.5 rounded-full mb-3 text-xs">
                    <span className="text-[#795344] truncate">
                      Filtro:{' '}
                      <strong className="text-[#A90F4D]">
                        {selectedCategory !== 'all'
                          ? categories.find((c) => c.id === selectedCategory)?.name
                          : `"${searchQuery}"`}
                      </strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="text-[#A90F4D] font-bold ml-2 shrink-0"
                    >
                      Ver todos
                    </button>
                  </div>
                )}

                {/* GRID EM DUAS COLUNAS FIEL À IMAGEM */}
                <div className="grid grid-cols-2 gap-3">
                  {(selectedCategory === 'all' && !searchQuery
                    ? featuredProducts
                    : filteredProducts
                  ).map((product) => {
                    const isFav = favorites.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => openProductModal(product)}
                        className="bg-[#F6E9E5]/85 rounded-2xl overflow-hidden border border-[#EAD6D0] shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer group"
                      >
                        <div className="relative aspect-[1.08/1] overflow-hidden bg-[#EAD6D0]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Selo superior esquerdo ("Mais Vendido" ou "Novo") */}
                          {product.badge && (
                            <div className="absolute top-2 left-2 bg-[#FFF9F3]/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold text-[#4A2532] flex items-center gap-1 shadow-xs">
                              {product.badgeType === 'star' ? (
                                <Star className="w-3 h-3 text-[#A90F4D]" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-[#A90F4D]" />
                              )}
                              <span>{product.badge}</span>
                            </div>
                          )}

                          {/* Botão de Favoritar no Card */}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            aria-label="Favoritar"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FFF9F3]/90 text-[#A90F4D] flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFav ? 'fill-[#A90F4D]' : 'fill-none'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between text-center">
                          <div>
                            <h3 className="text-[12.5px] leading-snug font-medium text-[#4A2532] line-clamp-2 min-h-[34px]">
                              {product.name}
                            </h3>
                            <p className="text-[16px] font-bold text-[#A90F4D] mt-1 mb-2">
                              {formatBRL(product.price)}
                            </p>
                          </div>

                          <button
                            onClick={(e) => addToCart(product, 1, null, e)}
                            className="w-full py-2 px-2 rounded-full bg-gradient-to-r from-[#A90F4D] to-[#B81456] hover:from-[#8E0B3F] hover:to-[#A90F4D] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Adicionar ao carrinho</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5. BANNER INSTITUCIONAL "ARTESANAL, COM MUITO AMOR" FIEL À REFERÊNCIA */}
              <section className="px-3.5 py-2">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#990B43] via-[#A90F4D] to-[#C82564] text-[#FFF9F3] p-4 shadow-md border border-[#D46A92]/30">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="shrink-0">
                      <RoseLogoSVG className="w-14 h-16" strokeColor="#FFF9F3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif-display text-[17px] leading-tight font-medium">
                          Artesanal,{' '}
                          <span className="italic font-normal">com muito</span>{' '}
                          <span className="font-script text-[25px] leading-none">amor</span>
                        </h3>
                        <Heart className="w-4 h-4 text-[#F6E9E5] shrink-0" />
                      </div>
                      <div className="h-[1px] w-36 bg-[#F6E9E5]/40 my-1" />
                      <p className="text-[11px] text-[#F6E9E5]/95 leading-snug">
                        Cuidados em cada detalhe para encantar em cada escolha.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex justify-end relative z-10">
                    <button
                      onClick={() => setAboutModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D] text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs hover:bg-white transition-colors"
                    >
                      <span>Sobre a Mimo Rosas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </section>

              {/* CATÁLOGO COMPLETO DE TODAS AS 8 CATEGORIAS LOGO ABAIXO */}
              <section className="px-3.5 pt-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                    Explore Todo o Nosso Catálogo ({filteredProducts.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-semibold text-[#A90F4D] flex items-center gap-0.5"
                  >
                    <span>Ver categorias</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((product) => {
                    const isFav = favorites.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => openProductModal(product)}
                        className="bg-[#F6E9E5]/85 rounded-2xl overflow-hidden border border-[#EAD6D0] shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer group"
                      >
                        <div className="relative aspect-[1.08/1] overflow-hidden bg-[#EAD6D0]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.badge && (
                            <div className="absolute top-2 left-2 bg-[#FFF9F3]/95 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#4A2532] flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5 text-[#A90F4D]" />
                              <span>{product.badge}</span>
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FFF9F3]/90 text-[#A90F4D] flex items-center justify-center shadow-xs"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFav ? 'fill-[#A90F4D]' : 'fill-none'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between text-center">
                          <div>
                            <h4 className="text-[12px] leading-snug font-medium text-[#4A2532] line-clamp-2 min-h-[32px]">
                              {product.name}
                            </h4>
                            <p className="text-[15px] font-bold text-[#A90F4D] mt-1 mb-2">
                              {formatBRL(product.price)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => addToCart(product, 1, null, e)}
                            className="w-full py-2 px-2 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Adicionar ao carrinho</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </main>
          )}

          {/* ABA CATEGORIAS */}
          {activeTab === 'categories' && (
            <div className="p-4 space-y-4">
              <div className="text-center">
                <h2 className="font-serif-display text-2xl font-bold text-[#4A2532]">
                  Nossas Categorias Artesanais
                </h2>
                <p className="text-xs text-[#795344]">
                  Toque em uma categoria para filtrar os produtos da Mimo Rosas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const count = activeProducts.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveTab('home');
                      }}
                      className="bg-[#F6E9E5] hover:bg-[#FFF9F3] border border-[#EAD6D0] hover:border-[#A90F4D] rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all shadow-xs"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF9F3] flex items-center justify-center shadow-xs">
                        <CategoryIllustration type={cat.icon} />
                      </div>
                      <span className="font-serif-display font-bold text-sm text-[#4A2532] leading-snug">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-semibold text-[#A90F4D] bg-[#FFF9F3] px-2.5 py-0.5 rounded-full">
                        {count} produtos
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA FAVORITOS */}
          {activeTab === 'favorites' && (
            <div className="p-4 space-y-4">
              <div className="text-center">
                <h2 className="font-serif-display text-2xl font-bold text-[#4A2532]">
                  Meus Favoritos 🌹
                </h2>
                <p className="text-xs text-[#795344]">
                  Seus mimos preferidos salvos para comprar quando quiser
                </p>
              </div>

              {favoriteProducts.length === 0 ? (
                <div className="bg-[#F6E9E5]/60 rounded-3xl p-8 text-center space-y-3 border border-[#EAD6D0]">
                  <Heart className="w-10 h-10 text-[#A90F4D] mx-auto stroke-[1.5]" />
                  <p className="text-sm font-medium text-[#4A2532]">
                    Sua lista de favoritos ainda está vazia.
                  </p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-5 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                  >
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {favoriteProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openProductModal(product)}
                      className="bg-[#F6E9E5] rounded-2xl overflow-hidden border border-[#EAD6D0] flex flex-col cursor-pointer"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FFF9F3] text-[#A90F4D] flex items-center justify-center"
                        >
                          <Heart className="w-3.5 h-3.5 fill-[#A90F4D]" />
                        </button>
                      </div>
                      <div className="p-2.5 text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-xs font-medium text-[#4A2532] line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold text-[#A90F4D] my-1">
                          {formatBRL(product.price)}
                        </p>
                        <button
                          onClick={(e) => addToCart(product, 1, null, e)}
                          className="w-full py-1.5 rounded-full bg-[#A90F4D] text-white text-[11px] font-semibold"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA MINHA CONTA & MEUS PEDIDOS */}
          {activeTab === 'account' && (
            <div className="p-4 space-y-4">
              <div className="bg-[#F6E9E5] rounded-3xl p-4 border border-[#EAD6D0] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9F3] flex items-center justify-center text-[#A90F4D]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A90F4D] bg-[#FFF9F3] px-2 py-0.5 rounded-full">
                      Cliente & Admin
                    </span>
                    <h2 className="font-serif-display text-lg text-[#4A2532] font-semibold mt-0.5">
                      Minha Conta Mimo Rosas
                    </h2>
                    <p className="text-xs text-[#795344]">
                      Pedidos sincronizados em tempo real
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRequestAdminAccess}
                  className="px-3.5 py-2 rounded-full bg-[#A90F4D] text-white text-xs font-semibold shadow-xs shrink-0"
                >
                  Abrir Painel Admin
                </button>
              </div>

              <div className="space-y-2.5">
                <h3 className="font-serif-display text-lg font-bold text-[#4A2532]">
                  Histórico de Pedidos ({orders.length})
                </h3>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#FFF9F3] rounded-2xl p-3.5 border border-[#EAD6D0] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#A90F4D]">
                        {ord.id}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#4A2532]">
                      Cliente: {ord.customerName} • Total:{' '}
                      <strong className="text-[#A90F4D]">{formatBRL(ord.total)}</strong>
                    </p>
                    <p className="text-[11px] text-[#795344]">
                      {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. BOTÃO FLUTUANTE "VAMOS CONVERSAR?" FIEL À REFERÊNCIA */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="fixed bottom-[70px] right-3 sm:right-[calc(50%-228px)] z-30 bg-[#FFF9F3] hover:bg-white text-[#2B2B2B] pl-2 pr-3.5 py-1.5 rounded-full shadow-lg border border-[#E5CFC9] flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <WhatsAppIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-tight">Vamos conversar?</span>
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          </button>

          {/* 7. MENU INFERIOR FIXO COM 5 ABAS FIEL À IMAGEM DE REFERÊNCIA */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 bg-[#F6E9E5]/95 backdrop-blur-md border-t border-[#E6CFC8] grid grid-cols-5 py-1.5 px-1">
            {[
              { id: 'home', label: 'Início', icon: Home },
              { id: 'categories', label: 'Categorias', icon: LayoutGrid },
              { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favorites.length },
              { id: 'account', label: 'Minha Conta', icon: User },
              { id: 'support', label: 'Atendimento', icon: 'whatsapp' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'support') {
                      setAssistantOpen(true);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                    isActive ? 'text-[#A90F4D] font-bold' : 'text-[#795344] hover:text-[#A90F4D]'
                  }`}
                >
                  {item.icon === 'whatsapp' ? (
                    <WhatsAppIcon className="w-5 h-5" />
                  ) : (
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive && item.id === 'home' ? 'fill-[#A90F4D]' : ''
                      }`}
                    />
                  )}
                  <span className="text-[10.5px] mt-0.5">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 w-10 h-[3px] rounded-full bg-[#A90F4D]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* =================================================================
              MODAIS INTERATIVOS: MENU LATERAL, PÁGINA DE PRODUTO, CARRINHO, CHECKOUT E ASSISTENTE
          ================================================================= */}

          {/* MENU LATERAL QUE ABRE E FECHA */}
          {sideMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                onClick={() => setSideMenuOpen(false)}
                className="fixed inset-0 bg-[#3B1924]/60 backdrop-blur-xs"
              />
              <div className="relative w-76 max-w-[82vw] bg-[#FFF9F3] h-full z-10 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFE0DC]">
                    <div className="flex items-center gap-2">
                      <RoseLogoSVG className="w-8 h-9" />
                      <span className="font-script text-3xl text-[#A90F4D]">Mimo Rosas</span>
                    </div>
                    <button
                      onClick={() => setSideMenuOpen(false)}
                      className="p-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#795344] mb-2">
                      Gestão & Loja
                    </p>
                    <button
                      onClick={() => {
                        setSideMenuOpen(false);
                        handleRequestAdminAccess();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#A90F4D] hover:bg-[#8E0B3F]"
                    >
                      <span>⚙️ Acessar Painel Admin (Sistema)</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#795344] mb-2">
                      Categorias Mimo Rosas
                    </p>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setActiveTab('home');
                            setSideMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A2532] hover:bg-[#F6E9E5]"
                        >
                          <span className="text-left">{cat.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#A90F4D] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFE0DC] text-center">
                  <p className="text-[11px] text-[#795344]">
                    Mimo Rosas • Artesanal com muito amor 🌹
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PÁGINA INDIVIDUAL DO PRODUTO (MODAL DETALHADO) */}
          {selectedProduct && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/70 backdrop-blur-xs flex items-end sm:items-center justify-center">
              <div className="bg-[#FFF9F3] w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EAD6D0]">
                <div className="relative aspect-square bg-[#F6E9E5]">
                  <img
                    src={
                      selectedProduct.gallery?.[activeGalleryIdx] || selectedProduct.image
                    }
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FFF9F3]/90 text-[#4A2532] flex items-center justify-center shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {selectedProduct.badge && (
                    <span className="absolute top-3 left-3 bg-[#FFF9F3]/95 px-3 py-1 rounded-full text-xs font-semibold text-[#A90F4D] shadow-xs">
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif-display text-2xl font-bold text-[#4A2532] leading-tight">
                      {selectedProduct.name}
                    </h2>
                    <button
                      onClick={(e) => toggleFavorite(selectedProduct.id, e)}
                      className="p-2 rounded-full bg-[#F6E9E5] text-[#A90F4D] shrink-0"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(selectedProduct.id) ? 'fill-[#A90F4D]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-[#A90F4D]">
                      {formatBRL(selectedProduct.price)}
                    </span>
                    <span className="text-xs text-[#795344]">
                      Em estoque ({selectedProduct.stock} disponíveis)
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-[#795344]">
                    {selectedProduct.description}
                  </p>

                  {/* Seleção de Variações */}
                  {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#4A2532]">
                        Escolha sua opção / aroma:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.variations.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSelectedVariation(v)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedVariation === v
                                ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                                : 'bg-[#F6E9E5] text-[#4A2532] border-[#E5CFC9]'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantidade + Botão Adicionar ao Carrinho */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center bg-[#F6E9E5] rounded-full border border-[#E5CFC9] px-2 py-1">
                      <button
                        type="button"
                        onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                        className="p-1.5 text-[#A90F4D]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-bold">{productQty}</span>
                      <button
                        type="button"
                        onClick={() => setProductQty((q) => q + 1)}
                        className="p-1.5 text-[#A90F4D]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProduct, productQty, selectedVariation);
                        setSelectedProduct(null);
                        setCartOpen(true);
                      }}
                      className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#A90F4D] to-[#C2185B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
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
          )}

          {/* DRAWER DO CARRINHO DE COMPRAS */}
          {cartOpen && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/70 backdrop-blur-xs flex justify-end">
              <div className="bg-[#FFF9F3] w-full max-w-[430px] h-full flex flex-col justify-between p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0DC]">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#A90F4D]" />
                    <h3 className="font-serif-display text-xl font-bold text-[#4A2532]">
                      Seu Carrinho ({cartCount})
                    </h3>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#F6E9E5] flex items-center justify-center text-[#A90F4D]">
                      <ShoppingCart className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif-display text-xl font-bold text-[#4A2532]">
                      Seu carrinho está vazio
                    </h4>
                    <p className="text-xs text-[#795344]">
                      Adicione infusões, cápsulas de chá de rosa ou cuias artesanais para começar!
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                    >
                      Escolher Produtos
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.cartKey}
                          className="bg-[#F6E9E5]/70 rounded-2xl p-3 border border-[#EAD6D0] flex gap-3 items-center"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#4A2532] truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-[#795344]">{item.variation}</p>
                            <p className="text-xs font-bold text-[#A90F4D] mt-0.5">
                              {formatBRL(item.price * item.qty)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => removeFromCart(item.cartKey)}
                              className="text-[#795344] hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center bg-[#FFF9F3] rounded-full border border-[#E5CFC9] px-1.5 py-0.5">
                              <button
                                onClick={() => updateCartQty(item.cartKey, -1)}
                                className="p-1 text-[#A90F4D]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.cartKey, 1)}
                                className="p-1 text-[#A90F4D]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#EFE0DC] space-y-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[#795344]">
                          <span>Subtotal</span>
                          <span>{formatBRL(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#795344]">
                          <span>Entrega estimada</span>
                          <span>
                            {shippingCost === 0 ? 'Grátis 🌹' : formatBRL(shippingCost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-[#4A2532] pt-1">
                          <span>Total</span>
                          <span className="text-[#A90F4D]">{formatBRL(cartTotal)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCartOpen(false);
                          setCheckoutSuccess(null);
                          setCheckoutOpen(true);
                        }}
                        className="w-full py-3 rounded-full bg-gradient-to-r from-[#A90F4D] to-[#C2185B] text-white text-xs font-bold shadow-md"
                      >
                        Finalizar Pedido (Checkout) →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MODAL DE CHECKOUT DEMONSTRATIVO */}
          {checkoutOpen && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FFF9F3] w-full max-w-[460px] rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EAD6D0]">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0DC]">
                  <h3 className="font-serif-display text-xl font-bold text-[#4A2532]">
                    {checkoutSuccess ? 'Pedido Confirmado! 🌹' : 'Finalizar Compra • Mimo Rosas'}
                  </h3>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="p-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {checkoutSuccess ? (
                  <div className="py-5 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#A90F4D] bg-[#F6E9E5] px-3 py-1 rounded-full">
                        Pedido {checkoutSuccess.id}
                      </span>
                      <h4 className="font-serif-display text-2xl font-bold text-[#4A2532] mt-2">
                        Muito obrigada, {checkoutSuccess.customerName}!
                      </h4>
                      <p className="text-xs text-[#795344] mt-1">
                        Seu pedido demonstrativo foi registrado com sucesso e já aparece no Painel Admin e no banco do Supabase.
                      </p>
                    </div>

                    <div className="bg-[#F6E9E5] rounded-2xl p-3.5 text-left text-xs space-y-1">
                      <p>
                        <strong>Total:</strong> {formatBRL(checkoutSuccess.total)} (
                        {checkoutSuccess.paymentMethod.toUpperCase()})
                      </p>
                      <p>
                        <strong>Modalidade:</strong>{' '}
                        {checkoutSuccess.deliveryMethod === 'pickup'
                          ? 'Retirada no Ateliê'
                          : checkoutSuccess.address}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => {
                          setCheckoutOpen(false);
                          setAdminTab('orders');
                          handleRequestAdminAccess();
                        }}
                        className="w-full py-3 rounded-full bg-[#A90F4D] text-white text-xs font-semibold shadow-sm"
                      >
                        Ver este Pedido no Painel Admin →
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutOpen(false);
                          setActiveTab('home');
                        }}
                        className="w-full py-2.5 rounded-full bg-[#F6E9E5] text-[#4A2532] text-xs font-semibold"
                      >
                        Voltar para a Loja
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 mt-3 text-xs">
                    {checkoutError && (
                      <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 font-medium">
                        {checkoutError}
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold mb-1">Nome completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ana Clara"
                        value={checkoutForm.name}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        placeholder="(54) 99999-9999"
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                      />
                    </div>

                    {/* Escolha Entrega ou Retirada */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCheckoutForm({ ...checkoutForm, deliveryMethod: 'delivery' })
                        }
                        className={`p-3 rounded-2xl border flex items-center gap-2 font-semibold ${
                          checkoutForm.deliveryMethod === 'delivery'
                            ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                            : 'bg-[#F6E9E5] text-[#4A2532] border-[#E5CFC9]'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Entrega</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCheckoutForm({ ...checkoutForm, deliveryMethod: 'pickup' })
                        }
                        className={`p-3 rounded-2xl border flex items-center gap-2 font-semibold ${
                          checkoutForm.deliveryMethod === 'pickup'
                            ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                            : 'bg-[#F6E9E5] text-[#4A2532] border-[#E5CFC9]'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        <span>Retirada (Grátis)</span>
                      </button>
                    </div>

                    {checkoutForm.deliveryMethod === 'delivery' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block font-semibold mb-1">CEP</label>
                          <input
                            type="text"
                            placeholder="00000-000"
                            value={checkoutForm.cep}
                            onChange={(e) =>
                              setCheckoutForm({ ...checkoutForm, cep: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-semibold mb-1">Endereço completo</label>
                          <input
                            type="text"
                            placeholder="Rua, número, bairro e cidade"
                            value={checkoutForm.address}
                            onChange={(e) =>
                              setCheckoutForm({ ...checkoutForm, address: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Forma de Pagamento Ilustrativa */}
                    <div>
                      <label className="block font-semibold mb-1.5">
                        Forma de Pagamento (Demonstração)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutForm({ ...checkoutForm, paymentMethod: 'pix' })
                          }
                          className={`p-3 rounded-2xl border flex items-center gap-2 font-semibold ${
                            checkoutForm.paymentMethod === 'pix'
                              ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                              : 'bg-[#F6E9E5] text-[#4A2532] border-[#E5CFC9]'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>PIX Instantâneo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutForm({ ...checkoutForm, paymentMethod: 'card' })
                          }
                          className={`p-3 rounded-2xl border flex items-center gap-2 font-semibold ${
                            checkoutForm.paymentMethod === 'card'
                              ? 'bg-[#A90F4D] text-white border-[#A90F4D]'
                              : 'bg-[#F6E9E5] text-[#4A2532] border-[#E5CFC9]'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Cartão de Crédito</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#F6E9E5] rounded-2xl p-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Itens ({cartCount})</span>
                        <span>{formatBRL(cartSubtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span>{shippingCost === 0 ? 'Grátis' : formatBRL(shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#A90F4D] pt-1 border-t border-[#E5CFC9]">
                        <span>Total do Pedido</span>
                        <span>{formatBRL(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#A90F4D] to-[#C2185B] text-white font-bold shadow-md"
                    >
                      Confirmar Pedido Demonstrativo
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* JANELA DA ASSISTENTE VIRTUAL MIMO ROSAS */}
          {assistantOpen && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-[#FFF9F3] w-full max-w-[430px] h-[84vh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl flex flex-col justify-between overflow-hidden shadow-2xl border border-[#EAD6D0]">
                {/* Topo da Assistente */}
                <div className="bg-gradient-to-r from-[#A90F4D] to-[#C2185B] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#FFF9F3] flex items-center justify-center">
                      <RoseLogoSVG className="w-7 h-8" />
                    </div>
                    <div>
                      <h3 className="font-serif-display text-lg font-bold leading-none">
                        Assistente Mimo Rosas 🌹
                      </h3>
                      <span className="text-[11px] text-[#F6E9E5] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                        Online agora • Atendimento demonstrativo
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssistantOpen(false)}
                    className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFF9F3]">
                  {chatMessages.map((msg) => {
                    const recProd = msg.recommendedProductId
                      ? products.find((p) => p.id === msg.recommendedProductId)
                      : null;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#A90F4D] text-white rounded-br-xs'
                              : 'bg-[#F6E9E5] text-[#4A2532] border border-[#EAD6D0] rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {recProd && (
                          <div
                            onClick={() => {
                              setAssistantOpen(false);
                              openProductModal(recProd);
                            }}
                            className="mt-2 w-64 bg-white rounded-2xl p-2.5 border border-[#EAD6D0] shadow-xs flex items-center gap-2.5 cursor-pointer hover:border-[#A90F4D]"
                          >
                            <img
                              src={recProd.image}
                              alt={recProd.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-[#4A2532] truncate">
                                {recProd.name}
                              </p>
                              <p className="text-xs font-bold text-[#A90F4D]">
                                {formatBRL(recProd.price)}
                              </p>
                              <span className="text-[10px] text-[#795344] underline">
                                Ver detalhes →
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 5 Botões Interativos Obrigatórios */}
                  <div className="pt-1">
                    <p className="text-[10.5px] font-semibold text-[#795344] mb-1.5">
                      Toque em uma opção rápida:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'conhecer', label: '🌹 Conhecer produtos' },
                        { id: 'precos', label: '💰 Consultar preços' },
                        { id: 'presentes', label: '🎁 Encontrar presentes' },
                        { id: 'duvidas', label: '✨ Tirar dúvidas' },
                        { id: 'pedidos', label: '📦 Ajuda com pedidos' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleAssistantOption(opt.id)}
                          className="px-3 py-1.5 rounded-full bg-[#F6E9E5] hover:bg-[#A90F4D] hover:text-white text-[#A90F4D] border border-[#E5CFC9] text-[11px] font-semibold transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div ref={chatEndRef} />
                </div>

                {/* Campo de digitação */}
                <form
                  onSubmit={handleCustomChatSubmit}
                  className="p-3 bg-[#F6E9E5] border-t border-[#EAD6D0] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escreva sua mensagem para a Mimo Rosas..."
                    className="flex-1 px-3.5 py-2 rounded-full bg-[#FFF9F3] border border-[#E5CFC9] text-xs focus:outline-none focus:border-[#A90F4D]"
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
          {aboutModalOpen && (
            <div className="fixed inset-0 z-50 bg-[#3B1924]/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FFF9F3] max-w-sm w-full rounded-3xl p-6 text-center border border-[#EAD6D0] shadow-2xl space-y-3">
                <RoseLogoSVG className="w-12 h-14 mx-auto" />
                <h3 className="font-script text-4xl text-[#A90F4D]">Mimo Rosas</h3>
                <p className="text-xs text-[#795344] leading-relaxed">
                  Nascemos da paixão por transformar rituais diários — como o chimarrão, o chá da tarde e o café — em momentos poéticos, perfumados e cheios de afeto. Cada cápsula de rosa, blend e cuia resinada é produzido artesanalmente.
                </p>
                <button
                  onClick={() => setAboutModalOpen(false)}
                  className="mt-4 w-full py-2.5 rounded-full bg-[#A90F4D] text-white text-xs font-semibold"
                >
                  Voltar para a Loja
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL DE SENHA DO PAINEL ADMIN (Para segurança quando publicado na Vercel)
      ===================================================================== */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B1924]/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-[380px] bg-[#FFF9F3] rounded-3xl p-5 border border-[#EAD6D0] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE0DC]">
              <div className="flex items-center gap-2">
                <RoseLogoSVG className="w-8 h-9" />
                <div>
                  <h3 className="font-serif-display text-base font-bold text-[#4A2532]">
                    Acesso Restrito • Admin
                  </h3>
                  <p className="text-[11px] text-[#795344]">Gestão da Loja Mimo Rosas</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="p-1.5 rounded-full bg-[#F6E9E5] text-[#A90F4D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4A2532] mb-1">
                  Digite a senha do Painel Admin:
                </label>
                <input
                  type="password"
                  autoFocus
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder="Senha padrão: mimo2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] focus:outline-none focus:border-[#A90F4D]"
                />
                {adminPassError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{adminPassError}</p>
                )}
                <p className="text-[10.5px] text-[#795344] mt-1.5">
                  💡 Senha inicial padrão: <strong>mimo2026</strong> (você pode alterá-la dentro do painel).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="px-4 py-2 rounded-full bg-[#F6E9E5] text-[#4A2532] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#A90F4D] text-white font-semibold shadow-sm"
                >
                  Entrar no Painel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
