import { Hero } from "@/components/site/hero";
import { PublicFrame } from "@/components/site/public-frame";
import { About, Careers, ContactBand, Cta, Faq, Gallery, Partners, Program, Speakers, Why } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const instant = false;

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
      <About site={site} locale={locale} />
      <Why site={site} locale={locale} />
      <Careers site={site} locale={locale} />
      <Program site={site} locale={locale} />
      <Speakers site={site} locale={locale} />
      <Partners site={site} locale={locale} />
      <Faq site={site} locale={locale} />
      <Gallery site={site} locale={locale} />
      <Cta site={site} locale={locale} />
      <ContactBand site={site} locale={locale} />
    </PublicFrame>
  );
}
