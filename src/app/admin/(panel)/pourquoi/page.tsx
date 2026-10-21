import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, IconSelect, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { iconNames } from "@/components/site/icons";
import { db } from "@/lib/prisma";
import { deleteWhy, saveWhy } from "@/server/actions/admin";

export const instant = false;

export default async function WhyAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().whyItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Site public" title="Pourquoi participer" description="Cartes de la section « Pourquoi participer » (accueil et page Le Forum). Une carte sur six apparaît en bleu nuit, une en orange." />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current?.titleFr} noun="une carte" />
            <form key={current?.id ?? "new"} action={saveWhy} className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <BilingualFields
                fr={
                  <AdminField label="Titre (français)">
                    <input className="field" name="titleFr" defaultValue={current?.titleFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Titre (arabe)">
                    <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Texte (français)">
                    <textarea className="field min-h-28" name="bodyFr" defaultValue={current?.bodyFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Texte (arabe)">
                    <textarea className="field min-h-28" name="bodyAr" dir="rtl" defaultValue={current?.bodyAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Icône" className="w-48">
                  <IconSelect names={iconNames} value={current?.icon ?? "sparkles"} />
                </AdminField>
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter la carte"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({ id: item.id, title: item.titleFr, meta: `Ordre ${item.sortOrder} · ${item.icon}`, published: item.published }))}
            currentId={current?.id}
            deleteAction={deleteWhy}
            empty="Aucune carte pour le moment."
          />
        }
      />
    </div>
  );
}
