// Couleur de chaque type de créneau dans le back-office (frise et sélecteur).
export const PROGRAM_TONES: Record<string, { dot: string; chip: string; rail: string }> = {
  welcome: { dot: "bg-amber-400", chip: "bg-amber-50 text-amber-800", rail: "border-amber-400" },
  plenary: { dot: "bg-sun", chip: "bg-dawn text-sun-ink", rail: "border-sun" },
  roundtable: { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700", rail: "border-violet-500" },
  workshop: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", rail: "border-emerald-500" },
  break: { dot: "bg-zinc-400", chip: "bg-zinc-100 text-zinc-600", rail: "border-zinc-400" },
  networking: { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700", rail: "border-sky-500" },
  closing: { dot: "bg-night", chip: "bg-night/[0.07] text-night", rail: "border-night" },
};

export function toMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function formatDuration(total: number) {
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${String(rest).padStart(2, "0")}` : `${hours} h`;
}
