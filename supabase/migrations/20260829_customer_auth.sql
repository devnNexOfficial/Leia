-- Password accounts use a normalized phone number as a private, generated
-- Supabase Auth email: phone-<digits>@leia-store.local. No public email is
-- required from customers for this sign-in flow.
alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text;

update public.customers
set full_name = name
where full_name is null;

alter table public.customers
  alter column full_name set not null;

create unique index if not exists customers_auth_user_id_key
  on public.customers(auth_user_id)
  where auth_user_id is not null;

create policy "customers read their own profile"
  on public.customers for select to authenticated
  using (auth_user_id = auth.uid());

create policy "customers create their own profile"
  on public.customers for insert to authenticated
  with check (auth_user_id = auth.uid());

create policy "customers update their own profile"
  on public.customers for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

create policy "customers read their own orders"
  on public.orders for select to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = orders.customer_id and c.auth_user_id = auth.uid()
    )
  );
