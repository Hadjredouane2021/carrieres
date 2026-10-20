"use client";

import { useActionState } from "react";
import { login } from "@/server/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(async (_state: { error?: string } | null, formData: FormData) => {
    return (await login(formData)) ?? null;
  }, null);

  return (
    <form action={action} className="grid w-full max-w-md gap-4 rounded-[2rem] bg-white p-8">
      <div>
        <img src="/logo-fma.png" alt="Assur' Carrière" className="h-16 w-auto" />
        <h1 className="display mt-4 text-4xl text-night">Espace équipe</h1>
      </div>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="grid gap-1 text-sm">
        E-mail
        <input className="field" name="email" type="email" autoComplete="username" required />
      </label>
      <label className="grid gap-1 text-sm">
        Mot de passe
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button disabled={pending} className="h-12 rounded-full bg-night font-semibold text-beige">
        {pending ? "Connexion…" : "Entrer"}
      </button>
    </form>
  );
}
