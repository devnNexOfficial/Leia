-- LEIA cosmetics storefront + admin panel schema.
-- Run this migration in Supabase Dashboard > SQL Editor, or with the Supabase CLI.

create extension if not exists "pgcrypto";

create type public.order_status as enum ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled');
create type public.payment_method as enum ('COD', 'JazzCash', 'Easypaisa');

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  stock_count integer not null default 0 check (stock_count >= 0),
  price_override numeric(12, 2) check (price_override is null or price_override >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (email, phone)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  -- Snapshots preserve the buyer details even if a customer record is later edited.
  customer_name text not null,
  customer_email text,
  customer_phone text,
  shipping_address text,
  city text,
  total numeric(12, 2) not null check (total >= 0),
  payment_method public.payment_method not null default 'COD',
  status public.order_status not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  -- Snapshots preserve product history when catalog data changes.
  product_name text not null,
  variant_name text,
  image_url text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- SECURITY DEFINER avoids RLS recursion when policies check membership.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- An authenticated user can check whether they are an administrator, but cannot enumerate admins.
create policy "users can read their own admin row" on public.admins for select to authenticated using (id = auth.uid());

-- Catalog remains readable to the storefront. Write access is strictly administrative.
create policy "public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "public can read active products" on public.products for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "public can read product variants" on public.product_variants for select to anon, authenticated using (true);

create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage customers" on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Required by the admin product image uploader.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
create policy "public product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- Enable dashboard subscriptions; product/category changes are reflected without a page reload.
alter publication supabase_realtime add table public.categories, public.products, public.product_variants, public.orders, public.order_items, public.customers;

-- After creating an Auth user in Supabase, grant it access once:
-- insert into public.admins (id) values ('AUTH_USER_UUID_HERE');
