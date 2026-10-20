import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Careers } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Métiers" };
export const instant = false;

export default async function CareersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.careers;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Métiers" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Careers site={site} locale={locale} headed={false} />
    </PublicFrame>
  );
}
