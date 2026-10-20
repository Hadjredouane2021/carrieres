import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { fallbackSections } from "@/lib/site-types";
import { db } from "@/lib/prisma";
import { saveSection } from "@/server/actions/admin";

export const instant = false;

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const stored = await db().siteSection.findMany();
  const keys = Object.keys(fallbackSections);
  return (
    <div className="grid gap-5">
      <h1 className="display text-4xl text-night">Textes du site</h1>
      <Flash error={query.error} ok={query.ok} />
      {keys.map((key) => {
        const current = stored.find((item) => item.key === key);
        const fallback = fallbackSections[key];
        return (
          <form key={key} action={saveSection} className="grid gap-3 rounded-3xl bg-white p-5">
            <input type="hidden" name="key" value={key} />
            <h2 className="text-lg capitalize text-night">{key}</h2>
            <input className="field" name="titleFr" defaultValue={current?.titleFr ?? fallback.title.fr} />
            <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? fallback.title.ar} />
            <textarea className="field min-h-28" name="bodyFr" defaultValue={current?.bodyFr ?? fallback.body.fr} />
            <textarea className="field min-h-28" name="bodyAr" dir="rtl" defaultValue={current?.bodyAr ?? fallback.body.ar} />
            <button className="h-10 w-fit rounded-full bg-night px-5 text-beige">Enregistrer</button>
          </form>
        );
      })}
    </div>
  );
}
