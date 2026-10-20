import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Faq } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "FAQ" };
export const instant = false;

export default async function FaqPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.faq;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="FAQ" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Faq site={site} locale={locale} headed={false} />
    </PublicFrame>
  );
}
