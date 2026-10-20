import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { deleteWhy, saveWhy } from "@/server/actions/admin";

export const instant = false;

export default async function WhyAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().whyItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-5">
      <h1 className="display text-4xl text-night">Pourquoi participer</h1>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveWhy} className="grid gap-3 rounded-3xl bg-white p-5">
        {current ? <input type="hidden" name="id" value={current.id} /> : null}
        <input className="field" name="titleFr" defaultValue={current?.titleFr ?? ""} required />
        <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? ""} />
        <textarea className="field" name="bodyFr" defaultValue={current?.bodyFr ?? ""} required />
        <textarea className="field" name="bodyAr" dir="rtl" defaultValue={current?.bodyAr ?? ""} />
        <input className="field" name="icon" defaultValue={current?.icon ?? "sparkles"} />
        <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={current?.published ?? true} /> Publié</label>
        <button className="h-11 rounded-full bg-night text-beige">{current ? "Mettre à jour" : "Ajouter"}</button>
      </form>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <a href={`?id=${item.id}`}>{item.titleFr}</a>
            <form action={deleteWhy}><input type="hidden" name="id" value={item.id} /><button className="text-sm text-red-700">Supprimer</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
