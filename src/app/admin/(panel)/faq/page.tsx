import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorLayout, FormTitle, ItemList, Panel, PublishedToggle } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { deleteFaq, saveFaq } from "@/server/actions/admin";

export const instant = false;

export default async function FaqAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Site public" title="FAQ" description="Questions affichées sur la page FAQ, dans l'ordre indiqué. La version arabe est facultative." />
      <Flash error={query.error} ok={query.ok} />
      <EditorLayout
        form={
          <Panel>
            <FormTitle editing={current?.questionFr} noun="une question" />
            <form key={current?.id ?? "new"} action={saveFaq} className="grid gap-4">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <BilingualFields
                fr={
                  <AdminField label="Question (français)">
                    <input className="field" name="questionFr" defaultValue={current?.questionFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Question (arabe)">
                    <input className="field" name="questionAr" dir="rtl" defaultValue={current?.questionAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Réponse (français)">
                    <textarea className="field min-h-32" name="answerFr" defaultValue={current?.answerFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Réponse (arabe)">
                    <textarea className="field min-h-32" name="answerAr" dir="rtl" defaultValue={current?.answerAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end gap-4">
                <AdminField label="Ordre" className="w-32">
                  <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                </AdminField>
                <PublishedToggle defaultChecked={current?.published ?? true} />
              </div>
              <SubmitButton className="w-fit">{current ? "Mettre à jour" : "Ajouter la question"}</SubmitButton>
            </form>
          </Panel>
        }
        list={
          <ItemList
            items={items.map((item) => ({ id: item.id, title: item.questionFr, meta: `Ordre ${item.sortOrder}`, published: item.published }))}
            currentId={current?.id}
            deleteAction={deleteFaq}
            empty="Aucune question pour le moment."
          />
        }
      />
    </div>
  );
}
