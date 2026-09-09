-- Add product_id optional foreign key to homepage_videos
alter table public.homepage_videos add column if not exists product_id uuid references public.products(id) on delete set null;
