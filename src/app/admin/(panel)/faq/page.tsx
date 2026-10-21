import { HelpCircle } from "lucide-react";
import { DeleteButton } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, LangFields, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteFaq, saveFaq } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function FaqAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="FAQ" intro="Les questions fréquentes, affichées en accordéon sur le site." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`question${items.length > 1 ? "s" : ""}`} publicHref="/faq" />
            {items.length === 0 ? (
              <EmptyState icon={<HelpCircle className="size-5" />} title="Aucune question" text="Ajoutez la première question avec le formulaire." />
            ) : (
              <div className="grid gap-3">
                {items.map((item, index) => (
                  <details key={item.id} className={cn("admin-card group overflow-hidden transition", current?.id === item.id && "ring-2 ring-gold")}>
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="display grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-sm text-[#8A6A33]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-night">{item.questionFr}</span>
                        <span className="mt-0.5 inline-flex"><StatusDot published={item.published} /></span>
                      </span>
                      <span className="grid size-8 place-items-center rounded-full bg-mist text-institution transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-night/[0.06] px-4 pb-4 pt-3">
                      <p className="whitespace-pre-line text-sm leading-6 text-institution">{item.answerFr}</p>
                      <div className="mt-3 flex justify-end gap-1">
                        <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                        <DeleteButton action={deleteFaq} id={item.id} label={item.questionFr} />
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </>
        }
        editor={
          <form key={current?.id ?? "new"} action={saveFaq} className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.questionFr ?? ""} newLabel="Ajouter une question" basePath="/admin/faq" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <LangFields label="Question" name="question" fr={current?.questionFr} ar={current?.questionAr} required placeholder="Ex. Qui peut participer ?" />
            <LangFields label="Réponse" name="answer" fr={current?.answerFr} ar={current?.answerAr} multiline required />
            <FormField label="Position">
              <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
            </FormField>
            <PublishedToggle checked={current?.published ?? true} />
            <SaveButton editing={Boolean(current)} />
          </form>
        }
      />
    </div>
  );
}
