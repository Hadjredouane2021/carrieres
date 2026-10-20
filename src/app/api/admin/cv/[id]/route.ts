import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });
  const { id } = await context.params;
  const row = await db().registration.findUnique({ where: { id }, select: { cvPath: true, reference: true } });
  if (!row?.cvPath || !/^[a-f0-9]{32}\.pdf$/.test(row.cvPath)) return new NextResponse("Introuvable", { status: 404 });
  const file = await readFile(path.join(process.cwd(), "storage", "cv", row.cvPath));
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.reference}-cv.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
