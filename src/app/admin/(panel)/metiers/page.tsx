import { ArrowUpRight, Briefcase, Eye, EyeOff, Heart, Pencil, Plus, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { CareerEditorFields } from "@/components/admin/career-editor";
import { AdminField, AdminHeader, Panel, PublishedToggle } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { Icon, iconNames } from "@/components/site/icons";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteCareer, saveCareer } from "@/server/actions/admin";

export const metadata = { title: "Métiers" };
export const instant = false;

export default async function CareersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const [items, registrations] = await Promise.all([
    db().career.findMany({ orderBy: { sortOrder: "asc" } }),
    db().registration.findMany({ where: { status: { not: "CANCELLED" } }, select: { interests: true } }),
  ]);
  const current = items.find((item) => item.id === query.id);
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const currentIndex = current ? items.indexOf(current) : items.length;

  // Intérêt des inscrits : métiers cochés à l'étape « Intérêts » de l'inscription.
  const votes = new Map<string, number>();
  for (const registration of registrations) {
    const ids = Array.isArray(registration.interests) ? registration.interests : [];
    for (const id of new Set(ids.map(String))) votes.set(id, (votes.get(id) ?? 0) + 1);
  }
  const total = registrations.length;
  const published = items.filter((item) => item.published).length;
  const favourite = [...items].sort((a, b) => (votes.get(b.id) ?? 0) - (votes.get(a.id) ?? 0))[0];
  const favouriteVotes = favourite ? votes.get(favourite.id) ?? 0 : 0;
  const average = total ? [...votes.values()].reduce((sum, value) => sum + value, 0) / total : 0;

  const stats = [
    { label: "Métiers", value: String(items.length), hint: `${published} publié${published > 1 ? "s" : ""} · ${items.length - published} masqué${items.length - published > 1 ? "s" : ""}`, icon: Briefcase },
    { label: "Inscrits à l'écoute", value: String(total), hint: "Inscriptions actives prises en compte", icon: Users },
    {
      label: "Le plus demandé",
      value: favouriteVotes ? favourite.titleFr : "—",
      hint: favouriteVotes ? `${favouriteVotes} inscrit${favouriteVotes > 1 ? "s" : ""} intéressé${favouriteVotes > 1 ? "s" : ""}` : "Pas encore de choix",
      icon: Trophy,
    },
    { label: "Choix par inscrit", value: total ? average.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : "—", hint: "Métiers cochés en moyenne", icon: Heart },
  ];

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Métiers"
        description="Les métiers de l'explorateur du site, aussi proposés à l'étape « Intérêts » de l'inscription. Le premier de la liste s'ouvre par défaut."
        actions={
          <>
            <Link href="/metiers" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir les métiers
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/metiers" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouveau métier
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
            <p className="display mt-2 truncate text-2xl text-night tabular-nums md:text-3xl">{value}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="order-2 xl:order-1" aria-label="Liste des métiers">
          {items.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
                <Briefcase className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium text-night">Aucun métier pour le moment</p>
              <p className="text-sm text-muted">Ajoutez le premier métier avec le formulaire.</p>
            </div>
          ) : (
            <ol className="grid gap-3 sm:grid-cols-2">
              {items.map((item, index) => {
                const featured = index === 0;
                const active = current?.id === item.id;
                const count = votes.get(item.id) ?? 0;
                const share = total ? Math.round((count / total) * 100) : 0;
                return (
                  <li key={item.id} className={cn(featured && "sm:col-span-2")}>
                    <article
                      className={cn(
                        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl p-5 ring-1 transition",
                        featured ? "bg-night text-white ring-night" : "bg-white ring-night/[0.07] hover:shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]",
                        active && "shadow-[0_20px_40px_-24px_rgba(255,122,26,0.6)] ring-2 ring-sun",
                        !item.published && "opacity-60",
                      )}
                    >
                      {featured ? <div aria-hidden="true" className="pointer-events-none absolute -end-16 -top-20 -z-10 size-56 rounded-full bg-sun/25 blur-3xl" /> : null}
                      <span
                        aria-hidden="true"
                        className={cn("display pointer-events-none absolute -bottom-3 end-3 -z-10 leading-none", featured ? "text-outline text-8xl" : "text-6xl text-night/[0.05]")}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            "grid shrink-0 place-items-center rounded-2xl transition",
                            featured ? "size-12 bg-sun text-night shadow-[0_12px_30px_-12px_rgba(255,122,26,0.9)]" : "size-11 bg-dawn text-sun-ink group-hover:bg-sun group-hover:text-night",
                          )}
                        >
                          <Icon name={item.icon} className={featured ? "size-6" : "size-5"} />
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            title={item.published ? "Publié sur le site" : "Masqué sur le site"}
                            className={cn(
                              "grid size-7 place-items-center rounded-full",
                              item.published
                                ? featured
                                  ? "bg-emerald-400/15 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700"
                                : featured
                                  ? "bg-white/10 text-haze"
                                  : "bg-night/[0.06] text-muted",
                            )}
                          >
                            {item.published ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                            <span className="sr-only">{item.published ? "Publié" : "Masqué"}</span>
                          </span>
                          <Link
                            href={`?id=${item.id}`}
                            scroll={false}
                            aria-label={`Modifier ${item.titleFr}`}
                            className={cn(
                              "grid size-9 place-items-center rounded-full transition",
                              active ? "bg-sun text-night" : featured ? "text-white hover:bg-white/10" : "text-institution hover:bg-mist",
                            )}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Link>
                          <span className={cn(featured && "[&_button]:text-red-300 [&_button:hover]:bg-white/10")}>
                            <DeleteForm action={deleteCareer} id={item.id} label={item.titleFr} />
                          </span>
                        </div>
                      </div>

                      <div className={cn("mt-5", featured && "max-w-xl")}>
                        {featured ? <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">Ouvert par défaut</p> : null}
                        <h3 className={cn("font-semibold", featured ? "display text-2xl md:text-3xl" : "text-lg text-night")}>{item.titleFr}</h3>
                        <p className={cn("mt-2 line-clamp-2 text-sm leading-6", featured ? "text-haze" : "text-muted")}>{item.summaryFr}</p>
                      </div>

                      <div className="mt-auto pt-5">
                        <div className={cn("flex items-baseline justify-between text-xs", featured ? "text-haze" : "text-muted")}>
                          <span>Intérêt des inscrits</span>
                          <span className={cn("font-semibold tabular-nums", featured ? "text-white" : "text-night")}>
                            {count} · {share} %
                          </span>
                        </div>
                        <div className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full", featured ? "bg-white/10" : "bg-mist")}>
                          <div className="h-full rounded-full bg-gradient-to-r from-sun to-sun-bright" style={{ width: `${share}%` }} />
                        </div>
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
            <div className="flex items-start justify-between gap-3 border-b border-night/[0.07] px-5 py-4 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{current ? "Modification" : "Nouveau métier"}</p>
                <h2 className="display mt-1 truncate text-xl text-night">{current ? current.titleFr : "Ajouter un métier"}</h2>
              </div>
              {current ? (
                <Link
                  href="/admin/metiers"
                  scroll={false}
                  aria-label="Annuler la modification"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-night"
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <form key={current?.id ?? "new"} action={saveCareer} className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <CareerEditorFields
                names={iconNames}
                number={currentIndex + 1}
                initial={{
                  titleFr: current?.titleFr ?? "",
                  titleAr: current?.titleAr ?? "",
                  summaryFr: current?.summaryFr ?? "",
                  summaryAr: current?.summaryAr ?? "",
                  icon: current?.icon ?? "briefcase",
                }}
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Famille" hint="Filtre du carrousel" className="w-48">
                    <input className="field" name="category" list="familles-metiers" maxLength={40} placeholder="Ex. Tech & data" defaultValue={current?.category ?? ""} />
                    <datalist id="familles-metiers">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </AdminField>
                  <AdminField label="Ordre" hint="1 = ouvert par défaut" className="w-32">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter le métier"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
