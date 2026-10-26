"use client";

import { ArrowRight, AtSign, CircleAlert, Eye, EyeOff, KeyRound, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { login } from "@/server/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(async (_state: { error?: string } | null, formData: FormData) => {
    return (await login(formData)) ?? null;
  }, null);
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  return (
    <form action={action} className="grid gap-5" aria-busy={pending}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-night">Adresse e-mail</span>
        <span className="relative">
          <AtSign className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input className="field h-13 ps-11" name="email" type="email" autoComplete="username" placeholder="prenom.nom@fma.org.ma" required autoFocus />
        </span>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-night">Mot de passe</span>
        <span className="relative">
          <KeyRound className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            className="field h-13 ps-11 pe-12"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
            onBlur={() => setCapsLock(false)}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            className="absolute end-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night"
          >
            {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </span>
        {capsLock ? (
          <span className="flex items-center gap-1.5 text-xs text-amber-700" role="status">
            <TriangleAlert className="size-3.5" aria-hidden="true" /> Verrouillage des majuscules activé
          </span>
        ) : null}
      </label>

      {state?.error ? (
        <p className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <button
        disabled={pending}
        className={cn(
          "group mt-1 inline-flex h-13 w-full items-center justify-between gap-3 rounded-full bg-sun ps-6 pe-1.5 font-semibold text-night shadow-[0_18px_44px_-18px_rgba(255,122,26,0.9)] transition hover:bg-sun-bright disabled:opacity-70",
        )}
      >
        {pending ? "Connexion…" : "Se connecter"}
        <span className="grid size-10 place-items-center rounded-full bg-night text-sun transition group-hover:translate-x-0.5">
          {pending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
        </span>
      </button>
    </form>
  );
}
