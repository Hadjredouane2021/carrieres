import { ArrowUpRight, ExternalLink, Eye, EyeOff, Globe, Handshake, ImageIcon, Layers, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, Panel, PublishedToggle } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { PartnerEditorFields } from "@/components/admin/partner-editor";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { PARTNER_TIERS } from "@/lib/constants";
import { safeAssetUrl } from "@/lib/media";
import { domainOf, PARTNER_TONES } from "@/lib/partner-tones";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deletePartner, savePartner } from "@/server/actions/admin";

export const metadata = { title: "Partenaires" };
export const instant = false;

type Query = { error?: string; ok?: string; id?: string; tier?: string };

function href(query: Query, changes: Partial<Query>) {
  const next = { tier: query.tier, id: query.id, ...changes };
  const params = new URLSearchParams();
  if (next.tier) params.set("tier", next.tier);
  if (next.id) params.set("id", next.id);
  const text = params.toString();
  return text ? `/admin/partenaires?${text}` : "/admin/partenaires";
}

export default async function PartnersAdminPage({ searchParams }: { searchParams: Promise<Query> }) {
  await connection();
  const query = await searchParams;
  const items = await db().partner.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  const filter = PARTNER_TIERS.some((tier) => tier.value === query.tier) ? query.tier : undefined;

  const published = items.filter((item) => item.published).length;
  const withLogo = items.filter((item) => safeAssetUrl(item.logoUrl)).length;
  const withSite = items.filter((item) => item.website).length;
  const usedTiers = PARTNER_TIERS.filter((tier) => items.some((item) => item.tier === tier.value));
  const groups = PARTNER_TIERS.filter((tier) => !filter || tier.value === filter)
    .map((tier) => ({ ...tier, items: items.filter((item) => item.tier === tier.value) }))
    .filter((group) => group.items.length > 0);

  const stats = [
    { label: "Partenaires", value: String(items.length), hint: `${published} publié${published > 1 ? "s" : ""} · ${items.length - published} masqué${items.length - published > 1 ? "s" : ""}`, icon: Handshake },
    { label: "Logos", value: `${withLogo}/${items.length}`, hint: withLogo === items.length ? "Tous illustrés" : `${items.length - withLogo} affiché${items.length - withLogo > 1 ? "s" : ""} par leur nom`, icon: ImageIcon },
    { label: "Liens vers un site", value: `${withSite}/${items.length}`, hint: "Logos cliquables", icon: Globe },
    { label: "Catégories utilisées", value: `${usedTiers.length}/${PARTNER_TIERS.length}`, hint: usedTiers.map((tier) => tier.fr).join(" · ") || "Aucune", icon: Layers },
  ];

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Partenaires"
        description="Logos officiels uniquement. Sans logo, le nom du partenaire s'affiche. Les catégories regroupent les partenaires sur la page dédiée."
        actions={
          <>
            <Link href="/partenaires" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir les partenaires
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href={href(query, { id: undefined })} className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouveau partenaire
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

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="order-2 grid gap-5 xl:order-1" aria-label="Partenaires par catégorie">
          <nav aria-label="Filtrer par catégorie" className="-mx-1 overflow-x-auto px-1">
            <div className="flex w-max gap-1 rounded-2xl bg-white p-1 ring-1 ring-night/[0.07]">
              {[{ value: undefined, fr: "Toutes" }, ...PARTNER_TIERS].map((tier) => {
                const active = filter === tier.value;
                const count = tier.value ? items.filter((item) => item.tier === tier.value).length : items.length;
                return (
                  <Link
                    key={tier.fr}
                    href={href(query, { tier: tier.value })}
                    scroll={false}
                    className={cn("inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm transition", active ? "bg-night text-white" : "text-muted hover:bg-mist hover:text-night")}
                  >
                    {tier.value ? <span className={cn("size-2 rounded-full", PARTNER_TONES[tier.value].dot, active && tier.value === "INSTITUTIONAL" && "bg-white")} aria-hidden="true" /> : null}
                    {tier.fr}
                    <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/15" : "bg-mist")}>{count}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {groups.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
                <Handshake className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium text-night">{items.length ? "Aucun partenaire dans cette catégorie" : "Aucun partenaire pour le moment"}</p>
              <p className="text-sm text-muted">Ajoutez un logo avec le formulaire.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.value} className="grid gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", PARTNER_TONES[group.value].chip)}>{group.fr}</span>
                  <span className="text-xs text-muted">{PARTNER_TONES[group.value].hint}</span>
                  <span className="h-px flex-1 bg-night/[0.07]" aria-hidden="true" />
                  <span className="text-xs tabular-nums text-muted">{group.items.length}</span>
                </div>
                <ol className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {group.items.map((item) => {
                    const logo = safeAssetUrl(item.logoUrl);
                    const active = current?.id === item.id;
                    const domain = domainOf(item.website);
                    return (
                      <li key={item.id}>
                        <article
                          className={cn(
                            "group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 transition",
                            active ? "shadow-[0_20px_40px_-24px_rgba(255,122,26,0.6)] ring-2 ring-sun" : "ring-night/[0.07] hover:shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]",
                            !item.published && "opacity-60",
                          )}
                        >
                          <div className="relative grid aspect-[3/2] place-items-center bg-[radial-gradient(circle_at_1px_1px,rgba(11,27,58,0.06)_1px,transparent_0)] bg-[size:14px_14px] p-5">
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logo} alt={item.name} className="max-h-14 w-auto max-w-[80%] object-contain grayscale transition duration-500 group-hover:grayscale-0" />
                            ) : (
                              <span className="display text-center text-xl text-night/35">{item.name}</span>
                            )}
                            <span
                              title={item.published ? "Publié sur le site" : "Masqué sur le site"}
                              className={cn("absolute start-2 top-2 grid size-7 place-items-center rounded-full", item.published ? "bg-emerald-50 text-emerald-700" : "bg-night/[0.06] text-muted")}
                            >
                              {item.published ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                              <span className="sr-only">{item.published ? "Publié" : "Masqué"}</span>
                            </span>
                            {!logo ? <span className="absolute end-2 top-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Sans logo</span> : null}
                          </div>
                          <div className="flex items-center gap-2 border-t border-night/[0.06] px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-night">{item.name}</p>
                              {domain ? (
                                <a href={item.website} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-xs text-muted hover:text-night">
                                  {domain} <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                                </a>
                              ) : (
                                <p className="text-xs text-muted">Pas de site</p>
                              )}
                            </div>
                            <Link
                              href={href(query, { id: item.id })}
                              scroll={false}
                              aria-label={`Modifier ${item.name}`}
                              className={cn("grid size-8 place-items-center rounded-full transition", active ? "bg-sun text-night" : "text-institution hover:bg-mist")}
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Link>
                            <span className="[&_button]:size-8">
                              <DeleteForm action={deletePartner} id={item.id} label={item.name} />
                            </span>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))
          )}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <div className="flex items-start justify-between gap-3 border-b border-night/[0.07] px-5 py-4 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{current ? "Modification" : "Nouveau partenaire"}</p>
                <h2 className="display mt-1 truncate text-xl text-night">{current ? current.name : "Ajouter un logo"}</h2>
              </div>
              {current ? (
                <Link
                  href={href(query, { id: undefined })}
                  scroll={false}
                  aria-label="Annuler la modification"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-night"
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <form key={current?.id ?? "new"} action={savePartner} encType="multipart/form-data" className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <PartnerEditorFields
                initial={{
                  name: current?.name ?? "",
                  tier: current?.tier ?? filter ?? "PARTNER",
                  website: current?.website ?? "",
                  logoUrl: current?.logoUrl ?? "",
                }}
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" hint="Position dans la catégorie" className="w-32">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter le partenaire"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
