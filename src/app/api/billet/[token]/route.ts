import { NextResponse } from "next/server";
import { formatEventDate } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { createBadgePdf } from "@/server/badge";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{48}$/.test(token)) return new NextResponse("Introuvable", { status: 404 });
  const row = await db().registration.findUnique({ where: { qrToken: token } });
  if (!row || row.status === "CANCELLED") return new NextResponse("Introuvable", { status: 404 });
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  const pdf = await createBadgePdf({
    firstName: row.firstName,
    lastName: row.lastName,
    reference: row.reference,
    organization: row.organization,
    participantType: row.participantType,
    token: row.qrToken,
    eventLabel: formatEventDate(settings?.eventDate ?? null, "fr") ?? "Novembre 2026 — Casablanca",
  });
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
