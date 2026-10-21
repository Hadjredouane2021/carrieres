import { connection } from "next/server";
import { AdminField, AdminHeader, EditorLayout, FormTitle, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { labelOf, PARTNER_TIERS } from "@/lib/constants";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { deletePartner, savePartner } from "@/server/actions/admin";

export const instant = false;

export default async function PartnersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().partner.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  const logo = safeAssetUrl(current?.logoUrl ?? "");
  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Partenaires"
        description="Logos officiels uniquement. Sans logo, le nom du partenaire s'affiche. Les catégories regroupent les partenaires sur la page dédiée."
      />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current?.name} noun="un partenaire" />
            <form key={current?.id ?? "new"} action={savePartner} encType="multipart/form-data" className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Nom">
                  <input className="field" name="name" defaultValue={current?.name ?? ""} required />
                </AdminField>
                <AdminField label="Catégorie">
                  <select className="field" name="tier" defaultValue={current?.tier ?? "PARTNER"}>
                    {PARTNER_TIERS.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.fr}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <AdminField label="Site web" hint="Adresse https complète, ouverte dans un nouvel onglet.">
                <input className="field" name="website" type="url" placeholder="https://" defaultValue={current?.website ?? ""} />
              </AdminField>
              <div className="grid gap-4 rounded-xl bg-mist/60 p-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <span className="grid h-20 w-28 place-items-center rounded-xl bg-white p-2 text-center text-xs text-muted ring-1 ring-night/10">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    "Aucun logo"
                  )}
                </span>
                <div className="grid gap-3">
                  <AdminField label="Logo : nouveau fichier" hint="JPG, PNG ou WebP, 3 Mo maximum. Remplace l'URL ci-dessous.">
                    <input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" />
                  </AdminField>
                  <AdminField label="ou URL du logo">
                    <input className="field" name="logoUrl" placeholder="https://…" defaultValue={current?.logoUrl ?? ""} />
                  </AdminField>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter le partenaire"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({
              id: item.id,
              title: item.name,
              meta: labelOf(PARTNER_TIERS, item.tier, "fr"),
              published: item.published,
              thumbnail: safeAssetUrl(item.logoUrl),
            }))}
            currentId={current?.id}
            deleteAction={deletePartner}
            empty="Aucun partenaire pour le moment."
          />
        }
      />
    </div>
  );
}
