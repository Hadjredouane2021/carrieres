import { formatEventDate } from "@/lib/datetime";
import { registrationMail, sendMail } from "@/lib/mail";
import { db } from "@/lib/prisma";
import { createBadgePdf } from "@/server/badge";

export async function deliverRegistration(id: string) {
  const row = await db().registration.findUnique({ where: { id } });
  if (!row || row.status === "CANCELLED") return { sent: false, error: "Inscription introuvable." };
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  const eventLabel = formatEventDate(settings?.eventDate ?? null, "fr") ?? "Novembre 2026 — Casablanca";
  const pdf = await createBadgePdf({
    firstName: row.firstName,
    lastName: row.lastName,
    reference: row.reference,
    organization: row.organization,
    participantType: row.participantType,
    token: row.qrToken,
    eventLabel,
  });
  const message = registrationMail({
    firstName: row.firstName,
    reference: row.reference,
    token: row.qrToken,
    eventLabel,
  });
  const result = await sendMail({
    to: row.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: [{ filename: `${row.reference}.pdf`, content: Buffer.from(pdf) }],
  });
  await db().registration.update({
    where: { id },
    data: { emailSent: result.sent, emailError: result.error },
  });
  return result;
}
