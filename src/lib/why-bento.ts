// Composition éditoriale des cartes « Pourquoi participer » : une grande carte nuit, des cartes larges et compactes, une carte solaire.
// Partagée entre l'accueil et le back-office pour que l'aperçu admin suive exactement le site.
export const BENTO = [
  { span: "sm:col-span-2 lg:col-span-2 lg:row-span-2", tone: "night", featured: true, label: "Vedette · bleu nuit" },
  { span: "lg:col-span-2", tone: "light", featured: false, label: "Large · gris clair" },
  { span: "", tone: "dawn", featured: false, label: "Compacte · aube" },
  { span: "", tone: "light", featured: false, label: "Compacte · gris clair" },
  { span: "lg:col-span-2", tone: "sun", featured: false, label: "Large · orange" },
  { span: "sm:col-span-2 lg:col-span-2", tone: "outline", featured: false, label: "Large · contour" },
] as const;

export type BentoTone = (typeof BENTO)[number]["tone"];

// Nouvelle mise en page : la 1re carte publiée est une citation, les suivantes des cartes à ombre décalée.
// Couleurs des cartes, dans l'ordre : blanc, nuit, jaune, corail.
export const WHY_TONES = ["bg-white text-night", "bg-night text-white", "bg-[#FFD43B] text-night", "bg-[#E5636A] text-night"];
export const WHY_TONE_LABELS = ["blanc", "bleu nuit", "jaune", "corail"];
