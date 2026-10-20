import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { deleteProgram, saveProgram } from "@/server/actions/admin";

export const instant = false;

export default async function ProgramAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().programItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-5">
      <h1 className="display text-4xl text-night">Programme</h1>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveProgram} className="grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        {current ? <input type="hidden" name="id" value={current.id} /> : null}
        <input className="field" name="startTime" placeholder="09:00" defaultValue={current?.startTime ?? ""} required />
        <input className="field" name="endTime" placeholder="10:00" defaultValue={current?.endTime ?? ""} required />
        <input className="field md:col-span-2" name="titleFr" placeholder="Titre français" defaultValue={current?.titleFr ?? ""} required />
        <input className="field md:col-span-2" name="titleAr" dir="rtl" placeholder="العنوان" defaultValue={current?.titleAr ?? ""} />
        <textarea className="field md:col-span-2" name="descriptionFr" placeholder="Description" defaultValue={current?.descriptionFr ?? ""} />
        <textarea className="field md:col-span-2" name="descriptionAr" dir="rtl" defaultValue={current?.descriptionAr ?? ""} />
        <input className="field" name="location" placeholder="Lieu" defaultValue={current?.location ?? ""} />
        <input className="field" name="speakerName" placeholder="Intervenant" defaultValue={current?.speakerName ?? ""} />
        <select className="field" name="category" defaultValue={current?.category ?? "plenary"}>
          {PROGRAM_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.fr}</option>)}
        </select>
        <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={current?.published ?? true} /> Publié</label>
        <button className="h-11 rounded-full bg-night text-beige md:col-span-2">{current ? "Mettre à jour" : "Ajouter"}</button>
      </form>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3">
            <a href={`?id=${item.id}`}>{item.startTime} — {item.titleFr}</a>
            <form action={deleteProgram}><input type="hidden" name="id" value={item.id} /><button className="text-sm text-red-700">Supprimer</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
