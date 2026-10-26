import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { labelOf, PARTICIPANT_TYPES, STATUSES } from "@/lib/constants";
import { levelLabel, parseLevels } from "@/lib/education";
import { db } from "@/lib/prisma";
import { registrationWhere } from "@/server/registration-query";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const rows = await db().registration.findMany({
    where: registrationWhere({
      q: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    }),
    orderBy: { createdAt: "desc" },
  });
  const settings = await db().eventSettings.findUnique({ where: { id: "main" }, select: { educationLevels: true } });
  const levels = parseLevels(settings?.educationLevels);
  const header = ["Référence", "Civilité", "Nom", "Prénom", "E-mail", "Téléphone", "Ville", "Profil", "Organisation", "Niveau", "Filière", "Année", "Statut", "CV", "Créée le"];
  const data = rows.map((row) => [
    row.reference,
    row.civility,
    row.lastName,
    row.firstName,
    row.email,
    row.phone,
    row.city,
    labelOf(PARTICIPANT_TYPES, row.participantType, "fr"),
    row.organization,
    levelLabel(levels, row.educationLevel),
    row.fieldOfStudy,
    row.studyYear,
    labelOf(STATUSES, row.status, "fr"),
    row.cvPath ? "Oui" : "Non",
    row.createdAt.toISOString(),
  ]);

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Inscriptions");
    sheet.addRow(header);
    for (const line of data) sheet.addRow(line);
    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=inscriptions-forum-2026.xlsx",
      },
    });
  }

  const csv = [header, ...data]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=inscriptions-forum-2026.csv",
    },
  });
}
