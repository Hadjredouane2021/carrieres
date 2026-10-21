import { BadgeCheck, Briefcase, GraduationCap, Presentation, Sparkles, Users, type LucideIcon } from "lucide-react";
import type { PARTICIPANT_TYPES } from "@/lib/constants";

// Icône de chaque profil de participant (page Le Forum et parcours d'inscription).
export const participantIcons: Record<(typeof PARTICIPANT_TYPES)[number]["value"], LucideIcon> = {
  STUDENT: GraduationCap,
  GRADUATE: BadgeCheck,
  PROFESSIONAL: Briefcase,
  TEACHER: Presentation,
  RECRUITER: Users,
  OTHER: Sparkles,
};
