import { CircleAlert, CircleCheck, CircleX, Clock, QrCode, Search, SearchX, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminHeader } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { checkInByToken } from "@/server/actions/admin";

export const metadata = { title: "Accueil QR" };
export const instant = false;

const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });
const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ token?: string; q?: string; error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const search = query.q?.trim() ?? "";
  const [row, matches, present, expected, recent] = await Promise.all([
    query.token ? db().registration.findUnique({ where: { qrToken: query.token } }) : null,
    // Billet oublié : recherche par nom, e-mail ou référence.
    search.length >= 2
      ? db().registration.findMany({
          where: {
            OR: [{ lastName: { contains: search } }, { firstName: { contains: search } }, { email: { contains: search } }, { reference: { contains: search } }],
          },
          orderBy: { lastName: "asc" },
          take: 8,
        })
      : [],
    db().registration.count({ where: { status: "CHECKED_IN" } }),
    db().registration.count({ where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
    db().registration.findMany({ where: { status: "CHECKED_IN", checkedInAt: { not: null } }, orderBy: { checkedInAt: "desc" }, take: 8 }),
  ]);
  const rate = expected ? Math.round((present / expected) * 100) : 0;
  const lastHour = recent.filter((entry) => entry.checkedInAt && new Date().getTime() - entry.checkedInAt.getTime() < 3_600_000).length;

  const verdict = row
    ? row.status === "CANCELLED"
      ? { tone: "bg-red-600", icon: CircleX, title: "Inscription annulée", text: "Ce billet n'est plus valide : orientez la personne vers l'équipe." }
      : row.status === "CHECKED_IN" && !query.ok
        ? { tone: "bg-amber-500", icon: CircleAlert, title: "Déjà accueilli", text: row.checkedInAt ? `Entrée enregistrée le ${dateTime.format(row.checkedInAt)}.` : "Présence déjà enregistrée." }
        : row.status === "CHECKED_IN"
          ? { tone: "bg-emerald-600", icon: CircleCheck, title: "Accès validé", text: "Présence enregistrée. Bienvenue au Forum !" }
          : { tone: "bg-sun", icon: UserCheck, title: "Billet valide", text: "Vérifiez l'identité puis validez la présence." }
    : null;

  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Jour J" title="Accueil des participants" description="Scannez le QR code du billet avec l'appareil photo : il ouvre directement cette page. Billet oublié ? Cherchez la personne par son nom." />
      <Flash error={query.error} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Présents", value: String(present), icon: UserCheck },
          { label: "Attendus", value: String(expected), icon: Users },
          { label: "Taux de présence", value: `${rate} %`, icon: CircleCheck },
          { label: "Dernière heure", value: String(lastHour), icon: Clock },
        ].map(({ label, value, icon: StatIcon }) => (
          <article key={label} className="rounded-2xl bg-white p-4 ring-1 ring-night/[0.07]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted">{label}</p>
              <span className="grid size-8 place-items-center rounded-xl bg-dawn text-sun-ink">
                <StatIcon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="display mt-2 text-3xl tabular-nums text-night">{value}</p>
            {label === "Présents" ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${rate}%` }} />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-night p-5 text-white md:p-7">
            <div aria-hidden="true" className="absolute -end-20 -top-24 -z-10 size-72 rounded-full bg-sun/25 blur-3xl" />
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-sun text-night">
                <QrCode className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">Scanner ou saisir un billet</h2>
                <p className="text-sm text-haze">Le jeton figure sous le QR code du billet PDF.</p>
              </div>
            </div>
            <form className="mt-5 flex flex-col gap-2 sm:flex-row" action="/admin/checkin" method="get">
              <label className="relative flex-1">
                <span className="sr-only">Jeton du billet</span>
                <input
                  className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 px-4 font-mono text-base text-white outline-none placeholder:text-haze/60 focus:border-sun focus:bg-white/15"
                  name="token"
                  defaultValue={query.token}
                  placeholder="Jeton du billet"
                  autoFocus={!query.token && !search}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </label>
              <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-sun px-6 font-semibold text-night transition hover:bg-sun-bright">
                <QrCode className="size-5" aria-hidden="true" />
                Vérifier
              </button>
            </form>
            <form className="mt-3 flex gap-2" action="/admin/checkin" method="get">
              <label className="relative flex-1">
                <span className="sr-only">Rechercher un participant</span>
                <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-haze" aria-hidden="true" />
                <input
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] ps-10 pe-3 text-sm text-white outline-none placeholder:text-haze/60 focus:border-sun"
                  name="q"
                  defaultValue={search}
                  placeholder="Billet oublié : nom, e-mail ou référence"
                  autoComplete="off"
                />
              </label>
              <button className="h-11 rounded-xl bg-white/10 px-4 text-sm transition hover:bg-white/20">Chercher</button>
            </form>
          </section>

          {query.token && !row ? (
            <p className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-800 ring-1 ring-red-200" role="alert">
              <SearchX className="size-5 shrink-0" aria-hidden="true" />
              Aucun billet ne correspond à ce jeton.
            </p>
          ) : null}

          {row && verdict ? (
            <article className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-night/[0.07]" aria-live="polite">
              <div className={cn("flex items-center gap-4 px-6 py-5 text-white", verdict.tone, verdict.tone === "bg-sun" && "text-night")}>
                <verdict.icon className="size-10 shrink-0" aria-hidden="true" />
                <div>
                  <p className="display text-2xl md:text-3xl">{verdict.title}</p>
                  <p className={cn("text-sm", verdict.tone === "bg-sun" ? "text-night/80" : "text-white/85")}>{verdict.text}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-5 p-6">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-night text-xl font-semibold text-sun">{initials(`${row.firstName} ${row.lastName}`)}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="display truncate text-3xl text-night">
                    {row.firstName} {row.lastName}
                  </h2>
                  <p className="text-night/80">
                    {labelOf(PARTICIPANT_TYPES, row.participantType, "fr")}
                    {row.organization ? ` — ${row.organization}` : ""}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                    <span className="font-mono font-semibold text-sun-ink">{row.reference}</span>
                    <span>{row.city}</span>
                    <span>{labelOf(STATUSES, row.status, "fr")}</span>
                  </p>
                </div>
              </div>
              {row.status !== "CANCELLED" && row.status !== "CHECKED_IN" ? (
                <form action={checkInByToken} className="border-t border-night/[0.07] p-6 pt-5">
                  <input type="hidden" name="token" value={row.qrToken} />
                  <SubmitButton variant="sun" size="lg" pendingLabel="Validation…" className="h-14 w-full text-base">
                    <UserCheck className="size-5" aria-hidden="true" />
                    Valider la présence
                  </SubmitButton>
                </form>
              ) : (
                <div className="border-t border-night/[0.07] p-4">
                  <Link href="/admin/checkin" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-mist text-sm font-semibold text-night transition hover:bg-night/[0.08]">
                    <QrCode className="size-4" aria-hidden="true" />
                    Participant suivant
                  </Link>
                </div>
              )}
            </article>
          ) : null}

          {search.length >= 2 ? (
            <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-night/[0.07]">
              <p className="border-b border-night/[0.07] px-5 py-3 text-sm text-muted">
                {matches.length ? `${matches.length} résultat${matches.length > 1 ? "s" : ""} pour « ${search} »` : `Aucun participant pour « ${search} »`}
              </p>
              <ul className="divide-y divide-night/[0.06]">
                {matches.map((match) => (
                  <li key={match.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-dawn text-xs font-semibold text-sun-ink">{initials(`${match.firstName} ${match.lastName}`)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-night">
                        {match.firstName} {match.lastName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        <span className="font-mono">{match.reference}</span> · {match.email}
                      </p>
                    </div>
                    {match.status === "CHECKED_IN" ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Présent</span>
                    ) : match.status === "CANCELLED" ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">Annulée</span>
                    ) : (
                      <Link href={`/admin/checkin?token=${match.qrToken}`} className="rounded-full bg-night px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-institution">
                        Ouvrir
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="rounded-2xl bg-white ring-1 ring-night/[0.07] xl:sticky xl:top-24">
          <h2 className="flex items-center justify-between border-b border-night/[0.07] px-5 py-4 font-semibold text-night">
            Dernières arrivées
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{present} présent{present > 1 ? "s" : ""}</span>
          </h2>
          {recent.length ? (
            <ol className="divide-y divide-night/[0.06]">
              {recent.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">{initials(`${entry.firstName} ${entry.lastName}`)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-night">
                      {entry.firstName} {entry.lastName}
                    </p>
                    <p className="truncate text-xs text-muted">{labelOf(PARTICIPANT_TYPES, entry.participantType, "fr")}</p>
                  </div>
                  <span className="text-xs tabular-nums text-muted">{entry.checkedInAt ? time.format(entry.checkedInAt) : ""}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">Aucune arrivée enregistrée pour le moment.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
