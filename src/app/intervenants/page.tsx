import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Speakers } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Intervenants" };
export const instant = false;

export default async function SpeakersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.speakers;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Intervenants" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Speakers site={site} locale={locale} headed={false} />
    </PublicFrame>
  );
}
