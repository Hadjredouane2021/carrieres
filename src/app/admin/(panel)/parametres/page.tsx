import { connection } from "next/server";
import { AdminField, AdminHeader, Panel } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
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
    <div className="mx-auto grid max-w-4xl gap-6">
      <AdminHeader eyebrow="Administration" title="Paramètres de l'événement" description="Ces informations alimentent l'accueil, le billet, le PDF et les e-mails." />
      <Flash error={query.error} ok={query.ok} />
      <form action={saveSettings} className="grid gap-5">
        <Panel title="Date et lieu" description="La date est saisie à l'heure du Maroc. Laissez-la vide pour masquer le compte à rebours.">
          <div className="grid gap-4">
            <AdminField label="Date et heure" className="max-w-xs">
              <input className="field" type="datetime-local" name="eventDate" defaultValue={toCasablancaInput(settings?.eventDate ?? null)} />
            </AdminField>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Lieu">
                <input className="field" name="venueName" defaultValue={settings?.venueName ?? "Casablanca"} />
              </AdminField>
              <AdminField label="Ville">
                <input className="field" name="city" defaultValue={settings?.city ?? "Casablanca"} />
              </AdminField>
            </div>
            <AdminField label="Adresse">
              <textarea className="field" name="address" defaultValue={settings?.address ?? ""} />
            </AdminField>
          </div>
        </Panel>
        <Panel title="Inscriptions">
          <div className="flex flex-wrap items-end gap-5">
            <AdminField label="Capacité d'accueil" className="w-48">
              <input className="field" name="capacity" type="number" min={1} defaultValue={settings?.capacity ?? 1500} />
            </AdminField>
            <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-night/10 px-3 py-2.5 text-sm text-night has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
              <input type="checkbox" name="registrationOpen" defaultChecked={settings?.registrationOpen ?? true} className="size-4 accent-[#0b1b3a]" />
              Inscriptions ouvertes
            </label>
          </div>
        </Panel>
        <Panel title="Slogan">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Slogan français">
              <input className="field" name="sloganFr" defaultValue={settings?.sloganFr ?? "Choisis ton avenir"} />
            </AdminField>
            <AdminField label="Slogan arabe">
              <input className="field" name="sloganAr" defaultValue={settings?.sloganAr ?? ""} dir="rtl" />
            </AdminField>
          </div>
        </Panel>
        <Panel title="Contact et réseaux" description="Les liens de réseaux sociaux ne s'affichent que s'ils commencent par https://.">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="E-mail de contact">
                <input className="field" name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} />
              </AdminField>
              <AdminField label="Téléphone">
                <input className="field" name="contactPhone" defaultValue={settings?.contactPhone ?? ""} />
              </AdminField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="LinkedIn">
                <input className="field" name="linkedin" placeholder="https://" defaultValue={settings?.linkedin ?? ""} />
              </AdminField>
              <AdminField label="Instagram">
                <input className="field" name="instagram" placeholder="https://" defaultValue={settings?.instagram ?? ""} />
              </AdminField>
              <AdminField label="Facebook">
                <input className="field" name="facebook" placeholder="https://" defaultValue={settings?.facebook ?? ""} />
              </AdminField>
              <AdminField label="YouTube">
                <input className="field" name="youtube" placeholder="https://" defaultValue={settings?.youtube ?? ""} />
              </AdminField>
            </div>
          </div>
        </Panel>
        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton size="lg" className="shadow-lg">
            Enregistrer les paramètres
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
