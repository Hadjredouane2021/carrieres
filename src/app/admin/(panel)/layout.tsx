import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireUser } from "@/server/session";

export const metadata = { robots: { index: false, follow: false } };
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-institution">Chargement du back-office…</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  const session = await requireUser(false);
  return (
    <AdminShell name={session.user.name ?? session.user.email ?? "Équipe"} role={session.user.role}>
      {children}
    </AdminShell>
  );
}
