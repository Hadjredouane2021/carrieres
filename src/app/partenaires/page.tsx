import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Partners } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Partenaires" };
export const instant = false;

export default async function PartnersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.partners;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Partenaires" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Partners site={site} locale={locale} headed={false} />
    </PublicFrame>
  );
}
