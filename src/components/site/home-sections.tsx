import { ArrowRight, ArrowUpRight, CalendarClock, CalendarDays, Check, Handshake, UserRound } from "lucide-react";
import Link from "next/link";
import { CareersCarousel } from "@/components/site/careers-carousel";
import { Icon } from "@/components/site/icons";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PartnersGrid } from "@/components/site/partners-grid";
import { ProgramTimeline } from "@/components/site/program-timeline";
import { SpeakersGallery } from "@/components/site/speakers-gallery";
import { AccentTitle, EmptyState, Highlighted, SectionHeading, TextLink } from "@/components/site/ui";
import type { eventDateParts } from "@/lib/datetime";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import { galleryEntries } from "@/lib/gallery";
import { galleryLabels, speakerCards, speakerLabels, timelineItems, timelineLabels } from "@/lib/public-data";
import type { SiteData } from "@/lib/site-types";
import { WHY_TONES } from "@/lib/why-bento";
import { cn, placeLabel } from "@/lib/utils";

type Props = { site: SiteData; locale: Locale };
type When = ReturnType<typeof eventDateParts>;



export function HomeWhy({ site, locale }: Props) {
  const copy = dictionary[locale].home;
  const section = site.sections.why;
  const numbers = locale === "ar" ? "ar-MA" : "fr-MA";
  const facts = [
    site.settings.capacity > 0 ? [site.settings.capacity.toLocaleString(numbers), copy.facts.seats] : null,
    site.careers.length > 0 ? [String(site.careers.length), copy.facts.careers] : null,
    site.program.length > 0 ? [String(site.program.length), copy.facts.program] : null,
    [copy.facts.free, copy.facts.freeHint],
  ].filter((fact): fact is string[] => fact !== null);

  const why = { quote: site.why[0], cards: site.why.slice(1) };

  return (
    <section aria-labelledby="accueil-pourquoi" className="overflow-clip bg-cream py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          id="accueil-pourquoi"
          eyebrow={copy.why}
          title={tx(locale, section.title.fr, section.title.ar)}
          intro={tx(locale, section.body.fr, section.body.ar)}
        />

        <dl className="scroll-reveal mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 lg:grid-cols-4">
          {facts.map(([value, label], index) => (
            <div key={label} className="flex flex-col-reverse gap-2 border-t-2 border-night pt-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</dt>
              <dd className={cn("display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[0.95] tabular-nums", index === 0 ? "text-sun-ink" : "text-night")}>{value}</dd>
            </div>
          ))}
        </dl>

        {site.why.length ? (
          <div className="relative mt-12 sm:mt-16">
            {/* Décor : quadrillage et carré corail, en haut à droite. */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-14 end-0 hidden h-[26rem] w-52 md:block lg:w-60">
              <div className="absolute end-0 top-14 h-60 w-2/3 bg-[#E5636A]" />
              <div className="absolute inset-0 bg-[linear-gradient(#0B1B3A_1.5px,transparent_1.5px),linear-gradient(90deg,#0B1B3A_1.5px,transparent_1.5px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]" />
            </div>

            {why.quote ? (
              <p className="scroll-reveal font-rounded relative max-w-[46rem] text-[clamp(1.3rem,2.2vw,1.85rem)] font-extrabold leading-[1.3] text-night">
                <span className="sr-only">{tx(locale, why.quote.title.fr, why.quote.title.ar)} : </span>
                <Highlighted text={tx(locale, why.quote.body.fr, why.quote.body.ar)} />
              </p>
            ) : null}

            {why.cards.length ? (
              <ul className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                {why.cards.map((item, index) => {
                  const tone = WHY_TONES[index % WHY_TONES.length];
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "scroll-reveal flex min-h-64 flex-col rounded-[2rem] border-2 border-night p-7 shadow-[8px_8px_0_0_#0B1B3A] transition duration-300 ease-out motion-safe:hover:-translate-x-1 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[12px_12px_0_0_#0B1B3A] lg:min-h-[17rem]",
                        index % 2 ? "motion-safe:hover:rotate-1" : "motion-safe:hover:-rotate-1",
                        tone,
                      )}
                    >
                      <h3 className="font-rounded text-[clamp(1.75rem,2.4vw,2.25rem)] font-extrabold leading-[1.02] tracking-[-0.01em]">{tx(locale, item.title.fr, item.title.ar)}</h3>
                      <p className="mt-8 text-[0.95rem] leading-6 opacity-90">
                        <Highlighted text={tx(locale, item.body.fr, item.body.ar)} />
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// Ruban solaire entre deux sections : slogan, date, lieu et gratuité, tous issus des paramètres de l'événement.
export function HomeRibbon({ site, locale, when }: Props & { when: When }) {
  const copy = dictionary[locale];
  // Mentions saisies dans Paramètres → Bandeau défilant ; sinon slogan, date, ville et gratuité.
  const custom = locale === "fr" ? site.settings.ribbonItems : [];
  const items = custom.length ? custom : [
    tx(locale, site.settings.slogan.fr, site.settings.slogan.ar),
    when ? when.day : copy.hero.date,
    site.settings.city,
    copy.register.kicker,
  ].filter(Boolean);
  return (
    <div aria-hidden="true" className="relative z-10 -my-7 overflow-clip bg-[linear-gradient(to_bottom,var(--cream)_55%,transparent_55%)] py-7 sm:-my-9 sm:py-9">
      <div className="-mx-[8vw] -rotate-2 bg-sun py-4 shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--sun)_80%,transparent)] sm:py-5" dir="ltr">
        <div className="ribbon-marquee flex w-max animate-marquee [animation-duration:35s] hover:[animation-play-state:paused]">
          {[0, 1].map((round) => (
            <ul key={round} className="flex shrink-0 items-center gap-8 pe-8">
              {[...items, ...items].map((item, index) => (
                <li key={`${round}-${index}`} className="display flex items-center gap-8 whitespace-nowrap text-2xl text-night sm:text-4xl">
                  {item}
                  <span className="size-2.5 rotate-45 bg-night" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeCareers({ site, locale }: Props) {
  const copy = dictionary[locale].home;
  const section = site.sections.careers;
  const careers = site.careers.map((career) => ({
    id: career.id,
    title: tx(locale, career.title.fr, career.title.ar),
    summary: tx(locale, career.summary.fr, career.summary.ar),
    icon: career.icon,
    category: career.category,
  }));

  return (
    <section aria-labelledby="accueil-metiers" className="surface-dark relative isolate mx-2 overflow-clip rounded-[2rem] bg-night pb-14 pt-20 text-white sm:mx-3 sm:pb-20 sm:pt-28 md:rounded-[3rem] md:pb-28 md:pt-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-48 end-[-12%] size-[38rem] rounded-full bg-sun/20 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(70%_60%_at_80%_10%,#000,transparent)]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          id="accueil-metiers"
          eyebrow={copy.careers}
          title={tx(locale, section.title.fr, section.title.ar)}
          intro={tx(locale, section.body.fr, section.body.ar)}
          dark
        >
          {careers.length ? (
            <TextLink href="/metiers" dark>
              {copy.allCareers}
            </TextLink>
          ) : null}
        </SectionHeading>

        {careers.length ? (
          <CareersCarousel
            careers={careers}
            labels={
              locale === "ar"
                ? { all: "الكل", filters: "تصفية حسب المجال", register: copy.careerCta, counter: copy.careerOf, pause: "إيقاف", play: "تشغيل" }
                : { all: "Tout", filters: "Filtrer par famille de métiers", register: copy.careerCta, counter: copy.careerOf, pause: "Mettre en pause", play: "Relancer le défilement" }
            }
          />
        ) : (
          <div className="mt-8 sm:mt-12 grid place-items-center gap-4 rounded-[2rem] border border-dashed border-white/20 px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/[0.07] text-sun">
              <Icon name="compass" className="size-7" />
            </span>
            <p className="max-w-md text-lg text-haze">{copy.careersEmpty}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function EventDateChip({ site, locale, when }: Props & { when: When }) {
  const place = placeLabel(site.settings.venueName, site.settings.city) || site.settings.city;
  return (
    <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-dawn px-4 py-2 text-sm font-medium text-night">
      <CalendarDays className="size-4 text-sun-ink" aria-hidden="true" />
      {when ? (
        <>
          <span>
            <span className="capitalize">{when.weekday}</span> {when.day}
          </span>
          <span className="text-night/30" aria-hidden="true">
            ·
          </span>
          <span>{place}</span>
        </>
      ) : (
        <span>{dictionary[locale].hero.date}</span>
      )}
    </p>
  );
}

export function HomeProgram({ site, locale, when }: Props & { when: When }) {
  const copy = dictionary[locale].home;
  const section = site.sections.program;

  return (
    <section aria-labelledby="accueil-programme" className="bg-white py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          id="accueil-programme"
          eyebrow={copy.program}
          title={tx(locale, section.title.fr, section.title.ar)}
          intro={tx(locale, section.body.fr, section.body.ar)}
        >
          <EventDateChip site={site} locale={locale} when={when} />
        </SectionHeading>

        {site.program.length ? (
          <>
            <div className="mt-8 sm:mt-12 md:mt-16">
              <ProgramTimeline items={timelineItems(site, locale)} labels={timelineLabels(locale)} />
            </div>
            <div className="mt-8 sm:mt-10">
              <TextLink href="/programme">{copy.fullProgram}</TextLink>
            </div>
          </>
        ) : (
          <EmptyState
            className="mt-8 sm:mt-12 md:mt-16"
            icon={CalendarClock}
            title={copy.programEmptyTitle}
            text={copy.programEmpty}
            action={<TextLink href="/inscription">{copy.register}</TextLink>}
          />
        )}
      </div>
    </section>
  );
}

export function SpeakersEmpty({ locale }: { locale: Locale }) {
  const copy = dictionary[locale].home;
  return (
    <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-white/20 px-6 py-14 text-center sm:flex-row sm:text-start md:px-12">
      <div className="flex shrink-0 -space-x-4 rtl:space-x-reverse" aria-hidden="true">
        {[0, 1, 2].map((slot) => (
          <span key={slot} className="grid size-16 place-items-center rounded-full border border-dashed border-white/30 bg-night text-haze">
            <UserRound className="size-7" />
          </span>
        ))}
      </div>
      <div>
        <p className="display text-2xl text-white">{copy.speakersSoon}</p>
        <p className="mt-1 text-haze">{copy.speakersEmpty}</p>
      </div>
    </div>
  );
}

export function PartnersEmpty({ locale, dark = true }: { locale: Locale; dark?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center sm:flex-row sm:text-start", dark ? "border-white/20" : "border-night/15 bg-dawn/60")}>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", dark ? "bg-white/[0.07] text-sun" : "bg-white text-sun-ink")}>
        <Handshake className="size-6" aria-hidden="true" />
      </span>
      <p className={dark ? "text-haze" : "text-muted"}>{dictionary[locale].home.partnersEmpty}</p>
    </div>
  );
}

export function HomeLineup({ site, locale }: Props) {
  const copy = dictionary[locale].home;
  const speakers = site.sections.speakers;
  const partners = site.sections.partners;

  return (
    <section aria-labelledby="accueil-intervenants" className="surface-dark relative isolate mx-2 overflow-clip rounded-[2rem] bg-night py-14 text-white sm:mx-3 sm:py-20 md:rounded-[3rem] md:py-28">
      <div aria-hidden="true" className="absolute -bottom-40 start-[-10%] -z-10 size-[34rem] rounded-full bg-sun/15 blur-[130px]" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          id="accueil-intervenants"
          eyebrow={copy.lineup}
          title={tx(locale, speakers.title.fr, speakers.title.ar)}
          intro={tx(locale, speakers.body.fr, speakers.body.ar)}
          dark
        >
          {site.speakers.length ? (
            <TextLink href="/intervenants" dark>
              {copy.allSpeakers}
            </TextLink>
          ) : null}
        </SectionHeading>

        <div className="mt-8 sm:mt-12 md:mt-16">
          {site.speakers.length ? (
            <SpeakersGallery speakers={speakerCards(site, locale)} labels={speakerLabels(locale)} />
          ) : (
            <SpeakersEmpty locale={locale} />
          )}
        </div>

        <div className="mt-14 border-t border-white/10 pt-10 sm:mt-20 sm:pt-14 md:mt-24">
          <div className="scroll-reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="display text-[clamp(1.6rem,2.8vw,2.3rem)] leading-tight text-white">{tx(locale, partners.title.fr, partners.title.ar)}</h3>
              <p className="mt-3 max-w-xl whitespace-pre-line text-haze">{tx(locale, partners.body.fr, partners.body.ar)}</p>
            </div>
            <TextLink href={site.partners.length ? "/partenaires" : "/contact"} dark>
              {site.partners.length ? copy.allPartners : copy.becomePartner}
            </TextLink>
          </div>
          <div className="mt-10">
            {site.partners.length ? <PartnersGrid partners={site.partners} locale={locale} dark /> : <PartnersEmpty locale={locale} />}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeCta({ site, locale, when }: Props & { when: When }) {
  const copy = dictionary[locale];
  const section = site.sections.cta;
  const { settings } = site;
  const seats = Math.max(settings.capacity - settings.confirmedCount, 0);
  const status = !settings.registrationOpen ? "closed" : seats === 0 ? "full" : "open";
  // Le reste de places n'est affiché que lorsqu'il devient un argument (moins d'un quart de la jauge).
  const scarce = status === "open" && settings.capacity > 0 && seats <= settings.capacity / 4;
  const place = placeLabel(settings.venueName, settings.city) || settings.city;

  return (
    <section aria-labelledby="accueil-inscription" className="bg-white px-4 pb-14 pt-4 sm:pb-20 md:px-6 md:pb-28">
      {/* Couleur unie, choisie dans Admin > Couleurs (« Bloc inscription »). */}
      <div className="relative isolate mx-auto max-w-7xl overflow-clip rounded-[2rem] bg-cta px-6 [--color-white:var(--cta-fg)] py-14 text-center text-white sm:px-12 sm:py-20 md:rounded-[2.75rem]">

        <div className="scroll-reveal mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-white">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pe-4 ps-3 backdrop-blur">
              <span className={cn("size-2 rounded-full", status === "open" ? "bg-emerald-400" : "bg-sun")} aria-hidden="true" />
              {copy.hero[status]}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 backdrop-blur">
              <CalendarDays className="size-3.5 text-sun" aria-hidden="true" />
              {when ? `${when.day} · ${place}` : copy.hero.date}
            </span>
          </div>
          <h2 id="accueil-inscription" className="display mt-6 text-[clamp(2.3rem,5.6vw,4.6rem)] leading-[0.95] text-balance">
            <AccentTitle text={tx(locale, section.title.fr, section.title.ar)} dark />
          </h2>
          <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-haze sm:text-lg sm:leading-8">{tx(locale, section.body.fr, section.body.ar)}</p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {status === "open" ? (
              <Link
                href="/inscription"
                className="group/cta inline-flex h-14 w-full items-center justify-between gap-4 rounded-full bg-sun pe-2 ps-7 font-semibold text-night shadow-[0_20px_50px_-18px_color-mix(in_srgb,var(--sun)_95%,transparent)] transition hover:bg-sun-bright sm:w-auto"
              >
                {copy.home.register}
                <span className="grid size-10 place-items-center rounded-full bg-night text-sun transition-transform motion-safe:group-hover/cta:translate-x-0.5 rtl:motion-safe:group-hover/cta:-translate-x-0.5">
                  <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                </span>
              </Link>
            ) : (
              <Link
                href="/contact"
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-sun px-7 font-semibold text-night transition hover:bg-sun-bright sm:w-auto"
              >
                {copy.register.contactTeam}
              </Link>
            )}
            <Link
              href="/faq"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-7 text-white backdrop-blur transition hover:border-white/40 hover:bg-white/[0.12] sm:w-auto"
            >
              {copy.home.question}
              <ArrowUpRight className="size-4 text-sun rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/85">
            {copy.register.perks.map(([title]) => (
              <li key={title} className="inline-flex items-center gap-2">
                <Check className="size-4 text-sun" aria-hidden="true" />
                {title}
              </li>
            ))}
          </ul>
          {scarce ? (
            <p className="mt-4 text-sm text-white">
              <strong className="font-semibold">{seats.toLocaleString(locale === "ar" ? "ar-MA" : "fr-MA")}</strong> {copy.register.seats}
            </p>
          ) : null}
        </div>
      </div>

      <nav aria-label={copy.home.more} className="mx-auto mt-4 grid max-w-7xl grid-cols-2 gap-3 md:auto-cols-fr md:grid-flow-col">
        {[
          ["/forum", copy.home.links.about, copy.home.links.aboutHint],
          ["/faq", copy.nav.faq, copy.home.links.faqHint],
          ["/galerie", copy.home.gallery, copy.home.links.galleryHint],
          ["/contact", copy.nav.contact, copy.home.links.contactHint],
        ].map(([href, label, hint]) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-night/10 px-4 py-4 transition hover:border-sun/60 sm:px-5"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-night">{label}</span>
              <span className="block text-xs text-muted">{hint}</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-sun-ink transition-transform motion-safe:group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}

export function HomeGallery({ site, locale }: Props) {
  const copy = dictionary[locale].home;
  const section = site.sections.gallery;
  const items = galleryEntries(site, locale);
  if (!items.length) return null;

  return (
    <section id="galerie" aria-labelledby="accueil-galerie" className="scroll-mt-24 bg-white py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading id="accueil-galerie" eyebrow={copy.gallery} title={tx(locale, section.title.fr, section.title.ar)}>
          <TextLink href="/galerie">{copy.allGallery}</TextLink>
        </SectionHeading>
        <div className="mt-8 sm:mt-12 md:mt-16">
          <GalleryGrid items={items.slice(0, 6)} labels={galleryLabels(locale)} />
        </div>
      </div>
    </section>
  );
}
