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
create index if not exists banners_placement_order_idx on public.banners(placement, display_order nulls last, created_at);
alter table public.banners enable row level security;
create policy "public reads active banners" on public.banners for select to anon, authenticated using (is_active = true);
create policy "admins manage banners" on public.banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
alter publication supabase_realtime add table public.banners;
