import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { HeroStudio } from "@/components/admin/hero-studio";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { eventDateParts } from "@/lib/datetime";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { fallbackSections } from "@/lib/site-types";
import { cn, placeLabel } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const metadata = { title: "Hero de l'accueil" };
export const instant = false;

export default async function HeroAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  await requireUser(true);
  const query = await searchParams;
  const [settings, section] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().siteSection.findUnique({ where: { key: "hero" } }),
  ]);
  const photo = safeAssetUrl(settings?.heroImage ?? "");
  const title = section?.titleFr || fallbackSections.hero.title.fr;
  const slogan = settings?.sloganFr || "Choisis ton avenir";
  const when = eventDateParts(settings?.eventDate?.toISOString() ?? null, "fr");
  const place = placeLabel(settings?.venueName, settings?.city) || "Casablanca";
  const texts = [
    ["Titre", title, "/admin/contenu", "Textes"],
    ["Slogan", slogan, "/admin/parametres", "Paramètres"],
    ["Date et lieu", `${when ? `${when.day} · ${when.time}` : "Date à définir"} — ${place}`, "/admin/parametres", "Paramètres"],
  ] as const;

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Hero de l'accueil"
        description="Choisissez l'arrière-plan du Hero : la vidéo de Casablanca, ou une photo fixe. En mode vidéo, l'image sert de poster avant la lecture et pour les visiteurs qui limitent les animations. Sans image, le poster tiré de la vidéo est utilisé."
        actions={
          <Link href="/" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
            Voir l&apos;accueil
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <HeroStudio key={photo ?? "illustration"} media={settings?.heroMedia === "image" ? "image" : "video"} photo={photo} title={title} slogan={slogan} day={when?.day ?? "Novembre 2026"} place={place} />
      <section className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.07] md:p-6">
        <h2 className="text-lg font-medium text-night">Textes affichés</h2>
        <dl className="mt-3 divide-y divide-night/5">
          {texts.map(([label, value, href, page]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4">
              <dt className="text-sm text-institution">{label}</dt>
              <dd className="font-medium text-night">{value}</dd>
              <dd>
                <Link href={href} className="text-sm text-institution underline-offset-4 hover:text-night hover:underline">
                  Modifier dans {page}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
