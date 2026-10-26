import { AlertTriangle, ArrowUpRight, EyeOff, Film, ImageIcon, Images, Pencil, Play, Plus, Type } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { GalleryMediaFields } from "@/components/admin/gallery-editor";
import { AdminField, AdminHeader, BilingualFields, EditorHead, EmptyBlock, Panel, PublishedToggle, StatGrid } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { safeAssetUrl, vimeoId, youtubeId } from "@/lib/media";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteGallery, saveGallery } from "@/server/actions/admin";

export const metadata = { title: "Galerie" };
export const instant = false;

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  const media = items.map((item) => {
    const youtube = item.type === "VIDEO" ? youtubeId(item.url) : null;
    const vimeo = item.type === "VIDEO" ? vimeoId(item.url) : null;
    const image = item.type === "IMAGE" ? safeAssetUrl(item.url) : null;
    const thumb = image ?? (youtube ? `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` : null);
    const valid = Boolean(image || youtube || vimeo);
    return { ...item, thumb, valid, online: item.published && valid };
  });
  const online = media.filter((item) => item.online).length;
  const photos = media.filter((item) => item.type === "IMAGE").length;
  const invalid = media.filter((item) => !item.valid).length;
  const captioned = media.filter((item) => item.captionFr.trim()).length;

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Galerie"
        description="Photos et vidéos YouTube ou Vimeo. Seuls les éléments publiés avec un média valide apparaissent ; la galerie reste masquée sur le site tant qu'elle est vide."
        actions={
          <>
            <Link href="/#galerie" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir sur le site
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/galerie" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouveau média
              </Link>
            ) : null}
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <StatGrid
        stats={[
          { label: "En ligne", value: `${online}/${items.length}`, hint: online ? "Visibles sur le site" : "Galerie masquée sur le site", icon: Images },
          { label: "Photos · vidéos", value: `${photos} · ${items.length - photos}`, hint: "Répartition des médias", icon: Film },
          { label: "Légendées", value: `${captioned}/${items.length}`, hint: "Légende et crédit photo", icon: Type },
          { label: "Sans média valide", value: String(invalid), hint: invalid ? "Non affichés sur le site" : "Tout est en ordre", icon: AlertTriangle, alert: invalid > 0 },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="order-2 xl:order-1" aria-label="Médias">
          {media.length === 0 ? (
            <EmptyBlock icon={Images} title="La galerie est vide" text="Ajoutez des photos de l'édition ou des replays vidéo : la section apparaîtra sur le site dès le premier média publié." />
          ) : (
            <ol className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {media.map((item, index) => {
                const active = current?.id === item.id;
                return (
                  <li key={item.id}>
                    <article
                      className={cn(
                        "group overflow-hidden rounded-2xl bg-white ring-1 transition",
                        active ? "shadow-[0_20px_40px_-24px_rgba(255,122,26,0.6)] ring-2 ring-sun" : "ring-night/[0.07] hover:shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]",
                        !item.online && "opacity-70",
                      )}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-night">
                        {item.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumb} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_90%_at_20%_0%,#173D70_0%,#0B1B3A_70%)] text-haze">
                            {item.type === "VIDEO" ? <Film className="size-7" aria-hidden="true" /> : <ImageIcon className="size-7" aria-hidden="true" />}
                          </div>
                        )}
                        {item.type === "VIDEO" && item.valid ? (
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="grid size-11 place-items-center rounded-full bg-sun text-night shadow-lg">
                              <Play className="size-4 fill-current" aria-hidden="true" />
                            </span>
                          </span>
                        ) : null}
                        <span className="absolute start-2 top-2 rounded-full bg-night/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="absolute end-2 top-2 flex gap-1">
                          {!item.valid ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Sans média</span> : null}
                          {!item.published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-muted">
                              <EyeOff className="size-3" aria-hidden="true" /> Masqué
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <p className={cn("min-w-0 flex-1 truncate text-sm", item.captionFr ? "font-medium text-night" : "italic text-muted")}>
                          {item.captionFr || "Sans légende"}
                        </p>
                        <Link
                          href={`?id=${item.id}`}
                          scroll={false}
                          aria-label={`Modifier ${item.captionFr || "ce média"}`}
                          className={cn("grid size-8 place-items-center rounded-full transition", active ? "bg-sun text-night" : "text-institution hover:bg-mist")}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </Link>
                        <span className="[&_button]:size-8">
                          <DeleteForm action={deleteGallery} id={item.id} label={item.captionFr || "ce média"} />
                        </span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <EditorHead editing={Boolean(current)} kicker="Nouveau média" title={current ? current.captionFr || "Média sans légende" : "Ajouter une photo ou une vidéo"} cancelHref="/admin/galerie" />
            <form key={current?.id ?? "new"} action={saveGallery} encType="multipart/form-data" className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <GalleryMediaFields initial={{ type: current?.type ?? "IMAGE", url: current?.url ?? "" }} />
              <BilingualFields
                fr={
                  <AdminField label="Légende" hint="Indiquez aussi le crédit photo si nécessaire.">
                    <input className="field" name="captionFr" placeholder="Ex. La plénière d'ouverture" defaultValue={current?.captionFr ?? ""} />
                  </AdminField>
                }
                ar={
                  <AdminField label="Légende (arabe)">
                    <input className="field" name="captionAr" dir="rtl" defaultValue={current?.captionAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" className="w-28">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter le média"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
