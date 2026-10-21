import { Mic } from "lucide-react";
import { DeleteButton, ImageField } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, LangFields, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { deleteSpeaker, saveSpeaker } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function SpeakersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().speaker.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="Intervenants" intro="Les portraits affichés en cartes sur le site. Une photo verticale donne le meilleur rendu." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`intervenant${items.length > 1 ? "s" : ""}`} publicHref="/intervenants" />
            {items.length === 0 ? (
              <EmptyState icon={<Mic className="size-5" />} title="Aucun intervenant" text="Ajoutez le premier intervenant avec le formulaire." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => {
                  const photo = safeAssetUrl(item.photoUrl);
                  return (
                    <article key={item.id} className={cn("group relative isolate aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-night text-beige shadow-[0_20px_40px_-25px_rgba(11,27,58,0.7)]", current?.id === item.id && "ring-2 ring-gold ring-offset-2 ring-offset-[#f5f7fb]")}>
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-night via-[#123063] to-institution">
                          <span className="display absolute end-4 top-10 text-7xl text-gold/40">{initials(item.name)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#081430] via-[#081430]/50 to-transparent" />
                      <div className="flex h-full flex-col p-4">
                        <div className="flex items-start justify-between gap-2">
                          <StatusDot published={item.published} />
                          <div className="flex items-center gap-1 rounded-full bg-white p-0.5">
                            <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                            <DeleteButton action={deleteSpeaker} id={item.id} label={item.name} />
                          </div>
                        </div>
                        <div className="mt-auto">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{item.roleFr}</p>
                          <p className="display mt-1 text-xl text-white">{item.name}</p>
                          {item.org ? <p className="text-xs text-beige/70">{item.org}</p> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        }
        editor={
          <form key={current?.id ?? "new"} action={saveSpeaker} encType="multipart/form-data" className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.name ?? ""} newLabel="Ajouter un intervenant" basePath="/admin/intervenants" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <ImageField label="Portrait" urlName="photoUrl" url={current?.photoUrl} round hint="JPG, PNG ou WebP. Format vertical conseillé." />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Nom complet"><input className="field" name="name" defaultValue={current?.name ?? ""} required /></FormField>
              <FormField label="Organisation"><input className="field" name="org" placeholder="Ex. Compagnie invitée" defaultValue={current?.org ?? ""} /></FormField>
            </div>
            <LangFields label="Fonction" name="role" fr={current?.roleFr} ar={current?.roleAr} required placeholder="Ex. Directrice actuariat" />
            <LangFields label="Biographie" name="bio" fr={current?.bioFr} ar={current?.bioAr} multiline />
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
