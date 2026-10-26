"use client";

import { CloudUpload, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AdminField, BilingualFields } from "@/components/admin/kit";
import { cn, initials } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Champs de l'intervenant avec aperçu en direct de la carte portrait du site.
export function SpeakerEditorFields({
  initial,
}: {
  initial: { name: string; org: string; roleFr: string; roleAr: string; bioFr: string; bioAr: string; photoUrl: string };
}) {
  const [name, setName] = useState(initial.name);
  const [org, setOrg] = useState(initial.org);
  const [role, setRole] = useState(initial.roleFr);
  const [bio, setBio] = useState(initial.bioFr);
  const [url, setUrl] = useState(initial.photoUrl);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!draft) return;
    return () => URL.revokeObjectURL(draft);
  }, [draft]);

  function pick(file: File | undefined) {
    setError("");
    if (!file) return setDraft(null);
    if (!TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setError(!TYPES.includes(file.type) ? "Formats acceptés : JPG, PNG ou WebP." : "Le portrait doit peser moins de 3 Mo.");
      if (input.current) input.current.value = "";
      return setDraft(null);
    }
    setDraft(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setDraft(null);
    setUrl("");
    if (input.current) input.current.value = "";
  }

  const remote = /^https:\/\//.test(url) || url.startsWith("/uploads/") ? url : null;
  const shown = draft ?? remote;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (input.current) input.current.files = event.dataTransfer.files;
            pick(event.dataTransfer.files[0]);
          }}
          className={cn(
            "group relative isolate mx-auto aspect-[4/5] w-44 cursor-pointer overflow-hidden rounded-2xl bg-night text-white ring-1 ring-night/10 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun sm:w-full",
            dragging && "ring-2 ring-sun",
          )}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_20%_0%,#173D70_0%,#0B1B3A_60%,#071226_100%)]">
              <div className="absolute -bottom-10 -end-10 size-32 rounded-full bg-sun/30 blur-2xl" />
              <span className="display absolute end-3 top-4 text-5xl text-sun/50">{initials(name || "?")}</span>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-transparent" />
          <span className="absolute inset-x-2 top-2 flex justify-center opacity-0 transition group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-night">
              <CloudUpload className="size-3.5" aria-hidden="true" /> {shown ? "Changer" : "Déposer"}
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 grid gap-0.5 p-3">
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-sun">{role || "Fonction"}</span>
            <span className="display truncate text-lg leading-tight">{name || "Nom de l'intervenant"}</span>
            {org ? <span className="truncate text-xs text-haze">{org}</span> : null}
          </span>
          <input ref={input} type="file" name="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
        </label>

        <div className="grid content-start gap-4">
          <AdminField label="Nom complet">
            <input className="field" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Salma El Fassi" required />
          </AdminField>
          <AdminField label="Organisation">
            <input className="field" name="org" value={org} onChange={(event) => setOrg(event.target.value)} placeholder="Ex. Compagnie invitée" />
          </AdminField>
          <div className="grid gap-1.5 text-sm">
            <span className="font-medium text-night">Portrait</span>
            {draft ? (
              <p className="rounded-xl bg-dawn px-3 py-2 text-xs text-sun-ink">Nouveau fichier prêt : il remplacera le portrait actuel à l&apos;enregistrement.</p>
            ) : (
              <input className="field text-xs" name="photoUrl" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Déposez une photo à gauche, ou collez une URL https://" />
            )}
            {draft ? <input type="hidden" name="photoUrl" value={url} /> : null}
            {shown ? (
              <button type="button" onClick={clearPhoto} className="inline-flex w-fit items-center gap-1.5 text-xs text-red-700 hover:underline">
                <Trash2 className="size-3.5" aria-hidden="true" /> Retirer le portrait (monogramme)
              </button>
            ) : (
              <span className="text-xs text-muted">JPG, PNG ou WebP, 3 Mo max. Format vertical conseillé.</span>
            )}
            {error ? (
              <span className="text-xs text-red-700" role="alert">
                {error}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <BilingualFields
        fr={
          <AdminField label="Fonction">
            <input className="field" name="roleFr" value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex. Directrice actuariat" required />
          </AdminField>
        }
        ar={
          <AdminField label="Fonction (arabe)">
            <input className="field" name="roleAr" dir="rtl" defaultValue={initial.roleAr} />
          </AdminField>
        }
      />
      <BilingualFields
        fr={
          <label className="grid content-start gap-1.5 text-sm">
            <span className="font-medium text-night">Biographie</span>
            <textarea className="field min-h-28" name="bioFr" value={bio} onChange={(event) => setBio(event.target.value)} />
            <span className={cn("text-xs tabular-nums", bio.trim().length > 220 ? "text-amber-700" : "text-muted")}>{bio.trim().length} / 220 caractères conseillés</span>
          </label>
        }
        ar={
          <AdminField label="Biographie (arabe)">
            <textarea className="field min-h-28" name="bioAr" dir="rtl" defaultValue={initial.bioAr} />
          </AdminField>
        }
      />
    </div>
  );
}
