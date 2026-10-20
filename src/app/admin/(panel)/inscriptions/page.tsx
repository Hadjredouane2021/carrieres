import Link from "next/link";
import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { db } from "@/lib/prisma";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-night">Inscriptions</h1>
          <p className="text-institution">{total} dossier{total > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <a className="underline" href={`/api/admin/export?format=csv&${exportQuery}`}>CSV</a>
          <a className="underline" href={`/api/admin/export?format=xlsx&${exportQuery}`}>Excel</a>
        </div>
      </div>
      <Flash error={query.error} ok={query.ok} />
      <form className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-4">
        <input className="field" name="q" defaultValue={query.q} placeholder="Nom, e-mail, référence" />
        <select className="field" name="status" defaultValue={query.status ?? ""}>
          <option value="">Tous les statuts</option>
          {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.fr}</option>)}
        </select>
        <select className="field" name="type" defaultValue={query.type ?? ""}>
          <option value="">Tous les profils</option>
          {PARTICIPANT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.fr}</option>)}
        </select>
        <button className="h-11 rounded-full bg-night text-beige">Filtrer</button>
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
      <div className="flex justify-between text-sm">
        <PageLink query={query} page={page - 1} disabled={page <= 1}>Précédent</PageLink>
        <span>{page} / {pages}</span>
        <PageLink query={query} page={page + 1} disabled={page >= pages}>Suivant</PageLink>
      </div>
    </div>
  );
}

function PageLink({ query, page, disabled, children }: { query: Record<string, string | undefined>; page: number; disabled: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="text-institution/40">{children}</span>;
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.type) params.set("type", query.type);
  params.set("page", String(page));
  return <Link href={`/admin/inscriptions?${params}`}>{children}</Link>;
}
