create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_lowercase check (email = lower(email))
);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on public.newsletter_subscribers(subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

create policy "visitors can subscribe to newsletter"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (email = lower(email) and email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$');

create policy "admins manage newsletter subscribers"
  on public.newsletter_subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.newsletter_subscribers;
