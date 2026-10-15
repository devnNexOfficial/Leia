-- ============================================================================
-- LEIA Pakistan Cosmetics - Migration: 20261015_add_product_wholesale_price.sql
-- Description: Isolated admin-only wholesale price storage with strict RLS
-- ============================================================================

-- 1. Remove wholesale_price column from public.products if it was added
alter table public.products drop column if exists wholesale_price;

-- 2. Create isolated admin-only product_wholesale table
create table if not exists public.product_wholesale (
  product_id uuid primary key references public.products(id) on delete cascade,
  wholesale_price numeric(12, 2) check (wholesale_price is null or wholesale_price >= 0),
  updated_at timestamptz default now()
);

comment on table public.product_wholesale is 'Admin-only wholesale costing data. Strictly inaccessible to public/storefront customers.';

-- 3. Enable Row Level Security (RLS)
alter table public.product_wholesale enable row level security;

-- 4. RLS Policies: ONLY admins (public.is_admin()) can select/insert/update/delete
drop policy if exists "product_wholesale_admin_select" on public.product_wholesale;
create policy "product_wholesale_admin_select"
  on public.product_wholesale for select
  to authenticated
  using (public.is_admin());

drop policy if exists "product_wholesale_admin_insert" on public.product_wholesale;
create policy "product_wholesale_admin_insert"
  on public.product_wholesale for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "product_wholesale_admin_update" on public.product_wholesale;
create policy "product_wholesale_admin_update"
  on public.product_wholesale for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_wholesale_admin_delete" on public.product_wholesale;
create policy "product_wholesale_admin_delete"
  on public.product_wholesale for delete
  to authenticated
  using (public.is_admin());

-- 5. Revoke all permissions from anon
revoke all on public.product_wholesale from anon;
grant select, insert, update, delete on public.product_wholesale to authenticated, service_role;
