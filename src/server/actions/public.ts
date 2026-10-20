"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { CITIES } from "@/lib/constants";
import { createReference, createToken } from "@/lib/codes";
import { db } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { saveCv } from "@/lib/uploads";
import { contactSchema, registrationSchema } from "@/lib/validators";
import { sendMail } from "@/lib/mail";
import { deliverRegistration } from "@/server/notifications";

export type ActionResult = { ok: true; token?: string; message?: string } | { ok: false; message: string };

export async function registerParticipant(payload: unknown, cv: FormData): Promise<ActionResult> {
  const key = await clientKey("register");
  if (!rateLimit(key, 8, 60 * 60 * 1000).ok) {
    return { ok: false, message: "Trop de tentatives. Réessayez dans une heure." };
  }

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Le formulaire est incomplet." };
  }
  const data = parsed.data;
  if (data.website) return { ok: true, token: "" };

  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  if (settings && !settings.registrationOpen) {
    return { ok: false, message: "Les inscriptions sont momentanément fermées." };
  }
  const capacity = settings?.capacity ?? 1500;
  const used = await db().registration.count({ where: { status: { not: "CANCELLED" } } });
  const existing = await db().registration.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing && existing.status !== "CANCELLED") {
    return {
      ok: false,
      message: "Un dossier existe déjà pour cette adresse e-mail. Consultez votre billet ou contactez l'organisation.",
    };
  }
  if (used >= capacity) {
    return { ok: false, message: "La capacité d'accueil de cette édition est atteinte." };
  }

  const knownCities = new Set<string>(CITIES.map((city) => city.value));
  if (!knownCities.has(data.city)) return { ok: false, message: "Choisissez une ville de la liste." };
  const city = data.city === "OTHER" ? data.cityOther.trim() : data.city;

  const [careers, sessions] = await Promise.all([
    db().career.findMany({ where: { published: true }, select: { id: true } }),
    db().programItem.findMany({ where: { published: true }, select: { id: true } }),
  ]);
  const careerIds = new Set(careers.map((item) => item.id));
  const sessionIds = new Set(sessions.map((item) => item.id));
  const interests = data.interests.filter((id) => careerIds.has(id));
  const selectedSessions = data.sessions.filter((id) => sessionIds.has(id));

  let cvPath = "";
  const file = cv.get("cv");
  if (file instanceof File && file.size > 0) {
    try {
      cvPath = await saveCv(file);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "CV refusé." };
    }
  }

  const record = {
    civility: data.civility,
    lastName: data.lastName,
    firstName: data.firstName,
    email: data.email.toLowerCase(),
    phone: `+212${data.phone}`,
    city,
    participantType: data.participantType,
    organization: data.organization,
    educationLevel: data.educationLevel,
    fieldOfStudy: data.fieldOfStudy,
    studyYear: data.studyYear,
    interests,
    sessions: selectedSessions,
    discoverySource: data.discoverySource,
    expectations: data.expectations,
    portfolioUrl: data.portfolioUrl,
    cvPath,
    consentRules: true,
    consentContact: data.consentContact,
    status: "CONFIRMED" as const,
  };

  try {
    const saved = existing
      ? await db().registration.update({
          where: { id: existing.id },
          data: {
            ...record,
            qrToken: existing.status === "CANCELLED" ? createToken() : existing.qrToken,
            reference: existing.reference,
          },
        })
      : await db().registration.create({
          data: { ...record, reference: createReference(), qrToken: createToken() },
        });
    await deliverRegistration(saved.id);
    revalidatePath("/admin/inscriptions");
    revalidatePath("/");
    return { ok: true, token: saved.qrToken };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Un dossier existe déjà pour cette adresse e-mail." };
    }
    console.error(error);
    return { ok: false, message: "L'inscription n'a pas pu être enregistrée." };
  }
}

export async function sendContact(payload: unknown): Promise<ActionResult> {
  const key = await clientKey("contact");
  if (!rateLimit(key, 6, 30 * 60 * 1000).ok) {
    return { ok: false, message: "Trop de messages. Réessayez un peu plus tard." };
  }
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Message incomplet." };
  }
  if (parsed.data.website) return { ok: true, message: "ok" };
  await db().contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  if (settings?.contactEmail) {
    await sendMail({
      to: settings.contactEmail,
      subject: `[Forum] ${parsed.data.subject}`,
      text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
      html: `<p><strong>${escapeHtml(parsed.data.name)}</strong> — ${escapeHtml(parsed.data.email)}</p><p>${escapeHtml(parsed.data.message).replaceAll("\n", "<br>")}</p>`,
    });
  }
  revalidatePath("/admin/messages");
  return { ok: true, message: "ok" };
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
