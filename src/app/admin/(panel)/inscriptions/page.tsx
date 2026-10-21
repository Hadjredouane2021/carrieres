import Link from "next/link";
import { connection } from "next/server";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { registrationWhere } from "@/server/registration-query";

export const instant = false;
const pageSize = 15;

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await connection();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const where = registrationWhere(query);
  const [total, rows] = await Promise.all([
    db().registration.count({ where }),
    db().registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const exportQuery = new URLSearchParams();
  if (query.q) exportQuery.set("q", query.q);
  if (query.status) exportQuery.set("status", query.status);
  if (query.type) exportQuery.set("type", query.type);

  return (
    <div className="grid gap-5">
      <AdminHeader
        eyebrow="Pilotage"
        title="Inscriptions"
        description={`${total} dossier${total > 1 ? "s" : ""}${query.q || query.status || query.type ? " pour ces filtres" : ""}.`}
        actions={
          <>
            <a className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href={`/api/admin/export?format=csv&${exportQuery}`}>
              <Download className="size-4" aria-hidden="true" />
              CSV
            </a>
            <a className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href={`/api/admin/export?format=xlsx&${exportQuery}`}>
              <Download className="size-4" aria-hidden="true" />
              Excel
            </a>
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <form className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-night/[0.07] md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]" role="search">
        <label className="grid gap-1 text-xs font-medium text-muted">
          Recherche
          <input className="field" name="q" defaultValue={query.q} placeholder="Nom, e-mail, référence, ville" />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Statut
          <select className="field" name="status" defaultValue={query.status ?? ""}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.fr}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Profil
          <select className="field" name="type" defaultValue={query.type ?? ""}>
            <option value="">Tous les profils</option>
            {PARTICIPANT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.fr}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className={cn(buttonVariants({ variant: "night", size: "md" }), "w-full md:w-auto")}>Filtrer</button>
          {query.q || query.status || query.type ? (
            <Link href="/admin/inscriptions" className={cn(buttonVariants({ variant: "ghost", size: "md" }))}>
              Effacer
            </Link>
          ) : null}
        </div>
      </form>
      <RegistrationsTable
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
          createdAt: row.createdAt.toLocaleDateString("fr-MA"),
          emailSent: row.emailSent,
          hasCv: Boolean(row.cvPath),
        }))}
      />
      <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
        <PageLink query={query} page={page - 1} disabled={page <= 1}>← Précédent</PageLink>
        <span className="text-muted">Page {page} / {pages}</span>
        <PageLink query={query} page={page + 1} disabled={page >= pages}>Suivant →</PageLink>
      </nav>
    </div>
  );
}

function PageLink({ query, page, disabled, children }: { query: Record<string, string | undefined>; page: number; disabled: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="px-3 py-2 text-muted/50">{children}</span>;
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.type) params.set("type", query.type);
  params.set("page", String(page));
  return (
    <Link href={`/admin/inscriptions?${params}`} className="rounded-full px-3 py-2 font-medium text-night transition hover:bg-white">
      {children}
    </Link>
  );
}
