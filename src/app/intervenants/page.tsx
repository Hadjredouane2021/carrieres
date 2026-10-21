import { SpeakersEmpty } from "@/components/site/home-sections";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { SpeakersGallery } from "@/components/site/speakers-gallery";
import { Badge, Container, CtaLink, NightDecor } from "@/components/site/ui";
import { dictionary, tx } from "@/lib/i18n";
import { speakerCards, speakerLabels } from "@/lib/public-data";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Intervenants", description: "Les professionnels et enseignants qui interviennent au Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function SpeakersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].home;
  const section = site.sections.speakers;
  const count = site.speakers.length;

  return (
    <PublicFrame locale={locale} site={site}>
      {/* Fond nuit : l'en-tête se prolonge sans couture dans la galerie. */}
      <div className="bg-night">
        <PageIntro watermark="Intervenants" kicker={copy.lineup} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)}>
          {count ? <Badge tone="glass">{tx(locale, `${count} intervenant${count > 1 ? "s" : ""}`, `${count} متحدث`)}</Badge> : null}
        </PageIntro>
      </div>
      <section aria-label={tx(locale, section.title.fr, section.title.ar)} className="surface-dark relative isolate overflow-clip rounded-b-[2rem] bg-night pb-16 pt-6 text-white sm:pb-24 md:rounded-b-[2.75rem]">
        <NightDecor glow="start" />
        <Container>
          {count ? (
            <SpeakersGallery speakers={speakerCards(site, locale)} labels={speakerLabels(locale)} columns="lg:grid-cols-3 xl:grid-cols-4" />
          ) : (
            <SpeakersEmpty locale={locale} />
          )}
        </Container>
      </section>
      <Container className="flex flex-col items-start gap-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-20">
        <p className="display max-w-xl text-2xl leading-tight text-night sm:text-3xl">{tx(locale, "Viens les écouter et échanger avec eux.", "تعال للاستماع إليهم والتحاور معهم.")}</p>
        <CtaLink href="/inscription" className="shrink-0">
          {copy.register}
        </CtaLink>
      </Container>
    </PublicFrame>
  );
}
