import { CircleCheck, QrCode, SearchX } from "lucide-react";
import { connection } from "next/server";
import { AdminHeader, Panel } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { formatEventDate } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { checkInByToken } from "@/server/actions/admin";

export const instant = false;

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const row = query.token ? await db().registration.findUnique({ where: { qrToken: query.token } }) : null;
  const canCheckIn = row && row.status !== "CANCELLED" && row.status !== "CHECKED_IN";
  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <AdminHeader eyebrow="Jour J" title="Accueil des participants" description="Scannez le QR code du billet avec l'appareil photo : il ouvre cette page. Vous pouvez aussi coller le jeton." />
      <Flash error={query.error} ok={query.ok} />
      <Panel>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/checkin" method="get">
          <label className="grid flex-1 gap-1.5 text-sm">
            <span className="font-medium text-night">Jeton du billet</span>
            <input className="field font-mono text-sm" name="token" defaultValue={query.token} autoFocus={!query.token} autoComplete="off" spellCheck={false} required />
          </label>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-institution">
            <QrCode className="size-4" aria-hidden="true" />
            Rechercher
          </button>
        </form>
      </Panel>
      {query.token && !row ? (
        <p className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800" role="alert">
          <SearchX className="size-5 shrink-0" aria-hidden="true" />
          Aucun billet ne correspond à ce jeton.
        </p>
      ) : null}
      {row ? (
        <article
          className={cn(
            "rounded-2xl bg-white p-6 ring-2",
            row.status === "CHECKED_IN" ? "ring-emerald-300" : row.status === "CANCELLED" ? "ring-red-300" : "ring-sun/60",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm font-semibold text-sun-ink">{row.reference}</p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                row.status === "CHECKED_IN" ? "bg-emerald-50 text-emerald-800" : row.status === "CANCELLED" ? "bg-red-50 text-red-800" : "bg-sun/15 text-sun-ink",
              )}
            >
              {labelOf(STATUSES, row.status, "fr")}
            </span>
          </div>
          <h2 className="display mt-3 text-3xl text-night">
            {row.firstName} {row.lastName}
          </h2>
          <p className="mt-1 text-night/80">
            {labelOf(PARTICIPANT_TYPES, row.participantType, "fr")} — {row.organization}
          </p>
          <p className="text-sm text-muted">{row.city}</p>
          {row.checkedInAt ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <CircleCheck className="size-4" aria-hidden="true" />
              Déjà accueilli le {formatEventDate(row.checkedInAt, "fr")}
            </p>
          ) : null}
          {canCheckIn ? (
            <form action={checkInByToken} className="mt-5">
              <input type="hidden" name="token" value={row.qrToken} />
              <SubmitButton variant="sun" size="lg" pendingLabel="Validation…" className="w-full sm:w-auto">
                Valider la présence
              </SubmitButton>
            </form>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
