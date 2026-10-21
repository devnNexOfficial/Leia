-- ============================================================================
-- LEIA Pakistan Cosmetics - Migration: 20261021_admin_product_wholesale_prices.sql
-- Description: Isolated admin-only wholesale price storage with strict RLS
-- ============================================================================

-- 1. Create table public.product_wholesale_prices
create table if not exists public.product_wholesale_prices (
  product_id uuid primary key references public.products(id) on delete cascade,
  wholesale_price numeric(12,2) not null check (wholesale_price >= 0),
  updated_at timestamptz default now()
);

comment on table public.product_wholesale_prices is 'Admin-only wholesale costing data. Strictly inaccessible to public/storefront customers and public Supabase API.';

-- 2. Enable Row Level Security (RLS)
alter table public.product_wholesale_prices enable row level security;

-- 3. RLS Policies: ONLY admins (public.is_admin()) can select, insert, update, delete
-- No policies granted to anon or public role.
drop policy if exists "admin_select_product_wholesale_prices" on public.product_wholesale_prices;
create policy "admin_select_product_wholesale_prices"
  on public.product_wholesale_prices
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin_insert_product_wholesale_prices" on public.product_wholesale_prices;
create policy "admin_insert_product_wholesale_prices"
  on public.product_wholesale_prices
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin_update_product_wholesale_prices" on public.product_wholesale_prices;
create policy "admin_update_product_wholesale_prices"
  on public.product_wholesale_prices
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_delete_product_wholesale_prices" on public.product_wholesale_prices;
create policy "admin_delete_product_wholesale_prices"
  on public.product_wholesale_prices
  for delete
  to authenticated
  using (public.is_admin());

-- 4. Revoke all permissions from anon and public roles
revoke all on public.product_wholesale_prices from anon;
revoke all on public.product_wholesale_prices from public;
grant select, insert, update, delete on public.product_wholesale_prices to authenticated, service_role;
