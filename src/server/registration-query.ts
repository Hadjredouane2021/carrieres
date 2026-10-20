import type { ParticipantType, Prisma, RegistrationStatus } from "@/generated/prisma/client";

const statuses = new Set(["PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED"]);
const types = new Set(["STUDENT", "GRADUATE", "PROFESSIONAL", "TEACHER", "RECRUITER", "OTHER"]);

export function registrationWhere(query: { q?: string; status?: string; type?: string }): Prisma.RegistrationWhereInput {
  const where: Prisma.RegistrationWhereInput = {};
  if (query.status && statuses.has(query.status)) where.status = query.status as RegistrationStatus;
  if (query.type && types.has(query.type)) where.participantType = query.type as ParticipantType;
  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { lastName: { contains: q } },
      { firstName: { contains: q } },
      { email: { contains: q } },
      { reference: { contains: q } },
      { organization: { contains: q } },
      { city: { contains: q } },
    ];
  }
  return where;
}
