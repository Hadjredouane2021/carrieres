import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  LayoutList,
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
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { formatEventDate } from "@/lib/datetime";
import { normalizeLayout, sectionLabel } from "@/lib/home-layout";
import { db } from "@/lib/prisma";
import { initials } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const instant = false;

const DAY = 86_400_000;

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-sky-50 text-sky-800",
  CHECKED_IN: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-zinc-100 text-zinc-600",
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
  const isAdmin = session.user.role === "ADMIN";
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
  const fill = Math.min(100, Math.round((active / capacity) * 100));
  const attendance = confirmed + present > 0 ? Math.round((present / (confirmed + present)) * 100) : 0;
  const trend = thisWeek - lastWeek;
  const eventDate = settings?.eventDate ?? null;
  const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - now) / DAY) : null;
  const layout = normalizeLayout(settings?.homeLayout);
  const firstName = (session.user.name ?? "").split(/\s+/)[0] || "équipe";
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Casablanca" }).format(new Date(now));

  const kpis = [
    {
      label: "Inscriptions",
      value: total,
      icon: Users,
      note: (
        <span className={`inline-flex items-center gap-1 ${trend >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {thisWeek} cette semaine ({trend >= 0 ? "+" : ""}{trend})
        </span>
      ),
    },
    { label: "Confirmées", value: confirmed, icon: CheckCircle2, note: <span>{cancelled} annulée{cancelled > 1 ? "s" : ""}</span> },
    { label: "Présents", value: present, icon: QrCode, note: <span>{attendance} % des inscrits valides</span> },
    {
      label: "Messages non lus",
      value: unread,
      icon: Mail,
      note: (
        <Link href="/admin/messages" className="inline-flex items-center gap-1 text-institution hover:text-night">
          Ouvrir la boîte <ArrowUpRight className="size-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <Flash error={query.error} ok={query.ok} />

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0B1B3A] via-[#123063] to-[#173D70] p-6 text-beige shadow-[0_24px_60px_-30px_rgba(11,27,58,0.6)] md:p-8">
        <div className="grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-gold/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold first-letter:uppercase">{today}</p>
            <h1 className="display mt-2 text-3xl text-white md:text-5xl">Bonjour, {firstName}</h1>
            <p className="mt-3 max-w-xl text-beige/75">
              {eventDate ? `Forum prévu le ${formatEventDate(eventDate, "fr")}.` : "La date du forum n'est pas encore fixée."}{" "}
              Les inscriptions sont {settings?.registrationOpen === false ? "fermées" : "ouvertes"}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/admin/inscriptions" className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-sm font-medium text-night hover:bg-gold-bright">
                <Users className="size-4" /> Inscriptions
              </Link>
              <Link href="/admin/checkin" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white hover:bg-white/10">
                <QrCode className="size-4" /> Pointage QR
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-beige/60">Compte à rebours</p>
              <p className="display mt-2 text-4xl text-white">
                {daysLeft === null ? "—" : daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? "Jour J" : "Terminé"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-beige/60">Remplissage</p>
              <p className="display mt-2 text-4xl text-white">{fill} %</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex justify-between text-xs text-beige/70">
                <span>{active} places prises</span>
                <span>{capacity} au total</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-label="Remplissage">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright" style={{ width: `${fill}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, note }) => (
          <article key={label} className="admin-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-institution">{label}</p>
              <span className="grid size-9 place-items-center rounded-xl bg-mist text-institution">
                <Icon className="size-4" />
              </span>
            </div>
            <p className="display mt-3 text-4xl text-night">{value}</p>
            <p className="mt-2 text-xs text-institution">{note}</p>
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

      <div className={`grid gap-4 ${isAdmin ? "xl:grid-cols-5" : ""}`}>
        <section className={`admin-card p-5 ${isAdmin ? "xl:col-span-3" : ""}`}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium text-night">Dernières inscriptions</h2>
            <Link href="/admin/inscriptions" className="inline-flex items-center gap-1 text-sm text-institution hover:text-night">
              Tout voir <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-night/[0.06]">
            {recent.map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mist to-beige text-xs font-semibold text-institution">
                  {initials(`${row.firstName} ${row.lastName}`)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-night">{row.firstName} {row.lastName}</p>
                  <p className="truncate text-xs text-institution">
                    {labelOf(PARTICIPANT_TYPES, row.participantType, "fr")} · {row.reference}
                  </p>
                </div>
                <span className={`hidden rounded-full px-2.5 py-1 text-xs sm:inline ${statusTone[row.status] ?? ""}`}>{labelOf(STATUSES, row.status, "fr")}</span>
                <span className="w-24 shrink-0 text-end text-xs text-institution">{ago(row.createdAt, now)}</span>
              </li>
            ))}
            {recent.length === 0 ? <li className="py-6 text-center text-sm text-institution">Aucune inscription pour le moment.</li> : null}
          </ul>
        </section>

        {isAdmin ? (
          <section className="admin-card p-5 xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-night">Site public</h2>
              <Link href="/admin/sections" className="inline-flex items-center gap-1 text-sm text-institution hover:text-night">
                Gérer <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <ol className="flex flex-wrap gap-1.5">
              {layout.map((item) => (
                <li key={item.key}>
                  <Link
                    href="/admin/sections"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${item.visible ? "border-night/10 text-night" : "border-dashed border-night/15 text-institution/60 line-through"}`}
                  >
                    <span className={`size-1.5 rounded-full ${item.visible ? "bg-emerald-500" : "bg-zinc-300"}`} />
                    {sectionLabel(item.key)}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { href: "/admin/sections", label: "Sections", icon: LayoutList },
                { href: "/admin/hero", label: "Hero", icon: ImageIcon },
                { href: "/admin/programme", label: "Programme", icon: CalendarDays },
                { href: "/admin/parametres", label: "Paramètres", icon: Settings },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl border border-night/[0.06] bg-mist/50 p-3 text-sm text-night transition hover:border-gold hover:bg-white">
                  <span className="grid size-8 place-items-center rounded-xl bg-white text-institution shadow-sm group-hover:text-gold">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </Link>
              ))}
              <a href="/api/admin/export?format=xlsx" className="group col-span-2 flex items-center gap-3 rounded-2xl border border-night/[0.06] bg-mist/50 p-3 text-sm text-night transition hover:border-gold hover:bg-white">
                <span className="grid size-8 place-items-center rounded-xl bg-white text-institution shadow-sm group-hover:text-gold">
                  <Download className="size-4" />
                </span>
                Exporter les inscriptions (Excel)
              </a>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
