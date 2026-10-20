import nodemailer from "nodemailer";
import { appUrl } from "@/lib/utils";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const mailer = transport();
  if (!mailer) {
    return { sent: false, error: "SMTP non configuré" };
  }
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || "Forum des Métiers de l'Assurance <noreply@localhost>",
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    return { sent: true, error: "" };
  } catch (error) {
    console.error("Envoi e-mail impossible", error);
    return { sent: false, error: "L'envoi SMTP a échoué." };
  }
}

export function registrationMail(input: {
  firstName: string;
  reference: string;
  token: string;
  eventLabel: string;
}) {
  const ticket = `${appUrl()}/billet/${input.token}`;
  const subject = `Confirmation — Forum des Métiers de l'Assurance (${input.reference})`;
  const text = [
    `Bonjour ${input.firstName},`,
    "",
    "Votre inscription au Forum des Métiers de l'Assurance est confirmée.",
    `Référence : ${input.reference}`,
    input.eventLabel,
    `Votre billet : ${ticket}`,
    "",
    "Présentez le QR code le jour de l'événement.",
    "Fédération Marocaine de l'Assurance",
  ].join("\n");
  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#F3E9DC;font-family:Arial,sans-serif;color:#0B1B3A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3E9DC;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E6D7C3">
        <tr><td style="background:#0B1B3A;padding:28px 32px;color:#F3E9DC">
          <div style="letter-spacing:3px;font-size:11px;color:#D8B57A">FÉDÉRATION MAROCAINE DE L'ASSURANCE</div>
          <h1 style="margin:12px 0 0;font-size:26px;line-height:1.15">Forum des Métiers de l'Assurance</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <p>Bonjour ${escapeHtml(input.firstName)},</p>
          <p>Votre place est confirmée. Choisis ton avenir.</p>
          <p style="font-size:18px"><strong>${escapeHtml(input.reference)}</strong></p>
          <p>${escapeHtml(input.eventLabel)}</p>
          <p><a href="${ticket}" style="display:inline-block;background:#D8B57A;color:#0B1B3A;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Ouvrir mon billet</a></p>
          <p style="color:#173D70">Le QR code joint à ce message sert d'accès le jour du Forum.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
