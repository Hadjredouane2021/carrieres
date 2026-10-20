"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MediaType, PartnerTier, RegistrationStatus, Role } from "@/generated/prisma/client";
import { fromCasablancaInput } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { savePublicImage } from "@/lib/uploads";
import { userSchema } from "@/lib/validators";
import { deliverRegistration } from "@/server/notifications";
import { requireUser } from "@/server/session";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function flag(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function order(formData: FormData) {
  const value = Number.parseInt(text(formData, "sortOrder"), 10);
  return Number.isFinite(value) ? value : 0;
}

function done(path: string, error?: string): never {
  redirect(error ? `${path}?error=${encodeURIComponent(error)}` : `${path}?ok=1`);
}

function refreshSite() {
  for (const path of ["/", "/forum", "/programme", "/metiers", "/intervenants", "/partenaires", "/faq", "/contact", "/inscription"]) {
    revalidatePath(path);
  }
}

async function imageField(formData: FormData, urlKey: string) {
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) return savePublicImage(file);
  return text(formData, urlKey);
}

export async function saveSettings(formData: FormData) {
  await requireUser(true);
  const capacity = Number.parseInt(text(formData, "capacity"), 10);
  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 20000) done("/admin/parametres", "Indiquez une capacité valide.");
  const email = text(formData, "contactEmail");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) done("/admin/parametres", "E-mail de contact invalide.");
  await db().eventSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      eventDate: fromCasablancaInput(text(formData, "eventDate")),
      venueName: text(formData, "venueName") || "Casablanca",
      address: text(formData, "address"),
      city: text(formData, "city") || "Casablanca",
      sloganFr: text(formData, "sloganFr") || "Choisis ton avenir",
      sloganAr: text(formData, "sloganAr"),
      contactEmail: email,
      contactPhone: text(formData, "contactPhone"),
      facebook: text(formData, "facebook"),
      linkedin: text(formData, "linkedin"),
      instagram: text(formData, "instagram"),
      youtube: text(formData, "youtube"),
      registrationOpen: flag(formData, "registrationOpen"),
      capacity,
    },
    update: {
      eventDate: fromCasablancaInput(text(formData, "eventDate")),
      venueName: text(formData, "venueName") || "Casablanca",
      address: text(formData, "address"),
      city: text(formData, "city") || "Casablanca",
      sloganFr: text(formData, "sloganFr") || "Choisis ton avenir",
      sloganAr: text(formData, "sloganAr"),
      contactEmail: email,
      contactPhone: text(formData, "contactPhone"),
      facebook: text(formData, "facebook"),
      linkedin: text(formData, "linkedin"),
      instagram: text(formData, "instagram"),
      youtube: text(formData, "youtube"),
      registrationOpen: flag(formData, "registrationOpen"),
      capacity,
    },
  });
  refreshSite();
  done("/admin/parametres");
}

export async function saveHeroImage(formData: FormData) {
  await requireUser(true);
  const file = formData.get("file");
  const remove = flag(formData, "remove");
  let heroImage = "";
  if (!remove && file instanceof File && file.size > 0) {
    try {
      heroImage = await savePublicImage(file, 16 * 1024 * 1024);
    } catch (error) {
      done("/admin", error instanceof Error ? error.message : "Image refusée.");
    }
  } else if (!remove) {
    done("/admin", "Choisissez une image JPG, PNG ou WebP.");
  }
  await db().eventSettings.update({ where: { id: "main" }, data: { heroImage } });
  refreshSite();
  done("/admin");
}

export async function saveSection(formData: FormData) {
  await requireUser(true);
  const key = text(formData, "key");
  if (!/^[a-z0-9-]{2,40}$/.test(key)) done("/admin/contenu", "Clé de section invalide.");
  if (!text(formData, "titleFr") || !text(formData, "bodyFr")) done("/admin/contenu", "Le titre et le texte français sont obligatoires.");
  await db().siteSection.upsert({
    where: { key },
    create: {
      key,
      titleFr: text(formData, "titleFr"),
      titleAr: text(formData, "titleAr"),
      bodyFr: text(formData, "bodyFr"),
      bodyAr: text(formData, "bodyAr"),
    },
    update: {
      titleFr: text(formData, "titleFr"),
      titleAr: text(formData, "titleAr"),
      bodyFr: text(formData, "bodyFr"),
      bodyAr: text(formData, "bodyAr"),
    },
  });
  refreshSite();
  done("/admin/contenu");
}

export async function saveWhy(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const data = {
    titleFr: text(formData, "titleFr"),
    titleAr: text(formData, "titleAr"),
    bodyFr: text(formData, "bodyFr"),
    bodyAr: text(formData, "bodyAr"),
    icon: text(formData, "icon") || "sparkles",
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!data.titleFr || !data.bodyFr) done("/admin/pourquoi", "Titre et texte français obligatoires.");
  if (id) await db().whyItem.update({ where: { id }, data });
  else await db().whyItem.create({ data });
  refreshSite();
  done("/admin/pourquoi");
}

export async function deleteWhy(formData: FormData) {
  await requireUser(true);
  await db().whyItem.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/pourquoi");
}

export async function saveCareer(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const data = {
    titleFr: text(formData, "titleFr"),
    titleAr: text(formData, "titleAr"),
    summaryFr: text(formData, "summaryFr"),
    summaryAr: text(formData, "summaryAr"),
    icon: text(formData, "icon") || "briefcase",
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!data.titleFr || !data.summaryFr) done("/admin/metiers", "Titre et résumé français obligatoires.");
  if (id) await db().career.update({ where: { id }, data });
  else await db().career.create({ data });
  refreshSite();
  done("/admin/metiers");
}

export async function deleteCareer(formData: FormData) {
  await requireUser(true);
  await db().career.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/metiers");
}

export async function saveProgram(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const data = {
    startTime: text(formData, "startTime"),
    endTime: text(formData, "endTime"),
    titleFr: text(formData, "titleFr"),
    titleAr: text(formData, "titleAr"),
    descriptionFr: text(formData, "descriptionFr"),
    descriptionAr: text(formData, "descriptionAr"),
    location: text(formData, "location"),
    speakerName: text(formData, "speakerName"),
    category: text(formData, "category") || "plenary",
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!/^\d{2}:\d{2}$/.test(data.startTime) || !/^\d{2}:\d{2}$/.test(data.endTime) || !data.titleFr) {
    done("/admin/programme", "Horaires HH:MM et titre français obligatoires.");
  }
  if (id) await db().programItem.update({ where: { id }, data });
  else await db().programItem.create({ data });
  refreshSite();
  done("/admin/programme");
}

export async function deleteProgram(formData: FormData) {
  await requireUser(true);
  await db().programItem.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/programme");
}

export async function saveSpeaker(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  let photoUrl = "";
  try {
    photoUrl = await imageField(formData, "photoUrl");
  } catch (error) {
    done("/admin/intervenants", error instanceof Error ? error.message : "Image refusée.");
  }
  const data = {
    name: text(formData, "name"),
    roleFr: text(formData, "roleFr"),
    roleAr: text(formData, "roleAr"),
    org: text(formData, "org"),
    bioFr: text(formData, "bioFr"),
    bioAr: text(formData, "bioAr"),
    photoUrl,
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!data.name || !data.roleFr) done("/admin/intervenants", "Nom et fonction obligatoires.");
  if (id) await db().speaker.update({ where: { id }, data });
  else await db().speaker.create({ data });
  refreshSite();
  done("/admin/intervenants");
}

export async function deleteSpeaker(formData: FormData) {
  await requireUser(true);
  await db().speaker.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/intervenants");
}

export async function savePartner(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const tiers = ["INSTITUTIONAL", "GOLD", "SILVER", "PARTNER", "MEDIA"];
  const tier = text(formData, "tier");
  if (!tiers.includes(tier)) done("/admin/partenaires", "Catégorie invalide.");
  let logoUrl = "";
  try {
    logoUrl = await imageField(formData, "logoUrl");
  } catch (error) {
    done("/admin/partenaires", error instanceof Error ? error.message : "Logo refusé.");
  }
  const website = text(formData, "website");
  if (website && !/^https:\/\/\S+$/i.test(website)) done("/admin/partenaires", "Le site doit être une URL https.");
  const data = {
    name: text(formData, "name"),
    logoUrl,
    website,
    tier: tier as PartnerTier,
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!data.name) done("/admin/partenaires", "Le nom est obligatoire.");
  if (id) await db().partner.update({ where: { id }, data });
  else await db().partner.create({ data });
  refreshSite();
  done("/admin/partenaires");
}

export async function deletePartner(formData: FormData) {
  await requireUser(true);
  await db().partner.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/partenaires");
}

export async function saveFaq(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const data = {
    questionFr: text(formData, "questionFr"),
    questionAr: text(formData, "questionAr"),
    answerFr: text(formData, "answerFr"),
    answerAr: text(formData, "answerAr"),
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (!data.questionFr || !data.answerFr) done("/admin/faq", "Question et réponse françaises obligatoires.");
  if (id) await db().faqItem.update({ where: { id }, data });
  else await db().faqItem.create({ data });
  refreshSite();
  done("/admin/faq");
}

export async function deleteFaq(formData: FormData) {
  await requireUser(true);
  await db().faqItem.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/faq");
}

export async function saveGallery(formData: FormData) {
  await requireUser(true);
  const id = text(formData, "id");
  const type = text(formData, "type") === "VIDEO" ? "VIDEO" : "IMAGE";
  let url = "";
  try {
    url = await imageField(formData, "url");
  } catch (error) {
    done("/admin/galerie", error instanceof Error ? error.message : "Fichier refusé.");
  }
  if (type === "VIDEO" && url && !url.includes("youtube.com") && !url.includes("youtu.be") && !url.includes("vimeo.com")) {
    done("/admin/galerie", "La vidéo doit être un lien YouTube ou Vimeo.");
  }
  const data = {
    type: type as MediaType,
    url,
    captionFr: text(formData, "captionFr"),
    captionAr: text(formData, "captionAr"),
    sortOrder: order(formData),
    published: flag(formData, "published"),
  };
  if (id) await db().galleryItem.update({ where: { id }, data });
  else await db().galleryItem.create({ data });
  refreshSite();
  done("/admin/galerie");
}

export async function deleteGallery(formData: FormData) {
  await requireUser(true);
  await db().galleryItem.delete({ where: { id: text(formData, "id") } });
  refreshSite();
  done("/admin/galerie");
}

export async function setRegistrationStatus(formData: FormData) {
  await requireUser(false);
  const id = text(formData, "id");
  const status = text(formData, "status");
  const allowed = ["PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED"];
  if (!allowed.includes(status)) done("/admin/inscriptions", "Statut invalide.");
  await db().registration.update({
    where: { id },
    data: {
      status: status as RegistrationStatus,
      checkedInAt: status === "CHECKED_IN" ? new Date() : null,
    },
  });
  revalidatePath("/admin/inscriptions");
  revalidatePath("/");
  done("/admin/inscriptions");
}

export async function resendRegistration(formData: FormData) {
  await requireUser(false);
  const id = text(formData, "id");
  await deliverRegistration(id);
  revalidatePath("/admin/inscriptions");
  done("/admin/inscriptions");
}

export async function checkInByToken(formData: FormData) {
  await requireUser(false);
  const token = text(formData, "token");
  const row = await db().registration.findUnique({ where: { qrToken: token } });
  if (!row) done("/admin/checkin", "Billet introuvable.");
  if (row.status === "CANCELLED") done(`/admin/checkin?token=${token}`, "Cette inscription est annulée.");
  await db().registration.update({
    where: { id: row.id },
    data: { status: "CHECKED_IN", checkedInAt: new Date() },
  });
  revalidatePath("/admin/inscriptions");
  redirect(`/admin/checkin?token=${token}&ok=1`);
}

export async function markMessage(formData: FormData) {
  await requireUser(false);
  await db().contactMessage.update({
    where: { id: text(formData, "id") },
    data: { read: flag(formData, "read") },
  });
  done("/admin/messages");
}

export async function saveUser(formData: FormData) {
  await requireUser(true);
  const parsed = userSchema.safeParse({
    id: text(formData, "id") || undefined,
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    role: text(formData, "role"),
    password: text(formData, "password"),
  });
  if (!parsed.success) done("/admin/utilisateurs", parsed.error.issues[0]?.message ?? "Compte invalide.");
  const password = parsed.data.password ?? "";
  if (!parsed.data.id && password.length < 10) done("/admin/utilisateurs", "Le mot de passe doit contenir au moins 10 caractères.");
  if (password && password.length < 10) done("/admin/utilisateurs", "Le mot de passe doit contenir au moins 10 caractères.");
  const role = parsed.data.role as Role;
  if (parsed.data.id) {
    const current = await db().user.findUnique({ where: { id: parsed.data.id } });
    if (!current) done("/admin/utilisateurs", "Compte introuvable.");
    if (current.role === "ADMIN" && role !== "ADMIN") {
      const others = await db().user.count({ where: { role: "ADMIN", active: true, NOT: { id: current.id } } });
      if (others === 0) done("/admin/utilisateurs", "Conservez au moins un administrateur actif.");
    }
    await db().user.update({
      where: { id: current.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
    });
  } else {
    await db().user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
  }
  done("/admin/utilisateurs");
}

export async function toggleUser(formData: FormData) {
  await requireUser(true);
  const session = await requireUser(true);
  const id = text(formData, "id");
  if (id === session.user.id) done("/admin/utilisateurs", "Vous ne pouvez pas désactiver votre propre compte.");
  const user = await db().user.findUnique({ where: { id } });
  if (!user) done("/admin/utilisateurs", "Compte introuvable.");
  if (user.role === "ADMIN" && user.active) {
    const others = await db().user.count({ where: { role: "ADMIN", active: true, NOT: { id } } });
    if (others === 0) done("/admin/utilisateurs", "Conservez au moins un administrateur actif.");
  }
  await db().user.update({ where: { id }, data: { active: !user.active } });
  done("/admin/utilisateurs");
}
