import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { deleteSpeaker, saveSpeaker } from "@/server/actions/admin";

export const instant = false;

export default async function SpeakersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().speaker.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  const photo = safeAssetUrl(current?.photoUrl ?? "");
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Site public" title="Intervenants" description="Fiches affichées sur l'accueil et la page Intervenants. Sans portrait, un monogramme est généré." />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current?.name} noun="un intervenant" />
            <form key={current?.id ?? "new"} action={saveSpeaker} encType="multipart/form-data" className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Nom complet">
                  <input className="field" name="name" defaultValue={current?.name ?? ""} required />
                </AdminField>
                <AdminField label="Organisation">
                  <input className="field" name="org" defaultValue={current?.org ?? ""} />
                </AdminField>
              </div>
              <BilingualFields
                fr={
                  <AdminField label="Fonction (français)">
                    <input className="field" name="roleFr" defaultValue={current?.roleFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Fonction (arabe)">
                    <input className="field" name="roleAr" dir="rtl" defaultValue={current?.roleAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Biographie (français)">
                    <textarea className="field min-h-28" name="bioFr" defaultValue={current?.bioFr ?? ""} />
                  </AdminField>
                }
                ar={
                  <AdminField label="Biographie (arabe)">
                    <textarea className="field min-h-28" name="bioAr" dir="rtl" defaultValue={current?.bioAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="grid gap-4 rounded-xl bg-mist/60 p-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
                <span className="grid size-20 place-items-center overflow-hidden rounded-xl bg-white text-xs text-muted ring-1 ring-night/10">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="size-full object-cover" />
                  ) : (
                    "Aucun portrait"
                  )}
                </span>
                <div className="grid gap-3">
                  <AdminField label="Portrait : nouveau fichier" hint="JPG, PNG ou WebP, 3 Mo maximum. Remplace l'URL ci-dessous.">
                    <input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" />
                  </AdminField>
                  <AdminField label="ou URL https du portrait">
                    <input className="field" name="photoUrl" placeholder="https://… ou laisser vide" defaultValue={current?.photoUrl ?? ""} />
                  </AdminField>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter l'intervenant"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({
              id: item.id,
              title: item.name,
              meta: [item.roleFr, item.org].filter(Boolean).join(" · "),
              published: item.published,
              thumbnail: safeAssetUrl(item.photoUrl),
            }))}
            currentId={current?.id}
            deleteAction={deleteSpeaker}
            empty="Aucun intervenant pour le moment."
          />
        }
      />
    </div>
  );
}
