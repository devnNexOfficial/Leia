-- Migration: 20260901_contact_messages_is_read.sql
-- Description: Adds is_read column to contact_messages table for admin read/unread tracking.

alter table public.contact_messages
  add column if not exists is_read boolean not null default false;

-- Create index on is_read and created_at for fast admin filtering
create index if not exists contact_messages_is_read_idx
  on public.contact_messages(is_read, created_at desc);
