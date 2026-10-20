import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { saveUser, toggleUser } from "@/server/actions/admin";

export const instant = false;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const users = await db().user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="grid gap-6">
      <h1 className="display text-4xl text-night">Comptes</h1>
      <Flash error={query.error} ok={query.ok} />
      <form action={saveUser} className="grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg">Nouveau compte</h2>
        <input className="field" name="name" placeholder="Nom" required />
        <input className="field" name="email" type="email" placeholder="E-mail" required />
        <select className="field" name="role" defaultValue="STAFF">
          <option value="STAFF">Accueil</option>
          <option value="ADMIN">Administration</option>
        </select>
        <input className="field" name="password" type="password" placeholder="Mot de passe (10 caractères min.)" required />
        <button className="h-11 rounded-full bg-night text-beige md:col-span-2">Créer</button>
      </form>
      <div className="grid gap-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-3xl bg-white p-5">
            <form action={saveUser} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={user.id} />
              <input className="field" name="name" defaultValue={user.name} />
              <input className="field" name="email" defaultValue={user.email} />
              <select className="field" name="role" defaultValue={user.role}>
                <option value="STAFF">Accueil</option>
                <option value="ADMIN">Administration</option>
              </select>
              <input className="field" name="password" type="password" placeholder="Nouveau mot de passe, facultatif" />
              <button className="h-10 rounded-full border border-night/10">Mettre à jour</button>
            </form>
            <form action={toggleUser} className="mt-3">
              <input type="hidden" name="id" value={user.id} />
              <button className="text-sm text-institution">{user.active ? "Désactiver" : "Réactiver"}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
