create table if not exists public.homepage_videos (
  id uuid primary key default gen_random_uuid(),
  title text,
  video_url text not null,
  thumbnail_url text,
  display_order integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists homepage_videos_display_order_idx on public.homepage_videos(display_order nulls last, created_at);
alter table public.homepage_videos enable row level security;
create policy "public reads active homepage videos" on public.homepage_videos for select to anon, authenticated using (is_active = true);
create policy "admins manage homepage videos" on public.homepage_videos for all to authenticated using (public.is_admin()) with check (public.is_admin());
alter publication supabase_realtime add table public.homepage_videos;
