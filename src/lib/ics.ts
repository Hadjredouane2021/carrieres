import { fromCasablancaInput, toCasablancaInput } from "@/lib/datetime";

// Fichier d'agenda de l'événement : aucune donnée personnelle ni jeton de billet n'y figure.

function escape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function eventCalendar({
  start,
  endTime,
  title,
  location,
  description,
  url,
}: {
  start: Date | null;
  endTime?: string;
  title: string;
  location: string;
  description: string;
  url: string;
}) {
  if (!start) return null;
  // Fin : dernier horaire du programme, le même jour à l'heure de Casablanca, s'il est postérieur au début.
  const day = toCasablancaInput(start).slice(0, 10);
  const end = endTime ? fromCasablancaInput(`${day}T${endTime}`) : null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Assur'Carriere//Forum des Metiers de l'Assurance//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:forum-${day}@assurcarriere`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    ...(end && end > start ? [`DTEND:${stamp(end)}`] : []),
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(description)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

// Adresse partiellement masquée pour l'affichage (n***@exemple.ma).
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 2))}@${domain}`;
}
