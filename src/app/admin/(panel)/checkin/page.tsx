import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { formatEventDate } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { checkInByToken } from "@/server/actions/admin";

export const instant = false;

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const row = query.token ? await db().registration.findUnique({ where: { qrToken: query.token } }) : null;
  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <h1 className="display text-4xl text-night">Accueil</h1>
      <p className="text-institution">Scannez le QR code ou collez le jeton du billet.</p>
      <Flash error={query.error} ok={query.ok} />
      <form className="grid gap-3 rounded-3xl bg-white p-5" action="/admin/checkin" method="get">
        <label className="grid gap-1 text-sm">
          Jeton
          <input className="field" name="token" defaultValue={query.token} required />
        </label>
        <button className="h-11 rounded-full bg-night text-beige">Rechercher</button>
      </form>
      {query.token && !row ? <p className="text-red-700">Aucun billet ne correspond.</p> : null}
      {row ? (
        <article className="rounded-3xl bg-white p-6">
          <p className="text-sm text-gold">{row.reference}</p>
          <h2 className="mt-2 text-3xl text-night">{row.firstName} {row.lastName}</h2>
          <p>{labelOf(PARTICIPANT_TYPES, row.participantType, "fr")} — {row.organization}</p>
          <p className="text-institution">{row.city} · {labelOf(STATUSES, row.status, "fr")}</p>
          {row.checkedInAt ? <p className="mt-2 text-sm">Déjà accueilli le {formatEventDate(row.checkedInAt, "fr")}</p> : null}
          {row.status !== "CANCELLED" && row.status !== "CHECKED_IN" ? (
            <form action={checkInByToken} className="mt-5">
              <input type="hidden" name="token" value={row.qrToken} />
              <button className="h-11 rounded-full bg-gold px-5 font-semibold text-night">Valider la présence</button>
            </form>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
