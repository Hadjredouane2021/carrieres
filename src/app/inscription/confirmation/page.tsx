import { CalendarPlus, Download, HelpCircle, MailCheck, MailWarning, QrCode, Ticket } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PublicFrame } from "@/components/site/public-frame";
import { Skyline } from "@/components/site/ui";
import { buttonVariants } from "@/components/ui/button";
import { eventDateParts } from "@/lib/datetime";
import { eventCalendar, maskEmail } from "@/lib/ics";
import { db } from "@/lib/prisma";
import { appUrl, cn, placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Inscription confirmée", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export const instant = false;

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  await connection();
  const { token } = await searchParams;
  if (!token || !/^[a-f0-9]{48}$/.test(token)) notFound();
  const row = await db().registration.findUnique({
    where: { qrToken: token },
    select: { firstName: true, email: true, reference: true, status: true, emailSent: true, qrToken: true },
  });
  if (!row || row.status === "CANCELLED") notFound();
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const { settings } = site;
  const when = eventDateParts(settings.eventDate, locale);
  const place = placeLabel(settings.venueName, settings.city) || settings.city;
  const calendar = eventCalendar({
    start: settings.eventDate ? new Date(settings.eventDate) : null,
    endTime: site.program.at(-1)?.endTime,
    title: "Forum des Métiers de l'Assurance — Assur'Carrière",
    location: [place, settings.address].filter(Boolean).join(", "),
    description: `Présente ton billet ${row.reference} et son QR code à l'entrée.`,
    url: appUrl(),
  });
  const steps = [
    [Ticket, "Garde ton billet", "Il est nominatif. Retrouve-le à tout moment depuis le lien de ton e-mail."],
    [QrCode, "Présente ton QR code", when ? `Le ${when.day} à partir de ${when.time}, ${place}.` : `Le jour J, ${place}.`],
    [HelpCircle, "Une question ?", "La FAQ répond à l'essentiel, l'équipe se charge du reste."],
  ] as const;

  return (
    <PublicFrame locale={locale} site={site}>
      <section className="surface-dark relative isolate overflow-clip rounded-b-[2rem] bg-night text-white md:rounded-b-[2.75rem]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--night)_0%,var(--night)_45%,#23264f_68%,#7d3622_90%,#c8551a_100%)]" />
          <div className="absolute inset-x-0 -bottom-[18rem] mx-auto size-[34rem] rounded-full bg-[radial-gradient(circle,#fff1dc_0%,var(--sun-bright)_22%,var(--sun)_42%,transparent_70%)] sm:-bottom-[24rem] sm:size-[46rem]" />
          <Skyline className="absolute inset-x-0 bottom-0 h-28 w-full text-night-deep sm:h-40" />
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-52 pt-32 text-center md:px-6 md:pb-64 md:pt-40">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-xs font-medium motion-safe:animate-rise">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Inscription confirmée · {row.reference}
          </span>
          <h1 className="display mt-6 text-[clamp(2.3rem,5.4vw,4.4rem)] leading-[0.97] text-balance motion-safe:animate-rise [animation-delay:0.08s]">
            C&apos;est confirmé, <span className="text-sun-sheen">{row.firstName}</span> !
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-haze motion-safe:animate-rise [animation-delay:0.16s] sm:text-lg">
            Ta place au Forum des Métiers de l&apos;Assurance est réservée. Ton billet et ton QR code d&apos;accès sont prêts.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 motion-safe:animate-rise [animation-delay:0.24s] sm:flex-row">
            <Link href={`/billet/${row.qrToken}`} className={cn(buttonVariants({ variant: "sun", size: "lg" }), "w-full sm:w-auto")}>
              <Ticket className="size-4" aria-hidden="true" />
              Voir mon billet
            </Link>
            <a href={`/api/billet/${row.qrToken}`} className={cn(buttonVariants({ variant: "glass", size: "lg" }), "w-full sm:w-auto")}>
              <Download className="size-4" aria-hidden="true" />
              Télécharger le PDF
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-5 px-4 py-14 sm:py-20 md:px-6">
        <p
          className={cn(
            "flex items-start gap-3 rounded-[1.5rem] p-5 text-sm leading-6",
            row.emailSent ? "bg-emerald-50 text-emerald-950" : "bg-dawn text-night",
          )}
          role="status"
        >
          {row.emailSent ? (
            <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <MailWarning className="mt-0.5 size-5 shrink-0 text-sun-ink" aria-hidden="true" />
          )}
          <span>
            {row.emailSent ? (
              <>
                Ton billet a été envoyé à <strong className="font-semibold">{maskEmail(row.email)}</strong>. Pense à vérifier tes courriers indésirables.
              </>
            ) : (
              <>
                L&apos;e-mail de confirmation n&apos;a pas pu être envoyé pour le moment. Ton inscription est bien enregistrée : télécharge ton billet dès
                maintenant ou garde cette page.
              </>
            )}
          </span>
        </p>

        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map(([StepIcon, title, text], index) => (
            <li key={title} className="flex flex-col gap-4 rounded-[1.75rem] border border-night/10 p-6">
              <span className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-night text-sun">
                  <StepIcon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tabular-nums text-muted">0{index + 1}</span>
              </span>
              <span className="display text-xl text-night">{title}</span>
              <span className="text-sm leading-6 text-muted">{text}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {calendar ? (
            <a href={calendar} download="assurcarriere-forum-2026.ics" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Ajouter au calendrier
            </a>
          ) : null}
          <Link href="/programme" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Découvrir le programme
          </Link>
          <Link href="/faq" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
            Questions fréquentes
          </Link>
        </div>
      </div>
    </PublicFrame>
  );
}
