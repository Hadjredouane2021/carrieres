import { ArrowUpRight, CheckCircle2, FileText, Languages, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, Panel, StatGrid } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { fallbackSections, splitAccent } from "@/lib/site-types";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { saveSection } from "@/server/actions/admin";

export const metadata = { title: "Textes du site" };
export const instant = false;

// Où chaque texte apparaît sur le site public.
const labels: Record<string, { label: string; hint: string; href: string }> = {
  hero: { label: "Hero de l'accueil", hint: "Titre principal et phrase d'accroche sous le slogan.", href: "/" },
  about: { label: "Le Forum", hint: "Titre et présentation de la page Le Forum.", href: "/forum" },
  why: { label: "Pourquoi participer", hint: "Introduction des cartes « Pourquoi participer ».", href: "/forum" },
  careers: { label: "Métiers", hint: "Introduction de l'explorateur des métiers.", href: "/metiers" },
  program: { label: "Programme", hint: "Introduction du programme (accueil et page Programme).", href: "/programme" },
  speakers: { label: "Intervenants", hint: "Introduction des intervenants.", href: "/intervenants" },
  partners: { label: "Partenaires", hint: "Introduction des partenaires.", href: "/partenaires" },
  gallery: { label: "Galerie", hint: "Texte de la galerie et de son état vide.", href: "/" },
  cta: { label: "Appel à l'inscription", hint: "Bloc final de l'accueil et encarts d'inscription.", href: "/" },
  contact: { label: "Contact", hint: "Introduction de la page Contact.", href: "/contact" },
  faq: { label: "FAQ", hint: "Introduction de la page FAQ.", href: "/faq" },
  register: { label: "Inscription", hint: "Titre et introduction de la page d'inscription. Le texte après « | » s'affiche en italique.", href: "/inscription" },
};

// Même mise en forme que les titres du site : le dernier mot (ou la suite après « | ») en italique orange.
function AccentPreview({ text }: { text: string }) {
  const [head, accent] = splitAccent(text);
  if (!accent) return <>{head}</>;
  return (
    <>
      {head} <span className="font-accent text-[1.08em] italic text-sun">{accent}</span>
    </>
  );
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; key?: string }> }) {
  await connection();
  const query = await searchParams;
  const stored = await db().siteSection.findMany();
  const keys = Object.keys(fallbackSections).filter((key) => labels[key]);
  const selected = keys.includes(query.key ?? "") ? query.key! : keys[0];
  const rows = keys.map((key) => {
    const saved = stored.find((item) => item.key === key);
    const fallback = fallbackSections[key];
    const title = saved?.titleFr ?? fallback.title.fr;
    const body = saved?.bodyFr ?? fallback.body.fr;
    return { key, saved, fallback, title, body, custom: Boolean(saved) };
  });
  const current = rows.find((row) => row.key === selected)!;
  const meta = labels[selected];
  const custom = rows.filter((row) => row.custom).length;
  const lastUpdate = stored.reduce<Date | null>((latest, item) => (!latest || item.updatedAt > latest ? item.updatedAt : latest), null);

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Textes du site"
        description="Titres et introductions des sections. Chaque bloc s'enregistre séparément."
      />
      <Flash error={query.error} ok={query.ok} />

      <StatGrid
        stats={[
          { label: "Sections", value: String(rows.length), hint: "Blocs de texte modifiables", icon: FileText },
          { label: "Personnalisées", value: `${custom}/${rows.length}`, hint: `${rows.length - custom} encore sur le texte par défaut`, icon: PenLine },
          { label: "Par défaut", value: `${rows.length - custom}/${rows.length}`, hint: "Textes d'origine conservés", icon: Languages },
          {
            label: "Dernière modification",
            value: lastUpdate ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Casablanca" }).format(lastUpdate) : "—",
            hint: lastUpdate ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" }).format(lastUpdate) : "Aucune",
            icon: Sparkles,
          },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <nav aria-label="Sections" className="lg:sticky lg:top-24">
          <ul className="grid gap-1 rounded-2xl bg-white p-2 ring-1 ring-night/[0.07]">
            {rows.map((row) => {
              const active = row.key === selected;
              return (
                <li key={row.key}>
                  <Link
                    href={`?key=${row.key}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-night text-white" : "text-night hover:bg-mist")}
                  >
                    <span className={cn("size-2 shrink-0 rounded-full", row.custom ? "bg-sun" : active ? "bg-white/30" : "bg-night/15")} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{labels[row.key].label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 flex items-center gap-2 px-2 text-xs text-muted">
            <span className="size-2 rounded-full bg-sun" aria-hidden="true" /> Texte personnalisé
          </p>
        </nav>

        <div className="grid gap-5">
          <section className="relative overflow-hidden rounded-2xl bg-night p-6 text-white md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-sun/25 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-sun">
                <span className="h-px w-8 bg-current" aria-hidden="true" /> Aperçu · {meta.label}
              </p>
              <Link href={meta.href} target="_blank" className="inline-flex items-center gap-1 text-xs text-haze hover:text-white">
                Voir sur le site <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <h2 className="display relative mt-4 max-w-3xl text-3xl leading-[1.02] md:text-4xl">
              <AccentPreview text={current.title} />
            </h2>
            {current.body ? <p className="relative mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-haze md:text-base">{current.body}</p> : null}
            <p className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-haze">
              {current.custom ? <CheckCircle2 className="size-3.5 text-emerald-300" aria-hidden="true" /> : null}
              {current.custom ? "Texte personnalisé" : "Texte par défaut"}
            </p>
          </section>

          <Panel title={`Modifier « ${meta.label} »`} description={meta.hint}>
            <form key={selected} action={saveSection} className="grid gap-5">
              <input type="hidden" name="key" value={selected} />
              <BilingualFields
                fr={
                  <AdminField label="Titre" hint={selected === "register" ? "Le texte après « | » s'affiche en italique orange." : "Le dernier mot s'affiche en italique orange."}>
                    <input className="field" name="titleFr" defaultValue={current.saved?.titleFr ?? current.fallback.title.fr} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Titre (arabe)">
                    <input className="field" name="titleAr" dir="rtl" defaultValue={current.saved?.titleAr ?? current.fallback.title.ar} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Texte">
                    <textarea className="field min-h-36" name="bodyFr" defaultValue={current.saved?.bodyFr ?? current.fallback.body.fr} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Texte (arabe)">
                    <textarea className="field min-h-36" name="bodyAr" dir="rtl" defaultValue={current.saved?.bodyAr ?? current.fallback.body.ar} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night/[0.07] pt-5">
                <Link href={meta.href} target="_blank" className={cn(buttonVariants({ variant: "ghost", size: "md" }))}>
                  Où ce texte apparaît
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                <SubmitButton variant="sun">Enregistrer</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
