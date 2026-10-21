import { ExternalLink, Handshake } from "lucide-react";
import { DeleteButton, ImageField } from "@/components/admin/kit-client";
import { ContentLayout, EditLink, EditorHeader, EmptyState, FormField, ListHeader, PublishedToggle, SaveButton, StatusDot } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { labelOf, PARTNER_TIERS } from "@/lib/constants";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deletePartner, savePartner } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

const tierTone: Record<string, string> = {
  INSTITUTIONAL: "bg-night text-gold",
  GOLD: "bg-gold/20 text-[#8A6A33]",
  SILVER: "bg-zinc-100 text-zinc-600",
  PARTNER: "bg-sky-50 text-sky-700",
  MEDIA: "bg-violet-50 text-violet-700",
};

export default async function PartnersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const items = await db().partner.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Site public" title="Partenaires" intro="Les logos des entreprises, écoles et médias qui portent l'édition. Un PNG à fond transparent rend le mieux." />
      <Flash error={query.error} ok={query.ok} />
      <ContentLayout
        list={
          <>
            <ListHeader count={items.length} label={`partenaire${items.length > 1 ? "s" : ""}`} publicHref="/partenaires" />
            {items.length === 0 ? (
              <EmptyState icon={<Handshake className="size-5" />} title="Aucun partenaire" text="Ajoutez le premier logo avec le formulaire." />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {items.map((item) => {
                  const logo = safeAssetUrl(item.logoUrl);
                  return (
                    <article key={item.id} className={cn("admin-card group flex flex-col overflow-hidden transition", current?.id === item.id && "ring-2 ring-gold")}>
                      <div className="grid aspect-[3/2] place-items-center bg-gradient-to-br from-white to-mist p-5">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt={item.name} className="max-h-16 w-auto max-w-full object-contain grayscale transition duration-500 group-hover:grayscale-0" />
                        ) : (
                          <span className="display text-2xl text-night/30">{item.name}</span>
                        )}
                      </div>
                      <div className="grid gap-2 border-t border-night/[0.06] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-night">{item.name}</p>
                          {item.website ? (
                            <a href={item.website} target="_blank" rel="noreferrer" className="text-institution/60 hover:text-night" aria-label={`Site de ${item.name}`}>
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px]", tierTone[item.tier] ?? "bg-mist text-night")}>{labelOf(PARTNER_TIERS, item.tier, "fr")}</span>
                          <StatusDot published={item.published} />
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <EditLink href={`?id=${item.id}`} active={current?.id === item.id} />
                          <DeleteButton action={deletePartner} id={item.id} label={item.name} />
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
          <form key={current?.id ?? "new"} action={savePartner} encType="multipart/form-data" className="admin-card grid gap-4 p-5 md:p-6">
            <EditorHeader editing={Boolean(current)} title={current?.name ?? ""} newLabel="Ajouter un partenaire" basePath="/admin/partenaires" />
            {current ? <input type="hidden" name="id" value={current.id} /> : null}
            <ImageField label="Logo" urlName="logoUrl" url={current?.logoUrl} hint="PNG transparent, JPG ou WebP." />
            <FormField label="Nom"><input className="field" name="name" defaultValue={current?.name ?? ""} required /></FormField>
            <fieldset className="grid gap-1.5 text-sm">
              <legend className="mb-1.5 font-medium text-night">Catégorie</legend>
              <div className="flex flex-wrap gap-1.5">
                {PARTNER_TIERS.map((tier) => (
                  <label key={tier.value} className="cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold rounded-full">
                    <input type="radio" name="tier" value={tier.value} defaultChecked={(current?.tier ?? "PARTNER") === tier.value} className="peer sr-only" />
                    <span className="inline-flex rounded-full border border-night/10 px-3.5 py-1.5 text-sm text-night transition peer-checked:border-night peer-checked:bg-night peer-checked:text-gold hover:border-gold">
                      {tier.fr}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FormField label="Site web" hint="Doit commencer par https://">
              <input className="field" name="website" placeholder="https://" defaultValue={current?.website ?? ""} />
            </FormField>
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
