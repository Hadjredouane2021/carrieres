import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { appUrl } from "@/lib/utils";
import { db } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{48}$/.test(token)) return new NextResponse("Introuvable", { status: 404 });
  const row = await db().registration.findUnique({ where: { qrToken: token }, select: { qrToken: true, status: true } });
  if (!row || row.status === "CANCELLED") return new NextResponse("Introuvable", { status: 404 });
  const png = await QRCode.toBuffer(`${appUrl()}/admin/checkin?token=${row.qrToken}`, {
    type: "png",
    margin: 1,
    width: 480,
    color: { dark: "#0B1B3A", light: "#FFFFFF" },
  });
  return new NextResponse(Buffer.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
