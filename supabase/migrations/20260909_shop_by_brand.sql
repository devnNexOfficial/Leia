-- Migration: Create brands table and add brand fields to products
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  image_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add brand and brand_id columns to products table if they don't exist
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists brand_id uuid references public.brands(id) on delete set null;

-- Enable Row Level Security
alter table public.brands enable row level security;

-- Policies for brands
drop policy if exists "Allow public read access for active brands" on public.brands;
create policy "Allow public read access for active brands"
  on public.brands for select
  using (is_active = true or auth.role() = 'authenticated');

drop policy if exists "Allow authenticated admin full access to brands" on public.brands;
create policy "Allow authenticated admin full access to brands"
  on public.brands for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
