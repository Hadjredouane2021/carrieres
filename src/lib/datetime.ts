const TIME_ZONE = "Africa/Casablanca";

export function formatEventDate(value: Date | string | null, locale: "fr" | "ar") {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function eventDateParts(value: string | null, locale: "fr" | "ar") {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", { ...options, timeZone: TIME_ZONE }).format(date);
  return {
    day: format({ day: "numeric", month: "long", year: "numeric" }),
    weekday: format({ weekday: "long" }),
    time: format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  };
}

export function toCasablancaInput(value: Date | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value);
  return parts.replace(" ", "T");
}

export function fromCasablancaInput(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
