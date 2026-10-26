"use client";

import { CloudUpload, Film, ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { youtubeId, vimeoId } from "@/lib/media";
import { cn } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Type de média, fichier ou lien, avec aperçu immédiat (vignette YouTube pour les vidéos).
export function GalleryMediaFields({ initial }: { initial: { type: "IMAGE" | "VIDEO"; url: string } }) {
  const [type, setType] = useState(initial.type);
  const [url, setUrl] = useState(initial.url);
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
      setError(!TYPES.includes(file.type) ? "Formats acceptés : JPG, PNG ou WebP." : "La photo doit peser moins de 3 Mo.");
      if (input.current) input.current.value = "";
      return setDraft(null);
    }
    setDraft(URL.createObjectURL(file));
  }

  function clear() {
    setDraft(null);
    setUrl("");
    if (input.current) input.current.value = "";
  }

  const youtube = type === "VIDEO" ? youtubeId(url) : null;
  const vimeo = type === "VIDEO" ? vimeoId(url) : null;
  const image = type === "IMAGE" ? draft ?? (/^https:\/\//.test(url) || url.startsWith("/uploads/") ? url : null) : null;
  const badVideo = type === "VIDEO" && url.trim() !== "" && !youtube && !vimeo;

  return (
    <div className="grid gap-3">
      <div className="inline-grid w-fit grid-cols-2 rounded-full bg-mist p-1" role="radiogroup" aria-label="Type de média">
        {(
          [
            ["IMAGE", "Photo", ImageIcon],
            ["VIDEO", "Vidéo", Film],
          ] as const
        ).map(([value, label, TypeIcon]) => (
          <label
            key={value}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
              type === value ? "bg-night text-white shadow" : "text-muted hover:text-night",
            )}
          >
            <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} className="sr-only" />
            <TypeIcon className="size-4" aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>

      {type === "IMAGE" ? (
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
            "group relative grid aspect-[16/10] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-night/15 bg-mist/50 transition hover:border-sun has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
            dragging && "border-sun bg-dawn",
            image && "border-solid",
          )}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="grid justify-items-center gap-1.5 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-sun-ink shadow-sm">
                <CloudUpload className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-night">Glissez une photo ici</span>
              <span className="text-xs text-muted">ou cliquez · JPG, PNG, WebP · 3 Mo max</span>
            </span>
          )}
          {image ? <span className="absolute bottom-2 end-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-night opacity-0 shadow-sm transition group-hover:opacity-100">Changer</span> : null}
          <input ref={input} type="file" name="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
        </label>
      ) : (
        <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-night text-white">
          {youtube ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
          ) : null}
          <span className="relative grid justify-items-center gap-1.5 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-sun text-night shadow-lg">
              <Film className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{youtube ? "YouTube" : vimeo ? "Vimeo" : "Collez un lien YouTube ou Vimeo"}</span>
          </span>
        </div>
      )}

      {draft ? (
        <>
          <p className="rounded-xl bg-dawn px-3 py-2 text-xs text-sun-ink">Nouveau fichier prêt : il remplacera la photo actuelle à l&apos;enregistrement.</p>
          <input type="hidden" name="url" value={url} />
        </>
      ) : (
        <input
          className={cn("field text-sm", badVideo && "border-red-300")}
          name="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={type === "VIDEO" ? "https://www.youtube.com/watch?v=…" : "ou collez l'URL https:// de la photo"}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={badVideo ? "text-red-700" : "text-muted"}>
          {badVideo ? "Seuls les liens YouTube et Vimeo sont acceptés." : "Sans média valide, l'élément n'apparaît pas sur le site."}
        </span>
        {url || draft ? (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-red-700 hover:underline">
            <Trash2 className="size-3.5" aria-hidden="true" /> Retirer
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
