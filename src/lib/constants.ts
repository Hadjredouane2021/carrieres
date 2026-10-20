export const CITIES = [
  { value: "Casablanca", fr: "Casablanca", ar: "الدار البيضاء" },
  { value: "Rabat", fr: "Rabat", ar: "الرباط" },
  { value: "Marrakech", fr: "Marrakech", ar: "مراكش" },
  { value: "Fès", fr: "Fès", ar: "فاس" },
  { value: "Tanger", fr: "Tanger", ar: "طنجة" },
  { value: "Agadir", fr: "Agadir", ar: "أكادير" },
  { value: "Oujda", fr: "Oujda", ar: "وجدة" },
  { value: "Meknès", fr: "Meknès", ar: "مكناس" },
  { value: "Kénitra", fr: "Kénitra", ar: "القنيطرة" },
  { value: "Tétouan", fr: "Tétouan", ar: "تطوان" },
  { value: "El Jadida", fr: "El Jadida", ar: "الجديدة" },
  { value: "Nador", fr: "Nador", ar: "الناظور" },
  { value: "OTHER", fr: "Autre ville", ar: "مدينة أخرى" },
] as const;

export const EDUCATION_LEVELS = [
  { value: "BAC", fr: "Baccalauréat", ar: "بكالوريا" },
  { value: "BAC2", fr: "Bac+2", ar: "باك+2" },
  { value: "BAC3", fr: "Bac+3 / Licence", ar: "باك+3 / إجازة" },
  { value: "BAC4", fr: "Bac+4", ar: "باك+4" },
  { value: "BAC5", fr: "Bac+5 / Master", ar: "باك+5 / ماستر" },
  { value: "DOCTORATE", fr: "Doctorat", ar: "دكتوراه" },
  { value: "OTHER", fr: "Autre", ar: "أخرى" },
  { value: "NA", fr: "Non concerné", ar: "غير معني" },
] as const;

export const STUDY_YEARS = [
  { value: "Y1", fr: "1re année", ar: "السنة الأولى" },
  { value: "Y2", fr: "2e année", ar: "السنة الثانية" },
  { value: "Y3", fr: "3e année", ar: "السنة الثالثة" },
  { value: "Y4", fr: "4e année", ar: "السنة الرابعة" },
  { value: "Y5", fr: "5e année", ar: "السنة الخامسة" },
  { value: "GRADUATED", fr: "Déjà diplômé", ar: "حاصل على الشهادة" },
  { value: "NA", fr: "Non concerné", ar: "غير معني" },
] as const;

export const DISCOVERY_SOURCES = [
  { value: "SCHOOL", fr: "École ou université", ar: "المدرسة أو الجامعة" },
  { value: "SOCIAL", fr: "Réseaux sociaux", ar: "شبكات التواصل" },
  { value: "WEB", fr: "Site web", ar: "الموقع الإلكتروني" },
  { value: "PRESS", fr: "Presse", ar: "الصحافة" },
  { value: "WORD", fr: "Bouche-à-oreille", ar: "توصية شخصية" },
  { value: "OTHER", fr: "Autre", ar: "أخرى" },
] as const;

export const PARTICIPANT_TYPES = [
  { value: "STUDENT", fr: "Étudiant", ar: "طالب" },
  { value: "GRADUATE", fr: "Jeune diplômé", ar: "خريج حديث" },
  { value: "PROFESSIONAL", fr: "Professionnel", ar: "مهني" },
  { value: "TEACHER", fr: "Enseignant", ar: "أستاذ" },
  { value: "RECRUITER", fr: "Recruteur", ar: "مسؤول توظيف" },
  { value: "OTHER", fr: "Autre", ar: "أخرى" },
] as const;

export const STATUSES = [
  { value: "PENDING", fr: "En attente", ar: "قيد الانتظار" },
  { value: "CONFIRMED", fr: "Confirmée", ar: "مؤكدة" },
  { value: "CHECKED_IN", fr: "Présent", ar: "حاضر" },
  { value: "CANCELLED", fr: "Annulée", ar: "ملغاة" },
] as const;

export const PARTNER_TIERS = [
  { value: "INSTITUTIONAL", fr: "Institutionnel", ar: "مؤسسي" },
  { value: "GOLD", fr: "Or", ar: "ذهبي" },
  { value: "SILVER", fr: "Argent", ar: "فضي" },
  { value: "PARTNER", fr: "Partenaire", ar: "شريك" },
  { value: "MEDIA", fr: "Média", ar: "إعلام" },
] as const;

export const PROGRAM_CATEGORIES = [
  { value: "welcome", fr: "Accueil", ar: "استقبال" },
  { value: "plenary", fr: "Plénière", ar: "جلسة عامة" },
  { value: "roundtable", fr: "Table ronde", ar: "مائدة مستديرة" },
  { value: "workshop", fr: "Atelier", ar: "ورشة" },
  { value: "break", fr: "Pause", ar: "استراحة" },
  { value: "networking", fr: "Networking", ar: "تواصل" },
  { value: "closing", fr: "Clôture", ar: "اختتام" },
] as const;

export function labelOf<T extends readonly { value: string; fr: string; ar: string }[]>(
  list: T,
  value: string,
  locale: "fr" | "ar",
) {
  return list.find((item) => item.value === value)?.[locale] ?? value;
}
