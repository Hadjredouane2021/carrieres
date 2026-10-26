import { CalendarClock, Link2, MapPin, Users } from "lucide-react";
import { connection } from "next/server";
import { AdminHeader, StatGrid } from "@/components/admin/kit";
import { SettingsForm } from "@/components/admin/settings-form";
import { Flash } from "@/components/admin/shell";
import { eventDateParts, toCasablancaInput } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { placeLabel } from "@/lib/utils";
import { saveSettings } from "@/server/actions/admin";

export const metadata = { title: "Paramètres" };
export const instant = false;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const [settings, registered] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().registration.count({ where: { status: { not: "CANCELLED" } } }),
  ]);
  const capacity = settings?.capacity ?? 1500;
  const fill = Math.min(100, Math.round((registered / Math.max(capacity, 1)) * 100));
  const when = eventDateParts(settings?.eventDate?.toISOString() ?? null, "fr");
  const now = new Date();
  const daysLeft = settings?.eventDate ? Math.ceil((settings.eventDate.getTime() - now.getTime()) / 86_400_000) : null;
  const socials = [settings?.linkedin, settings?.instagram, settings?.facebook, settings?.tiktok];
  const linked = socials.filter((value) => (value ?? "").startsWith("https://")).length;
  const open = settings?.registrationOpen ?? true;
  // Jour courant au Maroc, pour un compte à rebours d'aperçu cohérent avec le site.
  const today = toCasablancaInput(now).slice(0, 10);

  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Administration" title="Paramètres de l'événement" description="Ces informations alimentent l'accueil, le billet, le PDF et les e-mails. L'aperçu à droite se met à jour pendant la saisie." />
      <Flash error={query.error} ok={query.ok} />

      <StatGrid
        stats={[
          {
            label: "Date",
            value: when?.day ?? "À définir",
            hint: daysLeft === null ? "Compte à rebours masqué" : daysLeft > 0 ? `J-${daysLeft} · ${when?.time}` : daysLeft === 0 ? "C'est aujourd'hui" : "Événement passé",
            icon: CalendarClock,
          },
          { label: "Lieu", value: placeLabel(settings?.venueName, settings?.city) || "—", hint: settings?.address || "Adresse non renseignée", icon: MapPin },
          { label: "Remplissage", value: `${fill} %`, hint: `${registered} / ${capacity} places · ${open ? "inscriptions ouvertes" : "inscriptions fermées"}`, icon: Users, alert: !open },
          { label: "Réseaux sociaux", value: `${linked}/${socials.length}`, hint: "Liens affichés sur le site", icon: Link2 },
        ]}
      />

      <SettingsForm
        key={settings?.updatedAt.toISOString() ?? "new"}
        action={saveSettings}
        registered={registered}
        today={today}
        initial={{
          eventDate: toCasablancaInput(settings?.eventDate ?? null),
          venueName: settings?.venueName ?? "Casablanca",
          city: settings?.city ?? "Casablanca",
          address: settings?.address ?? "",
          capacity,
          registrationOpen: open,
          sloganFr: settings?.sloganFr ?? "Choisis ton avenir",
          sloganAr: settings?.sloganAr ?? "",
          contactEmail: settings?.contactEmail ?? "",
          contactPhone: settings?.contactPhone ?? "",
          linkedin: settings?.linkedin ?? "",
          instagram: settings?.instagram ?? "",
          facebook: settings?.facebook ?? "",
          tiktok: settings?.tiktok ?? "",
          ribbonItems: settings?.ribbonItems ?? "",
          heroMarquee: settings?.heroMarquee ?? "",
        }}
      />
    </div>
  );
}
