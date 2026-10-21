import { Info } from "lucide-react";

// Textes juridiques en attente de validation par la Fédération : reproduits sans modification.

export function DraftNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl border border-sun/30 bg-dawn px-5 py-4 text-sm leading-6 text-night">
      <Info className="mt-0.5 size-4 shrink-0 text-sun-ink" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function PrivacyContent() {
  return (
    <>
      <p>
        L&apos;inscription recueille l&apos;identité, les coordonnées, le profil, les métiers d&apos;intérêt et, si vous le joignez, un CV. Ces éléments servent à
        organiser votre venue, éditer votre billet et, seulement si vous l&apos;acceptez, permettre un contact des partenaires.
      </p>
      <p>
        La base est hébergée au Maroc ou dans l&apos;infrastructure choisie par la Fédération. Les mots de passe des comptes équipe sont hachés. Les CV ne sont
        pas publics : seul le personnel connecté peut les télécharger.
      </p>
      <p>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de votre dossier en écrivant à l&apos;adresse de contact du Forum, en indiquant votre
        référence d&apos;inscription.
      </p>
      <p>Le formulaire de contact conserve le message pour que l&apos;équipe puisse répondre. Un champ invisible sert à écarter les envois automatiques.</p>
      <DraftNotice>Ce texte décrit le fonctionnement du site. La politique définitive doit être validée par la Fédération avant la collecte réelle.</DraftNotice>
    </>
  );
}

export function LegalContent() {
  return (
    <>
      <p>Le site présente le Forum des Métiers de l&apos;Assurance, organisé par la Fédération Marocaine de l&apos;Assurance.</p>
      <p>
        Directeur de la publication : la personne désignée par la Fédération. Les coordonnées de contact figurent sur la page Contact et peuvent être modifiées
        depuis le back-office.
      </p>
      <p>Hébergement : serveur Ubuntu sous la responsabilité de l&apos;organisateur. Les journaux techniques sont conservés pour la sécurité du service.</p>
      <p>
        Les marques, logos officiels et visuels partenaires restent la propriété de leurs titulaires. Le monogramme affiché en l&apos;absence de fichier officiel est
        un repère typographique, remplaçable par le logo fourni par la FMA.
      </p>
      <DraftNotice>Ce texte est un modèle opérationnel. Il doit être relu par le conseil de la Fédération avant l&apos;ouverture publique.</DraftNotice>
    </>
  );
}
