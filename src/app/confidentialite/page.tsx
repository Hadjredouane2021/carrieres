import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Confidentialité" };
export const instant = false;

export default async function PrivacyPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="Données" title="Confidentialité" intro="Ce que le Forum collecte, pourquoi, et comment le demander." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-12 leading-8 text-institution md:px-6">
        <p>L'inscription recueille l'identité, les coordonnées, le profil, les métiers d'intérêt et, si vous le joignez, un CV. Ces éléments servent à organiser votre venue, éditer votre billet et, seulement si vous l'acceptez, permettre un contact des partenaires.</p>
        <p>La base est hébergée au Maroc ou dans l'infrastructure choisie par la Fédération. Les mots de passe des comptes équipe sont hachés. Les CV ne sont pas publics : seul le personnel connecté peut les télécharger.</p>
        <p>Vous pouvez demander l'accès, la rectification ou la suppression de votre dossier en écrivant à l'adresse de contact du Forum, en indiquant votre référence d'inscription.</p>
        <p>Le formulaire de contact conserve le message pour que l'équipe puisse répondre. Un champ invisible sert à écarter les envois automatiques.</p>
        <p>Ce texte décrit le fonctionnement du site. La politique définitive doit être validée par la Fédération avant la collecte réelle.</p>
      </article>
    </PublicFrame>
  );
}
