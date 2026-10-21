import { Handshake } from "lucide-react";
import { PartnersEmpty } from "@/components/site/home-sections";
import { PartnersGrid } from "@/components/site/partners-grid";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink } from "@/components/site/ui";
import { dictionary, tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Partenaires", description: "Compagnies, courtiers, écoles et médias partenaires du Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function PartnersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale];
  const section = site.sections.partners;
  const count = site.partners.length;

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Partenaires" kicker={copy.nav.partners} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)}>
        {count ? <Badge tone="glass">{tx(locale, `${count} partenaire${count > 1 ? "s" : ""}`, `${count} شريك`)}</Badge> : null}
      </PageIntro>
      <Container className="py-14 sm:py-20 lg:py-24">
        {count ? <PartnersGrid partners={site.partners} locale={locale} grouped /> : <PartnersEmpty locale={locale} dark={false} />}
        <p className="mt-10 text-sm text-muted">{copy.footer.organizer}.</p>

        <div className="surface-dark relative isolate mt-14 flex flex-col gap-6 overflow-clip rounded-[2rem] bg-night p-7 text-white sm:mt-20 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div aria-hidden="true" className="absolute -bottom-24 end-0 -z-10 size-72 rounded-full bg-sun/30 blur-[90px]" />
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun text-night">
              <Handshake className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="display text-2xl leading-tight sm:text-3xl">{copy.home.becomePartner}</p>
              <p className="mt-2 max-w-xl text-haze">{tx(locale, site.sections.contact.body.fr, site.sections.contact.body.ar)}</p>
            </div>
          </div>
          <CtaLink href="/contact" variant="light" size="lg" className="shrink-0">
            {copy.register.contactTeam}
          </CtaLink>
        </div>
      </Container>
    </PublicFrame>
  );
}
