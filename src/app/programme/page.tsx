import { CalendarClock, CalendarDays, MapPin } from "lucide-react";
import { ProgramTimeline } from "@/components/site/program-timeline";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink, EmptyState, TextLink } from "@/components/site/ui";
import { eventDateParts } from "@/lib/datetime";
import { dictionary, tx } from "@/lib/i18n";
import { timelineItems, timelineLabels } from "@/lib/public-data";
import { placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Programme", description: "Plénières, tables rondes, ateliers et rencontres : le déroulé du Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function ProgramPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale];
  const section = site.sections.program;
  const when = eventDateParts(site.settings.eventDate, locale);
  const place = placeLabel(site.settings.venueName, site.settings.city) || site.settings.city;
  const count = site.program.length;

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Programme" kicker={copy.home.program} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)}>
        <Badge tone="glass">
          <CalendarDays className="size-3.5 text-sun" aria-hidden="true" />
          {when ? (
            <span>
              <span className="capitalize">{when.weekday}</span> {when.day} · {when.time}
            </span>
          ) : (
            copy.hero.date
          )}
        </Badge>
        <Badge tone="glass">
          <MapPin className="size-3.5 text-sun" aria-hidden="true" />
          {place}
        </Badge>
        {count ? <Badge tone="glass">{tx(locale, `${count} rendez-vous`, `${count} موعد`)}</Badge> : null}
      </PageIntro>

      <Container className="py-14 sm:py-20 lg:py-24">
        {count ? (
          <ProgramTimeline items={timelineItems(site, locale)} labels={timelineLabels(locale)} filterable />
        ) : (
          <EmptyState
            icon={CalendarClock}
            title={copy.home.programEmptyTitle}
            text={copy.home.programEmpty}
            action={<TextLink href="/inscription">{copy.home.register}</TextLink>}
          />
        )}

        <div className="surface-dark relative isolate mt-14 flex flex-col gap-6 overflow-clip rounded-[2rem] bg-night p-7 text-white sm:mt-20 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div aria-hidden="true" className="absolute -bottom-24 end-0 -z-10 size-72 rounded-full bg-sun/30 blur-[90px]" />
          <div>
            <p className="display text-2xl leading-tight sm:text-3xl">{tx(locale, site.sections.cta.title.fr, site.sections.cta.title.ar)}</p>
            <p className="mt-2 max-w-xl text-haze">{tx(locale, site.sections.cta.body.fr, site.sections.cta.body.ar)}</p>
          </div>
          <CtaLink href="/inscription" className="shrink-0">
            {copy.home.register}
          </CtaLink>
        </div>
      </Container>
    </PublicFrame>
  );
}
