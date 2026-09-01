create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'),
  message text not null check (char_length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at desc);

alter table public.contact_messages enable row level security;

create policy "visitors can send contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(trim(message)) > 0
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'
  );

create policy "admins manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The public never receives the orders table directly. This limited lookup
-- returns a single order only when its order number and customer phone match.
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
language sql stable security definer set search_path = public as $$
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

grant execute on function public.track_storefront_order(text, text) to anon, authenticated;

alter publication supabase_realtime add table public.contact_messages;
