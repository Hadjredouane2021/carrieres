import { Hero } from "@/components/site/hero";
import { HomeCareers, HomeCta, HomeGallery, HomeLineup, HomeProgram, HomeRibbon, HomeWhy } from "@/components/site/home-sections";
import { PublicFrame } from "@/components/site/public-frame";
import { eventDateParts } from "@/lib/datetime";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const instant = false;

export default async function HomePage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const when = eventDateParts(site.settings.eventDate, locale);
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
      {/* Fond blanc : les coins arrondis du Hero s'ouvrent sur la première section. */}
      <div className="bg-white">
        <Hero site={site} locale={locale} when={when} />
        <HomeWhy site={site} locale={locale} />
        <HomeRibbon site={site} locale={locale} when={when} />
        <HomeCareers site={site} locale={locale} />
        <HomeProgram site={site} locale={locale} when={when} />
        <HomeLineup site={site} locale={locale} />
        <HomeGallery site={site} locale={locale} />
        <HomeCta site={site} locale={locale} when={when} />
      </div>
    </PublicFrame>
  );
}
