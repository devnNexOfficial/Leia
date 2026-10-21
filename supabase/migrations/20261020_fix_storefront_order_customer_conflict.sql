-- Migration: 20261020_fix_storefront_order_customer_conflict.sql
-- Fix repeat customer checkout failure caused by customers_email_phone_key unique constraint violation.
-- Ensures customer resolution never throws duplicate key violations or blocks order placement.
-- Safeguards customer identity against accidental merging or overwriting when phone numbers are shared.

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
  customer_uuid uuid := null;
  auth_identity_ambiguous boolean := false;
  created_order public.orders%rowtype;
  subtotal_value numeric := 0;
  line_price numeric;
  quantity_value integer;
  clean_name text := coalesce(nullif(trim(p_customer_name), ''), 'Customer');
  clean_email text := nullif(lower(trim(p_customer_email)), '');
  raw_digits text := regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g');
  clean_phone text := nullif(
    case
      when raw_digits ~ '^00923[0-9]{9}$' then '0' || substr(raw_digits, 5)
      when raw_digits ~ '^923[0-9]{9}$'   then '0' || substr(raw_digits, 3)
      when raw_digits ~ '^03[0-9]{9}$'    then raw_digits
      when raw_digits ~ '^3[0-9]{9}$'     then '0' || raw_digits
      else raw_digits
    end,
    ''
  );
  phone_core text := case when clean_phone ~ '^03[0-9]{9}$' then substr(clean_phone, 2) else null end;
  clean_address text := nullif(trim(p_shipping_address), '');
  clean_city text := nullif(trim(p_city), '');
  current_auth_id uuid := auth.uid();
begin
  if coalesce(jsonb_array_length(p_items), 0) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  -- 1. Find or create customer record (safe, isolated block so failures never prevent checkout)
  begin
    -- 1a. If caller is logged in, check customer tied to their auth account
    if current_auth_id is not null then
      select c.id into customer_uuid from public.customers c
      where c.auth_user_id = current_auth_id
      order by c.created_at limit 1;

      -- Safety check: if checkout details conflict with this customer's established identity
      if customer_uuid is not null then
        -- If checkout email is provided and differs from customer's existing non-null email, unsafe to associate
        if clean_email is not null and exists (
          select 1 from public.customers c
          where c.id = customer_uuid
            and c.email is not null
            and lower(trim(c.email)) <> clean_email
        ) then
          customer_uuid := null;
          auth_identity_ambiguous := true;
        -- If checkout phone belongs to ANOTHER customer record, do not claim or overwrite
        elsif clean_phone is not null and exists (
          select 1 from public.customers c
          where c.id <> customer_uuid
            and (
              c.phone = clean_phone
              or (
                phone_core is not null
                and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
                  '0' || phone_core,
                  phone_core,
                  '92' || phone_core,
                  '0092' || phone_core
                )
              )
              or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
            )
        ) then
          -- If this logged-in customer does not already own this phone in any format, association is ambiguous
          if not exists (
            select 1 from public.customers c
            where c.id = customer_uuid
              and (
                c.phone = clean_phone
                or (
                  phone_core is not null
                  and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
                    '0' || phone_core,
                    phone_core,
                    '92' || phone_core,
                    '0092' || phone_core
                  )
                )
                or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
              )
          ) then
            customer_uuid := null;
            auth_identity_ambiguous := true;
          end if;
        end if;
      end if;
    end if;

    -- If authenticated identity was ambiguous or conflicting, do not silently re-link to another customer
    if not auth_identity_ambiguous then
      -- 1b. Match exact pair (email AND phone) if both provided (never link to another user's auth account)
      if customer_uuid is null and clean_email is not null and clean_phone is not null then
        select c.id into customer_uuid from public.customers c
        where lower(trim(c.email)) = clean_email
          and (
            c.phone = clean_phone
            or (
              phone_core is not null
              and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
                '0' || phone_core,
                phone_core,
                '92' || phone_core,
                '0092' || phone_core
              )
            )
            or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
          )
          and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
        order by (case when c.auth_user_id is not null then 0 else 1 end), c.created_at limit 1;
      end if;

      -- 1c. Match by phone when customer omits email (reuse existing customer to prevent duplicates)
      if customer_uuid is null and clean_email is null and clean_phone is not null then
        select c.id into customer_uuid from public.customers c
        where (
          c.phone = clean_phone
          or (
            phone_core is not null
            and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
              '0' || phone_core,
              phone_core,
              '92' || phone_core,
              '0092' || phone_core
            )
          )
          or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
        )
        -- Protect authenticated accounts: unauthenticated checkout cannot link to an auth user profile
        and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
        -- Protect identity: do not associate if multiple distinct emails already share this phone
        and not exists (
          select 1 from public.customers c2
          where (
            c2.phone = clean_phone
            or (
              phone_core is not null
              and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') in (
                '0' || phone_core,
                phone_core,
                '92' || phone_core,
                '0092' || phone_core
              )
            )
            or (raw_digits <> '' and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') = raw_digits)
          )
          and c2.id <> c.id
          and c2.email is not null
          and c.email is not null
          and lower(trim(c2.email)) <> lower(trim(c.email))
        )
        order by (case when c.email is null then 0 else 1 end), c.created_at limit 1;
      end if;

      -- 1d. Match by email ONLY for email-only guest orders (clean_phone is null)
      if customer_uuid is null and clean_email is not null and clean_phone is null then
        select c.id into customer_uuid from public.customers c
        where lower(trim(c.email)) = clean_email
          and c.phone is null
          and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
        order by (case when c.auth_user_id is not null then 0 else 1 end), c.created_at limit 1;
      end if;
    end if;

    -- 1e. If found, update customer profile safely (never overwrite existing non-null email/name or mutate auth_user_id)
    if customer_uuid is not null then
      begin
        update public.customers
        set name = coalesce(nullif(name, ''), clean_name),
            full_name = coalesce(full_name, clean_name),
            email = coalesce(email, clean_email),
            phone = case
              when phone is null then clean_phone
              when clean_phone is null then phone
              when (
                (phone_core is not null and regexp_replace(coalesce(phone, ''), '\D', '', 'g') in (
                  '0' || phone_core, phone_core, '92' || phone_core, '0092' || phone_core
                ))
                or (raw_digits <> '' and regexp_replace(coalesce(phone, ''), '\D', '', 'g') = raw_digits)
              ) then clean_phone
              when not exists (
                select 1 from public.customers c2
                where c2.id <> customer_uuid
                  and (
                    c2.phone = clean_phone
                    or (
                      phone_core is not null
                      and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') in (
                        '0' || phone_core, phone_core, '92' || phone_core, '0092' || phone_core
                      )
                    )
                    or (raw_digits <> '' and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') = raw_digits)
                  )
              ) then clean_phone
              else phone
            end,
            updated_at = now()
        where id = customer_uuid;
      exception when unique_violation then
        -- Fallback: update profile fields safely without violating unique constraints
        begin
          update public.customers
          set full_name = coalesce(full_name, clean_name),
              updated_at = now()
          where id = customer_uuid;
        exception when others then
          null;
        end;
      end;
    elsif not auth_identity_ambiguous then
      -- 1f. If not found and not ambiguous, insert new customer with ON CONFLICT handling
      begin
        insert into public.customers(auth_user_id, name, full_name, email, phone)
        values (
          case
            when current_auth_id is not null and not exists (
              select 1 from public.customers c where c.auth_user_id = current_auth_id
            ) then current_auth_id
            else null
          end,
          clean_name,
          clean_name,
          clean_email,
          clean_phone
        )
        on conflict (email, phone) do update
          set full_name = coalesce(public.customers.full_name, excluded.full_name),
              updated_at = now()
          where public.customers.auth_user_id is null
             or public.customers.auth_user_id = current_auth_id
        returning id into customer_uuid;

        -- Guard: if ON CONFLICT resolved to an account belonging to another user, do not link
        if customer_uuid is not null and exists (
          select 1 from public.customers c
          where c.id = customer_uuid
            and c.auth_user_id is not null
            and (current_auth_id is null or c.auth_user_id <> current_auth_id)
        ) then
          customer_uuid := null;
        end if;
      exception when others then
        begin
          customer_uuid := null;

          -- Safe fallback: match ONLY the exact email+phone pair (unlinked to other auth users)
          if clean_email is not null and clean_phone is not null then
            select c.id into customer_uuid from public.customers c
            where lower(trim(c.email)) = clean_email
              and (
                c.phone = clean_phone
                or (
                  phone_core is not null
                  and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
                    '0' || phone_core,
                    phone_core,
                    '92' || phone_core,
                    '0092' || phone_core
                  )
                )
                or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
              )
              and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
            order by c.created_at limit 1;
          end if;

          -- If caller omitted email, fallback match by phone if non-ambiguous and unlinked to auth
          if customer_uuid is null and clean_phone is not null and clean_email is null then
            select c.id into customer_uuid from public.customers c
            where (
              c.phone = clean_phone
              or (
                phone_core is not null
                and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') in (
                  '0' || phone_core,
                  phone_core,
                  '92' || phone_core,
                  '0092' || phone_core
                )
              )
              or (raw_digits <> '' and regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') = raw_digits)
            )
            and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
            and not exists (
              select 1 from public.customers c2
              where (
                c2.phone = clean_phone
                or (
                  phone_core is not null
                  and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') in (
                    '0' || phone_core,
                    phone_core,
                    '92' || phone_core,
                    '0092' || phone_core
                  )
                )
                or (raw_digits <> '' and regexp_replace(coalesce(c2.phone, ''), '\D', '', 'g') = raw_digits)
              )
              and c2.id <> c.id
              and c2.email is not null
              and c.email is not null
              and lower(trim(c2.email)) <> lower(trim(c.email))
            )
            order by (case when c.email is null then 0 else 1 end), c.created_at limit 1;
          end if;

          -- If still null and clean_phone is null, match exact email-only record
          if customer_uuid is null and clean_email is not null and clean_phone is null then
            select c.id into customer_uuid from public.customers c
            where lower(trim(c.email)) = clean_email
              and c.phone is null
              and (c.auth_user_id is null or c.auth_user_id = current_auth_id)
            order by c.created_at limit 1;
          end if;
        exception when others then
          customer_uuid := null;
        end;
      end;
    end if;
  exception when others then
    customer_uuid := null;
  end;

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
