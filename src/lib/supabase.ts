import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Undefined means the project has not been connected to Supabase yet. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const supabaseSetupMessage =
  "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect the admin panel to Supabase.";
