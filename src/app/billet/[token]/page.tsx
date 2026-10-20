import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { labelOf, PARTICIPANT_TYPES } from "@/lib/constants";
import { formatEventDate } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { appUrl, placeLabel } from "@/lib/utils";
import { connection } from "next/server";

export const instant = false;

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  if (!/^[a-f0-9]{48}$/.test(token)) notFound();
  const row = await db().registration.findUnique({ where: { qrToken: token } });
  if (!row || row.status === "CANCELLED") notFound();
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  const qr = await QRCode.toDataURL(`${appUrl()}/admin/checkin?token=${row.qrToken}`, { margin: 1, width: 320 });
  const when = formatEventDate(settings?.eventDate ?? null, "fr") ?? "Novembre 2026 — Casablanca";

  return (
    <main className="min-h-screen bg-beige px-4 py-10">
      <article className="mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-night text-beige shadow-2xl">
        <div className="border-b border-white/10 px-8 py-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">FMA · Forum 2026</p>
          <h1 className="display mt-3 text-4xl text-white">Votre billet</h1>
          <p className="mt-2 text-gold">{row.reference}</p>
        </div>
        <div className="grid gap-6 px-8 py-8 md:grid-cols-[1fr_160px]">
          <div>
            <p className="text-3xl text-white">{row.firstName} {row.lastName}</p>
            <p className="mt-2">{labelOf(PARTICIPANT_TYPES, row.participantType, "fr")}</p>
            <p>{row.organization}</p>
            <p className="mt-4 text-sm text-gold">{when}</p>
            <p className="text-sm">{placeLabel(settings?.venueName, settings?.city) || "Casablanca"}</p>
          </div>
          {/* QR generated locally, not a remote image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code du billet ${row.reference}`} className="size-40 rounded-2xl bg-white p-2" />
        </div>
        <div className="flex flex-wrap gap-3 px-8 pb-8">
          <a className="inline-flex h-11 items-center rounded-full bg-gold px-5 font-semibold text-night" href={`/api/billet/${row.qrToken}`}>
            Télécharger le PDF
          </a>
          <Link className="inline-flex h-11 items-center rounded-full border border-white/20 px-5" href="/">
            Retour au site
          </Link>
        </div>
      </article>
    </main>
  );
}
