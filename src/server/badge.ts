import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { appUrl } from "@/lib/utils";
import { labelOf, PARTICIPANT_TYPES } from "@/lib/constants";

function winAnsi(value: string) {
  return value
    .normalize("NFC")
    .replace(/[^\u0000-\u00FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function createBadgePdf(input: {
  firstName: string;
  lastName: string;
  reference: string;
  organization: string;
  participantType: string;
  token: string;
  eventLabel: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([640, 280]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const night = rgb(0.043, 0.106, 0.227);
  const gold = rgb(0.847, 0.71, 0.478);
  const beige = rgb(0.953, 0.914, 0.863);

  page.drawRectangle({ x: 0, y: 0, width: 640, height: 280, color: night });
  page.drawRectangle({ x: 0, y: 0, width: 14, height: 280, color: gold });
  page.drawText("FEDERATION MAROCAINE DE L'ASSURANCE", {
    x: 36,
    y: 236,
    size: 9,
    font: bold,
    color: gold,
  });
  page.drawText("FORUM DES METIERS DE L'ASSURANCE", {
    x: 36,
    y: 208,
    size: 16,
    font: bold,
    color: beige,
  });
  page.drawText("2026  ·  CASABLANCA", { x: 36, y: 188, size: 10, font: regular, color: gold });
  page.drawText(winAnsi(`${input.firstName} ${input.lastName}`).toUpperCase() || input.reference, {
    x: 36,
    y: 142,
    size: 20,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(winAnsi(labelOf(PARTICIPANT_TYPES, input.participantType, "fr")), {
    x: 36,
    y: 116,
    size: 12,
    font: regular,
    color: beige,
  });
  page.drawText(winAnsi(input.organization).slice(0, 48), {
    x: 36,
    y: 96,
    size: 11,
    font: regular,
    color: beige,
  });
  page.drawText(winAnsi(input.eventLabel).slice(0, 70), {
    x: 36,
    y: 48,
    size: 9,
    font: regular,
    color: gold,
  });
  page.drawText(input.reference, { x: 36, y: 28, size: 12, font: bold, color: rgb(1, 1, 1) });

  const checkInUrl = `${appUrl()}/admin/checkin?token=${input.token}`;
  const qr = await QRCode.toBuffer(checkInUrl, { margin: 1, width: 280, color: { dark: "#0B1B3A", light: "#FFFFFF" } });
  const image = await pdf.embedPng(qr);
  page.drawRectangle({ x: 470, y: 46, width: 140, height: 140, color: rgb(1, 1, 1) });
  page.drawImage(image, { x: 478, y: 54, width: 124, height: 124 });

  return pdf.save();
}
