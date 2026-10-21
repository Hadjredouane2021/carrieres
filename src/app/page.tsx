import { Hero } from "@/components/site/hero";
import { PublicFrame } from "@/components/site/public-frame";
import { About, Careers, ContactBand, Cta, Faq, Gallery, Partners, Program, Speakers, Why } from "@/components/site/sections";
import type { HomeSectionKey } from "@/lib/home-layout";
import { tx, type Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const instant = false;

const blocks: Record<HomeSectionKey, (props: { site: SiteData; locale: Locale; index?: string }) => React.ReactNode> = {
  about: About,
  why: Why,
  careers: Careers,
  program: Program,
  speakers: Speakers,
  partners: Partners,
  faq: Faq,
  gallery: Gallery,
  cta: Cta,
  contact: ContactBand,
};

export default async function HomePage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Forum des Métiers de l'Assurance 2026",
    description: tx(locale, site.sections.about.body.fr, site.sections.about.body.ar),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    startDate: site.settings.eventDate,
    location: {
      "@type": "Place",
      name: site.settings.venueName,
      address: { "@type": "PostalAddress", addressLocality: site.settings.city, addressCountry: "MA" },
    },
    organizer: { "@type": "Organization", name: "Fédération Marocaine de l'Assurance" },
    inLanguage: locale,
  };

  return (
    <PublicFrame locale={locale} site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero site={site} locale={locale} />
      {site.settings.homeLayout
        .filter((section) => section.visible)
        .map((section, position) => {
          const Block = blocks[section.key];
          return <Block key={section.key} site={site} locale={locale} index={String(position + 1).padStart(2, "0")} />;
        })}
    </PublicFrame>
  );
}
