import { CalendarDays, Clock, Gift, Mail, MapPin, Phone, QrCode, Ticket } from "lucide-react";
import Link from "next/link";
import { HomeWhy } from "@/components/site/home-sections";
import { Icon } from "@/components/site/icons";
import { participantIcons } from "@/components/site/participant-icons";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink, Eyebrow, NightDecor, Section, SectionHeading, TextLink } from "@/components/site/ui";
import { labelOf, PARTICIPANT_TYPES, PROGRAM_CATEGORIES } from "@/lib/constants";
import { eventDateParts } from "@/lib/datetime";
import { dictionary, tx } from "@/lib/i18n";
import { placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = {
  title: "Le Forum",
  description: "Assur'Carrière, le Forum des Métiers de l'Assurance : vocation, objectifs, publics et informations pratiques.",
};
export const instant = false;

const OPPORTUNITIES = new Set(["plenary", "roundtable", "workshop", "networking"]);

export default async function ForumPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale];
  const { settings } = site;
  const about = site.sections.about;
  const paragraphs = tx(locale, about.body.fr, about.body.ar).split(/\n\n+/).filter(Boolean);
  const [lead, ...rest] = paragraphs;
  const when = eventDateParts(settings.eventDate, locale);
  const place = placeLabel(settings.venueName, settings.city) || settings.city;
  const moments = site.program.filter((item) => OPPORTUNITIES.has(item.category));
  const audiences = PARTICIPANT_TYPES.filter((type) => type.value !== "OTHER");
  const perkIcons = [Gift, Ticket, QrCode];

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Forum" kicker={tx(locale, "Assur'Carrière 2026", "Assur'Carrière 2026")} title={tx(locale, about.title.fr, about.title.ar)}>
        <Badge tone="glass">
          <CalendarDays className="size-3.5 text-sun" aria-hidden="true" />
          {when ? `${when.day} · ${place}` : copy.hero.date}
        </Badge>
        <Badge tone="glass">{copy.register.kicker}</Badge>
      </PageIntro>

      {/* Vocation */}
      <Section labelledBy="forum-vocation">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
          <div className="scroll-reveal">
            <Eyebrow>{tx(locale, "Notre vocation", "رسالتنا")}</Eyebrow>
            <h2 id="forum-vocation" className="sr-only">
              {tx(locale, "Notre vocation", "رسالتنا")}
            </h2>
            {lead ? (
              <p className="display mt-6 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.12] text-night text-balance">
                <span className="text-sun" aria-hidden="true">
                  «{" "}
                </span>
                {lead}
              </p>
            ) : null}
          </div>
          <div className="scroll-reveal grid content-end gap-5 text-lg leading-8 text-muted">
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            <p className="flex items-center gap-3 border-t border-night/10 pt-5 text-sm font-medium text-night">
              <span className="h-px w-8 bg-sun" aria-hidden="true" />
              {copy.footer.organizer}
            </p>
          </div>
        </Container>
      </Section>

      {/* Objectifs : contenus de « Pourquoi participer », administrables */}
      <div className="border-t border-night/5">
        <HomeWhy site={site} locale={locale} />
      </div>

      {/* Publics */}
      <Section tone="night" labelledBy="forum-publics">
        <NightDecor glow="start" />
        <Container>
          <SectionHeading
            id="forum-publics"
            eyebrow={tx(locale, "Publics concernés", "الفئات المعنية")}
            title={tx(locale, "Pour qui ?", "لمن؟")}
            dark
          />
          <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 sm:mt-14 sm:gap-x-5">
            {audiences.map((type, index) => {
              const TypeIcon = participantIcons[type.value];
              return (
                <li key={type.value} className="scroll-reveal flex items-center gap-3 sm:gap-5">
                  <span className="display inline-flex items-center gap-3 text-[clamp(2rem,6vw,4.8rem)] leading-[1.05] text-white">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sun text-night sm:size-14 sm:rounded-2xl">
                      <TypeIcon className="size-4 sm:size-7" aria-hidden="true" />
                    </span>
                    {tx(locale, type.fr, type.ar)}
                  </span>
                  {index < audiences.length - 1 ? (
                    <span aria-hidden="true" className="font-accent text-[clamp(2rem,6vw,4.8rem)] italic leading-none text-sun">
                      /
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="mt-10">
            <CtaLink href="/inscription">{tx(locale, "Je réserve ma place", "أحجز مقعدي")}</CtaLink>
          </div>
        </Container>
      </Section>

      {/* Opportunités */}
      {site.careers.length || moments.length ? (
        <Section labelledBy="forum-opportunites">
          <Container>
            <SectionHeading
              id="forum-opportunites"
              eyebrow={tx(locale, "Opportunités", "الفرص")}
              title={tx(locale, "Ce que tu y trouveras", "ما ستجده")}
              intro={tx(locale, site.sections.careers.body.fr, site.sections.careers.body.ar)}
            />
            <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-2 lg:gap-8">
              {site.careers.length ? (
                <div className="scroll-reveal rounded-[2rem] border border-night/10 p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">
                    {site.careers.length} {tx(locale, "métiers à explorer", "مهن للاكتشاف")}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {site.careers.map((career) => (
                      <li key={career.id}>
                        <Link
                          href={`/metiers#metier-${career.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-night/10 bg-white px-3.5 py-2 text-sm font-medium text-night transition hover:border-sun hover:bg-dawn"
                        >
                          <Icon name={career.icon} className="size-4 text-sun-ink" />
                          {tx(locale, career.title.fr, career.title.ar)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <TextLink href="/metiers">{copy.home.allCareers}</TextLink>
                  </div>
                </div>
              ) : null}
              {moments.length ? (
                <div className="scroll-reveal rounded-[2rem] bg-dawn p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{tx(locale, "Temps forts", "أبرز اللحظات")}</p>
                  <ul className="mt-5 grid gap-3">
                    {moments.map((item) => (
                      <li key={item.id} className="flex items-baseline gap-4 rounded-2xl bg-white px-4 py-3">
                        <span className="display w-14 shrink-0 tabular-nums text-night" dir="ltr">
                          {item.startTime}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-night">{tx(locale, item.title.fr, item.title.ar)}</span>
                          <span className="text-xs uppercase tracking-[0.14em] text-muted">{labelOf(PROGRAM_CATEGORIES, item.category, locale)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <TextLink href="/programme">{copy.home.fullProgram}</TextLink>
                  </div>
                </div>
              ) : null}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Informations pratiques */}
      <Section tone="dawn" labelledBy="forum-pratique">
        <Container>
          <SectionHeading id="forum-pratique" eyebrow={tx(locale, "Infos pratiques", "معلومات عملية")} title={tx(locale, "Le jour J", "يوم الحدث")} />
          <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            <PracticalCard icon={CalendarDays} label={copy.hero.when}>
              <span className="block font-semibold text-night">{when?.day ?? copy.hero.date}</span>
              {when ? (
                <span className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  <span className="capitalize">{when.weekday}</span> · {when.time}
                </span>
              ) : null}
            </PracticalCard>
            <PracticalCard icon={MapPin} label={copy.hero.where}>
              <span className="block font-semibold text-night">{place}</span>
              {settings.address ? <span className="mt-1 block text-sm text-muted">{settings.address}</span> : null}
            </PracticalCard>
            <PracticalCard icon={Ticket} label={tx(locale, "Accès", "الولوج")}>
              <ul className="grid gap-2">
                {copy.register.perks.map(([title, text], index) => {
                  const PerkIcon = perkIcons[index] ?? Ticket;
                  return (
                    <li key={title} className="flex items-start gap-2 text-sm">
                      <PerkIcon className="mt-0.5 size-4 shrink-0 text-sun-ink" aria-hidden="true" />
                      <span>
                        <span className="font-semibold text-night">{title}</span> <span className="text-muted">· {text}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </PracticalCard>
            <PracticalCard icon={Mail} label={copy.nav.contact}>
              {settings.contactEmail ? (
                <a href={`mailto:${settings.contactEmail}`} className="block break-all font-semibold text-night underline-offset-4 hover:underline">
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.contactPhone ? (
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-1.5 text-sm text-muted" dir="ltr">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {settings.contactPhone}
                </a>
              ) : null}
            </PracticalCard>
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink href="/inscription">{tx(locale, "Je réserve ma place", "أحجز مقعدي")}</CtaLink>
            <CtaLink href="/faq" variant="outline" size="lg">
              {tx(locale, "Questions fréquentes", "أسئلة متداولة")}
            </CtaLink>
          </div>
        </Container>
      </Section>
    </PublicFrame>
  );
}

function PracticalCard({ icon: CardIcon, label, children }: { icon: typeof CalendarDays; label: string; children: React.ReactNode }) {
  return (
    <li className="scroll-reveal flex flex-col gap-4 rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(11,27,58,0.35)]">
      <span className="grid size-11 place-items-center rounded-2xl bg-night text-sun">
        <CardIcon className="size-5" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{label}</span>
      <div>{children}</div>
    </li>
  );
}
