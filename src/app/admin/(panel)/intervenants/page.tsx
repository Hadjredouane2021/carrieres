import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { deleteSpeaker, saveSpeaker } from "@/server/actions/admin";

export const instant = false;

export default async function SpeakersAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().speaker.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-5">
      <h1 className="display text-4xl text-night">Intervenants</h1>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveSpeaker} encType="multipart/form-data" className="grid gap-3 rounded-3xl bg-white p-5">
        {current ? <input type="hidden" name="id" value={current.id} /> : null}
        <input className="field" name="name" defaultValue={current?.name ?? ""} required />
        <input className="field" name="roleFr" placeholder="Fonction" defaultValue={current?.roleFr ?? ""} required />
        <input className="field" name="roleAr" dir="rtl" defaultValue={current?.roleAr ?? ""} />
        <input className="field" name="org" placeholder="Organisation" defaultValue={current?.org ?? ""} />
        <textarea className="field" name="bioFr" defaultValue={current?.bioFr ?? ""} />
        <textarea className="field" name="bioAr" dir="rtl" defaultValue={current?.bioAr ?? ""} />
        <input className="field" name="photoUrl" placeholder="https://… ou laisser vide" defaultValue={current?.photoUrl ?? ""} />
        <input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" />
        <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={current?.published ?? true} /> Publié</label>
        <button className="h-11 rounded-full bg-night text-beige">{current ? "Mettre à jour" : "Ajouter"}</button>
      </form>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <a href={`?id=${item.id}`}>{item.name}</a>
            <form action={deleteSpeaker}><input type="hidden" name="id" value={item.id} /><button className="text-sm text-red-700">Supprimer</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
