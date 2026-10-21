import type { TimelineItem } from "@/components/site/program-timeline";
import type { GallerySpeaker } from "@/components/site/speakers-gallery";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";

// Données publiques déjà traduites, prêtes à passer aux composants clients.

export function timelineItems(site: SiteData, locale: Locale): TimelineItem[] {
  return site.program.map((item) => ({
    id: item.id,
    startTime: item.startTime,
    endTime: item.endTime,
    title: tx(locale, item.title.fr, item.title.ar),
    description: tx(locale, item.description.fr, item.description.ar),
    location: item.location,
    speakerName: item.speakerName,
    category: item.category,
    categoryLabel: labelOf(PROGRAM_CATEGORIES, item.category, locale),
  }));
}

export function timelineLabels(locale: Locale) {
  return {
    all: tx(locale, "Tout", "الكل"),
    filter: tx(locale, "Filtrer par type d'activité", "تصفية حسب نوع النشاط"),
    count: tx(locale, "{n} rendez-vous affichés", "{n} موعد معروض"),
  };
}

export function speakerCards(site: SiteData, locale: Locale): GallerySpeaker[] {
  return site.speakers.map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    role: tx(locale, speaker.role.fr, speaker.role.ar),
    org: speaker.org,
    bio: tx(locale, speaker.bio.fr, speaker.bio.ar),
    photo: safeAssetUrl(speaker.photoUrl),
  }));
}

export function speakerLabels(locale: Locale) {
  return { open: tx(locale, "Voir la fiche", "عرض البطاقة"), close: tx(locale, "Fermer", "إغلاق") };
}

export function galleryLabels(locale: Locale) {
  return {
    open: tx(locale, "Agrandir la photo", "تكبير الصورة"),
    close: tx(locale, "Fermer la visionneuse", "إغلاق العارض"),
    previous: tx(locale, "Photo précédente", "الصورة السابقة"),
    next: tx(locale, "Photo suivante", "الصورة التالية"),
    video: tx(locale, "Vidéo du Forum", "فيديو المنتدى"),
    of: tx(locale, "sur", "من"),
  };
}
