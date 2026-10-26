import { ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { STATUS_STYLE } from "@/lib/status-style";
import { labelOf, PARTICIPANT_TYPES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { registrationWhere } from "@/server/registration-query";
import { requireUser } from "@/server/session";

export const instant = false;
const pageSize = 20;

type Query = Record<string, string | undefined>;

function href(query: Query, changes: Query) {
  const params = new URLSearchParams();
  for (const key of ["q", "status", "type", "page"]) {
    const value = key in changes ? changes[key] : query[key];
    if (value) params.set(key, value);
  }
  const text = params.toString();
  return text ? `/admin/inscriptions?${text}` : "/admin/inscriptions";
}

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const session = await requireUser(false);
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const where = registrationWhere(query);
  const tabWhere = registrationWhere({ q: query.q, type: query.type });
  const [total, rows, byStatus] = await Promise.all([
    db().registration.count({ where }),
    db().registration.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    db().registration.groupBy({ by: ["status"], where: tabWhere, _count: { _all: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const countOf = (status: string) => byStatus.find((item) => item.status === status)?._count._all ?? 0;
  const allCount = byStatus.reduce((sum, item) => sum + item._count._all, 0);
  const tabs = [
    { value: undefined, label: "Toutes", count: allCount, dot: "bg-night" },
    ...Object.entries(STATUS_STYLE).map(([value, style]) => ({ value, label: style.label, count: countOf(value), dot: style.dot })),
  ];
  const exportQuery = new URLSearchParams();
  if (query.q) exportQuery.set("q", query.q);
  if (query.status) exportQuery.set("status", query.status);
  if (query.type) exportQuery.set("type", query.type);
  const back = href(query, {});
  const formatDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });

  return (
    <div className="grid gap-5 pb-24">
      <AdminHeader
        eyebrow="Pilotage"
        title="Inscriptions"
        description={`${allCount} dossier${allCount > 1 ? "s" : ""}${query.q || query.type ? " pour ces filtres" : " au total"}. Confirmez, mettez en attente ou supprimez, une par une ou par lot.`}
        actions={
          <div className="flex gap-2">
            <a href={`/api/admin/export?format=csv&${exportQuery}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 bg-white px-4 text-sm text-night hover:border-night/30">
              <Download className="size-4" /> CSV
            </a>
            <a href={`/api/admin/export?format=xlsx&${exportQuery}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-night px-4 text-sm text-white hover:bg-institution">
              <Download className="size-4" /> Excel
            </a>
          </div>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <nav aria-label="Filtrer par statut" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex w-max gap-1 rounded-2xl border border-night/[0.06] bg-white/70 p-1 backdrop-blur">
          {tabs.map((tab) => {
            const active = (query.status ?? undefined) === tab.value;
            return (
              <Link
                key={tab.label}
                href={href(query, { status: tab.value, page: undefined })}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm transition",
                  active ? "bg-night text-white shadow-sm" : "text-institution hover:bg-mist hover:text-night",
                )}
              >
                <span className={cn("size-1.5 rounded-full", active ? "bg-sun" : tab.dot)} />
                {tab.label}
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/15" : "bg-mist")}>{tab.count}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <form className="rounded-2xl bg-white ring-1 ring-night/[0.07] flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
        {query.status ? <input type="hidden" name="status" value={query.status} /> : null}
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
          <input
            name="q"
            defaultValue={query.q}
            placeholder="Rechercher un nom, un e-mail, une référence, une ville…"
            className="h-11 w-full rounded-xl bg-transparent ps-10 pe-3 text-sm outline-none placeholder:text-institution/50 focus:bg-mist/50"
          />
        </label>
        <label className="relative sm:w-56">
          <SlidersHorizontal className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
          <select name="type" defaultValue={query.type ?? ""} className="h-11 w-full appearance-none rounded-xl bg-mist/60 ps-10 pe-3 text-sm text-night outline-none">
            <option value="">Tous les profils</option>
            {PARTICIPANT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.fr}</option>
            ))}
          </select>
        </label>
        <button className="h-11 rounded-xl bg-night px-5 text-sm text-white hover:bg-institution">Rechercher</button>
        {query.q || query.type ? (
          <Link href={href(query, { q: undefined, type: undefined, page: undefined })} className="h-11 content-center rounded-xl px-3 text-center text-sm text-institution hover:bg-mist">
            Effacer
          </Link>
        ) : null}
      </form>

      <RegistrationsTable
        back={back}
        isAdmin={session.user.role !== "STAFF"}
        rows={rows.map((row) => ({
          id: row.id,
          token: row.qrToken,
          reference: row.reference,
          name: `${row.firstName} ${row.lastName}`,
          email: row.email,
          phone: row.phone,
          city: row.city,
          type: labelOf(PARTICIPANT_TYPES, row.participantType, "fr"),
          organization: row.organization,
          status: row.status,
          createdAt: formatDate.format(row.createdAt),
          emailSent: row.emailSent,
          hasCv: Boolean(row.cvPath),
        }))}
      />

      {total > pageSize ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-institution">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} sur {total}
          </p>
          <div className="flex items-center gap-1">
            <PageLink to={page > 1 ? href(query, { page: String(page - 1) }) : null} label="Page précédente">
              <ChevronLeft className="size-4" />
            </PageLink>
            <span className="min-w-16 text-center tabular-nums text-night">{page} / {pages}</span>
            <PageLink to={page < pages ? href(query, { page: String(page + 1) }) : null} label="Page suivante">
              <ChevronRight className="size-4" />
            </PageLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PageLink({ to, label, children }: { to: string | null; label: string; children: React.ReactNode }) {
  const className = "grid size-9 place-items-center rounded-full border border-night/10 bg-white";
  if (!to) return <span className={cn(className, "opacity-40")} aria-hidden>{children}</span>;
  return <Link href={to} aria-label={label} className={cn(className, "hover:border-night/30")}>{children}</Link>;
}
