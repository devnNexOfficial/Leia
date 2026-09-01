import { supabaseSetupMessage } from "@/lib/supabase";

export function AdminSetupNotice() {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{supabaseSetupMessage}</div>;
}
