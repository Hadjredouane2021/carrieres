import { Crown, PenLine, Plus, Power, ShieldCheck, UserRound, Users } from "lucide-react";
import { connection } from "next/server";
import { AdminHeader, StatGrid } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { UserDialog } from "@/components/admin/user-dialog";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { toggleUser } from "@/server/actions/admin";
import { requireSuperAdmin } from "@/server/session";

export const metadata = { title: "Comptes" };
export const instant = false;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const session = await requireSuperAdmin();
  const query = await searchParams;
  const users = await db().user.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { createdAt: "asc" }] });
  const supers = users.filter((user) => user.role === "SUPER_ADMIN" && user.active).length;
  const admins = users.filter((user) => user.role === "ADMIN" && user.active).length;
  const staff = users.filter((user) => user.role === "STAFF" && user.active).length;
  const inactive = users.filter((user) => !user.active).length;
  const since = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" });

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Administration"
        title="Comptes de l'équipe"
        description="Super administration : tous les droits, y compris les comptes. Administration : tous les écrans sauf les comptes. Accueil : inscriptions, accueil QR et messages."
        actions={
          <UserDialog>
            <button className={cn(buttonVariants({ variant: "night", size: "md" }))}>
              <Plus className="size-4" aria-hidden="true" />
              Nouveau compte
            </button>
          </UserDialog>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <StatGrid
        stats={[
          { label: "Comptes", value: String(users.length), hint: `${users.length - inactive} actif${users.length - inactive > 1 ? "s" : ""} · ${inactive} désactivé${inactive > 1 ? "s" : ""}`, icon: Users },
          { label: "Super administration", value: String(supers), hint: supers === 1 ? "Seul super administrateur actif" : "Gèrent les comptes", icon: Crown, alert: supers < 2 },
          { label: "Administration", value: String(admins), hint: "Tous les écrans sauf les comptes", icon: ShieldCheck },
          { label: "Accueil", value: String(staff), hint: "Équipe d'accueil active", icon: UserRound },
        ]}
      />

      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const self = user.id === session.user.id;
          const admin = user.role !== "STAFF";
          const isSuper = user.role === "SUPER_ADMIN";
          return (
            <li key={user.id}>
              <article className={cn("relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-night/[0.07] transition", !user.active && "opacity-70")}>
                <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 top-0 h-20", admin ? "bg-gradient-to-br from-sun/20 via-dawn to-transparent" : "bg-gradient-to-br from-sky-100 via-sky-50/50 to-transparent")} />
                <div className="relative flex items-start gap-4">
                  <span
                    className={cn(
                      "grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-semibold shadow-lg",
                      admin ? "bg-night text-sun shadow-night/25" : "bg-gradient-to-br from-sky-500 to-institution text-white shadow-sky-900/20",
                      !user.active && "grayscale",
                    )}
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="flex items-center gap-2 font-semibold text-night">
                      <span className="truncate">{user.name}</span>
                      {self ? <span className="shrink-0 rounded-full bg-night px-2 py-0.5 text-[11px] font-semibold text-sun">Vous</span> : null}
                    </p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                  </div>
                </div>

                <div className="relative mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold", admin ? "bg-dawn text-sun-ink" : "bg-sky-50 text-sky-700")}>
                    {isSuper ? <Crown className="size-3.5" aria-hidden="true" /> : admin ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <UserRound className="size-3.5" aria-hidden="true" />}
                    {isSuper ? "Super administration" : admin ? "Administration" : "Accueil"}
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", user.active ? "bg-emerald-50 text-emerald-700" : "bg-night/[0.06] text-muted")}>
                    <span className={cn("size-1.5 rounded-full", user.active ? "bg-emerald-500" : "bg-muted")} aria-hidden="true" />
                    {user.active ? "Actif" : "Désactivé"}
                  </span>
                  <span className="ms-auto text-muted">Depuis le {since.format(user.createdAt)}</span>
                </div>

                <div className="relative mt-auto flex gap-2 border-t border-night/[0.06] pt-4 [margin-top:1.25rem]">
                  <UserDialog user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
                    <button className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-night/10 text-sm text-night transition hover:border-night/30">
                      <PenLine className="size-4" aria-hidden="true" /> Modifier
                    </button>
                  </UserDialog>
                  {self ? null : (
                    <form action={toggleUser} className="flex-1">
                      <input type="hidden" name="id" value={user.id} />
                      <SubmitButton variant={user.active ? "ghost" : "outline"} size="sm" pendingLabel="…" className={cn("h-9 w-full", user.active && "text-red-700 hover:bg-red-50")}>
                        <Power className="size-4" aria-hidden="true" /> {user.active ? "Désactiver" : "Réactiver"}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
