import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Program } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Programme" };
export const instant = false;

export default async function ProgramPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.program;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Programme" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Program site={site} locale={locale} headed={false} />
    </PublicFrame>
  );
}
