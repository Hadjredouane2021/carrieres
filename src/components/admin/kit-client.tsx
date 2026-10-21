"use client";

import { ImagePlus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ICON_NAMES, Icon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

/** Bouton de suppression avec confirmation. */
export function DeleteButton({ action, id, label }: { action: (formData: FormData) => Promise<void>; id: string; label: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer « ${label} » ? Cette action est définitive.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="grid size-8 place-items-center rounded-full text-institution/70 transition hover:bg-red-50 hover:text-red-600" aria-label={`Supprimer ${label}`} title="Supprimer">
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}

/** Grille d'icônes au lieu d'un champ texte. */
export function IconPicker({ name = "icon", value }: { name?: string; value: string }) {
  const [current, setCurrent] = useState(value);
  return (
    <fieldset className="grid gap-1.5 text-sm">
      <legend className="mb-1.5 font-medium text-night">Icône</legend>
      <div className="grid grid-cols-7 gap-1.5">
        {ICON_NAMES.map((icon) => (
          <label
            key={icon}
            title={icon}
            className={cn(
              "grid aspect-square cursor-pointer place-items-center rounded-xl border transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
              current === icon ? "border-night bg-night text-gold shadow-md" : "border-night/10 text-institution hover:border-gold hover:text-night",
            )}
          >
            <input type="radio" name={name} value={icon} checked={current === icon} onChange={() => setCurrent(icon)} className="sr-only" />
            <Icon name={icon} className="size-4" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Image : aperçu, dépôt d'un fichier ou adresse https. */
export function ImageField({
  label,
  urlName,
  url,
  hint,
  round = false,
}: {
  label: string;
  urlName: string;
  url?: string;
  hint?: string;
  round?: boolean;
}) {
  const [preview, setPreview] = useState(url ?? "");
  const [address, setAddress] = useState(url ?? "");
  const [file, setFile] = useState<File | null>(null);

  const pick = (next: File | null) => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : address);
  };

  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-medium text-night">{label}</span>
      <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-night/10 p-3">
        <span className={cn("grid size-20 shrink-0 place-items-center overflow-hidden bg-mist text-institution/50", round ? "rounded-full" : "rounded-xl")}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className={cn("size-full", round ? "object-cover" : "object-contain p-1")} />
          ) : (
            <ImagePlus className="size-6" />
          )}
        </span>
        <div className="grid min-w-0 flex-1 gap-2">
          <label className="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-full bg-night px-4 text-xs font-medium text-beige hover:bg-institution has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
            <ImagePlus className="size-3.5" /> {file ? "Changer le fichier" : "Déposer une image"}
            <input type="file" name="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0] ?? null)} />
          </label>
          {file ? (
            <span className="flex items-center gap-2 truncate text-xs text-institution">
              {file.name}
              <button type="button" onClick={() => pick(null)} className="text-institution/60 hover:text-red-600" aria-label="Retirer le fichier">
                <X className="size-3.5" />
              </button>
            </span>
          ) : (
            <input
              className="field h-9 py-1 text-xs"
              name={urlName}
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                setPreview(event.target.value.startsWith("https://") || event.target.value.startsWith("/uploads/") ? event.target.value : "");
              }}
              placeholder="ou une adresse https://…"
            />
          )}
          {file ? <input type="hidden" name={urlName} value={address} /> : null}
        </div>
      </div>
      {hint ? <span className="text-xs text-institution/80">{hint}</span> : null}
    </div>
  );
}
