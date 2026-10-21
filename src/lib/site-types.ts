import type { HomeLayout } from "@/lib/home-layout";

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
    youtube: string;
    registrationOpen: boolean;
    capacity: number;
    confirmedCount: number;
    heroImage: string;
    homeLayout: HomeLayout;
    eventLink: { url: string; label: Localized };
  };
  sections: Record<string, SectionCopy>;
  why: { id: string; title: Localized; body: Localized; icon: string }[];
  careers: { id: string; title: Localized; summary: Localized; icon: string }[];
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

export const FACET_KEYS = ["facet-1", "facet-2", "facet-3", "facet-4"] as const;

export const fallbackFacets: Record<(typeof FACET_KEYS)[number], SectionCopy> = {
  "facet-1": {
    title: { fr: "Conférences", ar: "محاضرات" },
    body: {
      fr: "Des dirigeants et des experts racontent le secteur, ses défis et les métiers qui recrutent.",
      ar: "مسؤولون وخبراء يتحدثون عن القطاع وتحدياته والمهن التي توظف.",
    },
  },
  "facet-2": {
    title: { fr: "Ateliers", ar: "ورشات" },
    body: {
      fr: "Des formats courts et concrets pour tester un métier, une méthode ou un outil.",
      ar: "صيغ قصيرة وملموسة لتجربة مهنة أو منهجية أو أداة.",
    },
  },
  "facet-3": {
    title: { fr: "Job dating", ar: "لقاءات التوظيف" },
    body: {
      fr: "Rencontre les recruteurs en face à face et décroche un stage ou un premier emploi.",
      ar: "التقِ بمسؤولي التوظيف مباشرة واحصل على تدريب أو أول وظيفة.",
    },
  },
  "facet-4": {
    title: { fr: "Networking", ar: "التواصل" },
    body: {
      fr: "Échange avec des pros, des écoles et d’autres étudiants autour d’un même avenir.",
      ar: "تبادل مع المهنيين والمدارس والطلبة حول مستقبل مشترك.",
    },
  },
};

export const fallbackSections: Record<string, SectionCopy> = {
  ...fallbackFacets,
  hero: {
    title: { fr: "Le Forum des Métiers de l'Assurance", ar: "منتدى مهن التأمين" },
    body: { fr: "", ar: "" },
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
      fr: "Plénières, tables rondes et ateliers. Le détail reste modifiable depuis le back-office.",
      ar: "جلسات عامة وموائد مستديرة وورشات. يمكن تعديل التفاصيل من لوحة التحكم.",
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
};
