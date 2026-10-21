export const HOME_SECTIONS = [
  { key: "about", label: "Présentation", items: null },
  { key: "why", label: "Pourquoi participer", items: "/admin/pourquoi" },
  { key: "careers", label: "Métiers", items: "/admin/metiers" },
  { key: "program", label: "Programme", items: "/admin/programme" },
  { key: "speakers", label: "Intervenants", items: "/admin/intervenants" },
  { key: "partners", label: "Partenaires", items: "/admin/partenaires" },
  { key: "faq", label: "FAQ", items: "/admin/faq" },
  { key: "gallery", label: "Galerie", items: "/admin/galerie" },
  { key: "cta", label: "Appel à l'inscription", items: null },
  { key: "contact", label: "Contact", items: "/admin/parametres" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];
export type HomeLayout = { key: HomeSectionKey; visible: boolean }[];

const known = new Set<string>(HOME_SECTIONS.map((section) => section.key));

/** Complète un ordre enregistré : clés inconnues ignorées, sections manquantes ajoutées à la fin. */
export function normalizeLayout(value: unknown): HomeLayout {
  const layout: HomeLayout = [];
  if (Array.isArray(value)) {
    for (const entry of value) {
      const key = (entry as { key?: unknown })?.key;
      if (typeof key !== "string" || !known.has(key) || layout.some((item) => item.key === key)) continue;
      layout.push({ key: key as HomeSectionKey, visible: (entry as { visible?: unknown }).visible !== false });
    }
  }
  for (const section of HOME_SECTIONS) {
    if (!layout.some((item) => item.key === section.key)) layout.push({ key: section.key, visible: true });
  }
  return layout;
}

export function sectionLabel(key: string) {
  return HOME_SECTIONS.find((section) => section.key === key)?.label ?? key;
}
