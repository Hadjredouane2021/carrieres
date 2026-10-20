import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Mentions légales" };
export const instant = false;

export default async function LegalPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="FMA" title="Mentions légales" intro="Informations d'édition du site du Forum des Métiers de l'Assurance." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-12 leading-8 text-institution md:px-6">
        <p>Le site présente le Forum des Métiers de l'Assurance, organisé par la Fédération Marocaine de l'Assurance.</p>
        <p>Directeur de la publication : la personne désignée par la Fédération. Les coordonnées de contact figurent sur la page Contact et peuvent être modifiées depuis le back-office.</p>
        <p>Hébergement : serveur Ubuntu sous la responsabilité de l'organisateur. Les journaux techniques sont conservés pour la sécurité du service.</p>
        <p>Les marques, logos officiels et visuels partenaires restent la propriété de leurs titulaires. Le monogramme affiché en l'absence de fichier officiel est un repère typographique, remplaçable par le logo fourni par la FMA.</p>
        <p>Ce texte est un modèle opérationnel. Il doit être relu par le conseil de la Fédération avant l'ouverture publique.</p>
      </article>
    </PublicFrame>
  );
}
