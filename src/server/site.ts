import { connection } from "next/server";
import { parseLevels } from "@/lib/education";
import { parseMenu } from "@/lib/menu";
import { parseTheme } from "@/lib/theme";
import { db } from "@/lib/prisma";
import { fallbackSections, publicCopy, type SiteData } from "@/lib/site-types";

function pair(fr: string, ar: string) {
  return { fr, ar };
}

export async function getPublicSite(): Promise<SiteData> {
  await connection();
  const database = db();
  const [settings, sections, why, careers, program, speakers, partners, faqs, gallery, confirmedCount] =
    await Promise.all([
      database.eventSettings.findUnique({ where: { id: "main" } }),
      database.siteSection.findMany(),
      database.whyItem.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.career.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.programItem.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }] }),
      database.speaker.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.partner.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.faqItem.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.galleryItem.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
      database.registration.count({ where: { status: { not: "CANCELLED" } } }),
    ]);

  const sectionMap: SiteData["sections"] = { ...fallbackSections };
  for (const section of sections) {
    sectionMap[section.key] = {
      title: pair(section.titleFr, section.titleAr),
      body: pair(publicCopy(section.bodyFr), publicCopy(section.bodyAr)),
    };
  }

  return {
    settings: {
      eventDate: settings?.eventDate?.toISOString() ?? null,
      venueName: settings?.venueName ?? "Casablanca",
      address: settings?.address ?? "",
      city: settings?.city ?? "Casablanca",
      slogan: pair(settings?.sloganFr ?? "Choisis ton avenir", settings?.sloganAr ?? "اختر مستقبلك"),
      contactEmail: settings?.contactEmail ?? "contact@forum-assurance.ma",
      contactPhone: settings?.contactPhone ?? "",
      facebook: settings?.facebook ?? "",
      linkedin: settings?.linkedin ?? "",
      instagram: settings?.instagram ?? "",
      tiktok: settings?.tiktok ?? "",
      registrationOpen: settings?.registrationOpen ?? true,
      capacity: settings?.capacity ?? 1500,
      confirmedCount,
      heroImage: settings?.heroImage ?? "",
      heroMedia: settings?.heroMedia === "image" ? "image" : "video",
      heroMarquee: (settings?.heroMarquee ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 20),
      menu: parseMenu(settings?.menuItems),
      educationLevels: parseLevels(settings?.educationLevels),
      theme: parseTheme(settings?.theme),
      ribbonItems: (settings?.ribbonItems ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12),
    },
    sections: sectionMap,
    why: why.map((item) => ({
      id: item.id,
      title: pair(item.titleFr, item.titleAr),
      body: pair(item.bodyFr, item.bodyAr),
      icon: item.icon,
    })),
    careers: careers.map((item) => ({
      id: item.id,
      title: pair(item.titleFr, item.titleAr),
      summary: pair(item.summaryFr, item.summaryAr),
      icon: item.icon,
      category: item.category,
    })),
    program: program.map((item) => ({
      id: item.id,
      startTime: item.startTime,
      endTime: item.endTime,
      title: pair(item.titleFr, item.titleAr),
      description: pair(item.descriptionFr, item.descriptionAr),
      location: item.location,
      speakerName: item.speakerName,
      category: item.category,
    })),
    speakers: speakers.map((item) => ({
      id: item.id,
      name: item.name,
      role: pair(item.roleFr, item.roleAr),
      org: item.org,
      bio: pair(item.bioFr, item.bioAr),
      photoUrl: item.photoUrl,
    })),
    partners: partners.map((item) => ({
      id: item.id,
      name: item.name,
      logoUrl: item.logoUrl,
      website: item.website,
      tier: item.tier,
    })),
    faqs: faqs.map((item) => ({
      id: item.id,
      question: pair(item.questionFr, item.questionAr),
      answer: pair(item.answerFr, item.answerAr),
    })),
    gallery: gallery.map((item) => ({
      id: item.id,
      type: item.type,
      url: item.url,
      caption: pair(item.captionFr, item.captionAr),
    })),
  };
}
