"use client";

import { CloudUpload, Globe, Moon, Sun, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AdminField } from "@/components/admin/kit";
import { PARTNER_TIERS } from "@/lib/constants";
import { domainOf, PARTNER_TONES } from "@/lib/partner-tones";
import { cn } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Recadre un logo sur son contenu : pixels transparents ou presque blancs autour du dessin.
async function trimMargins(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const blank = data[i + 3] < 16 || (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240);
      if (blank) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return file;
  const w = right - left + 1;
  const h = bottom - top + 1;
  if (w === width && h === height) return file;
  const crop = document.createElement("canvas");
  crop.width = w;
  crop.height = h;
  crop.getContext("2d")?.drawImage(canvas, left, top, w, h, 0, 0, w, h);
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
  const blob = await new Promise<Blob | null>((resolve) => crop.toBlob(resolve, type, 0.92));
  if (!blob || blob.size > MAX_BYTES) return file;
  return new File([blob], file.name.replace(/\.\w+$/, type === "image/png" ? ".png" : ".jpg"), { type });
}

// Champs du partenaire : logo testé sur fond clair et sombre, catégorie en cartes, site web vérifié.
export function PartnerEditorFields({ initial }: { initial: { name: string; tier: string; website: string; logoUrl: string } }) {
  const [name, setName] = useState(initial.name);
  const [tier, setTier] = useState(initial.tier);
  const [website, setWebsite] = useState(initial.website);
  const [url, setUrl] = useState(initial.logoUrl);
  const [draft, setDraft] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!draft) return;
    return () => URL.revokeObjectURL(draft);
  }, [draft]);

  async function pick(file: File | undefined) {
    setError("");
    if (!file) return setDraft(null);
    if (!TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setError(!TYPES.includes(file.type) ? "Formats acceptés : PNG, JPG ou WebP." : "Le logo doit peser moins de 3 Mo.");
      if (input.current) input.current.value = "";
      return setDraft(null);
    }
    // Marges vides retirées avant l'envoi : tous les logos s'affichent ensuite à la même taille.
    const trimmed = await trimMargins(file).catch(() => file);
    if (input.current && trimmed !== file) {
      const transfer = new DataTransfer();
      transfer.items.add(trimmed);
      input.current.files = transfer.files;
    }
    setDraft(URL.createObjectURL(trimmed));
  }

  function clearLogo() {
    setDraft(null);
    setUrl("");
    if (input.current) input.current.value = "";
  }

  const remote = /^https:\/\//.test(url) || url.startsWith("/uploads/") ? url : null;
  const shown = draft ?? remote;
  const domain = domainOf(website);
  const invalidSite = website.trim() !== "" && !/^https:\/\/\S+$/i.test(website.trim());

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-night">Logo</span>
          <div className="inline-grid grid-cols-2 rounded-full bg-mist p-0.5" role="group" aria-label="Fond de l'aperçu">
            {[
              { value: false, label: "Clair", icon: Sun },
              { value: true, label: "Sombre", icon: Moon },
            ].map(({ value, label, icon: Mode }) => (
              <button
                key={label}
                type="button"
                aria-pressed={dark === value}
                onClick={() => setDark(value)}
                className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition", dark === value ? "bg-night text-white" : "text-muted hover:text-night")}
              >
                <Mode className="size-3" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
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
            "group relative grid aspect-[16/7] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
            dark ? "border-white/15 bg-night" : "border-night/10 bg-[radial-gradient(circle_at_1px_1px,rgba(11,27,58,0.08)_1px,transparent_0)] bg-white bg-[size:16px_16px]",
            dragging && "border-sun",
          )}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="max-h-[60%] max-w-[70%] object-contain" />
          ) : name ? (
            <span className={cn("display px-6 text-center text-2xl", dark ? "text-white/70" : "text-night/40")}>{name}</span>
          ) : (
            <span className="grid justify-items-center gap-1.5 text-center">
              <CloudUpload className={cn("size-6", dark ? "text-sun" : "text-sun-ink")} aria-hidden="true" />
              <span className={cn("text-sm font-medium", dark ? "text-white" : "text-night")}>Glissez le logo ici</span>
              <span className="text-xs text-muted">PNG transparent conseillé</span>
            </span>
          )}
          {shown ? (
            <span className="absolute bottom-2 end-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-night opacity-0 shadow-sm transition group-hover:opacity-100">
              Changer
            </span>
          ) : null}
          <input ref={input} type="file" name="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
        </label>
        {draft ? (
          <p className="rounded-xl bg-dawn px-3 py-2 text-xs text-sun-ink">Nouveau fichier prêt : il remplacera le logo actuel à l&apos;enregistrement.</p>
        ) : (
          <input className="field text-xs" name="logoUrl" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="ou collez l'URL https:// du logo" />
        )}
        {draft ? <input type="hidden" name="logoUrl" value={url} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted">Sans logo, le nom s&apos;affiche à la place. PNG, JPG ou WebP, 3 Mo max.</span>
          {shown ? (
            <button type="button" onClick={clearLogo} className="inline-flex items-center gap-1 text-red-700 hover:underline">
              <Trash2 className="size-3.5" aria-hidden="true" /> Retirer le logo
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <AdminField label="Nom">
        <input className="field" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. AXA Assurance Maroc" required />
      </AdminField>

      <fieldset className="grid gap-2 text-sm">
        <legend className="mb-1 font-medium text-night">Catégorie</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PARTNER_TIERS.map((option) => {
            const tone = PARTNER_TONES[option.value];
            const active = tier === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
                  active ? "border-night bg-night text-white shadow-md" : "border-night/10 bg-white hover:border-night/30",
                )}
              >
                <input type="radio" name="tier" value={option.value} checked={active} onChange={() => setTier(option.value)} className="sr-only" />
                <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", tone.dot, active && option.value === "INSTITUTIONAL" && "bg-white")} aria-hidden="true" />
                <span>
                  <span className="block font-medium">{option.fr}</span>
                  <span className={cn("block text-xs leading-5", active ? "text-haze" : "text-muted")}>{tone.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <AdminField label="Site web">
        <span className="relative">
          <Globe className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            className={cn("field ps-9", invalidSite && "border-red-300")}
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
            inputMode="url"
          />
        </span>
        {invalidSite ? (
          <span className="text-xs text-red-700">L&apos;adresse doit commencer par https://</span>
        ) : domain ? (
          <span className="text-xs text-muted">Le logo renverra vers {domain}</span>
        ) : (
          <span className="text-xs text-muted">Facultatif : rend le logo cliquable.</span>
        )}
      </AdminField>
    </div>
  );
}
