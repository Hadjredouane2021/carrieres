// Menu du site public : liens de l'en-tête (ordre, libellés, visibilité), reprise dans le pied de page, bouton d'appel.

export type MenuKey = "forum" | "program" | "careers" | "speakers" | "partners" | "gallery" | "faq" | "contact";

export type MenuItem = {
  id: string;
  key?: MenuKey;
  label: string;
  href: string;
  visible: boolean;
  footer: boolean;
};

export type MenuConfig = {
  items: MenuItem[];
  cta: { label: string; href: string; visible: boolean };
};

const KEYS: MenuKey[] = ["forum", "program", "careers", "speakers", "partners", "gallery", "faq", "contact"];

export const DEFAULT_MENU: MenuConfig = {
  items: [
    { id: "forum", key: "forum", label: "Le Forum", href: "/forum", visible: true, footer: true },
    { id: "program", key: "program", label: "Programme", href: "/programme", visible: true, footer: true },
    { id: "careers", key: "careers", label: "Métiers", href: "/metiers", visible: true, footer: true },
    { id: "speakers", key: "speakers", label: "Intervenants", href: "/intervenants", visible: true, footer: true },
    { id: "partners", key: "partners", label: "Partenaires", href: "/partenaires", visible: true, footer: true },
    { id: "gallery", key: "gallery", label: "Galerie", href: "/galerie", visible: true, footer: true },
    { id: "faq", key: "faq", label: "FAQ", href: "/faq", visible: true, footer: false },
    { id: "contact", key: "contact", label: "Contact", href: "/contact", visible: true, footer: false },
  ],
  cta: { label: "Je m'inscris", href: "/inscription", visible: true },
};

export const MENU_LIMIT = 12;

// Lien interne (/page, #ancre) ou externe en https uniquement.
export function safeMenuHref(value: unknown) {
  const href = String(value ?? "").trim().slice(0, 300);
  if (/^\/(?!\/)/.test(href) || href.startsWith("#") || /^https:\/\/[^\s]+$/i.test(href)) return href;
  return "";
}

export function isExternal(href: string) {
  return href.startsWith("https://");
}

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// Lecture tolérante : toute valeur invalide retombe sur le menu par défaut.
export function parseMenu(raw: string | null | undefined): MenuConfig {
  if (!raw?.trim()) return DEFAULT_MENU;
  try {
    const data = JSON.parse(raw) as Partial<MenuConfig>;
    const items = (Array.isArray(data.items) ? data.items : [])
      .map((item, index): MenuItem | null => {
        const href = safeMenuHref(item?.href);
        const label = clean(item?.label, 40);
        if (!href || !label) return null;
        const key = KEYS.includes(item?.key as MenuKey) ? (item.key as MenuKey) : undefined;
        return { id: clean(item?.id, 40) || `lien-${index}`, key, label, href, visible: item?.visible !== false, footer: item?.footer !== false };
      })
      .filter((item): item is MenuItem => item !== null)
      .slice(0, MENU_LIMIT);
    const ctaHref = safeMenuHref(data.cta?.href);
    const ctaLabel = clean(data.cta?.label, 30);
    return {
      items: items.length ? items : DEFAULT_MENU.items,
      cta: { label: ctaLabel || DEFAULT_MENU.cta.label, href: ctaHref || DEFAULT_MENU.cta.href, visible: data.cta?.visible !== false },
    };
  } catch {
    return DEFAULT_MENU;
  }
}
