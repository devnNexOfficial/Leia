create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('privacy-policy', 'terms-of-service', 'accessibility', 'cookie-policy')),
  title text not null,
  content text not null,
  updated_at timestamptz not null default now()
);

create trigger site_pages_updated_at
  before update on public.site_pages
  for each row execute function public.set_updated_at();

alter table public.site_pages enable row level security;

create policy "public reads site pages"
  on public.site_pages for select to anon, authenticated using (true);

create policy "admins manage site pages"
  on public.site_pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.site_pages;
