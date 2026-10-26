import { DEFAULT_FONTS, FONT_OPTIONS, type FontRole } from "@/lib/font-options";

// Couleurs et polices du site public, modifiables depuis le back-office (Admin > Couleurs et polices).

export type ThemeColors = {
  header: string;
  headerText: string;
  sections: string;
  sectionsText: string;
  accent: string;
  text: string;
  muted: string;
  cream: string;
  cta: string;
  ctaText: string;
  footer: string;
  footerText: string;
};

export type ThemeConfig = ThemeColors & { fonts: Record<FontRole, string> };

export const DEFAULT_COLORS: ThemeColors = {
  header: "#0b1b3a",
  headerText: "#ffffff",
  sections: "#0b1b3a",
  sectionsText: "#9fb0c8",
  accent: "#ff7a1a",
  text: "#122033",
  muted: "#5a6b85",
  cream: "#f8f5ec",
  cta: "#0b1b3a",
  ctaText: "#ffffff",
  footer: "#0b1b3a",
  footerText: "#ffffff",
};

export const DEFAULT_THEME: ThemeConfig = { ...DEFAULT_COLORS, fonts: DEFAULT_FONTS };

export type ColorField = { key: keyof ThemeColors; label: string; hint: string };

export const COLOR_GROUPS: { title: string; fields: ColorField[] }[] = [
  {
    title: "Menu",
    fields: [
      { key: "header", label: "Fond", hint: "Bandeau du menu au défilement et menu mobile." },
      { key: "headerText", label: "Texte", hint: "Liens du menu." },
    ],
  },
  {
    title: "Sections sombres",
    fields: [
      { key: "sections", label: "Fond et titres", hint: "Hero, intros, métiers… et titres des sections claires." },
      { key: "sectionsText", label: "Texte secondaire", hint: "Paragraphes sur fond sombre." },
    ],
  },
  {
    title: "Accent",
    fields: [{ key: "accent", label: "Accent", hint: "Boutons, mots mis en valeur, puces, liens actifs." }],
  },
  {
    title: "Sections claires",
    fields: [
      { key: "text", label: "Texte courant", hint: "Paragraphes sur fond blanc." },
      { key: "muted", label: "Texte secondaire", hint: "Descriptions, légendes, aides." },
      { key: "cream", label: "Fond crème", hint: "Section « Pourquoi participer »." },
    ],
  },
  {
    title: "Bloc inscription",
    fields: [
      { key: "cta", label: "Fond", hint: "Bloc « Votre place vous attend » de l'accueil." },
      { key: "ctaText", label: "Texte", hint: "Titre, textes et contours du bloc." },
    ],
  },
  {
    title: "Pied de page",
    fields: [
      { key: "footer", label: "Fond", hint: "Fond du pied de page." },
      { key: "footerText", label: "Texte", hint: "Liens et textes du pied de page." },
    ],
  },
];

export const THEME_PRESETS: { name: string; colors: ThemeColors }[] = [
  { name: "Aube sur Casablanca", colors: DEFAULT_COLORS },
  { name: "Océan", colors: { ...DEFAULT_COLORS, header: "#06283d", sections: "#0a3150", accent: "#1fb6c9", cta: "#06283d", footer: "#041c2c" } },
  { name: "Émeraude", colors: { ...DEFAULT_COLORS, header: "#0d2b24", sections: "#0f3a30", accent: "#3dd6ae", cta: "#0d2b24", footer: "#081f19", cream: "#f1f7f3" } },
  { name: "Prune", colors: { ...DEFAULT_COLORS, header: "#2a1033", sections: "#341540", accent: "#ff6f91", cta: "#2a1033", footer: "#1d0a24", cream: "#faf3f6" } },
  { name: "Graphite", colors: { ...DEFAULT_COLORS, header: "#16181d", sections: "#1f232b", accent: "#f5b700", cta: "#16181d", footer: "#0e1013", cream: "#f6f5f1" } },
];

export function safeHex(value: unknown) {
  const hex = String(value ?? "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : "";
}

const COLOR_KEYS = Object.keys(DEFAULT_COLORS) as (keyof ThemeColors)[];
const FONT_ROLE_KEYS = Object.keys(DEFAULT_FONTS) as FontRole[];

export function parseTheme(raw: string | null | undefined): ThemeConfig {
  if (!raw?.trim()) return DEFAULT_THEME;
  try {
    const data = JSON.parse(raw) as Partial<ThemeColors> & { fonts?: Partial<Record<FontRole, string>> };
    const colors = Object.fromEntries(COLOR_KEYS.map((key) => [key, safeHex(data[key]) || DEFAULT_COLORS[key]])) as ThemeColors;
    const fonts = Object.fromEntries(
      FONT_ROLE_KEYS.map((role) => {
        const id = data.fonts?.[role];
        return [role, FONT_OPTIONS[role].some((option) => option.id === id) ? id : DEFAULT_FONTS[role]];
      }),
    ) as Record<FontRole, string>;
    return { ...colors, fonts };
  } catch {
    return DEFAULT_THEME;
  }
}

const FONT_VARIABLES: Record<FontRole, string> = { sans: "--font-inter", display: "--font-display", accent: "--font-instrument", rounded: "--font-outfit" };

/** CSS injecté sur les pages publiques : couleurs validées, nuances dérivées, polices choisies. */
export function themeCss(theme: ThemeConfig, families: Record<string, string>) {
  const rules: string[] = [];
  const color = theme as ThemeColors;
  if (COLOR_KEYS.some((key) => color[key] !== DEFAULT_COLORS[key])) {
    rules.push(
      `:root{--night:${color.sections};--night-deep:color-mix(in srgb,${color.sections} 70%,#000);--haze:${color.sectionsText};` +
        `--sun:${color.accent};--sun-bright:color-mix(in srgb,${color.accent} 72%,#fff);--sun-ink:color-mix(in srgb,${color.accent} 62%,#000);--dawn:color-mix(in srgb,${color.accent} 9%,#fff);` +
        `--foreground:${color.text};--ink:${color.text};--muted:${color.muted};--cream:${color.cream};` +
        `--header-bg:${color.header};--header-fg:${color.headerText};--cta-bg:${color.cta};--cta-fg:${color.ctaText};--footer-bg:${color.footer};--footer-fg:${color.footerText};}`,
    );
  }
  const fonts = FONT_ROLE_KEYS.filter((role) => theme.fonts[role] !== DEFAULT_FONTS[role] && families[theme.fonts[role]]).map(
    (role) => `${FONT_VARIABLES[role]}:${families[theme.fonts[role]]}`,
  );
  // html:root l'emporte sur les classes de variables posées par next/font sur <html>.
  if (fonts.length) rules.push(`html:root{${fonts.join(";")}}`);
  return rules.join("");
}

/** Contraste WCAG entre deux couleurs hexadécimales. */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
