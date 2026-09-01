-- ============================================================================
-- LEIA Pakistan Cosmetics - Supabase Complete RLS & Server-Side Security Hardening
-- Migration: 20260831_complete_rls_security_hardening.sql
-- ============================================================================

-- Ensure pgcrypto extension is available
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Ensure custom enum types exist
-- ----------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('COD', 'JazzCash', 'Easypaisa');
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. Ensure all tables exist
-- ----------------------------------------------------------------------------

-- Admins
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  description text,
  display_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2),
  image_url text,
  image_urls text[],
  category_id uuid references public.categories(id) on delete set null,
  ingredients text,
  directions text,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  new_arrival_order integer,
  is_active boolean not null default true,
  status text not null default 'Active',
  stock_count integer not null default 0 check (stock_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product Variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  image_url text,
  stock_count integer not null default 0 check (stock_count >= 0),
  price_override numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (email, phone)
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
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

-- Order Items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  image_url text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

-- Banners
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  link_url text,
  placement text not null check (placement in ('homepage_hero')),
  display_order integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Homepage Videos
create table if not exists public.homepage_videos (
  id uuid primary key default gen_random_uuid(),
  title text,
  video_url text not null,
  thumbnail_url text,
  display_order integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Site Pages
create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('privacy-policy', 'terms-of-service', 'accessibility', 'cookie-policy')),
  title text not null,
  content text not null,
  updated_at timestamptz not null default now()
);

-- Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. ENSURE ALL COLUMNS EXIST ON PRE-EXISTING TABLES (Schema Migration Fix)
-- ----------------------------------------------------------------------------
alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text;

create unique index if not exists customers_auth_user_id_key
  on public.customers(auth_user_id)
  where auth_user_id is not null;

alter table public.products
  add column if not exists description text,
  add column if not exists compare_at_price numeric(12, 2),
  add column if not exists image_url text,
  add column if not exists image_urls text[],
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists ingredients text,
  add column if not exists directions text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_new_arrival boolean not null default false,
  add column if not exists new_arrival_order integer,
  add column if not exists is_active boolean not null default true,
  add column if not exists status text not null default 'Active',
  add column if not exists stock_count integer not null default 0;

alter table public.categories
  add column if not exists image_url text,
  add column if not exists description text,
  add column if not exists display_order integer;

alter table public.product_variants
  add column if not exists sku text,
  add column if not exists image_url text,
  add column if not exists stock_count integer not null default 0,
  add column if not exists price_override numeric(12, 2);

alter table public.orders
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists shipping_address text,
  add column if not exists city text,
  add column if not exists total numeric(12, 2) not null default 0,
  add column if not exists payment_method public.payment_method not null default 'COD',
  add column if not exists status public.order_status not null default 'Pending';

-- ----------------------------------------------------------------------------
-- 4. Helper Functions (SECURITY DEFINER with search_path)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ----------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.banners enable row level security;
alter table public.homepage_videos enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customers enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_pages enable row level security;

-- ----------------------------------------------------------------------------
-- 6. DROP ALL EXISTING POLICIES TO AVOID DRIFT/DUPLICATION
-- ----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in (
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'admins', 'categories', 'products', 'product_variants',
        'banners', 'homepage_videos', 'orders', 'order_items',
        'customers', 'newsletter_subscribers', 'contact_messages', 'site_pages'
      )
  ) loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 7. APPLY STRICT RLS POLICIES
-- ----------------------------------------------------------------------------

-- [ADMINS]
-- No public/authenticated direct table access; strictly accessible by service_role or security definer functions (is_admin).

-- [CATEGORIES]
create policy "categories_public_select"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- [PRODUCTS]
create policy "products_public_select"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- [PRODUCT VARIANTS]
create policy "product_variants_public_select"
  on public.product_variants for select
  to anon, authenticated
  using (true);

create policy "product_variants_admin_insert"
  on public.product_variants for insert
  to authenticated
  with check (public.is_admin());

create policy "product_variants_admin_update"
  on public.product_variants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_variants_admin_delete"
  on public.product_variants for delete
  to authenticated
  using (public.is_admin());

-- [BANNERS]
create policy "banners_public_select"
  on public.banners for select
  to anon, authenticated
  using (true);

create policy "banners_admin_insert"
  on public.banners for insert
  to authenticated
  with check (public.is_admin());

create policy "banners_admin_update"
  on public.banners for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "banners_admin_delete"
  on public.banners for delete
  to authenticated
  using (public.is_admin());

-- [HOMEPAGE VIDEOS]
create policy "homepage_videos_public_select"
  on public.homepage_videos for select
  to anon, authenticated
  using (true);

create policy "homepage_videos_admin_insert"
  on public.homepage_videos for insert
  to authenticated
  with check (public.is_admin());

create policy "homepage_videos_admin_update"
  on public.homepage_videos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "homepage_videos_admin_delete"
  on public.homepage_videos for delete
  to authenticated
  using (public.is_admin());

-- [SITE PAGES]
create policy "site_pages_public_select"
  on public.site_pages for select
  to anon, authenticated
  using (true);

create policy "site_pages_admin_insert"
  on public.site_pages for insert
  to authenticated
  with check (public.is_admin());

create policy "site_pages_admin_update"
  on public.site_pages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_pages_admin_delete"
  on public.site_pages for delete
  to authenticated
  using (public.is_admin());

-- [CUSTOMERS]
create policy "customers_select"
  on public.customers for select
  to authenticated
  using (auth_user_id = auth.uid() or public.is_admin());

create policy "customers_insert"
  on public.customers for insert
  to authenticated
  with check (auth_user_id = auth.uid() or public.is_admin());

create policy "customers_update"
  on public.customers for update
  to authenticated
  using (auth_user_id = auth.uid() or public.is_admin())
  with check (auth_user_id = auth.uid() or public.is_admin());

create policy "customers_admin_delete"
  on public.customers for delete
  to authenticated
  using (public.is_admin());

-- [ORDERS]
create policy "orders_customer_and_admin_select"
  on public.orders for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = orders.customer_id
        and c.auth_user_id = auth.uid()
    )
  );

create policy "orders_insert_policy"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_admin_delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- [ORDER ITEMS]
create policy "order_items_customer_and_admin_select"
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_items.order_id
        and c.auth_user_id = auth.uid()
    )
  );

create policy "order_items_insert_policy"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

create policy "order_items_admin_update"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_admin_delete"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- [NEWSLETTER SUBSCRIBERS]
create policy "newsletter_anyone_insert"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    email = lower(trim(email))
    and char_length(email) <= 255
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

create policy "newsletter_admin_select"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

create policy "newsletter_admin_update"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "newsletter_admin_delete"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());

-- [CONTACT MESSAGES]
create policy "contact_messages_anyone_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(trim(message)) > 0
    and char_length(email) <= 255
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

create policy "contact_messages_admin_select"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages_admin_update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. ORDER TRACKING & STOREFRONT ORDER RPCs (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
create or replace function public.track_storefront_order(
  p_order_number text,
  p_customer_phone text
)
returns table (
  order_number text,
  customer_name text,
  status public.order_status,
  total numeric,
  payment_method public.payment_method,
  created_at timestamptz,
  items jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.customer_name,
    o.status,
    o.total,
    o.payment_method,
    o.created_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'product_name', oi.product_name,
          'variant_name', oi.variant_name,
          'quantity', oi.quantity
        ) order by oi.created_at
      ) filter (where oi.id is not null),
      '[]'::jsonb
    ) as items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where upper(o.order_number) = upper(trim(p_order_number))
    and regexp_replace(o.customer_phone, '[^0-9]', '', 'g') = regexp_replace(trim(p_customer_phone), '[^0-9]', '', 'g')
  group by o.id
  limit 1;
$$;

grant execute on function public.track_storefront_order(text, text) to anon, authenticated, service_role;

-- Server-validated storefront checkout function
create or replace function public.place_storefront_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_city text,
  p_payment_method public.payment_method,
  p_items jsonb
)
returns table(order_id uuid, order_number text, total numeric, shipping_fee numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_row public.products%rowtype;
  variant_row public.product_variants%rowtype;
  customer_uuid uuid;
  created_order public.orders%rowtype;
  subtotal_value numeric := 0;
  line_price numeric;
  quantity_value integer;
  clean_name text := trim(p_customer_name);
  clean_email text := nullif(lower(trim(p_customer_email)), '');
  clean_phone text := nullif(trim(p_customer_phone), '');
  clean_address text := trim(p_shipping_address);
  clean_city text := trim(p_city);
begin
  if coalesce(jsonb_array_length(p_items), 0) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  -- Upsert customer record
  select id into customer_uuid from public.customers
  where (email = clean_email or phone = clean_phone)
  order by created_at limit 1;

  if customer_uuid is null then
    insert into public.customers(name, email, phone)
    values (clean_name, clean_email, clean_phone)
    returning id into customer_uuid;
  else
    update public.customers
    set name = clean_name, email = clean_email, phone = clean_phone
    where id = customer_uuid;
  end if;

  -- Verify product availability and lock variants for stock decrement
  for item in select * from jsonb_array_elements(p_items) loop
    quantity_value := (item->>'quantity')::integer;
    if quantity_value is null or quantity_value < 1 then
      raise exception 'Invalid item quantity.';
    end if;

    select * into product_row from public.products
    where id = (item->>'product_id')::uuid and is_active = true;

    if not found then
      raise exception 'One of the selected products is unavailable.';
    end if;

    if nullif(item->>'variant_id', '') is not null then
      select * into variant_row from public.product_variants
      where id = (item->>'variant_id')::uuid and product_id = product_row.id for update;

      if not found or variant_row.stock_count < quantity_value then
        raise exception 'A selected variant is out of stock.';
      end if;

      line_price := coalesce(variant_row.price_override, product_row.price);
      update public.product_variants
      set stock_count = stock_count - quantity_value
      where id = variant_row.id;
    else
      if exists (select 1 from public.product_variants where product_id = product_row.id) then
        raise exception 'Please choose a product variant.';
      end if;
      line_price := product_row.price;
    end if;

    subtotal_value := subtotal_value + line_price * quantity_value;
  end loop;

  -- Create Order record
  insert into public.orders(
    order_number, customer_id, customer_name, customer_email, customer_phone,
    shipping_address, city, total, payment_method
  )
  values (
    'LEIA-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    customer_uuid, clean_name, clean_email, clean_phone,
    clean_address, clean_city,
    subtotal_value + case when subtotal_value >= 5000 then 0 else 250 end,
    p_payment_method
  )
  returning * into created_order;

  -- Create Order Items
  for item in select * from jsonb_array_elements(p_items) loop
    select * into product_row from public.products where id = (item->>'product_id')::uuid;
    select * into variant_row from public.product_variants where id = nullif(item->>'variant_id', '')::uuid;
    quantity_value := (item->>'quantity')::integer;
    line_price := coalesce(variant_row.price_override, product_row.price);

    insert into public.order_items(
      order_id, product_id, variant_id, product_name, variant_name, image_url, unit_price, quantity
    )
    values (
      created_order.id, product_row.id, variant_row.id,
      product_row.name, variant_row.name, product_row.image_url,
      line_price, quantity_value
    );
  end loop;

  return query select
    created_order.id,
    created_order.order_number,
    created_order.total,
    case when subtotal_value >= 5000 then 0::numeric else 250::numeric end;
end;
$$;

grant execute on function public.place_storefront_order(text, text, text, text, text, public.payment_method, jsonb) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 9. STORAGE BUCKETS & POLICIES (PRODUCT IMAGES)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public product images" on storage.objects;
drop policy if exists "admins upload product images" on storage.objects;
drop policy if exists "admins update product images" on storage.objects;
drop policy if exists "admins delete product images" on storage.objects;

create policy "public product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
