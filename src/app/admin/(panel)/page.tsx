import {
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  Download,
  ImageIcon,
  Mail,
  QrCode,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { DashboardCharts } from "@/components/admin/charts";
import { Panel } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { eventDateParts } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { cn, initials, placeLabel } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const instant = false;

const DAY = 86_400_000;

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-sky-50 text-sky-800",
  CHECKED_IN: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-night/[0.06] text-muted",
};

function ago(date: Date, now: number) {
  const minutes = Math.round((date.getTime() - now) / 60_000);
  const format = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return format.format(minutes, "minute");
  if (Math.abs(minutes) < 1440) return format.format(Math.round(minutes / 60), "hour");
  return format.format(Math.round(minutes / 1440), "day");
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const session = await requireUser(false);
  const isAdmin = session.user.role !== "STAFF";
  const now = new Date().getTime();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);
  const weekAgo = new Date(now - 7 * DAY);
  const twoWeeksAgo = new Date(now - 14 * DAY);

  const [total, confirmed, present, cancelled, grouped, recent, created, settings, unread, thisWeek, lastWeek] = await Promise.all([
    db().registration.count(),
    db().registration.count({ where: { status: "CONFIRMED" } }),
    db().registration.count({ where: { status: "CHECKED_IN" } }),
    db().registration.count({ where: { status: "CANCELLED" } }),
    db().registration.groupBy({ by: ["participantType"], _count: { _all: true } }),
    db().registration.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db().registration.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().contactMessage.count({ where: { read: false } }),
    db().registration.count({ where: { createdAt: { gte: weekAgo } } }),
    db().registration.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
  ]);

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      day: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
      count: created.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length,
    };
  });

  const active = total - cancelled;
  const capacity = settings?.capacity ?? 1500;
  const fill = Math.min(100, Math.round((active / Math.max(capacity, 1)) * 100));
  const attendance = confirmed + present > 0 ? Math.round((present / (confirmed + present)) * 100) : 0;
  const trend = thisWeek - lastWeek;
  const when = eventDateParts(settings?.eventDate?.toISOString() ?? null, "fr");
  const daysLeft = settings?.eventDate ? Math.ceil((settings.eventDate.getTime() - now) / DAY) : null;
  const firstName = (session.user.name ?? "").split(/\s+/)[0] || "l'équipe";
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Casablanca" }).format(new Date(now));
  const open = settings?.registrationOpen ?? true;

  const kpis = [
    {
      label: "Inscriptions",
      value: total,
      icon: Users,
      note: (
        <span className={cn("inline-flex items-center gap-1", trend >= 0 ? "text-emerald-700" : "text-red-700")}>
          {trend >= 0 ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
          {thisWeek} cette semaine ({trend >= 0 ? "+" : ""}
          {trend})
        </span>
      ),
    },
    { label: "Confirmées", value: confirmed, icon: CircleCheck, note: <span>{cancelled} annulée{cancelled > 1 ? "s" : ""}</span> },
    { label: "Présents", value: present, icon: QrCode, note: <span>{attendance} % des inscrits valides</span> },
    {
      label: "Messages non lus",
      value: unread,
      icon: Mail,
      note: (
        <Link href="/admin/messages" className="inline-flex items-center gap-1 text-institution hover:text-night">
          Ouvrir la boîte <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  const shortcuts = [
    { href: "/admin/hero", label: "Hero", icon: ImageIcon },
    { href: "/admin/programme", label: "Programme", icon: CalendarClock },
    { href: "/admin/parametres", label: "Paramètres", icon: Settings },
    { href: "/admin/messages", label: "Messages", icon: Mail },
  ];

  return (
    <div className="grid gap-6">
      <Flash error={query.error} ok={query.ok} />

      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-night p-6 text-white shadow-[0_24px_60px_-30px_rgba(11,27,58,0.6)] md:p-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,#173D70_0%,#0B1B3A_55%,#071226_100%)]" />
        <div aria-hidden="true" className="absolute -bottom-32 -end-20 -z-10 size-96 rounded-full bg-sun/30 blur-[100px]" />
        <div aria-hidden="true" className="noise absolute inset-0 -z-10 opacity-[0.12]" />
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sun first-letter:uppercase">{today}</p>
            <h1 className="display mt-2 text-3xl md:text-5xl">Bonjour, {firstName}</h1>
            <p className="mt-3 max-w-xl text-haze">
              {when ? `Forum prévu le ${when.weekday} ${when.day} à ${when.time}` : "La date du forum n'est pas encore fixée"}
              {settings ? ` — ${placeLabel(settings.venueName, settings.city)}` : ""}. Les inscriptions sont {open ? "ouvertes" : "fermées"}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/admin/checkin" className={cn(buttonVariants({ variant: "sun", size: "md" }))}>
                <QrCode className="size-4" aria-hidden="true" />
                Accueil QR
              </Link>
              <Link href="/admin/inscriptions" className={cn(buttonVariants({ variant: "light", size: "md" }), "bg-white/10 text-white hover:bg-white/20")}>
                <Users className="size-4" aria-hidden="true" />
                Toutes les inscriptions
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-haze">Compte à rebours</p>
              <p className="display mt-2 text-4xl">{daysLeft === null ? "—" : daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? "Jour J" : "Terminé"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-haze">Remplissage</p>
              <p className="display mt-2 text-4xl tabular-nums">{fill} %</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex justify-between text-xs text-haze">
                <span>{active} places prises</span>
                <span>{capacity} au total</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-label="Remplissage">
                <div className="h-full rounded-full bg-gradient-to-r from-sun to-sun-bright" style={{ width: `${Math.max(fill, 2)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: KpiIcon, note }) => (
          <article key={label} className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{label}</p>
              <span className="grid size-9 place-items-center rounded-xl bg-dawn text-sun-ink">
                <KpiIcon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="display mt-3 text-4xl tabular-nums text-night">{value.toLocaleString("fr-MA")}</p>
            <p className="mt-2 text-xs text-muted">{note}</p>
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

      <div className={cn("grid gap-4", isAdmin && "xl:grid-cols-5")}>
        <Panel
          title="Dernières inscriptions"
          className={cn(isAdmin && "xl:col-span-3")}
          actions={
            <Link href="/admin/inscriptions" className="inline-flex items-center gap-1 text-sm font-medium text-institution hover:text-night">
              Tout voir <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          <ul className="divide-y divide-night/[0.06]">
            {recent.map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-dawn text-xs font-semibold text-sun-ink">{initials(`${row.firstName} ${row.lastName}`)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-night">
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {labelOf(PARTICIPANT_TYPES, row.participantType, "fr")} · <span className="font-mono">{row.reference}</span>
                  </p>
                </div>
                <span className={cn("hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline", statusTone[row.status])}>{labelOf(STATUSES, row.status, "fr")}</span>
                <span className="w-24 shrink-0 text-end text-xs text-muted">{ago(row.createdAt, now)}</span>
              </li>
            ))}
            {recent.length === 0 ? <li className="py-6 text-center text-sm text-muted">Aucune inscription pour le moment.</li> : null}
          </ul>
        </Panel>

        {isAdmin ? (
          <Panel title="Raccourcis" className="xl:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map(({ href, label, icon: ShortcutIcon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl bg-mist/60 p-3 text-sm text-night ring-1 ring-transparent transition hover:bg-white hover:ring-night/10">
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-sun-ink shadow-sm transition group-hover:bg-sun group-hover:text-night">
                    <ShortcutIcon className="size-4" aria-hidden="true" />
                  </span>
                  {label}
                  {label === "Messages" && unread ? <span className="ms-auto rounded-full bg-sun px-1.5 text-xs font-semibold text-night">{unread}</span> : null}
                </Link>
              ))}
              <a href="/api/admin/export?format=xlsx" className="group col-span-2 flex items-center gap-3 rounded-2xl bg-night p-3 text-sm text-white transition hover:bg-institution">
                <span className="grid size-9 place-items-center rounded-xl bg-sun text-night">
                  <Download className="size-4" aria-hidden="true" />
                </span>
                Exporter les inscriptions (Excel)
              </a>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
