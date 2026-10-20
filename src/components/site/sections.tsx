import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon } from "@/components/site/icons";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { tx, type Locale } from "@/lib/i18n";
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
      <p className="display text-4xl leading-none text-gold sm:text-6xl md:text-7xl">{index}</p>
      <div>
        <h2 className={`display text-[clamp(1.9rem,4.4vw,4.1rem)] leading-[0.95] text-balance ${light ? "text-white" : "text-night"}`}>
          {title}
        </h2>
        {intro ? (
          <p className={`mt-3 max-w-2xl text-base leading-7 sm:mt-4 sm:text-lg ${light ? "text-beige/80" : "text-institution"}`}>
            {intro}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function About({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.about;
  return (
    <section className={`mx-auto grid max-w-7xl gap-8 px-4 md:px-6 ${headed ? "py-14 sm:py-20 md:py-28" : "pb-14 pt-8 sm:pb-20"}`}>
      {headed ? <SectionHead index="01" title={tx(locale, section.title.fr, section.title.ar)} /> : null}
      <div className={headed ? "md:ps-[8.2rem]" : ""}>
        <div className="border-s-2 border-gold ps-6">
          {paragraphs(tx(locale, section.body.fr, section.body.ar)).map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mb-5 text-lg leading-8 text-institution">
              {paragraph}
            </p>
          ))}
        </div>
        <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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

export function Why({ site, locale }: { site: SiteData; locale: Locale }) {
  const section = site.sections.why;
  return (
    <section className="bg-night py-20 text-beige md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHead index="02" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {site.why.map((item, index) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between text-gold">
                <Icon name={item.icon} className="size-6" />
                <span className="text-xs tracking-[0.2em]">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-2xl text-white">{tx(locale, item.title.fr, item.title.ar)}</h3>
              <p className="mt-3 leading-7 text-beige/75">{tx(locale, item.body.fr, item.body.ar)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Careers({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.careers;
  return (
    <section className={`mx-auto max-w-7xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index="03" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
      <div className={`${headed ? "mt-12" : ""} divide-y divide-night/10 border-y border-night/10`}>
        {site.careers.map((career, index) => (
          <article key={career.id} className="grid gap-4 py-7 md:grid-cols-12 md:items-start">
            <div className="display text-gold md:col-span-1">{String(index + 1).padStart(2, "0")}</div>
            <div className="flex items-center gap-3 md:col-span-4">
              <Icon name={career.icon} className="size-5 text-institution" />
              <h3 className="text-2xl text-night">{tx(locale, career.title.fr, career.title.ar)}</h3>
            </div>
            <p className="leading-7 text-institution md:col-span-7">{tx(locale, career.summary.fr, career.summary.ar)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Program({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.program;
  return (
    <section className={`bg-mist ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {headed ? <SectionHead index="04" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
        <ol className={`relative border-s border-gold/60 ps-0 ${headed ? "mt-12" : ""}`}>
          {site.program.map((item) => (
            <li key={item.id} className="relative mb-8 ms-8 rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(11,27,58,0.04)]">
              <span className="absolute -start-[2.4rem] top-7 size-3 rounded-full bg-gold ring-4 ring-mist" />
              <div className="flex flex-wrap items-center gap-3 text-sm text-institution">
                <time className="font-semibold text-night">
                  {item.startTime} – {item.endTime}
                </time>
                <span className="rounded-full bg-beige px-3 py-1 text-xs uppercase tracking-[0.14em] text-night">
                  {labelOf(PROGRAM_CATEGORIES, item.category, locale)}
                </span>
                {item.location ? <span>{item.location}</span> : null}
              </div>
              <h3 className="mt-3 text-2xl text-night">{tx(locale, item.title.fr, item.title.ar)}</h3>
              <p className="mt-2 leading-7 text-institution">{tx(locale, item.description.fr, item.description.ar)}</p>
              {item.speakerName ? <p className="mt-3 text-sm text-night">{item.speakerName}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Speakers({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.speakers;
  return (
    <section className={`mx-auto max-w-7xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index="05" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
      <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${headed ? "mt-12" : ""}`}>
        {site.speakers.map((speaker) => {
          const photo = safeAssetUrl(speaker.photoUrl);
          return (
            <article key={speaker.id} className="overflow-hidden rounded-3xl border border-night/10 bg-white">
              <div className="flex h-48 items-end bg-gradient-to-br from-night to-institution p-6 text-beige">
                {photo ? (
                  // User-provided portraits can come from any https host.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="size-20 rounded-full object-cover ring-2 ring-gold" />
                ) : (
                  <span className="display grid size-20 place-items-center rounded-full border border-gold text-2xl text-gold">
                    {initials(speaker.name)}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl text-night">{speaker.name}</h3>
                <p className="mt-1 text-gold">{tx(locale, speaker.role.fr, speaker.role.ar)}</p>
                <p className="text-sm text-institution">{speaker.org}</p>
                <p className="mt-4 leading-7 text-institution">{tx(locale, speaker.bio.fr, speaker.bio.ar)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Partners({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.partners;
  return (
    <section className={`bg-white ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {headed ? <SectionHead index="06" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
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

export function Faq({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
  const section = site.sections.faq;
  if (site.faqs.length === 0) return null;
  return (
    <section className={`mx-auto max-w-3xl px-4 md:px-6 ${headed ? "py-20 md:py-28" : "pb-20 pt-8 md:pb-28"}`}>
      {headed ? <SectionHead index="07" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} /> : null}
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

export function Gallery({ site, locale }: { site: SiteData; locale: Locale }) {
  const section = site.sections.gallery;
  return (
    <section className="bg-night py-20 text-beige md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHead index="08" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
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

export function Cta({ site, locale }: { site: SiteData; locale: Locale }) {
  const section = site.sections.cta;
  const seats = Math.max(site.settings.capacity - site.settings.confirmedCount, 0);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="overflow-hidden rounded-[2rem] bg-night px-6 py-14 text-beige md:px-14">
        <SectionHead index="09" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} light />
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

export function ContactBand({ site, locale, headed = true }: { site: SiteData; locale: Locale; headed?: boolean }) {
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
      <SectionHead index="10" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      {details}
    </section>
  );
}
