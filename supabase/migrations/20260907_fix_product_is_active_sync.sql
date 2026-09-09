-- ============================================================================
-- Fix: Sync is_active with status for any products with inconsistent values.
--
-- Root cause: The storefront query previously required BOTH status='Active' AND
-- is_active=true. Products inserted before the `status` column existed, or
-- via any path that only set one flag, were silently excluded from the storefront.
--
-- This migration:
--   1. Ensures `status` defaults to 'Active'
--   2. Ensures `is_active` defaults to true
--   3. Backfills is_active=true for rows with status='Active' but is_active=false
--   4. Backfills is_active=false for rows with status!='Active' but is_active=true
--   5. Sets status='Active' for rows where status is NULL (pre-migration rows)
-- ============================================================================

alter table public.products
  alter column status set default 'Active',
  alter column is_active set default true;

update public.products
  set is_active = true
  where status = 'Active'
    and is_active = false;

update public.products
  set is_active = false
  where status in ('Draft', 'Out of Stock')
    and is_active = true;

update public.products
  set status = case when is_active then 'Active' else 'Draft' end
  where status is null;
