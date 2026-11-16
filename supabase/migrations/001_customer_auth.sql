-- ============================================================================
-- Mimo Rosas • Contas de cliente, favoritos e pedidos por conta
-- Rodar UMA vez no Supabase: Dashboard > SQL Editor > New query > Run
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PROFILES  (dados públicos do cliente + flag de administrador)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Função usada pelas políticas. SECURITY DEFINER evita recursão de RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Políticas: cada um vê/edita o próprio perfil; admin vê todos
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trava a coluna is_admin: o cliente só pode alterar nome e telefone
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2) FAVORITES  (lista de desejos por conta)
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.favorites enable row level security;

drop policy if exists favorites_select on public.favorites;
create policy favorites_select on public.favorites
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists favorites_insert on public.favorites;
create policy favorites_insert on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists favorites_delete on public.favorites;
create policy favorites_delete on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) ORDERS  (pedido passa a pertencer a uma conta)
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_email_lower_idx on public.orders (lower(email));

alter table public.orders enable row level security;

-- Remove políticas antigas (inclusive as abertas que permitiam ler tudo)
do $$
declare
  v_policies text[] := array(
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'orders'
  );
  v_name text;
begin
  foreach v_name in array v_policies loop
    execute format('drop policy if exists %I on public.orders', v_name);
  end loop;
end $$;

-- Cliente vê os pedidos dele (por user_id ou pelo e-mail confirmado do login).
-- Admin vê todos.
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select to authenticated
  using (
    user_id = auth.uid()
    or (coalesce(email, '') <> '' and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    or public.is_admin()
  );

-- Checkout de visitante continua funcionando (sem login, user_id nulo)
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders
  for delete to authenticated
  using (
    public.is_admin()
    or (
      (user_id = auth.uid() or (coalesce(email, '') <> '' and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
      and status in ('Aguardando PIX', 'Aguardando Pagamento')
    )
  );

-- ---------------------------------------------------------------------------
-- 3.1) FUNÇÕES PÚBLICAS DE ACOMPANHAMENTO
-- Sem elas, o cliente/visitante não conseguiria ler o status do próprio pedido
-- com o RLS fechado. Nenhuma delas devolve dados pessoais.
-- ---------------------------------------------------------------------------

-- Consulta apenas o status de um pedido (usado na tela de PIX/Mercado Pago)
create or replace function public.order_status(p_order_id text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select status from public.orders where id = p_order_id;
$$;

-- Permite que o dono do pedido (conta logada) marque o próprio pedido como pago.
-- Visitantes não podem: nesse caso a loja confirma o pagamento pelo painel.
create or replace function public.claim_order_paid(p_order_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_count bigint := 0;
begin
  update public.orders
     set status = 'Pago'
   where id = p_order_id
     and status is distinct from 'Pago'
     and (
       (v_uid is not null and user_id = v_uid)
       or (v_email <> '' and lower(coalesce(email, '')) = v_email)
     );
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

-- Verifica se um e-mail já está cadastrado em auth.users (impede cadastro duplicado)
create or replace function public.email_already_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
      from auth.users
     where lower(email) = lower(trim(coalesce(p_email, '')))
  );
$$;

-- Remove automaticamente pedidos não pagos ("Aguardando PIX" / "Aguardando Pagamento") com mais de 30 minutos
create or replace function public.cleanup_expired_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer := 0;
begin
  delete from public.orders
   where status in ('Aguardando PIX', 'Aguardando Pagamento')
     and created_at < (now() - interval '30 minutes');
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Permite ao cliente cancelar imediatamente um pedido seu que ainda esteja aguardando pagamento
create or replace function public.cancel_my_pending_order(p_order_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_deleted integer := 0;
begin
  delete from public.orders
   where id = p_order_id
     and status in ('Aguardando PIX', 'Aguardando Pagamento')
     and (
       (v_uid is not null and user_id = v_uid)
       or (v_email <> '' and lower(coalesce(email, '')) = v_email)
     );
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

-- Permite que um administrador promova (ou remova) outra conta pelo e-mail direto pelo painel /admin
create or replace function public.set_admin_by_email(p_email text, p_is_admin boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_target_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem alterar permissões.';
  end if;

  select id into v_target_id
    from auth.users
   where lower(email) = lower(trim(coalesce(p_email, '')))
   limit 1;

  if v_target_id is null then
    return false;
  end if;

  insert into public.profiles (id, is_admin)
  values (v_target_id, coalesce(p_is_admin, true))
  on conflict (id) do update
     set is_admin = excluded.is_admin;

  return true;
end;
$$;

grant execute on function public.set_admin_by_email(text, boolean) to authenticated;
grant execute on function public.cleanup_expired_orders() to anon, authenticated;
grant execute on function public.cancel_my_pending_order(text) to authenticated;
grant execute on function public.email_already_registered(text) to anon, authenticated;
grant execute on function public.order_status(text) to anon, authenticated;
grant execute on function public.claim_order_paid(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) CATÁLOGO  (leitura pública, escrita só do admin)
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.categories enable row level security;

drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select to anon, authenticated using (true);

drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories
  for select to anon, authenticated using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5) PROMOVER A CONTA DE ADMINISTRADORA
-- Passo 1: crie sua conta pelo site (/admin > "Criar conta")
-- Passo 2: rode o comando abaixo trocando o e-mail
-- ---------------------------------------------------------------------------
-- update public.profiles
--   set is_admin = true
--   where id = (select id from auth.users where email = 'seu@email.com');

-- Conferir quem é admin:
-- select u.email, p.full_name, p.is_admin from public.profiles p join auth.users u on u.id = p.id;
