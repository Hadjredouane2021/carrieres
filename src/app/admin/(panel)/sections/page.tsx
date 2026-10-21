import { ArrowDown, ArrowUp, ArrowUpRight, Eye, EyeOff, LayoutGrid, Lock, PenLine } from "lucide-react";
import Link from "next/link";
import { Flash, PageHeader } from "@/components/admin/shell";
import { HOME_SECTIONS, normalizeLayout } from "@/lib/home-layout";
import { db } from "@/lib/prisma";
import { FACET_KEYS, fallbackFacets, fallbackSections } from "@/lib/site-types";
import { moveSection, saveSection, toggleSection } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function SectionsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const [settings, stored, why, careers, program, speakers, partners, faqs, gallery] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" }, select: { homeLayout: true } }),
    db().siteSection.findMany(),
    db().whyItem.count({ where: { published: true } }),
    db().career.count({ where: { published: true } }),
    db().programItem.count({ where: { published: true } }),
    db().speaker.count({ where: { published: true } }),
    db().partner.count({ where: { published: true } }),
    db().faqItem.count({ where: { published: true } }),
    db().galleryItem.count({ where: { published: true } }),
  ]);
  const counts: Record<string, number> = { why, careers, program, speakers, partners, faq: faqs, gallery };
  const layout = normalizeLayout(settings?.homeLayout);
  const visibleCount = layout.filter((item) => item.visible).length;
  let position = 0;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Site public"
        title="Sections de l'accueil"
        intro={`${visibleCount} sections affichées sur ${layout.length}. Changez l'ordre, masquez une section ou modifiez ses textes : le site se met à jour aussitôt.`}
        action={
          <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full bg-night px-5 text-sm text-beige hover:bg-institution">
            Voir l'accueil <ArrowUpRight className="size-4" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <ol className="grid gap-3">
        <li className="flex flex-wrap items-center gap-4 rounded-3xl border border-night/5 bg-white/80 p-4 shadow-[0_1px_0_rgba(11,27,58,0.04)] backdrop-blur">
          <span className="grid size-11 place-items-center rounded-2xl bg-night text-gold"><Lock className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-night">Hero</p>
            <p className="text-sm text-institution">Toujours en tête de page : titre, slogan, date et photo de fond.</p>
          </div>
          <Link href="/admin/hero" className="inline-flex h-9 items-center gap-2 rounded-full border border-night/10 px-4 text-sm hover:border-gold">
            <PenLine className="size-4" /> Modifier
          </Link>
        </li>

        {layout.map((item, index) => {
          const meta = HOME_SECTIONS.find((section) => section.key === item.key)!;
          const current = stored.find((section) => section.key === item.key);
          const fallback = fallbackSections[item.key];
          const number = item.visible ? String(++position).padStart(2, "0") : "—";
          const count = counts[item.key];
          return (
            <li
              key={item.key}
              id={item.key}
              className={`rounded-3xl border bg-white p-4 shadow-[0_1px_0_rgba(11,27,58,0.04)] transition ${item.visible ? "border-night/5" : "border-dashed border-night/15 bg-white/50"}`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className={`display grid size-11 place-items-center rounded-2xl text-lg ${item.visible ? "bg-gold/15 text-night" : "bg-mist text-institution/60"}`}>{number}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${item.visible ? "text-night" : "text-institution/70"}`}>
                    {meta.label}
                    {!item.visible ? <span className="ms-2 rounded-full bg-mist px-2 py-0.5 text-xs text-institution">Masquée</span> : null}
                  </p>
                  <p className="truncate text-sm text-institution">
                    {current?.titleFr ?? fallback.title.fr}
                    {count !== undefined ? ` · ${count} élément${count > 1 ? "s" : ""} publié${count > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <form action={moveSection}>
                    <input type="hidden" name="key" value={item.key} />
                    <input type="hidden" name="direction" value="up" />
                    <button disabled={index === 0} aria-label="Monter" className="grid size-9 place-items-center rounded-full border border-night/10 hover:border-gold disabled:opacity-30">
                      <ArrowUp className="size-4" />
                    </button>
                  </form>
                  <form action={moveSection}>
                    <input type="hidden" name="key" value={item.key} />
                    <input type="hidden" name="direction" value="down" />
                    <button disabled={index === layout.length - 1} aria-label="Descendre" className="grid size-9 place-items-center rounded-full border border-night/10 hover:border-gold disabled:opacity-30">
                      <ArrowDown className="size-4" />
                    </button>
                  </form>
                  <form action={toggleSection}>
                    <input type="hidden" name="key" value={item.key} />
                    <button className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm ${item.visible ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "bg-night text-beige hover:bg-institution"}`}>
                      {item.visible ? <><Eye className="size-4" /> Visible</> : <><EyeOff className="size-4" /> Afficher</>}
                    </button>
                  </form>
                  {meta.items ? (
                    <Link href={meta.items} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-night/10 px-4 text-sm hover:border-gold">
                      {meta.key === "contact" ? "Coordonnées" : "Éléments"} <ArrowUpRight className="size-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>

              <details className="group mt-3 rounded-2xl bg-mist/60 open:bg-mist">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm text-institution [&::-webkit-details-marker]:hidden">
                  <PenLine className="size-4" /> Modifier les textes
                  <ArrowDown className="ms-auto size-4 transition group-open:rotate-180" />
                </summary>
                <form action={saveSection} className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                  <input type="hidden" name="key" value={item.key} />
                  <label className="grid gap-1 text-sm">Titre français<input className="field" name="titleFr" defaultValue={current?.titleFr ?? fallback.title.fr} /></label>
                  <label className="grid gap-1 text-sm">Titre arabe<input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? fallback.title.ar} /></label>
                  <label className="grid gap-1 text-sm">Texte français<textarea className="field min-h-28" name="bodyFr" defaultValue={current?.bodyFr ?? fallback.body.fr} /></label>
                  <label className="grid gap-1 text-sm">Texte arabe<textarea className="field min-h-28" name="bodyAr" dir="rtl" defaultValue={current?.bodyAr ?? fallback.body.ar} /></label>
                  <button className="h-10 w-fit rounded-full bg-night px-5 text-sm text-beige hover:bg-institution">Enregistrer</button>
                </form>
              </details>

              {item.key === "about" ? (
                <details className="group mt-2 rounded-2xl bg-mist/60 open:bg-mist">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm text-institution [&::-webkit-details-marker]:hidden">
                    <LayoutGrid className="size-4" /> Cartes sous le texte (4 facettes)
                    <ArrowDown className="ms-auto size-4 transition group-open:rotate-180" />
                  </summary>
                  <div className="grid gap-3 px-4 pb-4 lg:grid-cols-2">
                    {FACET_KEYS.map((facetKey, facetIndex) => {
                      const saved = stored.find((section) => section.key === facetKey);
                      const base = fallbackFacets[facetKey];
                      return (
                        <form key={facetKey} action={saveSection} className="grid gap-2 rounded-2xl bg-white p-4">
                          <input type="hidden" name="key" value={facetKey} />
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-institution">Carte {facetIndex + 1}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input className="field" name="titleFr" aria-label="Titre français" defaultValue={saved?.titleFr ?? base.title.fr} />
                            <input className="field" name="titleAr" aria-label="Titre arabe" dir="rtl" defaultValue={saved?.titleAr ?? base.title.ar} />
                          </div>
                          <textarea className="field min-h-20" name="bodyFr" aria-label="Texte français" defaultValue={saved?.bodyFr ?? base.body.fr} />
                          <textarea className="field min-h-20" name="bodyAr" aria-label="Texte arabe" dir="rtl" defaultValue={saved?.bodyAr ?? base.body.ar} />
                          <button className="h-9 w-fit rounded-full bg-night px-4 text-sm text-beige hover:bg-institution">Enregistrer</button>
                        </form>
                      );
                    })}
                  </div>
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
