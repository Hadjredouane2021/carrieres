import { Images } from "lucide-react";
import Link from "next/link";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, EmptyState, TextLink } from "@/components/site/ui";
import { galleryEntries } from "@/lib/gallery";
import { dictionary, tx } from "@/lib/i18n";
import { galleryLabels } from "@/lib/public-data";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Galerie", description: "Photos et vidéos du Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function GalleryPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale];
  const section = site.sections.gallery;
  const items = galleryEntries(site, locale);

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Galerie"
        kicker={copy.nav.gallery}
        title={tx(locale, section.title.fr, section.title.ar)}
        intro={items.length ? tx(locale, section.body.fr, section.body.ar) : undefined}
      >
        {items.length ? <Badge tone="glass">{tx(locale, `${items.length} média${items.length > 1 ? "s" : ""}`, `${items.length} وسائط`)}</Badge> : null}
      </PageIntro>
      <Container className="py-14 sm:py-20 lg:py-24">
        {items.length ? (
          <GalleryGrid items={items} labels={galleryLabels(locale)} />
        ) : (
          <EmptyState
            icon={Images}
            title={tx(locale, "Les images arrivent après l'événement", "الصور بعد الحدث")}
            text={tx(locale, section.body.fr, section.body.ar)}
            action={<TextLink href="/inscription">{copy.home.register}</TextLink>}
          />
        )}
        <p className="mt-10 text-sm text-muted">
          {tx(locale, "Sources et licences des images de la vidéo d'accueil : ", "مصادر وتراخيص صور فيديو الصفحة الرئيسية: ")}
          <Link href="/credits" className="font-medium text-night underline underline-offset-4 hover:text-sun-ink">
            {copy.footer.credits}
          </Link>
        </p>
      </Container>
    </PublicFrame>
  );
}
