import { PrivacyContent } from "@/components/site/legal";
import { PageIntro, Prose, PublicFrame } from "@/components/site/public-frame";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Confidentialité", description: "Données collectées par le Forum, finalités et droits des participants." };
export const instant = false;

export default async function PrivacyPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Données" kicker="Données" title="Confidentialité" intro="Ce que le Forum collecte, pourquoi, et comment le demander." />
      <Prose>
        <PrivacyContent />
      </Prose>
    </PublicFrame>
  );
}
