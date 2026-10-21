import Link from "next/link";
import { connection } from "next/server";
import { DashboardCharts } from "@/components/admin/charts";
import { CircleCheck, CircleX, QrCode, Users } from "lucide-react";
import { AdminHeader, Panel } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { labelOf, PARTICIPANT_TYPES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  await requireUser(false);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);
  const [total, confirmed, present, cancelled, grouped, recent, created] = await Promise.all([
    db().registration.count(),
    db().registration.count({ where: { status: "CONFIRMED" } }),
    db().registration.count({ where: { status: "CHECKED_IN" } }),
    db().registration.count({ where: { status: "CANCELLED" } }),
    db().registration.groupBy({ by: ["participantType"], _count: { _all: true } }),
    db().registration.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db().registration.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      day: key.slice(5),
      count: created.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length,
    };
  });

  const stats = [
    ["Inscriptions", total, Users, "text-night"],
    ["Confirmées", confirmed, CircleCheck, "text-sky-700"],
    ["Présents", present, QrCode, "text-emerald-700"],
    ["Annulées", cancelled, CircleX, "text-red-700"],
  ] as const;

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Pilotage"
        title="Tableau de bord"
        description="Vue d'ensemble de l'édition 2026."
        actions={
          <>
            <Link href="/admin/checkin" className={cn(buttonVariants({ variant: "sun", size: "md" }))}>
              <QrCode className="size-4" aria-hidden="true" />
              Accueil QR
            </Link>
            <Link href="/admin/inscriptions" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Toutes les inscriptions
            </Link>
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, StatIcon, tone]) => (
          <article key={label} className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{label}</p>
              <StatIcon className={cn("size-5", tone)} aria-hidden="true" />
            </div>
            <p className="display mt-3 text-4xl tabular-nums text-night">{value.toLocaleString("fr-MA")}</p>
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
      <Panel
        title="Dernières inscriptions"
        actions={
          <Link href="/admin/inscriptions" className="text-sm font-medium text-institution underline-offset-4 hover:underline">
            Tout voir
          </Link>
        }
      >
        <ul className="divide-y divide-night/[0.07]">
          {recent.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-medium text-night">
                {row.firstName} {row.lastName}
              </span>
              <span className="flex items-center gap-3 text-muted">
                <span className="font-mono text-xs">{row.reference}</span>
                <span>{row.createdAt.toLocaleDateString("fr-MA")}</span>
              </span>
            </li>
          ))}
          {recent.length === 0 ? <li className="py-6 text-center text-muted">Aucune inscription pour le moment.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}
