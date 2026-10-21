import Link from "next/link";
import { Mail, MapPin, Mic, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel3D } from "@/components/site/carousel-3d";
import { Facets } from "@/components/site/facets";
import { Icon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { tx, type Locale } from "@/lib/i18n";
import { sectionTitleSize } from "@/lib/typography";
import { safeAssetUrl, vimeoId, youtubeId } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";
import { initials, placeLabel } from "@/lib/utils";

function paragraphs(value: string) {
  return value.split(/\n\n+/).filter(Boolean);
}

function SectionHead({
  index,
  title,
  intro,
  light = false,
}: {
  index: string;
  title: string;
  intro?: string;
  light?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-end sm:gap-6 md:grid-cols-[6.5rem_1fr]">
      <Reveal as="p" className="display text-4xl leading-none text-gold sm:text-6xl md:text-7xl">{index}</Reveal>
      <div>
        <Reveal as="h2" delay={0.1} className={`display text-balance ${sectionTitleSize(title)} ${light ? "text-white" : "text-night"}`}>
          {title}
        </Reveal>
        {intro ? (
          <Reveal as="p" delay={0.2} className={`mt-3 max-w-2xl text-base leading-7 sm:mt-4 sm:text-lg ${light ? "text-beige/80" : "text-institution"}`}>
            {intro}
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}

export function About({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.about;
  return (
    <section className={`mx-auto grid max-w-7xl gap-8 px-4 md:px-6 ${headed ? "py-14 sm:py-20 md:py-28" : "pb-14 pt-8 sm:pb-20"}`}>
      {headed ? <SectionHead index={index ?? "01"} title={tx(locale, section.title.fr, section.title.ar)} /> : null}
      <div className={headed ? "md:ps-[8.2rem]" : ""}>
        <div className="border-s-2 border-gold ps-6">
          {paragraphs(tx(locale, section.body.fr, section.body.ar)).map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mb-5 text-lg leading-8 text-institution">
              {paragraph}
            </p>
          ))}
        </div>
        <Facets site={site} locale={locale} />
        <dl className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            [String(site.settings.capacity), locale === "ar" ? "مقعد" : "places"],
            [String(site.careers.length || 8), locale === "ar" ? "مهن" : "métiers"],
            ["2026", "Casablanca"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/70 p-4">
              <dt className="display text-3xl text-night">{value}</dt>
              <dd className="mt-1 text-sm text-institution">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Why({ site, locale, index }: { site: SiteData; locale: Locale; index?: string }) {
  const section = site.sections.why;
  return (
    <section className="overflow-hidden bg-night py-20 text-beige md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHead index={index ?? "02"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
        <Carousel3D
          items={site.why.map((item) => ({
            id: item.id,
            title: tx(locale, item.title.fr, item.title.ar),
            body: tx(locale, item.body.fr, item.body.ar),
            icon: item.icon,
          }))}
          labels={locale === "ar" ? { previous: "السابق", next: "التالي", goTo: "الانتقال إلى" } : { previous: "Précédent", next: "Suivant", goTo: "Aller à la carte" }}
        />
      </div>
    </section>
  );
}

export function Careers({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.careers;
  return (
    <section className={`mx-auto max-w-7xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index={index ?? "03"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
      <div className={`${headed ? "mt-14" : ""} grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
        {site.careers.map((career, position) => {
          const featured = position === 0;
          const wide = position === site.careers.length - 1 && site.careers.length % 4 === 0;
          return (
            <Reveal
              key={career.id}
              delay={0.06 * position}
              className={`group relative isolate flex flex-col overflow-hidden rounded-[1.75rem] border p-6 transition-colors duration-500 ${
                featured
                  ? "border-night bg-night text-beige sm:col-span-2 lg:row-span-2 lg:p-9"
                  : "border-night/[0.07] bg-white/70 backdrop-blur-sm hover:border-gold/60 hover:bg-white hover:shadow-[0_30px_60px_-35px_rgba(11,27,58,0.45)]"
              } ${wide ? "lg:col-span-2" : ""}`}
            >
              {featured ? (
                <>
                  <div className="pointer-events-none absolute -end-24 -top-24 -z-10 size-80 rounded-full bg-gold/25 blur-3xl transition duration-700 group-hover:bg-gold/35" />
                  <div className="grain pointer-events-none absolute inset-0 -z-10 opacity-20" />
                </>
              ) : (
                <div className="pointer-events-none absolute -bottom-16 -end-16 -z-10 size-40 rounded-full bg-gold/0 blur-2xl transition duration-700 group-hover:bg-gold/20" />
              )}
              <div className="flex items-start justify-between">
                <span
                  className={`grid place-items-center rounded-2xl transition duration-500 ${
                    featured
                      ? "size-14 bg-gradient-to-br from-gold to-[#B8935A] text-night shadow-lg shadow-black/30"
                      : "size-12 bg-gradient-to-br from-mist to-beige text-institution group-hover:from-gold group-hover:to-[#B8935A] group-hover:text-night"
                  }`}
                >
                  <Icon name={career.icon} className={featured ? "size-6" : "size-5"} />
                </span>
                <span className={`display leading-none ${featured ? "text-6xl text-white/10 lg:text-8xl" : "text-4xl text-night/[0.07] transition group-hover:text-gold/40"}`}>
                  {String(position + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={featured ? "mt-auto pt-16" : "mt-auto pt-10"}>
                {featured ? <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-gold">{locale === "ar" ? "مهنة مميزة" : "Métier à la une"}</p> : null}
                <h3 className={featured ? "display text-3xl text-white lg:text-5xl" : "text-xl font-medium text-night"}>{tx(locale, career.title.fr, career.title.ar)}</h3>
                <p className={featured ? "mt-4 max-w-md text-base leading-7 text-beige/75 lg:text-lg" : "mt-2 text-sm leading-6 text-institution"}>{tx(locale, career.summary.fr, career.summary.ar)}</p>
              </div>
              <span className={`mt-6 h-px w-full origin-left scale-x-0 transition duration-700 group-hover:scale-x-100 rtl:origin-right ${featured ? "bg-gold/60" : "bg-gold"}`} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

const PROGRAM_TONES: Record<string, { dot: string; chip: string }> = {
  welcome: { dot: "bg-gold", chip: "bg-gold/15 text-[#8A6A33]" },
  plenary: { dot: "bg-sky-500", chip: "bg-sky-500/10 text-sky-800" },
  roundtable: { dot: "bg-violet-500", chip: "bg-violet-500/10 text-violet-700" },
  workshop: { dot: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-700" },
  break: { dot: "bg-zinc-400", chip: "bg-zinc-500/10 text-zinc-600" },
  networking: { dot: "bg-orange-500", chip: "bg-orange-500/10 text-orange-700" },
  closing: { dot: "bg-rose-500", chip: "bg-rose-500/10 text-rose-700" },
};

export function Program({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.program;
  const first = site.program[0];
  const last = site.program[site.program.length - 1];
  const day = site.settings.eventDate
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" }).format(new Date(site.settings.eventDate))
    : locale === "ar" ? "نونبر 2026" : "Novembre 2026";
  const categories = PROGRAM_CATEGORIES.filter((category) => site.program.some((item) => item.category === category.value));

  return (
    <section className={`relative overflow-clip bg-mist ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      <div className="pointer-events-none absolute -start-40 top-1/3 size-[32rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {headed ? <SectionHead index={index ?? "04"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
        <div className={`grid gap-8 lg:grid-cols-[20rem_1fr] lg:gap-12 ${headed ? "mt-14" : ""}`}>
          <aside className="h-fit lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-night p-7 text-beige shadow-[0_30px_60px_-30px_rgba(11,27,58,0.6)]">
              <div className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gold/25 blur-3xl" />
              <div className="grain pointer-events-none absolute inset-0 opacity-20" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold">{locale === "ar" ? "اليوم" : "La journée"}</p>
                <p className="mt-2 text-lg capitalize text-white">{day}</p>
                {first && last ? (
                  <p className="display mt-6 flex items-baseline gap-3 text-4xl text-white">
                    {first.startTime}
                    <span className="text-lg text-gold">→</span>
                    {last.endTime}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-beige/70">
                  {site.program.length} {locale === "ar" ? "محطة" : `temps fort${site.program.length > 1 ? "s" : ""}`}
                </p>
                <ul className="mt-6 grid gap-2 border-t border-white/10 pt-6 text-sm">
                  {categories.map((category) => (
                    <li key={category.value} className="flex items-center gap-2.5 text-beige/80">
                      <span className={`size-2 rounded-full ${PROGRAM_TONES[category.value]?.dot ?? "bg-gold"}`} />
                      {tx(locale, category.fr, category.ar)}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription" className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-full bg-gold text-sm font-semibold text-night transition hover:bg-gold-bright">
                  {locale === "ar" ? "احجز مقعدك" : "Réserver ma place"}
                </Link>
              </div>
            </div>
          </aside>

          <ol className="relative">
            <span aria-hidden="true" className="absolute inset-y-3 start-[5.5rem] hidden w-px bg-gradient-to-b from-gold via-institution/30 to-transparent sm:block" />
            {site.program.map((item, position) => {
              const tone = PROGRAM_TONES[item.category] ?? PROGRAM_TONES.plenary;
              return (
                <Reveal as="li" key={item.id} delay={0.05 * position} className="group relative grid gap-3 pb-5 last:pb-0 sm:grid-cols-[5.5rem_1fr] sm:gap-0">
                  <div className="flex items-baseline gap-2 sm:block sm:pe-6 sm:pt-6 sm:text-end">
                    <time className="display text-2xl text-night">{item.startTime}</time>
                    <span className="text-xs text-institution sm:mt-1 sm:block">{item.endTime}</span>
                  </div>
                  <div className="relative sm:ps-8">
                    <span aria-hidden="true" className={`absolute -start-[5px] top-8 hidden size-[11px] rounded-full ring-4 ring-mist transition group-hover:scale-125 sm:block ${tone.dot}`} />
                    <article className="rounded-3xl border border-night/[0.06] bg-white/80 p-6 shadow-[0_1px_0_rgba(11,27,58,0.04)] backdrop-blur transition duration-500 group-hover:border-gold/50 group-hover:bg-white group-hover:shadow-[0_24px_50px_-30px_rgba(11,27,58,0.4)]">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium uppercase tracking-[0.12em] ${tone.chip}`}>
                          <span className={`size-1.5 rounded-full ${tone.dot}`} />
                          {labelOf(PROGRAM_CATEGORIES, item.category, locale)}
                        </span>
                        {item.location ? (
                          <span className="inline-flex items-center gap-1 text-institution">
                            <MapPin className="size-3.5" /> {item.location}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-xl font-medium text-night md:text-2xl">{tx(locale, item.title.fr, item.title.ar)}</h3>
                      <p className="mt-2 leading-7 text-institution">{tx(locale, item.description.fr, item.description.ar)}</p>
                      {item.speakerName ? (
                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-sm text-night">
                          <Mic className="size-3.5 text-gold" /> {item.speakerName}
                        </p>
                      ) : null}
                    </article>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Speakers({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.speakers;
  return (
    <section className={`mx-auto max-w-7xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index={index ?? "05"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
      <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${headed ? "mt-14" : ""}`}>
        {site.speakers.map((speaker, position) => {
          const photo = safeAssetUrl(speaker.photoUrl);
          const angle = ["bg-gradient-to-br", "bg-gradient-to-bl", "bg-gradient-to-tr"][position % 3];
          return (
            <Reveal key={speaker.id} delay={0.06 * position} className="group relative isolate aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-night text-beige shadow-[0_30px_60px_-35px_rgba(11,27,58,0.6)]">
              {photo ? (
                // User-provided portraits can come from any https host.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105" />
              ) : (
                <div className={`absolute inset-0 -z-10 ${angle} from-night via-[#123063] to-institution`}>
                  <div className="grain absolute inset-0 opacity-25" />
                  <div className="absolute -end-20 -top-20 size-72 rounded-full border border-gold/20" />
                  <div className="absolute -end-10 -top-10 size-52 rounded-full border border-gold/10" />
                  <div className="absolute -start-16 bottom-1/3 size-56 rounded-full bg-gold/15 blur-3xl transition duration-700 group-hover:bg-gold/25" />
                  <span className="display absolute end-6 top-14 select-none text-[7.5rem] leading-none text-gold/45 transition duration-700 group-hover:text-gold/70">
                    {initials(speaker.name)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#081430] via-[#081430]/55 to-transparent" />

              <div className="flex h-full flex-col p-6">
                {speaker.org ? (
                  <span className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-md">{speaker.org}</span>
                ) : null}
                <div className="mt-auto">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">{tx(locale, speaker.role.fr, speaker.role.ar)}</p>
                  <h3 className="display mt-2 text-3xl text-white">{speaker.name}</h3>
                  <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="pt-3 text-sm leading-6 text-beige/80">{tx(locale, speaker.bio.fr, speaker.bio.ar)}</p>
                    </div>
                  </div>
                  <span className="mt-5 block h-px w-12 bg-gold transition-all duration-700 group-hover:w-full" />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function Partners({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.partners;
  return (
    <section className={`bg-white ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {headed ? <SectionHead index={index ?? "06"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
        <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${headed ? "mt-12" : ""}`}>
          {site.partners.map((partner) => {
            const logo = safeAssetUrl(partner.logoUrl);
            if (!logo) return null;
            const card = (
              <article className="flex min-h-32 items-center justify-center rounded-3xl border border-night/10 p-6 transition hover:-translate-y-0.5 hover:border-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={partner.name} className="max-h-20 max-w-full object-contain" />
              </article>
            );
            return partner.website ? (
              <a key={partner.id} href={partner.website} target="_blank" rel="noreferrer" aria-label={`Site web de ${partner.name}`}>
                {card}
              </a>
            ) : (
              <div key={partner.id}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Faq({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.faq;
  if (site.faqs.length === 0) return null;
  return (
    <section className={`mx-auto max-w-3xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index={index ?? "07"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
      <Accordion type="single" collapsible className={headed ? "mt-8" : ""}>
        {site.faqs.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{tx(locale, item.question.fr, item.question.ar)}</AccordionTrigger>
            <AccordionContent>{tx(locale, item.answer.fr, item.answer.ar)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function Gallery({ site, locale, index }: { site: SiteData; locale: Locale; index?: string }) {
  const section = site.sections.gallery;
  return (
    <section className="bg-night py-20 text-beige md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHead index={index ?? "08"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {site.gallery.map((item, index) => (
            <figure key={item.id} className="overflow-hidden rounded-3xl border border-white/10">
              <Media item={item} index={index} />
              <figcaption className="px-5 py-4 text-sm text-beige/80">{tx(locale, item.caption.fr, item.caption.ar)}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Media({ item, index }: { item: SiteData["gallery"][number]; index: number }) {
  const youtube = youtubeId(item.url);
  const vimeo = vimeoId(item.url);
  if (item.type === "VIDEO" && youtube) {
    return (
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${youtube}`}
        title={item.caption.fr}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (item.type === "VIDEO" && vimeo) {
    return <iframe className="aspect-video w-full" src={`https://player.vimeo.com/video/${vimeo}`} title={item.caption.fr} allowFullScreen />;
  }
  const image = item.type === "IMAGE" ? safeAssetUrl(item.url) : null;
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={item.caption.fr} className="aspect-[16/10] w-full object-cover" />;
  }
  const plates = ["from-[#173D70] to-[#0B1B3A]", "from-[#D8B57A] to-[#173D70]", "from-[#0B1B3A] to-[#D8B57A]", "from-[#F3E9DC] to-[#173D70]"];
  return <div className={`aspect-[16/10] bg-gradient-to-br ${plates[index % plates.length]}`} />;
}

export function Cta({ site, locale, index }: { site: SiteData; locale: Locale; index?: string }) {
  const section = site.sections.cta;
  const seats = Math.max(site.settings.capacity - site.settings.confirmedCount, 0);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="overflow-hidden rounded-[2rem] bg-night px-6 py-14 text-beige md:px-14">
        <SectionHead index={index ?? "09"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
        <p className="mt-6 text-sm text-gold">
          {locale === "ar" ? `${seats} مقعداً متبقياً` : `${seats} places encore ouvertes`}
        </p>
        <Link href="/inscription" className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-7 font-semibold text-night hover:bg-gold-bright">
          {locale === "ar" ? "أشارك" : "Je participe"}
        </Link>
      </div>
    </section>
  );
}

export function ContactBand({ site, locale, index, headed = true }: { site: SiteData; locale: Locale; index?: string; headed?: boolean }) {
  const section = site.sections.contact;
  const { settings } = site;
  const socials = [
    [settings.linkedin, "LinkedIn"],
    [settings.instagram, "Instagram"],
    [settings.facebook, "Facebook"],
    [settings.youtube, "YouTube"],
  ] as const;
  const details = (
      <div className="grid h-fit gap-3 rounded-3xl bg-white p-6">
        <p className="flex items-center gap-3"><MapPin className="size-4 text-gold" /> {placeLabel(settings.venueName, settings.city)}</p>
        {settings.address ? <p className="ps-7 text-institution">{settings.address}</p> : null}
        {settings.contactEmail ? (
          <a className="flex items-center gap-3 hover:text-institution" href={`mailto:${settings.contactEmail}`}>
            <Mail className="size-4 text-gold" /> {settings.contactEmail}
          </a>
        ) : null}
        {settings.contactPhone ? (
          <a className="flex items-center gap-3" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
            <Phone className="size-4 text-gold" /> {settings.contactPhone}
          </a>
        ) : null}
        <div className="flex gap-3 pt-2">
          {socials.filter(([href]) => href).map(([href, label]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-night/10 px-3 py-2 text-sm hover:border-gold">
              {label}
            </a>
          ))}
        </div>
      </div>
  );
  if (!headed) return details;
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
      <SectionHead index={index ?? "10"} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      {details}
    </section>
  );
}
