import { CalendarDays, Clock, MapPin, Mic } from "lucide-react";
import { DeleteButton } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, LangFields, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteProgram, saveProgram } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

const tones: Record<string, string> = {
  welcome: "bg-gold",
  plenary: "bg-sky-500",
  roundtable: "bg-violet-500",
  workshop: "bg-emerald-500",
  break: "bg-zinc-400",
  networking: "bg-orange-500",
  closing: "bg-rose-500",
};

export default async function ProgramAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().programItem.findMany({ orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }] });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="Programme" intro="Les temps forts de la journée, affichés en frise sur le site. L'ordre suit le champ « Position »." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`séance${items.length > 1 ? "s" : ""}`} publicHref="/programme" />
            {items.length === 0 ? (
              <EmptyState icon={<CalendarDays className="size-5" />} title="Aucune séance" text="Ajoutez la première séance avec le formulaire." />
            ) : (
              <ol className="relative grid gap-3">
                <span aria-hidden="true" className="absolute inset-y-4 start-[3.25rem] w-px bg-gradient-to-b from-gold via-night/10 to-transparent" />
                {items.map((item) => (
                  <li key={item.id} className="relative grid grid-cols-[3.25rem_1fr] items-start gap-0">
                    <time className="pe-3 pt-4 text-end">
                      <span className="display block text-lg leading-none text-night">{item.startTime}</span>
                      <span className="text-[11px] text-institution">{item.endTime}</span>
                    </time>
                    <div className="relative ps-5">
                      <span className={cn("absolute -start-[5px] top-5 size-[11px] rounded-full ring-4 ring-[#f5f7fb]", tones[item.category] ?? "bg-gold")} />
                      <article className={cn("admin-card flex items-start gap-3 p-4 transition", current?.id === item.id && "ring-2 ring-gold")}>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-institution">
                            <span className="rounded-full bg-mist px-2 py-0.5 font-medium uppercase tracking-[0.1em] text-night">{labelOf(PROGRAM_CATEGORIES, item.category, "fr")}</span>
                            {item.location ? <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {item.location}</span> : null}
                            <StatusDot published={item.published} />
                          </div>
                          <p className="mt-1.5 truncate font-medium text-night">{item.titleFr}</p>
                          {item.speakerName ? <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-institution"><Mic className="size-3" /> {item.speakerName}</p> : null}
                        </div>
                        <div className="flex items-center gap-1">
                          <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                          <DeleteButton action={deleteProgram} id={item.id} label={item.titleFr} />
                        </div>
                      </article>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        }
        editor={
          <form key={current?.id ?? "new"} action={saveProgram} className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.titleFr ?? ""} newLabel="Ajouter une séance" basePath="/admin/programme" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Début">
                <span className="relative">
                  <Clock className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                  <input className="field ps-10" name="startTime" type="time" defaultValue={current?.startTime ?? ""} required />
                </span>
              </FormField>
              <FormField label="Fin">
                <span className="relative">
                  <Clock className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-institution/60" />
                  <input className="field ps-10" name="endTime" type="time" defaultValue={current?.endTime ?? ""} required />
                </span>
              </FormField>
            </div>
            <LangFields label="Titre" name="title" fr={current?.titleFr} ar={current?.titleAr} required placeholder="Ex. Table ronde des métiers" />
            <LangFields label="Description" name="description" fr={current?.descriptionFr} ar={current?.descriptionAr} multiline />
            <FormField label="Type de séance">
              <select className="field" name="category" defaultValue={current?.category ?? "plenary"}>
                {PROGRAM_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.fr}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Lieu"><input className="field" name="location" placeholder="Ex. Plénière" defaultValue={current?.location ?? ""} /></FormField>
              <FormField label="Intervenant"><input className="field" name="speakerName" placeholder="Facultatif" defaultValue={current?.speakerName ?? ""} /></FormField>
            </div>
            <FormField label="Position" hint="Plus petit = plus haut dans la liste.">
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
