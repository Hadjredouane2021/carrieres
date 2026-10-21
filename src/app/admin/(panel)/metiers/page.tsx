import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, IconSelect, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { iconNames } from "@/components/site/icons";
import { db } from "@/lib/prisma";
import { deleteCareer, saveCareer } from "@/server/actions/admin";

export const instant = false;

export default async function CareersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().career.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Site public" title="Métiers" description="Métiers présentés dans l'explorateur et proposés à l'inscription (étape « Intérêts »)." />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current?.titleFr} noun="un métier" />
            <form key={current?.id ?? "new"} action={saveCareer} className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <BilingualFields
                fr={
                  <AdminField label="Intitulé (français)">
                    <input className="field" name="titleFr" defaultValue={current?.titleFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Intitulé (arabe)">
                    <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Résumé de la mission (français)">
                    <textarea className="field min-h-28" name="summaryFr" defaultValue={current?.summaryFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Résumé (arabe)">
                    <textarea className="field min-h-28" name="summaryAr" dir="rtl" defaultValue={current?.summaryAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Icône" className="w-48">
                  <IconSelect names={iconNames} value={current?.icon ?? "briefcase"} />
                </AdminField>
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter le métier"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({ id: item.id, title: item.titleFr, meta: `Ordre ${item.sortOrder} · ${item.icon}`, published: item.published }))}
            currentId={current?.id}
            deleteAction={deleteCareer}
            empty="Aucun métier pour le moment."
          />
        }
      />
    </div>
  );
}
