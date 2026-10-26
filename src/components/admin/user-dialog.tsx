"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Crown, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { saveUser } from "@/server/actions/admin";

export type EditableUser = { id: string; name: string; email: string; role: "SUPER_ADMIN" | "ADMIN" | "STAFF" };

const roles = [
  { value: "SUPER_ADMIN", label: "Super administration", hint: "Tous les droits, y compris la gestion des comptes.", icon: Crown },
  { value: "ADMIN", label: "Administration", hint: "Contenus du site, paramètres et inscriptions. Pas de gestion des comptes.", icon: ShieldCheck },
  { value: "STAFF", label: "Accueil", hint: "Inscriptions, pointage QR et messages.", icon: UserRound },
] as const;

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
  const values = crypto.getRandomValues(new Uint32Array(16));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export function UserDialog({ user, children }: { user?: EditableUser; children: React.ReactNode }) {
  const [role, setRole] = useState<EditableUser["role"]>(user?.role ?? "STAFF");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const editing = Boolean(user);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) {
          setPassword("");
          setVisible(false);
          setRole(user?.role ?? "STAFF");
        }
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl shadow-night/30 sm:inset-x-auto sm:bottom-auto sm:start-1/2 sm:top-1/2 sm:w-[32rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-8 rtl:sm:translate-x-1/2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sun">{editing ? "Modifier" : "Nouveau compte"}</p>
              <Dialog.Title className="display mt-1 text-2xl text-night">{editing ? user!.name : "Inviter un membre"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                {editing ? "Laissez le mot de passe vide pour le conserver." : "Transmettez ensuite l'e-mail et le mot de passe à la personne."}
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-mist" aria-label="Fermer">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form action={saveUser} className="mt-6 grid gap-4">
            {user ? <input type="hidden" name="id" value={user.id} /> : null}
            <label className="grid gap-1.5 text-sm text-night">
              Nom complet
              <input className="field" name="name" defaultValue={user?.name} placeholder="Ex. Salma El Fassi" required maxLength={120} />
            </label>
            <label className="grid gap-1.5 text-sm text-night">
              E-mail de connexion
              <input className="field" name="email" type="email" defaultValue={user?.email} placeholder="prenom.nom@exemple.ma" required />
            </label>

            <fieldset className="grid gap-2">
              <legend className="mb-1.5 text-sm text-night">Rôle</legend>
              <div className="grid gap-2">
                {roles.map(({ value, label, hint, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-2xl border p-3.5 transition",
                      role === value ? "border-night bg-night text-white shadow-lg shadow-night/20" : "border-night/10 hover:border-night/30",
                    )}
                  >
                    <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon className={cn("size-4", role === value ? "text-sun" : "text-muted")} /> {label}
                    </span>
                    <span className={cn("text-xs leading-5", role === value ? "text-haze" : "text-muted")}>{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="grid gap-1.5 text-sm text-night">
              {editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}
              <span className="relative">
                <KeyRound className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted/60" />
                <input
                  className="field ps-10 pe-24 font-mono"
                  name="password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="10 caractères minimum"
                  minLength={password ? 10 : undefined}
                  required={!editing}
                  autoComplete="new-password"
                />
                <span className="absolute end-2 top-1/2 flex -translate-y-1/2 gap-1">
                  <button type="button" onClick={() => setVisible((value) => !value)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-mist" aria-label={visible ? "Masquer" : "Afficher"}>
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPassword(generatePassword());
                      setVisible(true);
                    }}
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-mist hover:text-sun"
                    aria-label="Générer un mot de passe"
                    title="Générer un mot de passe"
                  >
                    <Sparkles className="size-4" />
                  </button>
                </span>
              </span>
              {password ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
                    <span
                      className={cn("block h-full rounded-full transition-all", password.length >= 14 ? "w-full bg-emerald-500" : password.length >= 10 ? "w-2/3 bg-sun" : "w-1/3 bg-red-400")}
                    />
                  </span>
                  <span className="text-muted">{password.length >= 14 ? "Solide" : password.length >= 10 ? "Correct" : "Trop court"}</span>
                </span>
              ) : null}
            </label>

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close className="h-11 rounded-full px-5 text-sm text-muted hover:bg-mist">Annuler</Dialog.Close>
              <button className="h-11 rounded-full bg-sun px-6 text-sm font-semibold text-night hover:bg-sun-bright">{editing ? "Enregistrer" : "Créer le compte"}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
