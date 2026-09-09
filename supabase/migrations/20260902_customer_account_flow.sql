-- ============================================================================
-- LEIA COSMETICS: Complete Customer Account Flow & Auto-Confirmation Migration
-- ============================================================================
-- 1. Auto-confirms ALL customer signups (no transactional email dependency)
-- 2. Automatically syncs auth.users into public.customers table
-- 3. Confirms all existing unconfirmed test accounts
-- 4. Ensures storefront orders are linked to customer accounts
-- ============================================================================

-- 1. Ensure required extensions exist
create extension if not exists pgcrypto with schema extensions;

-- 2. Trigger Function: Auto-confirm ALL customer accounts on creation
create or replace function public.auto_confirm_customer_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row
  execute function public.auto_confirm_customer_user();

-- 3. Trigger Function: Automatically sync auth.users to public.customers
create or replace function public.handle_new_customer_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  cust_phone text;
  cust_name text;
  cust_email text;
  existing_cust_id uuid;
begin
  begin
    cust_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Valued Customer');
    cust_phone := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');
    cust_email := nullif(lower(trim(coalesce(new.email, ''))), '');

    -- Check if a customer record already exists with this email or phone
    select id into existing_cust_id
    from public.customers
    where (cust_email is not null and email = cust_email)
       or (cust_phone is not null and phone = cust_phone)
    order by (case when auth_user_id is not null then 0 else 1 end), created_at limit 1;

    if existing_cust_id is not null then
      update public.customers
      set auth_user_id = new.id,
          name = cust_name,
          full_name = cust_name,
          email = coalesce(cust_email, email),
          phone = coalesce(cust_phone, phone)
      where id = existing_cust_id;
    else
      insert into public.customers (auth_user_id, name, full_name, email, phone)
      values (new.id, cust_name, cust_name, cust_email, cust_phone)
      on conflict (auth_user_id) do update
      set name = excluded.name,
          full_name = excluded.full_name,
          phone = coalesce(excluded.phone, customers.phone),
          email = coalesce(excluded.email, customers.email);
    end if;

    -- Link any existing orders placed with matching email or phone
    update public.orders
    set customer_id = coalesce(existing_cust_id, (select id from public.customers where auth_user_id = new.id limit 1))
    where ((customer_email = cust_email and cust_email is not null) or (customer_phone = cust_phone and cust_phone is not null))
      and customer_id is null;

  exception when others then
    -- Never block user signup if customer sync encounters non-fatal edge case
    raise warning 'handle_new_customer_user non-fatal notice: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_customer on auth.users;
create trigger on_auth_user_created_sync_customer
  after insert on auth.users
  for each row
  execute function public.handle_new_customer_user();

-- 4. One-time fix: Confirm all existing stuck test accounts
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- Sync any unlinked auth users into public.customers table
insert into public.customers (auth_user_id, name, full_name, email, phone)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Customer'),
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Customer'),
  u.email,
  u.raw_user_meta_data->>'phone'
from auth.users u
where not exists (select 1 from public.customers c where c.auth_user_id = u.id)
on conflict (auth_user_id) do update
set email = excluded.email,
    name = excluded.name,
    full_name = excluded.full_name;

-- 5. Updated place_storefront_order RPC to ensure authenticated caller is always linked
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
set search_path = public, auth
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
  current_auth_id uuid := auth.uid();
begin
  if coalesce(jsonb_array_length(p_items), 0) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  -- 1. Find or create customer record
  if current_auth_id is not null then
    select id into customer_uuid from public.customers
    where auth_user_id = current_auth_id
    order by created_at limit 1;
  end if;

  if customer_uuid is null then
    select id into customer_uuid from public.customers
    where (email = clean_email or phone = clean_phone)
    order by (case when auth_user_id is not null then 0 else 1 end), created_at limit 1;
  end if;

  if customer_uuid is null then
    insert into public.customers(auth_user_id, name, full_name, email, phone)
    values (current_auth_id, clean_name, clean_name, clean_email, clean_phone)
    returning id into customer_uuid;
  else
    update public.customers
    set auth_user_id = coalesce(auth_user_id, current_auth_id),
        name = clean_name,
        full_name = coalesce(full_name, clean_name),
        email = coalesce(clean_email, email),
        phone = coalesce(clean_phone, phone)
    where id = customer_uuid;
  end if;

  -- 2. Verify product availability and lock variants for stock decrement
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

  -- 3. Create Order record
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

  -- 4. Create Order Items
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
