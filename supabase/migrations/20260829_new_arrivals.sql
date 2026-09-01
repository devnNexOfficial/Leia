alter table public.products
  add column if not exists is_new_arrival boolean not null default false,
  add column if not exists new_arrival_order integer;
create index if not exists products_new_arrival_idx on public.products(is_new_arrival, new_arrival_order nulls last, created_at desc);
