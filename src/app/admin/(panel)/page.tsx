import Link from "next/link";
import { connection } from "next/server";
import { DashboardCharts } from "@/components/admin/charts";
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTICIPANT_TYPES } from "@/lib/constants";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { saveHeroImage } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const session = await requireUser(false);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);
  const [total, confirmed, present, cancelled, grouped, recent, created, settings] = await Promise.all([
    db().registration.count(),
    db().registration.count({ where: { status: "CONFIRMED" } }),
    db().registration.count({ where: { status: "CHECKED_IN" } }),
    db().registration.count({ where: { status: "CANCELLED" } }),
    db().registration.groupBy({ by: ["participantType"], _count: { _all: true } }),
    db().registration.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db().registration.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db().eventSettings.findUnique({ where: { id: "main" } }),
  ]);
  const heroImage = safeAssetUrl(settings?.heroImage ?? "");
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      day: key.slice(5),
      count: created.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length,
    };
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="display text-4xl text-night">Tableau de bord</h1>
        <p className="text-institution">Vue d'ensemble de l'édition 2026.</p>
      </div>
      <Flash error={query.error} ok={query.ok} />
      {session.user.role === "ADMIN" ? (
        <section className="rounded-3xl bg-white p-5">
          <h2 className="text-lg text-night">Photo du hero</h2>
          <p className="mt-1 text-sm text-institution">JPG, PNG ou WebP, 16 Mo maximum. L'image est recadrée en pleine largeur, sans être étirée. Un voile bleu nuit garde le titre lisible.</p>
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Aperçu du hero" className="mt-4 h-40 w-full rounded-2xl object-cover" />
          ) : (
            <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-sm text-institution">Illustration par défaut, tant qu'aucune photo n'est déposée.</p>
          )}
          <form action={saveHeroImage} className="mt-4 grid gap-3">
            <input className="field" type="file" name="file" accept="image/jpeg,image/png,image/webp" />
            {heroImage ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="remove" /> Revenir à l'illustration
              </label>
            ) : null}
            <button className="h-11 w-fit rounded-full bg-night px-6 text-beige">Mettre à jour la photo</button>
          </form>
        </section>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Inscriptions", total],
          ["Confirmées", confirmed],
          ["Présents", present],
          ["Annulées", cancelled],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-institution">{label}</p>
            <p className="display mt-2 text-4xl text-night">{value}</p>
          </article>
        ))}
      </div>
      <DashboardCharts
        days={days}
        types={grouped.map((item) => ({
          name: labelOf(PARTICIPANT_TYPES, item.participantType, "fr"),
          count: item._count._all,
        }))}
      />
      <section className="rounded-3xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg text-night">Dernières inscriptions</h2>
          <Link href="/admin/inscriptions" className="text-sm text-institution">Tout voir</Link>
        </div>
        <ul className="divide-y divide-night/10">
          {recent.map((row) => (
            <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <span>{row.firstName} {row.lastName}</span>
              <span className="text-institution">{row.reference}</span>
            </li>
          ))}
          {recent.length === 0 ? <li className="py-4 text-institution">Aucune inscription pour le moment.</li> : null}
        </ul>
      </section>
    </div>
  );
}
