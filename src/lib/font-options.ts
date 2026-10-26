// Polices proposées dans Admin > Couleurs et polices. Chaque police est chargée par next/font (fichiers servis par le site),
// sans préchargement : seule la police choisie est téléchargée par le navigateur.

export type FontRole = "sans" | "display" | "accent" | "rounded";

export type FontOption = { id: string; label: string };

export const FONT_OPTIONS: Record<FontRole, FontOption[]> = {
  sans: [
    { id: "inter", label: "Inter" },
    { id: "poppins", label: "Poppins" },
    { id: "montserrat", label: "Montserrat" },
    { id: "dm-sans", label: "DM Sans" },
    { id: "manrope", label: "Manrope" },
    { id: "open-sans", label: "Open Sans" },
    { id: "work-sans", label: "Work Sans" },
    { id: "lexend", label: "Lexend" },
    { id: "outfit", label: "Outfit" },
  ],
  display: [
    { id: "space-grotesk", label: "Space Grotesk" },
    { id: "sora", label: "Sora" },
    { id: "syne", label: "Syne" },
    { id: "plus-jakarta", label: "Plus Jakarta Sans" },
    { id: "bricolage", label: "Bricolage Grotesque" },
    { id: "montserrat", label: "Montserrat" },
    { id: "poppins", label: "Poppins" },
    { id: "outfit", label: "Outfit" },
    { id: "playfair", label: "Playfair Display" },
    { id: "fraunces", label: "Fraunces" },
  ],
  accent: [
    { id: "instrument", label: "Instrument Serif" },
    { id: "playfair", label: "Playfair Display" },
    { id: "fraunces", label: "Fraunces" },
    { id: "dm-serif", label: "DM Serif Display" },
    { id: "cormorant", label: "Cormorant Garamond" },
    { id: "caveat", label: "Caveat (manuscrite)" },
    { id: "outfit", label: "Outfit" },
  ],
  rounded: [
    { id: "outfit", label: "Outfit" },
    { id: "nunito", label: "Nunito" },
    { id: "quicksand", label: "Quicksand" },
    { id: "fredoka", label: "Fredoka" },
    { id: "poppins", label: "Poppins" },
  ],
};

export const FONT_ROLES: { role: FontRole; label: string; hint: string; sample: string }[] = [
  { role: "display", label: "Titres", hint: "Grands titres et chiffres.", sample: "Le Forum des Métiers" },
  { role: "sans", label: "Texte courant", hint: "Paragraphes, menus, formulaires.", sample: "Découvre les métiers de l'assurance et rencontre les entreprises." },
  { role: "accent", label: "Mots mis en valeur", hint: "Italique des titres et de la citation du hero.", sample: "Choisis ton avenir" },
  { role: "rounded", label: "Étiquettes arrondies", hint: "Pilules de filtre et citation « Pourquoi participer ».", sample: "Tout · Tech & data" },
];

export const DEFAULT_FONTS: Record<FontRole, string> = { sans: "inter", display: "space-grotesk", accent: "instrument", rounded: "outfit" };

