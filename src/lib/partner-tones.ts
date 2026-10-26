// Couleur de chaque catégorie de partenaire dans le back-office.
export const PARTNER_TONES: Record<string, { dot: string; chip: string; hint: string }> = {
  INSTITUTIONAL: { dot: "bg-night", chip: "bg-night text-white", hint: "Fédération, autorités, organismes publics" },
  GOLD: { dot: "bg-amber-400", chip: "bg-amber-100 text-amber-900", hint: "Partenaires principaux, visibilité maximale" },
  SILVER: { dot: "bg-zinc-400", chip: "bg-zinc-100 text-zinc-700", hint: "Partenaires associés" },
  PARTNER: { dot: "bg-sun", chip: "bg-dawn text-sun-ink", hint: "Compagnies, courtiers, écoles" },
  MEDIA: { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700", hint: "Presse et médias partenaires" },
};

export function domainOf(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
