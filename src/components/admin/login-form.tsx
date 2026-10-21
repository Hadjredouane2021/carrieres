"use client";

import { CircleAlert, LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { login } from "@/server/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(async (_state: { error?: string } | null, formData: FormData) => {
    return (await login(formData)) ?? null;
  }, null);

  return (
    <form action={action} className="grid w-full max-w-md gap-5 rounded-[2rem] bg-white p-8 shadow-2xl sm:p-10" aria-busy={pending}>
      <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-night text-sun">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <h1 className="display mt-5 text-3xl text-night">Espace équipe</h1>
        <p className="mt-1 text-sm text-muted">Back-office du Forum des Métiers de l&apos;Assurance.</p>
      </div>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-night">E-mail</span>
        <input className="field" name="email" type="email" autoComplete="username" required />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-night">Mot de passe</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error ? (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}
      <button disabled={pending} className={cn(buttonVariants({ variant: "night", size: "lg" }), "w-full")}>
        {pending ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
