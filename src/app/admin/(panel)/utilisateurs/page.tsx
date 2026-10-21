import { connection } from "next/server";
import { AdminField, AdminHeader, Panel } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { saveUser, toggleUser } from "@/server/actions/admin";

export const instant = false;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const users = await db().user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Administration" title="Comptes de l'équipe" description="Administration : tous les écrans. Accueil : inscriptions, accueil QR et messages." />
      <Flash error={query.error} ok={query.ok} />
      <Panel title="Nouveau compte">
        <form action={saveUser} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nom">
            <input className="field" name="name" required />
          </AdminField>
          <AdminField label="E-mail">
            <input className="field" name="email" type="email" autoComplete="off" required />
          </AdminField>
          <AdminField label="Rôle">
            <select className="field" name="role" defaultValue="STAFF">
              <option value="STAFF">Accueil</option>
              <option value="ADMIN">Administration</option>
            </select>
          </AdminField>
          <AdminField label="Mot de passe" hint="10 caractères minimum.">
            <input className="field" name="password" type="password" autoComplete="new-password" required />
          </AdminField>
          <SubmitButton className="w-fit">Créer le compte</SubmitButton>
        </form>
      </Panel>
      <div className="grid gap-3">
        {users.map((user) => (
          <Panel
            key={user.id}
            title={user.name}
            description={user.email}
            actions={
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", user.active ? "bg-emerald-50 text-emerald-800" : "bg-night/[0.06] text-muted")}>
                {user.active ? "Actif" : "Désactivé"} · {user.role === "ADMIN" ? "Administration" : "Accueil"}
              </span>
            }
          >
            <form action={saveUser} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={user.id} />
              <AdminField label="Nom">
                <input className="field" name="name" defaultValue={user.name} />
              </AdminField>
              <AdminField label="E-mail">
                <input className="field" name="email" defaultValue={user.email} />
              </AdminField>
              <AdminField label="Rôle">
                <select className="field" name="role" defaultValue={user.role}>
                  <option value="STAFF">Accueil</option>
                  <option value="ADMIN">Administration</option>
                </select>
              </AdminField>
              <AdminField label="Nouveau mot de passe" hint="Facultatif : laisser vide pour le conserver.">
                <input className="field" name="password" type="password" autoComplete="new-password" />
              </AdminField>
              <SubmitButton variant="outline" className="w-fit">
                Mettre à jour
              </SubmitButton>
            </form>
            <form action={toggleUser} className="mt-4 border-t border-night/[0.07] pt-4">
              <input type="hidden" name="id" value={user.id} />
              <SubmitButton variant={user.active ? "danger" : "outline"} size="sm" pendingLabel="…">
                {user.active ? "Désactiver le compte" : "Réactiver le compte"}
              </SubmitButton>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
