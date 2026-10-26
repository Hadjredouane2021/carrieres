import { ArrowUpRight, CalendarClock, Camera, CircleCheck, Eye, EyeOff, Mic, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, Panel, PublishedToggle } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { SpeakerEditorFields } from "@/components/admin/speaker-editor";
import { buttonVariants } from "@/components/ui/button";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { deleteSpeaker, saveSpeaker } from "@/server/actions/admin";

export const metadata = { title: "Intervenants" };
export const instant = false;

function comparable(value: string) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[^\p{L}]/gu, "");
}

export default async function SpeakersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const [items, program] = await Promise.all([
    db().speaker.findMany({ orderBy: { sortOrder: "asc" } }),
    db().programItem.findMany({ where: { published: true }, select: { startTime: true, speakerName: true }, orderBy: { startTime: "asc" } }),
  ]);
  const current = items.find((item) => item.id === query.id);

  const cards = items.map((item) => {
    const photo = safeAssetUrl(item.photoUrl);
    const name = comparable(item.name);
    // Créneau du programme où figure l'intervenant (nom saisi dans le champ « Intervenant »).
    const slot = name ? program.find((entry) => comparable(entry.speakerName).includes(name)) : undefined;
    const missing = [
      !photo && "Portrait",
      !item.bioFr.trim() && "Biographie",
      !item.org.trim() && "Organisation",
    ].filter(Boolean) as string[];
    const completeness = Math.round(((3 - missing.length) / 3) * 100);
    return { ...item, photo, slot, missing, completeness };
  });
  const published = cards.filter((card) => card.published).length;
  const withPhoto = cards.filter((card) => card.photo).length;
  const complete = cards.filter((card) => card.missing.length === 0).length;
  const scheduled = cards.filter((card) => card.slot).length;

  const stats = [
    { label: "Intervenants", value: String(items.length), hint: `${published} publié${published > 1 ? "s" : ""} · ${items.length - published} masqué${items.length - published > 1 ? "s" : ""}`, icon: Mic },
    { label: "Portraits", value: `${withPhoto}/${items.length}`, hint: withPhoto === items.length ? "Tous illustrés" : `${items.length - withPhoto} avec monogramme`, icon: Camera },
    { label: "Fiches complètes", value: `${complete}/${items.length}`, hint: "Photo, biographie, organisation", icon: CircleCheck },
    { label: "Au programme", value: String(scheduled), hint: "Cités dans un créneau publié", icon: CalendarClock },
  ];

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Intervenants"
        description="Les portraits affichés sur l'accueil et la page Intervenants. Sans photo, un monogramme est généré à partir des initiales."
        actions={
          <>
            <Link href="/intervenants" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir les intervenants
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/intervenants" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouvel intervenant
              </Link>
            ) : null}
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: StatIcon }) => (
          <article key={label} className="rounded-2xl bg-white p-4 ring-1 ring-night/[0.07]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted">{label}</p>
              <span className="grid size-8 place-items-center rounded-xl bg-dawn text-sun-ink">
                <StatIcon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="display mt-2 text-2xl text-night tabular-nums md:text-3xl">{value}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_32rem]">
        <section className="order-2 xl:order-1" aria-label="Liste des intervenants">
          {cards.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
                <Mic className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium text-night">Aucun intervenant pour le moment</p>
              <p className="text-sm text-muted">Ajoutez le premier portrait avec le formulaire.</p>
            </div>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {cards.map((card, index) => {
                const active = current?.id === card.id;
                return (
                  <li key={card.id} className="grid gap-2">
                    <article
                      className={cn(
                        "group relative isolate aspect-[4/5] overflow-hidden rounded-2xl bg-night text-white shadow-[0_24px_48px_-30px_rgba(11,27,58,0.7)] ring-1 ring-night/10 transition",
                        active && "ring-2 ring-sun ring-offset-2 ring-offset-mist",
                        !card.published && "opacity-60",
                      )}
                    >
                      {card.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.photo} alt="" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_20%_0%,#173D70_0%,#0B1B3A_60%,#071226_100%)]">
                          <div className="absolute -bottom-12 -end-12 size-44 rounded-full bg-sun/25 blur-3xl" />
                          <span className="display absolute end-4 top-12 text-7xl text-sun/45 transition duration-700 group-hover:text-sun/70">{initials(card.name)}</span>
                        </div>
                      )}
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/45 to-transparent" />

                      <div className="flex h-full flex-col p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="flex items-center gap-1 rounded-full bg-white/95 p-0.5 text-night shadow-sm">
                            <span
                              title={card.published ? "Publié sur le site" : "Masqué sur le site"}
                              className={cn("grid size-8 place-items-center rounded-full", card.published ? "text-emerald-700" : "text-muted")}
                            >
                              {card.published ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                              <span className="sr-only">{card.published ? "Publié" : "Masqué"}</span>
                            </span>
                            <Link
                              href={`?id=${card.id}`}
                              scroll={false}
                              aria-label={`Modifier ${card.name}`}
                              className={cn("grid size-8 place-items-center rounded-full transition", active ? "bg-sun text-night" : "text-institution hover:bg-mist")}
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Link>
                            <span className="[&_button]:size-8">
                              <DeleteForm action={deleteSpeaker} id={card.id} label={card.name} />
                            </span>
                          </div>
                        </div>
                        <div className="mt-auto">
                          {card.slot ? (
                            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-sun px-2 py-0.5 text-[11px] font-semibold text-night">
                              <CalendarClock className="size-3" aria-hidden="true" /> Au programme · {card.slot.startTime}
                            </span>
                          ) : null}
                          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-sun">{card.roleFr}</p>
                          <h3 className="display mt-1 truncate text-xl leading-tight">{card.name}</h3>
                          {card.org ? <p className="truncate text-xs text-haze">{card.org}</p> : null}
                        </div>
                      </div>
                    </article>
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-night/[0.06]">
                        <div
                          className={cn("h-full rounded-full", card.completeness === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-sun to-sun-bright")}
                          style={{ width: `${card.completeness}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted">{card.completeness} %</span>
                    </div>
                    {card.missing.length ? (
                      <p className="truncate px-1 text-xs text-muted" title={`À compléter : ${card.missing.join(", ")}`}>
                        À compléter : {card.missing.join(", ")}
                      </p>
                    ) : (
                      <p className="px-1 text-xs text-emerald-700">Fiche complète</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <div className="flex items-start justify-between gap-3 border-b border-night/[0.07] px-5 py-4 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{current ? "Modification" : "Nouvel intervenant"}</p>
                <h2 className="display mt-1 truncate text-xl text-night">{current ? current.name : "Ajouter un portrait"}</h2>
              </div>
              {current ? (
                <Link
                  href="/admin/intervenants"
                  scroll={false}
                  aria-label="Annuler la modification"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-night"
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <form key={current?.id ?? "new"} action={saveSpeaker} encType="multipart/form-data" className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <SpeakerEditorFields
                initial={{
                  name: current?.name ?? "",
                  org: current?.org ?? "",
                  roleFr: current?.roleFr ?? "",
                  roleAr: current?.roleAr ?? "",
                  bioFr: current?.bioFr ?? "",
                  bioAr: current?.bioAr ?? "",
                  photoUrl: current?.photoUrl ?? "",
                }}
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" hint="Position sur le site" className="w-28">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter l'intervenant"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
