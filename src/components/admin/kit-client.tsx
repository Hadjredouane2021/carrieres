"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonVariants, type ButtonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Bouton d'envoi des formulaires du back-office : désactivé et explicite pendant l'enregistrement.
export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  variant = "night",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
} & ButtonVariants) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={cn(buttonVariants({ variant, size }), className)}>
      {pending ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}

// Suppression confirmée avant l'envoi : l'action serveur et ses contrôles restent inchangés.
export function DeleteForm({ action, id, label }: { action: (formData: FormData) => void | Promise<void>; id: string; label: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer « ${label} » ? Cette action est définitive.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton label={label} />
    </form>
  );
}

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Supprimer ${label}`}
      className="grid size-9 place-items-center rounded-full text-red-700 transition hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
    </button>
  );
}
