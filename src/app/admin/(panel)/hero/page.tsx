import { ArrowUpRight, CalendarDays, ImageIcon, Link2, MapPin, Type } from "lucide-react";
import Link from "next/link";
import { FormField, LangFields, Panel } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { formatEventDate, toCasablancaInput } from "@/lib/datetime";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { fallbackSections } from "@/lib/site-types";
import { saveHeroImage, saveHeroText } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

export default async function HeroPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireUser(true);
  const query = await searchParams;
  const [settings, section] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().siteSection.findUnique({ where: { key: "hero" } }),
  ]);
  const heroImage = safeAssetUrl(settings?.heroImage ?? "");
  const fallback = fallbackSections.hero;
  const title = section?.titleFr ?? fallback.title.fr;
  const when = formatEventDate(settings?.eventDate ?? null, "fr") ?? "Novembre 2026";
  const venue = settings && settings.venueName.trim() !== settings.city.trim() ? settings.venueName : "";
  const place = [venue, settings?.address ?? ""].filter(Boolean).join(" — ");

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Site public"
        title="Hero"
        intro="Le grand bandeau en haut de la page d'accueil : titre, slogan, date, lieu, lien et photo."
        action={
          <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 bg-white px-4 text-sm text-night hover:border-gold">
            Voir l'accueil <ArrowUpRight className="size-4" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <form action={saveHeroText} className="grid gap-5">
          <Panel title="Textes" description="Le titre, le slogan et la phrase d'accroche, en français et en arabe." icon={<Type className="size-5" />}>
            <LangFields label="Titre" name="title" fr={section?.titleFr ?? fallback.title.fr} ar={section?.titleAr ?? fallback.title.ar} required />
            <LangFields label="Slogan" name="slogan" fr={settings?.sloganFr ?? "Choisis ton avenir"} ar={settings?.sloganAr ?? ""} required />
            <LangFields label="Texte d'accroche" name="intro" fr={section?.bodyFr ?? ""} ar={section?.bodyAr ?? ""} multiline placeholder="Laissez vide pour le masquer." />
          </Panel>

          <Panel title="Date et lieu" description="Affichés sous l'accroche. La date pilote aussi le compte à rebours." icon={<CalendarDays className="size-5" />}>
            <FormField label="Date et heure" hint="Heure du Maroc. Vide : « Novembre 2026 », sans compte à rebours.">
              <input className="field" type="datetime-local" name="eventDate" defaultValue={toCasablancaInput(settings?.eventDate ?? null)} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Lieu" hint="Non répété s'il est identique à la ville.">
                <input className="field" name="venueName" placeholder="Ex. Pathé Californie" defaultValue={settings?.venueName ?? "Casablanca"} />
              </FormField>
              <FormField label="Adresse">
                <input className="field" name="address" placeholder="Ex. CT 1029, Centre commercial Californie" defaultValue={settings?.address ?? ""} />
              </FormField>
            </div>
          </Panel>

          <Panel title="Lien de l'événement" description="Bouton doré à côté de « Je participe » : billetterie, plan d'accès, live… Adresse vide = bouton masqué." icon={<Link2 className="size-5" />}>
            <FormField label="Adresse" hint="https://… pour un site externe, /contact pour une page du site.">
              <input className="field" name="eventLinkUrl" placeholder="https://…" defaultValue={settings?.eventLinkUrl ?? ""} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Texte du bouton (FR)"><input className="field" name="eventLinkLabelFr" placeholder="Lien de l'événement" defaultValue={settings?.eventLinkLabelFr ?? ""} /></FormField>
              <FormField label="Texte du bouton (AR)"><input className="field" name="eventLinkLabelAr" dir="rtl" placeholder="رابط الحدث" defaultValue={settings?.eventLinkLabelAr ?? ""} /></FormField>
            </div>
          </Panel>

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl bg-night/95 p-2 ps-5 text-sm text-beige shadow-2xl shadow-night/30 backdrop-blur">
            <span className="text-beige/70">Textes, date, lieu et lien.</span>
            <button className="h-10 rounded-xl bg-gold px-5 font-medium text-night hover:bg-gold-bright">Enregistrer</button>
          </div>
        </form>

        <div className="grid gap-5 xl:sticky xl:top-24">
          <section className="admin-card overflow-hidden">
            <p className="flex items-center justify-between px-5 pt-4 text-xs uppercase tracking-[0.2em] text-institution">
              Aperçu <span className="normal-case tracking-normal text-institution/60">valeurs enregistrées</span>
            </p>
            <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-2xl bg-night text-white">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#071226] via-[#173D70] to-[#C4A06A]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3A]/95 via-[#0B1B3A]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 grid gap-1.5 p-4">
                <p className="hero-title text-xl leading-tight">{title}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black">{settings?.sloganFr}</p>
                {section?.bodyFr ? <p className="line-clamp-2 text-[11px] text-beige/90">{section.bodyFr}</p> : null}
                <p className="text-[9px] uppercase tracking-[0.16em] text-beige/80">{when} — {settings?.city ?? "Casablanca"}</p>
                {place ? <p className="flex items-center gap-1 text-[10px] text-beige/70"><MapPin className="size-3 text-gold" /> {place}</p> : null}
                <div className="mt-1 flex gap-1.5">
                  <span className="rounded-full bg-gold px-2.5 py-1 text-[9px] font-semibold text-night">Je participe</span>
                  <span className="rounded-full border border-white/30 px-2.5 py-1 text-[9px]">Programme</span>
                  {settings?.eventLinkUrl ? <span className="rounded-full border border-gold/50 px-2.5 py-1 text-[9px] text-gold">{settings.eventLinkLabelFr || "Lien de l'événement"}</span> : null}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold/15 text-[#8A6A33]"><ImageIcon className="size-5" /></span>
              <div>
                <h2 className="font-medium text-night">Photo de fond</h2>
                <p className="mt-0.5 text-sm text-institution">JPG, PNG ou WebP, 16 Mo max. Recadrée en pleine largeur avec un voile bleu nuit.</p>
              </div>
            </div>
            <form action={saveHeroImage} className="grid gap-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-night/15 p-4 text-sm text-institution transition hover:border-gold hover:bg-gold/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
                <ImageIcon className="size-5 shrink-0 text-gold" />
                <span>Choisir une nouvelle photo…</span>
                <input type="file" name="file" accept="image/jpeg,image/png,image/webp" className="min-w-0 flex-1 text-xs file:hidden" />
              </label>
              {heroImage ? (
                <label className="flex items-center gap-2 text-sm text-institution">
                  <input type="checkbox" name="remove" className="size-4 accent-[#0B1B3A]" /> Revenir à l'illustration par défaut
                </label>
              ) : null}
              <button className="h-10 w-full rounded-full bg-night text-sm text-beige hover:bg-institution">Mettre à jour la photo</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
