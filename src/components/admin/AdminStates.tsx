import { adminCard } from "./AdminLayout";

export function AdminLoading() { return <div className={`${adminCard} p-8 text-center text-sm text-slate-500`}>Loading data…</div>; }
export function AdminError({ message }: { message: string }) { return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
export function EmptyState({ children }: { children: React.ReactNode }) { return <div className={`${adminCard} p-10 text-center text-sm text-slate-500`}>{children}</div>; }
