import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { toCasablancaInput } from "@/lib/datetime";
import { db } from "@/lib/prisma";
import { saveSettings } from "@/server/actions/admin";

export const instant = false;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display text-4xl text-night">Paramètres</h1>
      <p className="mb-5 mt-2 text-institution">La date est saisie à l'heure du Maroc. Laissez-la vide pour masquer le compte à rebours.</p>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveSettings} className="grid gap-4 rounded-3xl bg-white p-6">
        <label className="grid gap-1 text-sm">Date et heure<input className="field" type="datetime-local" name="eventDate" defaultValue={toCasablancaInput(settings?.eventDate ?? null)} /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">Lieu<input className="field" name="venueName" defaultValue={settings?.venueName ?? "Casablanca"} /></label>
          <label className="grid gap-1 text-sm">Ville<input className="field" name="city" defaultValue={settings?.city ?? "Casablanca"} /></label>
        </div>
        <label className="grid gap-1 text-sm">Adresse<textarea className="field" name="address" defaultValue={settings?.address ?? ""} /></label>
        <label className="grid gap-1 text-sm">Slogan français<input className="field" name="sloganFr" defaultValue={settings?.sloganFr ?? "Choisis ton avenir"} /></label>
        <label className="grid gap-1 text-sm">Slogan arabe<input className="field" name="sloganAr" defaultValue={settings?.sloganAr ?? ""} dir="rtl" /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">E-mail<input className="field" name="contactEmail" defaultValue={settings?.contactEmail ?? ""} /></label>
          <label className="grid gap-1 text-sm">Téléphone<input className="field" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} /></label>
        </div>
        <label className="grid gap-1 text-sm">LinkedIn<input className="field" name="linkedin" defaultValue={settings?.linkedin ?? ""} /></label>
        <label className="grid gap-1 text-sm">Instagram<input className="field" name="instagram" defaultValue={settings?.instagram ?? ""} /></label>
        <label className="grid gap-1 text-sm">Facebook<input className="field" name="facebook" defaultValue={settings?.facebook ?? ""} /></label>
        <label className="grid gap-1 text-sm">YouTube<input className="field" name="youtube" defaultValue={settings?.youtube ?? ""} /></label>
        <label className="grid gap-1 text-sm">Capacité<input className="field" name="capacity" type="number" min={1} defaultValue={settings?.capacity ?? 1500} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="registrationOpen" defaultChecked={settings?.registrationOpen ?? true} /> Inscriptions ouvertes</label>
        <button className="h-11 rounded-full bg-night text-beige">Enregistrer</button>
      </form>
    </div>
  );
}
