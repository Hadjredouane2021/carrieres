export const STATUS_STYLE: Record<string, { label: string; tone: string; dot: string }> = {
  PENDING: { label: "En attente", tone: "bg-amber-50 text-amber-800 ring-amber-200/70", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmée", tone: "bg-sky-50 text-sky-800 ring-sky-200/70", dot: "bg-sky-500" },
  CHECKED_IN: { label: "Présent", tone: "bg-emerald-50 text-emerald-800 ring-emerald-200/70", dot: "bg-emerald-500" },
  CANCELLED: { label: "Annulée", tone: "bg-zinc-100 text-zinc-600 ring-zinc-200", dot: "bg-zinc-400" },
};
