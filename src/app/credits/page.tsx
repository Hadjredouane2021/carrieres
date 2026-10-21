import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Crédits" };
export const instant = false;

const UNSPLASH_LICENSE = "https://unsplash.com/license";

// Sources de la vidéo du Hero, reprises de assurcarriere-video/ASSETS.md (vérifiées le 21 octobre 2026).
const credits = [
  {
    title: "Panorama de Casablanca à l'aube",
    credit: "Photo : Imad Ghazal / Unsplash",
    author: ["Imad Ghazal", "https://unsplash.com/@7_skies_up"],
    source: "https://unsplash.com/photos/NjdvqCNGI7M",
    license: ["Licence Unsplash", UNSPLASH_LICENSE],
    changes: "Recadrage, étalonnage, dégradés de ciel, halo solaire et zoom animé.",
  },
  {
    title: "Casablanca de nuit depuis la Station spatiale internationale",
    credit: "Image : NASA",
    author: ["NASA Johnson Space Center, photo ISS iss072e645691", null],
    source: "https://commons.wikimedia.org/wiki/File:The_city_lights_of_Casablanca,_Morocco%27s_largest_city_(iss072e645691).jpg",
    license: ["Domaine public", null],
    changes: "Recadrage, contraste et tracés lumineux superposés.",
  },
  {
    title: "Une salle de coding de l'école 1337 Khouribga",
    credit:
      "« Une salle de coding de l'école 1337 Khouribga » — Bertrand SOUBEYRAND, Wikimedia Commons, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Image recadrée, étalonnée et animée.",
    author: ["Bertrand SOUBEYRAND", null],
    source: "https://commons.wikimedia.org/wiki/File:Une_salle_de_coding_de_l%27%C3%A9cole_1337_Khouribga.jpg",
    license: ["Creative Commons Attribution 4.0 International (CC BY 4.0)", "https://creativecommons.org/licenses/by/4.0/"],
    changes: "Image recadrée, étalonnée et animée.",
  },
  {
    title: "Équipe autour d'un écran",
    credit: "Photo : Vitaly Gariev / Unsplash",
    author: ["Vitaly Gariev", "https://unsplash.com/@silverkblack"],
    source: "https://unsplash.com/photos/Y32qbykD69g",
    license: ["Licence Unsplash", UNSPLASH_LICENSE],
    changes: "Intégrée au montage de la vidéo.",
  },
  {
    title: "Équipe et graphiques de données",
    credit: "Photo : Vitaly Gariev / Unsplash",
    author: ["Vitaly Gariev", "https://unsplash.com/@silverkblack"],
    source: "https://unsplash.com/photos/vasBHKO3GSs",
    license: ["Licence Unsplash", UNSPLASH_LICENSE],
    changes: "Intégrée au montage de la vidéo.",
  },
  {
    title: "Rencontre professionnelle",
    credit: "Photo : M ACCELERATOR / Unsplash",
    author: ["M ACCELERATOR", "https://unsplash.com/@m_accelerator"],
    source: "https://unsplash.com/photos/yTsy3PYFPtc",
    license: ["Licence Unsplash", UNSPLASH_LICENSE],
    changes: "Intégrée au montage de la vidéo.",
  },
] as const;

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-night underline underline-offset-4 hover:text-sun-ink">
      {children}
    </a>
  );
}

export default async function CreditsPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Crédits"
        kicker="Vidéo"
        title="Crédits"
        intro="La vidéo de l'accueil a été réalisée pour Assur'Carrière à partir des images ci-dessous. Halos, tracés lumineux et dégradés ont été créés en code."
      />
      <article className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-5 px-4 py-14 text-night/80 md:px-6 md:py-20">
        <ol className="grid gap-4">
          {credits.map((item) => (
            <li key={item.source} className="min-w-0 rounded-[1.75rem] border border-night/10 bg-white p-6 leading-7 sm:p-7">
              <h2 className="text-lg font-semibold text-night">{item.title}</h2>
              <p className="mt-2 text-night [overflow-wrap:anywhere]">{item.credit}</p>
              <dl className="mt-4 grid gap-1.5 text-sm [overflow-wrap:anywhere] sm:grid-cols-[7rem_minmax(0,1fr)]">
                <dt className="text-muted">Auteur</dt>
                <dd>{item.author[1] ? <External href={item.author[1]}>{item.author[0]}</External> : item.author[0]}</dd>
                <dt className="text-muted">Source</dt>
                <dd className="break-words">
                  <External href={item.source}>{item.source.includes("wikimedia") ? "Wikimedia Commons" : "Unsplash"}</External>
                </dd>
                <dt className="text-muted">Licence</dt>
                <dd>{item.license[1] ? <External href={item.license[1]}>{item.license[0]}</External> : item.license[0]}</dd>
                <dt className="text-muted">Modifications</dt>
                <dd>{item.changes}</dd>
              </dl>
            </li>
          ))}
        </ol>
        <p className="text-sm leading-6">
          {"L'usage de ces images n'implique aucun soutien de la NASA, de l'école 1337, de l'OCP ou des personnes photographiées envers Assur'Carrière."}
        </p>
      </article>
    </PublicFrame>
  );
}
