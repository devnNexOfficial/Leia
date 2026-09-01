-- Run after 20260829_admin_storefront.sql. This makes guest checkout atomic and server-priced.
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
language plpgsql security definer set search_path = public as $$
declare
  item jsonb; product_row public.products%rowtype; variant_row public.product_variants%rowtype;
  customer_uuid uuid; created_order public.orders%rowtype; subtotal_value numeric := 0; line_price numeric; quantity_value integer;
begin
  if coalesce(jsonb_array_length(p_items), 0) = 0 then raise exception 'Your cart is empty.'; end if;
  select id into customer_uuid from public.customers where (email = nullif(p_customer_email, '') or phone = nullif(p_customer_phone, '')) order by created_at limit 1;
  if customer_uuid is null then
    insert into public.customers(name, email, phone) values (p_customer_name, nullif(p_customer_email, ''), nullif(p_customer_phone, '')) returning id into customer_uuid;
  else
    update public.customers set name = p_customer_name, email = nullif(p_customer_email, ''), phone = nullif(p_customer_phone, '') where id = customer_uuid;
  end if;
  for item in select * from jsonb_array_elements(p_items) loop
    quantity_value := (item->>'quantity')::integer;
    if quantity_value is null or quantity_value < 1 then raise exception 'Invalid item quantity.'; end if;
    select * into product_row from public.products where id = (item->>'product_id')::uuid and is_active = true;
    if not found then raise exception 'One of the selected products is unavailable.'; end if;
    if nullif(item->>'variant_id', '') is not null then
      select * into variant_row from public.product_variants where id = (item->>'variant_id')::uuid and product_id = product_row.id for update;
      if not found or variant_row.stock_count < quantity_value then raise exception 'A selected variant is out of stock.'; end if;
      line_price := coalesce(variant_row.price_override, product_row.price);
      update public.product_variants set stock_count = stock_count - quantity_value where id = variant_row.id;
    else
      if exists (select 1 from public.product_variants where product_id = product_row.id) then raise exception 'Please choose a product variant.'; end if;
      line_price := product_row.price;
    end if;
    subtotal_value := subtotal_value + line_price * quantity_value;
  end loop;
  insert into public.orders(order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, city, total, payment_method)
  values ('LEIA-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), customer_uuid, p_customer_name, nullif(p_customer_email, ''), nullif(p_customer_phone, ''), p_shipping_address, p_city, subtotal_value + case when subtotal_value >= 5000 then 0 else 250 end, p_payment_method)
  returning * into created_order;
  for item in select * from jsonb_array_elements(p_items) loop
    select * into product_row from public.products where id = (item->>'product_id')::uuid;
    select * into variant_row from public.product_variants where id = nullif(item->>'variant_id', '')::uuid;
    quantity_value := (item->>'quantity')::integer;
    line_price := coalesce(variant_row.price_override, product_row.price);
    insert into public.order_items(order_id, product_id, variant_id, product_name, variant_name, image_url, unit_price, quantity)
    values (created_order.id, product_row.id, variant_row.id, product_row.name, variant_row.name, product_row.image_url, line_price, quantity_value);
  end loop;
  return query select created_order.id, created_order.order_number, created_order.total, case when subtotal_value >= 5000 then 0::numeric else 250::numeric end;
end;
$$;
grant execute on function public.place_storefront_order(text, text, text, text, text, public.payment_method, jsonb) to anon, authenticated;
