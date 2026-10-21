import { ArrowRight, ArrowUpRight, CalendarClock, CalendarDays, Check, Handshake, UserRound } from "lucide-react";
import Link from "next/link";
import { CareersExplorer } from "@/components/site/careers-explorer";
import { Icon } from "@/components/site/icons";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PartnersGrid } from "@/components/site/partners-grid";
import { ProgramTimeline } from "@/components/site/program-timeline";
import { SpeakersGallery } from "@/components/site/speakers-gallery";
import { AccentTitle, EmptyState, SectionHeading, Skyline, TextLink } from "@/components/site/ui";
import type { eventDateParts } from "@/lib/datetime";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import { galleryEntries } from "@/lib/gallery";
import { galleryLabels, speakerCards, speakerLabels, timelineItems, timelineLabels } from "@/lib/public-data";
import type { SiteData } from "@/lib/site-types";
import { cn, placeLabel } from "@/lib/utils";

type Props = { site: SiteData; locale: Locale };
type When = ReturnType<typeof eventDateParts>;


// Composition éditoriale : une grande carte nuit, des cartes larges et compactes, une carte solaire.
const BENTO = [
  { span: "sm:col-span-2 lg:col-span-2 lg:row-span-2", tone: "night", featured: true },
  { span: "lg:col-span-2", tone: "light", featured: false },
  { span: "", tone: "dawn", featured: false },
  { span: "", tone: "light", featured: false },
  { span: "lg:col-span-2", tone: "sun", featured: false },
  { span: "sm:col-span-2 lg:col-span-2", tone: "outline", featured: false },
] as const;

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

  return (
    <section aria-labelledby="accueil-pourquoi" className="bg-white py-14 sm:py-20 md:py-28">
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
              <dd className={cn("display text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] tabular-nums", index === 0 ? "text-sun-ink" : "text-night")}>{value}</dd>
            </div>
          ))}
        </dl>

        {site.why.length ? (
          <ul className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4 lg:grid-flow-dense lg:grid-cols-4">
            {site.why.map((item, index) => {
              const layout = BENTO[index % BENTO.length];
              const dark = layout.tone === "night";
              const sun = layout.tone === "sun";
              return (
                <li
                  key={item.id}
                  className={cn(
                    "scroll-reveal group relative isolate flex flex-col overflow-hidden rounded-[1.75rem] p-6 transition duration-300 motion-safe:hover:-translate-y-1 sm:p-7",
                    layout.span,
                    dark && "surface-dark bg-night text-white lg:p-10",
                    sun && "bg-sun text-night",
                    layout.tone === "dawn" && "bg-dawn text-night",
                    layout.tone === "light" && "bg-mist text-night",
                    layout.tone === "outline" && "border-2 border-night text-night",
                  )}
                >
                  {dark ? (
                    <>
                      <span aria-hidden="true" className="absolute -bottom-32 -end-24 -z-10 size-80 rounded-full bg-sun/40 blur-[80px]" />
                      <span aria-hidden="true" className="display text-outline pointer-events-none absolute -end-4 -top-8 -z-10 text-[13rem] leading-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid place-items-center rounded-2xl",
                        layout.featured ? "size-14" : "size-11",
                        dark && "bg-sun text-night",
                        sun && "bg-night text-sun",
                        !dark && !sun && "bg-white text-sun-ink shadow-sm",
                      )}
                    >
                      <Icon name={item.icon} className={layout.featured ? "size-7" : "size-5"} />
                    </span>
                    {!dark ? (
                      <span className={cn("text-xs font-semibold tabular-nums tracking-[0.2em]", sun ? "text-night/70" : "text-muted")}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    ) : null}
                  </div>
                  <h3 className={cn("display mt-auto leading-[1.02]", layout.featured ? "pt-16 text-[clamp(2rem,3.6vw,3.2rem)]" : "pt-8 text-2xl")}>
                    {tx(locale, item.title.fr, item.title.ar)}
                  </h3>
                  <p className={cn("mt-3 leading-7", layout.featured && "max-w-md text-lg", dark ? "text-haze" : sun ? "text-night/80" : "text-muted")}>
                    {tx(locale, item.body.fr, item.body.ar)}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

// Ruban solaire entre deux sections : slogan, date, lieu et gratuité, tous issus des paramètres de l'événement.
export function HomeRibbon({ site, locale, when }: Props & { when: When }) {
  const copy = dictionary[locale];
  const items = [
    tx(locale, site.settings.slogan.fr, site.settings.slogan.ar),
    when ? when.day : copy.hero.date,
    site.settings.city,
    copy.register.kicker,
  ].filter(Boolean);
  return (
    <div aria-hidden="true" className="relative z-10 -my-7 overflow-clip py-7 sm:-my-9 sm:py-9">
      <div className="-mx-4 -rotate-2 bg-sun py-4 shadow-[0_24px_60px_-24px_rgba(255,122,26,0.8)] sm:py-5" dir="ltr">
        <div className="flex w-max animate-marquee [animation-duration:60s]">
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
          <CareersExplorer
            careers={careers}
            labels={{ list: copy.careersList, counter: copy.careerOf, register: copy.careerCta }}
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
              <h3 className="display text-[clamp(1.8rem,3.4vw,2.75rem)] leading-tight text-white">{tx(locale, partners.title.fr, partners.title.ar)}</h3>
              <p className="mt-3 max-w-xl text-haze">{tx(locale, partners.body.fr, partners.body.ar)}</p>
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
      <div className="relative isolate mx-auto max-w-7xl overflow-clip rounded-[2rem] bg-night px-6 pb-52 pt-14 text-center text-white sm:px-12 sm:pb-64 sm:pt-20 md:rounded-[2.75rem]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--night)_0%,var(--night)_48%,#23264f_68%,#7d3622_88%,#c8551a_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-[16rem] -z-10 mx-auto size-[28rem] rounded-full bg-[radial-gradient(circle,#fff1dc_0%,var(--sun-bright)_22%,var(--sun)_42%,transparent_70%)] sm:-bottom-[26rem] sm:size-[44rem]"
        />
        <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-night-deep sm:h-48" />

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
          <h2 id="accueil-inscription" className="display mt-6 text-[clamp(2.8rem,8vw,6.4rem)] leading-[0.9] text-balance">
            <AccentTitle text={tx(locale, section.title.fr, section.title.ar)} dark />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-haze sm:text-lg sm:leading-8">{tx(locale, section.body.fr, section.body.ar)}</p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {status === "open" ? (
              <Link
                href="/inscription"
                className="group/cta inline-flex h-14 w-full items-center justify-between gap-4 rounded-full bg-sun pe-2 ps-7 font-semibold text-night shadow-[0_20px_50px_-18px_rgba(255,122,26,0.95)] transition hover:bg-sun-bright sm:w-auto"
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
