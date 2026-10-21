import { Briefcase } from "lucide-react";
import { DeleteButton, IconPicker } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, LangFields, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { Icon } from "@/components/site/icons";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteCareer, saveCareer } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function CareersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().career.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="Métiers" intro="La grille des métiers de l'assurance. Le premier de la liste devient la grande carte « Métier à la une »." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`métier${items.length > 1 ? "s" : ""}`} publicHref="/metiers" />
            {items.length === 0 ? (
              <EmptyState icon={<Briefcase className="size-5" />} title="Aucun métier" text="Ajoutez le premier métier avec le formulaire." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item, index) => (
                  <article
                    key={item.id}
                    className={cn(
                      "admin-card group relative flex flex-col gap-4 p-5 transition",
                      index === 0 && "sm:col-span-2 bg-night text-beige",
                      current?.id === item.id && "ring-2 ring-gold",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn("grid size-11 place-items-center rounded-2xl", index === 0 ? "bg-gradient-to-br from-gold to-[#B8935A] text-night" : "bg-gradient-to-br from-mist to-beige text-institution")}>
                        <Icon name={item.icon} className="size-5" />
                      </span>
                      <span className={cn("display text-3xl leading-none", index === 0 ? "text-white/15" : "text-night/[0.08]")}>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="min-w-0">
                      {index === 0 ? <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-gold">À la une</p> : null}
                      <p className={cn("font-medium", index === 0 ? "text-lg text-white" : "text-night")}>{item.titleFr}</p>
                      <p className={cn("mt-1 line-clamp-2 text-sm", index === 0 ? "text-beige/70" : "text-institution")}>{item.summaryFr}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <StatusDot published={item.published} />
                      <div className="flex items-center gap-1">
                        <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                        <DeleteButton action={deleteCareer} id={item.id} label={item.titleFr} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        }
        editor={
          <form key={current?.id ?? "new"} action={saveCareer} className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.titleFr ?? ""} newLabel="Ajouter un métier" basePath="/admin/metiers" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <LangFields label="Intitulé" name="title" fr={current?.titleFr} ar={current?.titleAr} required placeholder="Ex. Actuariat" />
            <LangFields label="Résumé" name="summary" fr={current?.summaryFr} ar={current?.summaryAr} multiline required />
            <IconPicker value={current?.icon ?? "briefcase"} />
            <FormField label="Position" hint="1 = carte à la une.">
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
