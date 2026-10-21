import { PenLine, Plus, Power, ShieldCheck, UserRound, Users, UserX } from "lucide-react";
import { Flash, PageHeader } from "@/components/admin/shell";
import { UserDialog } from "@/components/admin/user-dialog";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { toggleUser } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const session = await requireUser(true);
  const query = await searchParams;
  const users = await db().user.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { createdAt: "asc" }] });
  const admins = users.filter((user) => user.role === "ADMIN" && user.active).length;
  const staff = users.filter((user) => user.role === "STAFF" && user.active).length;
  const inactive = users.filter((user) => !user.active).length;
  const since = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" });

  const stats = [
    { label: "Comptes", value: users.length, icon: Users, tone: "bg-mist text-institution" },
    { label: "Administration", value: admins, icon: ShieldCheck, tone: "bg-gold/15 text-[#8A6A33]" },
    { label: "Accueil", value: staff, icon: UserRound, tone: "bg-sky-50 text-sky-700" },
    { label: "Désactivés", value: inactive, icon: UserX, tone: "bg-zinc-100 text-zinc-500" },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Configuration"
        title="Comptes"
        intro="Les personnes qui accèdent au back-office. L'administration gère tout ; l'accueil gère les inscriptions, le pointage et les messages."
        action={
          <UserDialog>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-medium text-beige shadow-lg shadow-night/20 hover:bg-institution">
              <Plus className="size-4" /> Nouveau compte
            </button>
          </UserDialog>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="admin-card flex items-center gap-4 p-4">
            <span className={cn("grid size-11 place-items-center rounded-2xl", tone)}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="display text-2xl text-night">{value}</p>
              <p className="text-xs text-institution">{label}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const self = user.id === session.user.id;
          const admin = user.role === "ADMIN";
          return (
            <article key={user.id} className={cn("admin-card group relative flex flex-col overflow-hidden p-5 transition", !user.active && "opacity-70")}>
              <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-20", admin ? "bg-gradient-to-br from-gold/25 via-gold/5 to-transparent" : "bg-gradient-to-br from-sky-100 via-sky-50/40 to-transparent")} />
              <div className="relative flex items-start gap-4">
                <span
                  className={cn(
                    "grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-semibold shadow-lg",
                    admin ? "bg-gradient-to-br from-night to-institution text-gold shadow-night/25" : "bg-gradient-to-br from-sky-500 to-institution text-white shadow-sky-900/20",
                    !user.active && "grayscale",
                  )}
                >
                  {initials(user.name)}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="flex items-center gap-2 truncate font-medium text-night">
                    <span className="truncate">{user.name}</span>
                    {self ? <span className="shrink-0 rounded-full bg-night px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-gold">Vous</span> : null}
                  </p>
                  <p className="truncate text-sm text-institution">{user.email}</p>
                </div>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium", admin ? "bg-gold/15 text-[#8A6A33]" : "bg-sky-50 text-sky-700")}>
                  {admin ? <ShieldCheck className="size-3.5" /> : <UserRound className="size-3.5" />}
                  {admin ? "Administration" : "Accueil"}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", user.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
                  <span className={cn("size-1.5 rounded-full", user.active ? "bg-emerald-500" : "bg-zinc-400")} />
                  {user.active ? "Actif" : "Désactivé"}
                </span>
                <span className="ms-auto text-institution/70">Depuis le {since.format(user.createdAt)}</span>
              </div>

              <div className="relative mt-5 flex gap-2 border-t border-night/[0.06] pt-4">
                <UserDialog user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
                  <button className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-night/10 text-sm text-night transition hover:border-gold">
                    <PenLine className="size-4" /> Modifier
                  </button>
                </UserDialog>
                {self ? null : (
                  <form action={toggleUser} className="flex-1">
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      className={cn(
                        "inline-flex h-9 w-full items-center justify-center gap-2 rounded-full text-sm transition",
                        user.active ? "text-red-700 hover:bg-red-50" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                      )}
                    >
                      <Power className="size-4" /> {user.active ? "Désactiver" : "Réactiver"}
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
