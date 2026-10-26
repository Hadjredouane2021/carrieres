// Page Crédits : textes et sources des images, modifiables depuis le back-office.

export type CreditItem = {
  id: string;
  title: string;
  credit: string;
  author: string;
  authorUrl: string;
  source: string;
  sourceLabel: string;
  license: string;
  licenseUrl: string;
  changes: string;
};

export type CreditsConfig = {
  kicker: string;
  intro: string;
  note: string;
  items: CreditItem[];
};

export const CREDITS_LIMIT = 40;

const UNSPLASH_LICENSE = "https://unsplash.com/license";

// Sources de la vidéo du Hero, reprises de assurcarriere-video/ASSETS.md (vérifiées le 21 octobre 2026).
export const DEFAULT_CREDITS: CreditsConfig = {
  kicker: "Vidéo",
  intro: "La vidéo de l'accueil a été réalisée pour Assur'Carrière à partir des images ci-dessous. Halos, tracés lumineux et dégradés ont été créés en code.",
  note: "L'usage de ces images n'implique aucun soutien de la NASA, de l'école 1337, de l'OCP ou des personnes photographiées envers Assur'Carrière.",
  items: [
    {
      id: "casablanca-aube",
      title: "Panorama de Casablanca à l'aube",
      credit: "Photo : Imad Ghazal / Unsplash",
      author: "Imad Ghazal",
      authorUrl: "https://unsplash.com/@7_skies_up",
      source: "https://unsplash.com/photos/NjdvqCNGI7M",
      sourceLabel: "Unsplash",
      license: "Licence Unsplash",
      licenseUrl: UNSPLASH_LICENSE,
      changes: "Recadrage, étalonnage, dégradés de ciel, halo solaire et zoom animé.",
    },
    {
      id: "casablanca-iss",
      title: "Casablanca de nuit depuis la Station spatiale internationale",
      credit: "Image : NASA",
      author: "NASA Johnson Space Center, photo ISS iss072e645691",
      authorUrl: "",
      source: "https://commons.wikimedia.org/wiki/File:The_city_lights_of_Casablanca,_Morocco%27s_largest_city_(iss072e645691).jpg",
      sourceLabel: "Wikimedia Commons",
      license: "Domaine public",
      licenseUrl: "",
      changes: "Recadrage, contraste et tracés lumineux superposés.",
    },
    {
      id: "1337-khouribga",
      title: "Une salle de coding de l'école 1337 Khouribga",
      credit:
        "« Une salle de coding de l'école 1337 Khouribga » — Bertrand SOUBEYRAND, Wikimedia Commons, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Image recadrée, étalonnée et animée.",
      author: "Bertrand SOUBEYRAND",
      authorUrl: "",
      source: "https://commons.wikimedia.org/wiki/File:Une_salle_de_coding_de_l%27%C3%A9cole_1337_Khouribga.jpg",
      sourceLabel: "Wikimedia Commons",
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      changes: "Image recadrée, étalonnée et animée.",
    },
    {
      id: "equipe-ecran",
      title: "Équipe autour d'un écran",
      credit: "Photo : Vitaly Gariev / Unsplash",
      author: "Vitaly Gariev",
      authorUrl: "https://unsplash.com/@silverkblack",
      source: "https://unsplash.com/photos/Y32qbykD69g",
      sourceLabel: "Unsplash",
      license: "Licence Unsplash",
      licenseUrl: UNSPLASH_LICENSE,
      changes: "Intégrée au montage de la vidéo.",
    },
    {
      id: "equipe-graphiques",
      title: "Équipe et graphiques de données",
      credit: "Photo : Vitaly Gariev / Unsplash",
      author: "Vitaly Gariev",
      authorUrl: "https://unsplash.com/@silverkblack",
      source: "https://unsplash.com/photos/vasBHKO3GSs",
      sourceLabel: "Unsplash",
      license: "Licence Unsplash",
      licenseUrl: UNSPLASH_LICENSE,
      changes: "Intégrée au montage de la vidéo.",
    },
    {
      id: "rencontre-pro",
      title: "Rencontre professionnelle",
      credit: "Photo : M ACCELERATOR / Unsplash",
      author: "M ACCELERATOR",
      authorUrl: "https://unsplash.com/@m_accelerator",
      source: "https://unsplash.com/photos/yTsy3PYFPtc",
      sourceLabel: "Unsplash",
      license: "Licence Unsplash",
      licenseUrl: UNSPLASH_LICENSE,
      changes: "Intégrée au montage de la vidéo.",
    },
  ],
};

// Liens externes en https uniquement ; sinon la valeur est ignorée.
export function safeHttps(value: unknown) {
  const url = String(value ?? "").trim().slice(0, 500);
  return /^https:\/\/[^\s]+$/i.test(url) ? url : "";
}

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function parseCredits(raw: string | null | undefined): CreditsConfig {
  if (!raw?.trim()) return DEFAULT_CREDITS;
  try {
    const data = JSON.parse(raw) as Partial<CreditsConfig>;
    const items = (Array.isArray(data.items) ? data.items : [])
      .map((item, index): CreditItem | null => {
        const title = clean(item?.title, 160);
        if (!title) return null;
        return {
          id: clean(item?.id, 60) || `credit-${index}`,
          title,
          credit: clean(item?.credit, 500),
          author: clean(item?.author, 160),
          authorUrl: safeHttps(item?.authorUrl),
          source: safeHttps(item?.source),
          sourceLabel: clean(item?.sourceLabel, 60),
          license: clean(item?.license, 160),
          licenseUrl: safeHttps(item?.licenseUrl),
          changes: clean(item?.changes, 500),
        };
      })
      .filter((item): item is CreditItem => item !== null)
      .slice(0, CREDITS_LIMIT);
    return {
      kicker: clean(data.kicker, 40),
      intro: clean(data.intro, 1000),
      note: clean(data.note, 1000),
      items,
    };
  } catch {
    return DEFAULT_CREDITS;
  }
}
