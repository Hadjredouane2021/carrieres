import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { About, Why } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Le Forum" };
export const instant = false;

export default async function ForumPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro
        kicker="2026"
        title={tx(locale, site.sections.about.title.fr, site.sections.about.title.ar)}
        intro={tx(locale, site.sections.why.body.fr, site.sections.why.body.ar)}
      />
      <About site={site} locale={locale} headed={false} />
      <Why site={site} locale={locale} />
    </PublicFrame>
  );
}
