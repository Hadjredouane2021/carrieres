import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { deleteGallery, saveGallery } from "@/server/actions/admin";

export const instant = false;

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  const preview = current?.type === "IMAGE" ? safeAssetUrl(current.url) : null;
  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Galerie"
        description="Photos et vidéos YouTube ou Vimeo. Seuls les éléments publiés dotés d'un média valide apparaissent sur le site ; la galerie reste masquée tant qu'elle est vide."
      />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current ? current.captionFr || "Élément sans légende" : null} noun="un média" />
            <form key={current?.id ?? "new"} action={saveGallery} encType="multipart/form-data" className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <AdminField label="Type">
                <select className="field" name="type" defaultValue={current?.type ?? "IMAGE"}>
                  <option value="IMAGE">Photo</option>
                  <option value="VIDEO">Vidéo YouTube ou Vimeo</option>
                </select>
              </AdminField>
              <div className="grid gap-4 rounded-xl bg-mist/60 p-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <span className="grid h-20 w-28 place-items-center overflow-hidden rounded-xl bg-white text-center text-xs text-muted ring-1 ring-night/10">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="size-full object-cover" />
                  ) : (
                    "Aperçu"
                  )}
                </span>
                <div className="grid gap-3">
                  <AdminField label="URL https (photo ou vidéo)">
                    <input className="field" name="url" placeholder="https://…" defaultValue={current?.url ?? ""} />
                  </AdminField>
                  <AdminField label="ou fichier photo" hint="JPG, PNG ou WebP. Remplace l'URL pour une photo.">
                    <input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" />
                  </AdminField>
                </div>
              </div>
              <BilingualFields
                fr={
                  <AdminField label="Légende (français)" hint="Indique aussi le crédit photo si nécessaire.">
                    <input className="field" name="captionFr" defaultValue={current?.captionFr ?? ""} />
                  </AdminField>
                }
                ar={
                  <AdminField label="Légende (arabe)">
                    <input className="field" name="captionAr" dir="rtl" defaultValue={current?.captionAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter le média"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({
              id: item.id,
              title: item.captionFr || (item.type === "VIDEO" ? "Vidéo sans légende" : "Photo sans légende"),
              meta: item.url ? (item.type === "VIDEO" ? "Vidéo" : "Photo") : "Aucun média : non affiché",
              published: item.published,
              thumbnail: item.type === "IMAGE" ? safeAssetUrl(item.url) : null,
            }))}
            currentId={current?.id}
            deleteAction={deleteGallery}
            empty="La galerie est vide."
          />
        }
      />
    </div>
  );
}
