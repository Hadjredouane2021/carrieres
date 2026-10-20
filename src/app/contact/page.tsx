import { ContactForm } from "@/components/forms/contact-form";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { ContactBand } from "@/components/site/sections";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Contact" };
export const instant = false;

export default async function ContactPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.contact;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Contact" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
        <ContactForm locale={locale} />
        <ContactBand site={site} locale={locale} headed={false} />
      </div>
    </PublicFrame>
  );
}
