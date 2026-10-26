import { ArrowUpRight, EyeOff, LayoutGrid, Pencil, Plus, Sparkles, Star, Type, X } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, Panel, PublishedToggle } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { WhyCardVisual } from "@/components/admin/why-card";
import { WhyEditorFields } from "@/components/admin/why-editor";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteWhy, saveWhy } from "@/server/actions/admin";

export const metadata = { title: "Pourquoi participer" };
export const instant = false;

export default async function WhyAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().whyItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  // Le site n'affiche que les cartes publiées : leur rang détermine la couleur et la taille.
  const visible = items.filter((item) => item.published);
  const rank = new Map(visible.map((item, index) => [item.id, index]));
  const hidden = items.filter((item) => !item.published);
  const editorPosition = current && rank.has(current.id) ? rank.get(current.id)! : visible.length;
  const featured = visible[0];
  const averageLength = visible.length ? Math.round(visible.reduce((sum, item) => sum + item.bodyFr.trim().length, 0) / visible.length) : 0;
  const cards = Math.max(visible.length - 1, 0);

  const stats = [
    { label: "Cartes en ligne", value: `${visible.length}`, hint: `${hidden.length} masquée${hidden.length > 1 ? "s" : ""}`, icon: Sparkles },
    { label: "Citation", value: featured?.titleFr ?? "—", hint: "Première carte publiée, affichée en grand", icon: Star },
    {
      label: "Cartes",
      value: String(cards),
      hint: cards && cards % 4 === 0 ? "Rangées de 4 complètes" : "Rangées de 4 sur ordinateur",
      icon: LayoutGrid,
    },
    { label: "Longueur moyenne", value: averageLength ? `${averageLength} car.` : "—", hint: "120 caractères conseillés", icon: Type },
  ];

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Pourquoi participer"
        description="La section « Pourquoi participer » (accueil et page Le Forum) : la 1re carte publiée s'affiche en grande citation, les suivantes en cartes colorées. Entourez un mot d'astérisques (*mot*) pour le surligner."
        actions={
          <>
            <Link href="/forum" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir sur le site
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/pourquoi" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouvelle carte
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
            <p className="display mt-2 truncate text-2xl text-night md:text-3xl">{value}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="order-2 grid gap-5 xl:order-1" aria-label="Cartes">
          {items.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium text-night">Aucune carte pour le moment</p>
              <p className="text-sm text-muted">La première carte ajoutée deviendra la grande carte bleu nuit.</p>
            </div>
          ) : null}

          {visible.length ? (
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-night">Telle qu&apos;affichée sur le site : la citation, puis les cartes</h2>
                <span className="h-px flex-1 bg-night/[0.07]" aria-hidden="true" />
              </div>
              <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visible.map((item, index) => {
                  const active = current?.id === item.id;
                  const dark = index > 0 && (index - 1) % 4 === 1;
                  return (
                    <li key={item.id} className={cn(index === 0 && "sm:col-span-2 xl:col-span-4")}>
                      <WhyCardVisual
                        position={index}
                        title={item.titleFr}
                        body={item.bodyFr}
                        className={cn("transition", active && "ring-2 ring-sun ring-offset-2 ring-offset-mist")}
                      >
                        <div className={cn("flex items-center gap-0.5 rounded-full p-0.5", dark ? "bg-white/10" : "bg-white/90 shadow-sm")}>
                          <Link
                            href={`?id=${item.id}`}
                            scroll={false}
                            aria-label={`Modifier ${item.titleFr}`}
                            className={cn(
                              "grid size-8 place-items-center rounded-full transition",
                              active ? "bg-sun text-night" : dark ? "text-white hover:bg-white/10" : "text-institution hover:bg-mist",
                            )}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Link>
                          <span className={cn("[&_button]:size-8", dark && "[&_button]:text-red-300 [&_button:hover]:bg-white/10")}>
                            <DeleteForm action={deleteWhy} id={item.id} label={item.titleFr} />
                          </span>
                        </div>
                      </WhyCardVisual>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {hidden.length ? (
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-night">
                  <EyeOff className="size-4 text-muted" aria-hidden="true" /> Cartes masquées
                </h2>
                <span className="h-px flex-1 bg-night/[0.07]" aria-hidden="true" />
              </div>
              <ul className="divide-y divide-night/[0.07] overflow-hidden rounded-2xl bg-white ring-1 ring-night/[0.07]">
                {hidden.map((item) => (
                  <li key={item.id} className={cn("flex items-center gap-3 px-4 py-3", current?.id === item.id && "bg-dawn")}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-night">{item.titleFr}</p>
                      <p className="truncate text-xs text-muted">{item.bodyFr}</p>
                    </div>
                    <Link href={`?id=${item.id}`} scroll={false} aria-label={`Modifier ${item.titleFr}`} className="grid size-9 place-items-center rounded-full text-institution transition hover:bg-mist">
                      <Pencil className="size-4" aria-hidden="true" />
                    </Link>
                    <DeleteForm action={deleteWhy} id={item.id} label={item.titleFr} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <div className="flex items-start justify-between gap-3 border-b border-night/[0.07] px-5 py-4 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{current ? "Modification" : "Nouvelle carte"}</p>
                <h2 className="display mt-1 truncate text-xl text-night">{current ? current.titleFr : "Ajouter une raison"}</h2>
              </div>
              {current ? (
                <Link
                  href="/admin/pourquoi"
                  scroll={false}
                  aria-label="Annuler la modification"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-night"
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <form key={current?.id ?? "new"} action={saveWhy} className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <WhyEditorFields
                position={editorPosition}
                initial={{
                  titleFr: current?.titleFr ?? "",
                  titleAr: current?.titleAr ?? "",
                  bodyFr: current?.bodyFr ?? "",
                  bodyAr: current?.bodyAr ?? "",
                  icon: current?.icon ?? "sparkles",
                }}
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" hint="1 = carte vedette" className="w-28">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter la carte"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
