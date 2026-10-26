import { EDUCATION_LEVELS } from "@/lib/constants";

// Niveaux d'études proposés à l'inscription : libellés, ordre et visibilité modifiables depuis le back-office.

export type EducationLevel = { value: string; fr: string; ar: string; visible: boolean };

export const EDUCATION_LIMIT = 20;

/** Codes d'origine : jamais supprimés, pour garder le libellé des inscriptions déjà reçues ("NA" sert aussi aux contrôles). */
export const CORE_LEVELS: string[] = EDUCATION_LEVELS.map((level) => level.value);

export const DEFAULT_LEVELS: EducationLevel[] = EDUCATION_LEVELS.map((level) => ({ ...level, visible: true }));

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function parseLevels(raw: string | null | undefined): EducationLevel[] {
  if (!raw?.trim()) return DEFAULT_LEVELS;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return DEFAULT_LEVELS;
    const seen = new Set<string>();
    const levels = data
      .map((item): EducationLevel | null => {
        const value = clean(item?.value, 40).replace(/[^A-Za-z0-9_-]/g, "");
        const fr = clean(item?.fr, 80);
        if (!value || !fr || seen.has(value)) return null;
        seen.add(value);
        return { value, fr, ar: clean(item?.ar, 80), visible: item?.visible !== false };
      })
      .filter((level): level is EducationLevel => level !== null);
    // Un code d'origine absent est rétabli, masqué.
    for (const level of DEFAULT_LEVELS) {
      if (!seen.has(level.value)) levels.push({ ...level, visible: false });
    }
    return levels.slice(0, EDUCATION_LIMIT + CORE_LEVELS.length);
  } catch {
    return DEFAULT_LEVELS;
  }
}

export function levelLabel(levels: EducationLevel[], value: string, locale: "fr" | "ar" = "fr") {
  const level = levels.find((item) => item.value === value);
  if (!level) return value;
  return locale === "ar" ? level.ar || level.fr : level.fr;
}
