import { CalendarPlus, Download, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import QRCode from "qrcode";
import { PublicFrame } from "@/components/site/public-frame";
import { PrintButton } from "@/components/site/ticket";
import { buttonVariants } from "@/components/ui/button";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { formatEventDate } from "@/lib/datetime";
import { eventCalendar } from "@/lib/ics";
import { db } from "@/lib/prisma";
import { appUrl, cn, placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Votre billet", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export const instant = false;

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  if (!/^[a-f0-9]{48}$/.test(token)) notFound();
  const row = await db().registration.findUnique({ where: { qrToken: token } });
  if (!row || row.status === "CANCELLED") notFound();
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  // Contenu du QR inchangé : lien d'accueil lu par le check-in de l'équipe.
  const qr = await QRCode.toDataURL(`${appUrl()}/admin/checkin?token=${row.qrToken}`, { margin: 1, width: 320 });
  const when = formatEventDate(settings?.eventDate ?? null, "fr") ?? "Novembre 2026 — Casablanca";
  const place = placeLabel(settings?.venueName, settings?.city) || "Casablanca";
  const calendar = eventCalendar({
    start: settings?.eventDate ?? null,
    endTime: site.program.at(-1)?.endTime,
    title: "Forum des Métiers de l'Assurance — Assur'Carrière",
    location: [place, settings?.address].filter(Boolean).join(", "),
    description: `Présente ton billet ${row.reference} et son QR code à l'entrée.`,
    url: appUrl(),
  });
  const checkedIn = row.status === "CHECKED_IN";

  return (
    <PublicFrame locale={locale} site={site}>
      <section className="surface-dark relative isolate overflow-clip bg-night pb-40 pt-32 text-white print:hidden md:pt-40">
        <div aria-hidden="true" className="absolute -top-40 end-[-10%] -z-10 size-[34rem] rounded-full bg-sun/25 blur-[120px]" />
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sun">Assur&apos;Carrière · Forum 2026</p>
          <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95]">Ton billet</h1>
          <p className="mt-3 max-w-xl text-haze">Présente le QR code à l&apos;entrée, sur ton téléphone ou imprimé. Il est personnel : ne le partage pas.</p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-28 max-w-4xl px-4 pb-20 print:mt-0 print:p-0 md:px-6">
        <article className="ticket-print overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_120px_-40px_rgba(11,27,58,0.45)] ring-1 ring-night/5 md:grid md:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="surface-dark relative isolate overflow-clip bg-night p-7 text-white sm:p-9">
            <div aria-hidden="true" className="absolute -bottom-24 -end-16 -z-10 size-64 rounded-full bg-sun/35 blur-[80px]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sun">FMA · Forum 2026</p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  checkedIn ? "bg-emerald-400 text-night" : "border border-white/20 text-white",
                )}
              >
                {labelOf(STATUSES, row.status, "fr")}
              </span>
            </div>
            <p className="display mt-10 break-words text-[clamp(2rem,5vw,3rem)] leading-[1.02]">
              {row.firstName} {row.lastName}
            </p>
            <p className="mt-3 text-white/85">{labelOf(PARTICIPANT_TYPES, row.participantType, "fr")}</p>
            {row.organization ? <p className="text-haze">{row.organization}</p> : null}
            <dl className="mt-10 grid gap-5 border-t border-dashed border-white/25 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-haze">Date</dt>
                <dd className="mt-1 font-medium first-letter:uppercase">{when}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-haze">Lieu</dt>
                <dd className="mt-1 font-medium">{place}</dd>
                {settings?.address ? <dd className="text-sm text-haze">{settings.address}</dd> : null}
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-haze">Référence</dt>
                <dd className="display mt-1 text-xl tracking-wide text-sun">{row.reference}</dd>
              </div>
            </dl>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-4 border-t-2 border-dashed border-night/15 p-7 text-center md:border-s-2 md:border-t-0">
            {/* Encoches de ticket aux deux extrémités de la ligne de perforation. */}
            <span aria-hidden="true" className="absolute -start-4 -top-4 size-8 rounded-full bg-white print:hidden" />
            <span aria-hidden="true" className="absolute -end-4 -top-4 size-8 rounded-full bg-white md:-bottom-4 md:-start-4 md:end-auto md:top-auto print:hidden" />
            {/* QR généré sur le serveur, sans image distante. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code d'accès du billet ${row.reference}`} width={224} height={224} className="size-56 rounded-2xl bg-white p-2 ring-1 ring-night/10 [image-rendering:pixelated]" />
            <p className="text-xs text-muted">À scanner à l&apos;accueil du Forum</p>
          </div>
        </article>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
          <a href={`/api/billet/${row.qrToken}`} className={cn(buttonVariants({ variant: "sun", size: "lg" }))}>
            <Download className="size-4" aria-hidden="true" />
            Télécharger le PDF
          </a>
          {calendar ? (
            <a href={calendar} download="assurcarriere-forum-2026.ics" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Ajouter au calendrier
            </a>
          ) : null}
          <PrintButton label="Imprimer" />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 print:hidden">
          <div className="flex items-start gap-3 rounded-[1.5rem] bg-dawn p-5">
            <MapPin className="mt-0.5 size-5 shrink-0 text-sun-ink" aria-hidden="true" />
            <p className="text-sm leading-6 text-night">
              <strong className="font-semibold">{place}</strong>
              {settings?.address ? <> · {settings.address}</> : null}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-night/10 p-5 text-sm leading-6 text-muted">
            Une question sur ta venue ?{" "}
            <Link href="/faq" className="font-medium text-night underline underline-offset-4">
              Consulte la FAQ
            </Link>{" "}
            ou{" "}
            <Link href="/contact" className="font-medium text-night underline underline-offset-4">
              écris à l&apos;équipe
            </Link>
            .
          </div>
        </div>
      </div>
    </PublicFrame>
  );
}
