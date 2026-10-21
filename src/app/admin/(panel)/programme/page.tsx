import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { deleteProgram, saveProgram } from "@/server/actions/admin";

export const instant = false;

export default async function ProgramAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().programItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Programme"
        description="Créneaux de la journée. Les ateliers et tables rondes publiés sont proposés aux participants lors de l'inscription."
      />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current ? `${current.startTime} · ${current.titleFr}` : null} noun="un créneau" />
            <form key={current?.id ?? "new"} action={saveProgram} className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-3">
                <AdminField label="Début" hint="Format HH:MM">
                  <input className="field" name="startTime" placeholder="09:00" pattern="\d{2}:\d{2}" defaultValue={current?.startTime ?? ""} required />
                </AdminField>
                <AdminField label="Fin" hint="Format HH:MM">
                  <input className="field" name="endTime" placeholder="10:00" pattern="\d{2}:\d{2}" defaultValue={current?.endTime ?? ""} required />
                </AdminField>
                <AdminField label="Type d'activité">
                  <select className="field" name="category" defaultValue={current?.category ?? "plenary"}>
                    {PROGRAM_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.fr}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>
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
                  <AdminField label="Description (français)">
                    <textarea className="field min-h-24" name="descriptionFr" defaultValue={current?.descriptionFr ?? ""} />
                  </AdminField>
                }
                ar={
                  <AdminField label="Description (arabe)">
                    <textarea className="field min-h-24" name="descriptionAr" dir="rtl" defaultValue={current?.descriptionAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Lieu">
                  <input className="field" name="location" placeholder="Plénière, Salle A…" defaultValue={current?.location ?? ""} />
                </AdminField>
                <AdminField label="Intervenant">
                  <input className="field" name="speakerName" defaultValue={current?.speakerName ?? ""} />
                </AdminField>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter le créneau"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({
              id: item.id,
              title: `${item.startTime} — ${item.titleFr}`,
              meta: `${labelOf(PROGRAM_CATEGORIES, item.category, "fr")}${item.location ? ` · ${item.location}` : ""}`,
              published: item.published,
            }))}
            currentId={current?.id}
            deleteAction={deleteProgram}
            empty="Aucun créneau pour le moment."
          />
        }
      />
    </div>
  );
}
