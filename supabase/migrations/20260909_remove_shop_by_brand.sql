-- Migration: Revert "Shop by Brand" feature
ALTER TABLE public.products DROP COLUMN IF EXISTS brand_id;
ALTER TABLE public.products DROP COLUMN IF EXISTS brand;

DROP TABLE IF EXISTS public.brands CASCADE;
