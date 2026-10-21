import { ChevronDown } from "lucide-react";
import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { fallbackSections } from "@/lib/site-types";
import { db } from "@/lib/prisma";
import { saveSection } from "@/server/actions/admin";

export const instant = false;

// Où chaque texte apparaît sur le site public.
const labels: Record<string, [string, string]> = {
  hero: ["Hero de l'accueil", "Titre principal de l'accueil (le texte n'est pas affiché)."],
  about: ["Le Forum", "Titre et présentation de la page Le Forum."],
  why: ["Pourquoi participer", "Introduction des cartes « Pourquoi participer »."],
  careers: ["Métiers", "Introduction de l'explorateur des métiers."],
  program: ["Programme", "Introduction du programme (accueil et page Programme)."],
  speakers: ["Intervenants", "Introduction des intervenants."],
  partners: ["Partenaires", "Introduction des partenaires."],
  gallery: ["Galerie", "Texte de la galerie et de son état vide."],
  cta: ["Appel à l'inscription", "Bloc final de l'accueil et encarts d'inscription."],
  contact: ["Contact", "Introduction de la page Contact."],
  faq: ["FAQ", "Introduction de la page FAQ."],
};

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const stored = await db().siteSection.findMany();
  const keys = Object.keys(fallbackSections);
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Site public" title="Textes du site" description="Titres et introductions des sections. Le français est obligatoire, l'arabe facultatif. Chaque bloc s'enregistre séparément." />
      <Flash error={query.error} ok={query.ok} />
      <div className="grid gap-3">
        {keys.map((key, index) => {
          const current = stored.find((item) => item.key === key);
          const fallback = fallbackSections[key];
          const [label, hint] = labels[key] ?? [key, ""];
          return (
            <details key={key} open={index === 0} className="group rounded-2xl bg-white ring-1 ring-night/[0.07]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block font-semibold text-night">{label}</span>
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <form action={saveSection} className="grid gap-4 border-t border-night/[0.07] px-5 pb-5 pt-4">
                <input type="hidden" name="key" value={key} />
                <BilingualFields
                  fr={
                    <AdminField label="Titre (français)">
                      <input className="field" name="titleFr" defaultValue={current?.titleFr ?? fallback.title.fr} />
                    </AdminField>
                  }
                  ar={
                    <AdminField label="Titre (arabe)">
                      <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? fallback.title.ar} />
                    </AdminField>
                  }
                />
                <BilingualFields
                  fr={
                    <AdminField label="Texte (français)">
                      <textarea className="field min-h-28" name="bodyFr" defaultValue={current?.bodyFr ?? fallback.body.fr} />
                    </AdminField>
                  }
                  ar={
                    <AdminField label="Texte (arabe)">
                      <textarea className="field min-h-28" name="bodyAr" dir="rtl" defaultValue={current?.bodyAr ?? fallback.body.ar} />
                    </AdminField>
                  }
                />
                <SubmitButton className="w-fit">Enregistrer « {label} »</SubmitButton>
              </form>
            </details>
          );
        })}
      </div>
    </div>
  );
}
