import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { deleteGallery, saveGallery } from "@/server/actions/admin";

export const instant = false;

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);
  return (
    <div className="grid gap-5">
      <h1 className="display text-4xl text-night">Galerie</h1>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveGallery} encType="multipart/form-data" className="grid gap-3 rounded-3xl bg-white p-5">
        {current ? <input type="hidden" name="id" value={current.id} /> : null}
        <select className="field" name="type" defaultValue={current?.type ?? "IMAGE"}>
          <option value="IMAGE">Photo</option>
          <option value="VIDEO">Vidéo YouTube ou Vimeo</option>
        </select>
        <input className="field" name="url" placeholder="URL https ou fichier ci-dessous" defaultValue={current?.url ?? ""} />
        <input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" />
        <input className="field" name="captionFr" placeholder="Légende" defaultValue={current?.captionFr ?? ""} />
        <input className="field" name="captionAr" dir="rtl" defaultValue={current?.captionAr ?? ""} />
        <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={current?.published ?? true} /> Publié</label>
        <button className="h-11 rounded-full bg-night text-beige">{current ? "Mettre à jour" : "Ajouter"}</button>
      </form>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <a href={`?id=${item.id}`}>{item.captionFr || item.type}</a>
            <form action={deleteGallery}><input type="hidden" name="id" value={item.id} /><button className="text-sm text-red-700">Supprimer</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
