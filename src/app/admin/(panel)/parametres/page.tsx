import { AtSign, CalendarDays, Link2, MapPin, Megaphone, Phone, Users } from "lucide-react";
import { FormField, Panel, PublishedToggle } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { toCasablancaInput } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { saveSettings } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

const sections = [
  { id: "evenement", label: "Événement", icon: CalendarDays },
  { id: "lieu", label: "Lieu", icon: MapPin },
  { id: "identite", label: "Slogan", icon: Megaphone },
  { id: "contact", label: "Contact", icon: AtSign },
  { id: "reseaux", label: "Réseaux sociaux", icon: Link2 },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const [settings, registered] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().registration.count({ where: { status: { not: "CANCELLED" } } }),
  ]);
  const capacity = settings?.capacity ?? 1500;
  const fill = Math.min(100, Math.round((registered / Math.max(capacity, 1)) * 100));
  const socials = [
    { name: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/…" },
    { name: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…" },
    { name: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/…" },
    { name: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
  ] as const;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Configuration" title="Paramètres" intro="Les informations générales de l'événement, reprises sur tout le site, les billets et les e-mails." />
      <Flash error={query.error} ok={query.ok} />

      <div className="grid items-start gap-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Sections" className="hidden lg:sticky lg:top-24 lg:block">
          <ul className="grid gap-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a href={`#${id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-institution transition hover:bg-white hover:text-night">
                  <Icon className="size-4 text-gold" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <form action={saveSettings} className="grid gap-5">
          <div id="evenement" className="scroll-mt-24">
            <Panel title="Événement" description="La date pilote le compte à rebours. Laissez-la vide pour le masquer." icon={<CalendarDays className="size-5" />}>
              <FormField label="Date et heure" hint="Heure du Maroc.">
                <input className="field" type="datetime-local" name="eventDate" defaultValue={toCasablancaInput(settings?.eventDate ?? null)} />
              </FormField>
              <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                <FormField label="Capacité d'accueil">
                  <span className="relative">
                    <Users className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                    <input className="field ps-10" name="capacity" type="number" min={1} max={20000} defaultValue={capacity} />
                  </span>
                </FormField>
                <div className="grid content-end gap-1.5 rounded-2xl bg-mist/70 p-3.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-institution">Places prises</span>
                    <span className="font-medium text-night">{registered} / {capacity}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#B8935A]" style={{ width: `${fill}%` }} />
                  </div>
                </div>
              </div>
              <PublishedToggle name="registrationOpen" checked={settings?.registrationOpen ?? true} label="Inscriptions ouvertes" />
            </Panel>
          </div>

          <div id="lieu" className="scroll-mt-24">
            <Panel title="Lieu" description="Affiché sous la date dans le hero, sur les billets et dans la page contact." icon={<MapPin className="size-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nom du lieu"><input className="field" name="venueName" defaultValue={settings?.venueName ?? "Casablanca"} /></FormField>
                <FormField label="Ville"><input className="field" name="city" defaultValue={settings?.city ?? "Casablanca"} /></FormField>
              </div>
              <FormField label="Adresse"><textarea className="field min-h-20" name="address" defaultValue={settings?.address ?? ""} /></FormField>
            </Panel>
          </div>

          <div id="identite" className="scroll-mt-24">
            <Panel title="Slogan" description="La phrase d'accroche du hero, aussi modifiable depuis la page Hero." icon={<Megaphone className="size-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Français"><input className="field" name="sloganFr" defaultValue={settings?.sloganFr ?? "Choisis ton avenir"} /></FormField>
                <FormField label="Arabe"><input className="field" name="sloganAr" dir="rtl" defaultValue={settings?.sloganAr ?? ""} /></FormField>
              </div>
            </Panel>
          </div>

          <div id="contact" className="scroll-mt-24">
            <Panel title="Contact" description="Coordonnées publiques de l'équipe." icon={<AtSign className="size-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="E-mail">
                  <span className="relative">
                    <AtSign className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                    <input className="field ps-10" type="email" name="contactEmail" defaultValue={settings?.contactEmail ?? ""} required />
                  </span>
                </FormField>
                <FormField label="Téléphone">
                  <span className="relative">
                    <Phone className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                    <input className="field ps-10" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} />
                  </span>
                </FormField>
              </div>
            </Panel>
          </div>

          <div id="reseaux" className="scroll-mt-24">
            <Panel title="Réseaux sociaux" description="Laissez un champ vide pour masquer le lien." icon={<Link2 className="size-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                {socials.map(({ name, label, placeholder }) => (
                  <FormField key={name} label={label}>
                    <span className="relative">
                      <Link2 className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                      <input className="field ps-10" name={name} placeholder={placeholder} defaultValue={settings?.[name] ?? ""} />
                    </span>
                  </FormField>
                ))}
              </div>
            </Panel>
          </div>

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl bg-night/95 p-2 ps-5 text-sm text-beige shadow-2xl shadow-night/30 backdrop-blur">
            <span className="text-beige/70">Les changements s'appliquent dès l'enregistrement.</span>
            <button className="h-10 rounded-xl bg-gold px-5 font-medium text-night hover:bg-gold-bright">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
