import type { EducationLevel } from "@/lib/education";
import type { MenuConfig } from "@/lib/menu";
import type { ThemeConfig } from "@/lib/theme";

export type Localized = { fr: string; ar: string };
export type SectionCopy = { title: Localized; body: Localized };

export type SiteData = {
  settings: {
    eventDate: string | null;
    venueName: string;
    address: string;
    city: string;
    slogan: Localized;
    contactEmail: string;
    contactPhone: string;
    facebook: string;
    linkedin: string;
    instagram: string;
    tiktok: string;
    registrationOpen: boolean;
    capacity: number;
    confirmedCount: number;
    heroImage: string;
    heroMedia: "video" | "image";
    ribbonItems: string[];
    heroMarquee: string[];
    menu: MenuConfig;
    educationLevels: EducationLevel[];
    theme: ThemeConfig;
  };
  sections: Record<string, SectionCopy>;
  why: { id: string; title: Localized; body: Localized; icon: string }[];
  careers: { id: string; title: Localized; summary: Localized; icon: string; category: string }[];
  program: {
    id: string;
    startTime: string;
    endTime: string;
    title: Localized;
    description: Localized;
    location: string;
    speakerName: string;
    category: string;
  }[];
  speakers: { id: string; name: string; role: Localized; org: string; bio: Localized; photoUrl: string }[];
  partners: { id: string; name: string; logoUrl: string; website: string; tier: string }[];
  faqs: { id: string; question: Localized; answer: Localized }[];
  gallery: { id: string; type: "IMAGE" | "VIDEO"; url: string; caption: Localized }[];
};

// Notes destinées à l'équipe, présentes dans les textes déjà enregistrés : jamais affichées au public.
const INTERNAL_NOTES = [/\s*Le détail reste modifiable depuis le back-office\.?/g, /\s*يمكن تعديل التفاصيل من لوحة التحكم\.?/g];

export function publicCopy(value: string) {
  return INTERNAL_NOTES.reduce((text, note) => text.replace(note, ""), value).trim();
}

export const fallbackSections: Record<string, SectionCopy> = {
  hero: {
    title: { fr: "Le Forum des Métiers de l'Assurance", ar: "منتدى مهن التأمين" },
    body: { fr: "Une journée pour découvrir les métiers, rencontrer les entreprises du secteur et choisir une voie concrète.", ar: "يوم لاكتشاف المهن ولقاء مقاولات القطاع واختيار مسار ملموس." },
  },
  about: {
    title: { fr: "Une journée pour tracer sa route", ar: "يوم لرسم مسارك" },
    body: {
      fr: "Le Forum des Métiers de l'Assurance réunit, à l'initiative de la Fédération Marocaine de l'Assurance, les étudiants, les jeunes diplômés, les enseignants et les recruteurs du secteur.\n\nAu programme : des métiers expliqués sans détour, des rencontres avec les entreprises et des ateliers pour choisir une voie concrète.",
      ar: "يجمع منتدى مهن التأمين، بمبادرة من الجامعة المغربية لشركات التأمين، الطلبة والخريجين والأساتذة ومسؤولي التوظيف.\n\nفي البرنامج: مهن تُشرح بوضوح، ولقاءات مع المقاولات، وورشات لاختيار مسار ملموس.",
    },
  },
  why: {
    title: { fr: "Pourquoi participer", ar: "لماذا المشاركة" },
    body: {
      fr: "Un rendez-vous utile, précis et ouvert à celles et ceux qui construisent la suite de leur parcours.",
      ar: "موعد مفيد ودقيق، مفتوح لمن يبني الخطوة التالية في مساره.",
    },
  },
  careers: {
    title: { fr: "Les métiers de l'assurance", ar: "مهن التأمين" },
    body: {
      fr: "Du calcul du risque à la relation avec l'assuré, le secteur offre des trajectoires variées.",
      ar: "من حساب الخطر إلى العلاقة مع المؤمن له، يتيح القطاع مسارات متنوعة.",
    },
  },
  program: {
    title: { fr: "Le fil de la journée", ar: "مجرى اليوم" },
    body: {
      fr: "Plénières, tables rondes et ateliers.",
      ar: "جلسات عامة وموائد مستديرة وورشات.",
    },
  },
  speakers: {
    title: { fr: "Intervenants", ar: "المتحدثون" },
    body: {
      fr: "Des professionnels et des enseignants pour éclairer les choix, pas pour les enfermer.",
      ar: "مهنيون وأساتذة لإضاءة الاختيارات، لا لتقييدها.",
    },
  },
  partners: {
    title: { fr: "Entreprises et partenaires", ar: "المقاولات والشركاء" },
    body: {
      fr: "Compagnies, courtiers, écoles et médias qui portent l'édition avec la FMA.",
      ar: "شركات ووسطاء ومدارس ووسائل إعلام تحمل هذه الدورة مع الجامعة.",
    },
  },
  gallery: {
    title: { fr: "Galerie", ar: "معرض" },
    body: {
      fr: "Les images et les replays de l'édition prendront place ici.",
      ar: "ستأخذ صور الدورة وإعادات المشاهدة مكانها هنا.",
    },
  },
  cta: {
    title: { fr: "Votre place vous attend", ar: "مقعدك في انتظارك" },
    body: {
      fr: "L'inscription est gratuite. Vous repartez avec un billet nominatif et un QR code d'accès.",
      ar: "التسجيل مجاني. تغادرون بتذكرة اسمية ورمز QR للدخول.",
    },
  },
  contact: {
    title: { fr: "Écrire à l'équipe", ar: "راسلوا الفريق" },
    body: {
      fr: "Une question sur l'accès, les écoles invitées ou les partenariats : laissez un message.",
      ar: "سؤال عن الولوج أو المؤسسات المدعوة أو الشراكات: اتركوا رسالة.",
    },
  },
  faq: {
    title: { fr: "Questions fréquentes", ar: "أسئلة متداولة" },
    body: { fr: "L'essentiel avant de vous déplacer.", ar: "الأساسي قبل الحضور." },
  },
  register: {
    title: { fr: "Réserve ta place | au Forum 2026", ar: "احجز مقعدك | في منتدى 2026" },
    body: {
      fr: "Quatre étapes, deux minutes. Ton billet nominatif et ton QR code d'accès sont délivrés dès la confirmation.",
      ar: "أربع خطوات لحجز مقعدك. تُسلَّم التذكرة ورمز QR عند التأكيد.",
    },
  },
};

// « Début | suite en italique » : sans « | », seul le dernier mot est mis en accent.
export function splitAccent(text: string): [string, string] {
  const [head, ...rest] = text.split("|");
  if (rest.length) return [head.trim(), rest.join(" ").trim()];
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text.trim(), ""];
  const last = words.pop()!;
  return [words.join(" "), last];
}
