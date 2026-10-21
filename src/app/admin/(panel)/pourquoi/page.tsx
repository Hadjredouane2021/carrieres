import { Sparkles } from "lucide-react";
import { DeleteButton, IconPicker } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, LangFields, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { Icon } from "@/components/site/icons";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteWhy, saveWhy } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function WhyAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().whyItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="Pourquoi participer" intro="Les cartes du carrousel 3D de la section « Pourquoi participer »." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`carte${items.length > 1 ? "s" : ""}`} publicHref="/forum" />
            {items.length === 0 ? (
              <EmptyState icon={<Sparkles className="size-5" />} title="Aucune carte" text="Ajoutez la première carte avec le formulaire." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item, index) => (
                  <article
                    key={item.id}
                    className={cn(
                      "group relative flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1D3A70] to-[#0F2349] p-5 text-beige shadow-[0_20px_40px_-25px_rgba(11,27,58,0.7)]",
                      current?.id === item.id && "ring-2 ring-gold",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-gold/15 text-gold">
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <span className="display text-2xl text-white/15">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.titleFr}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-beige/70">{item.bodyFr}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <StatusDot published={item.published} />
                      <div className="flex items-center gap-1 rounded-full bg-white p-0.5">
                        <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                        <DeleteButton action={deleteWhy} id={item.id} label={item.titleFr} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        }
        editor={
          <form key={current?.id ?? "new"} action={saveWhy} className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.titleFr ?? ""} newLabel="Ajouter une carte" basePath="/admin/pourquoi" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <LangFields label="Titre" name="title" fr={current?.titleFr} ar={current?.titleAr} required placeholder="Ex. Rencontrer les employeurs" />
            <LangFields label="Texte" name="body" fr={current?.bodyFr} ar={current?.bodyAr} multiline required />
            <IconPicker value={current?.icon ?? "sparkles"} />
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
