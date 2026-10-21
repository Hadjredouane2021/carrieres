import { LegalContent } from "@/components/site/legal";
import { PageIntro, Prose, PublicFrame } from "@/components/site/public-frame";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Mentions légales", description: "Informations d'édition du site Assur'Carrière." };
export const instant = false;

export default async function LegalPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="FMA" kicker="FMA" title="Mentions légales" intro="Informations d'édition du site du Forum des Métiers de l'Assurance." />
      <Prose>
        <LegalContent />
      </Prose>
    </PublicFrame>
  );
}
