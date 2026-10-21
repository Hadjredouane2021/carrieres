"use client";

import { CloudUpload, Monitor, RotateCcw, Smartphone, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveHeroImage } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

const MAX_BYTES = 16 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_WIDTH = 1600;
const DEFAULT_POSTER = "/video/assurcarriere-hero-poster.webp";

type Draft = { url: string; name: string; size: number; width: number; height: number };

export function HeroStudio({
  photo,
  title,
  slogan,
  day,
  place,
}: {
  photo: string | null;
  title: string;
  slogan: string;
  day: string;
  place: string;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [photoMissing, setPhotoMissing] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!draft) return;
    return () => URL.revokeObjectURL(draft.url);
  }, [draft]);

  // La base peut pointer vers un fichier absent du serveur : le site affiche alors l'illustration.
  useEffect(() => {
    if (!photo) return;
    const probe = new Image();
    probe.onerror = () => setPhotoMissing(true);
    probe.src = photo;
  }, [photo]);

  function reset() {
    setDraft(null);
    if (input.current) input.current.value = "";
  }

  // Contrôles faits avant l'envoi ; le serveur revérifie le type et le contenu du fichier.
  function pick(file: File | undefined) {
    setError("");
    if (!file) return reset();
    if (!TYPES.includes(file.type)) {
      setError("Formats acceptés : JPG, PNG ou WebP.");
      return reset();
    }
    if (file.size > MAX_BYTES) {
      setError("L'image doit peser moins de 16 Mo.");
      return reset();
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setDraft({ url, name: file.name, size: file.size, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Le fichier image est illisible.");
      reset();
    };
    image.src = url;
  }

  // Sans image personnalisée, le site affiche le poster tiré de la vidéo du Hero.
  const shown = draft?.url ?? (photoMissing ? null : photo) ?? DEFAULT_POSTER;
  const status = draft
    ? { label: "Aperçu non publié", tone: "bg-amber-100 text-amber-900", dot: "bg-amber-500" }
    : photo && photoMissing
      ? { label: "Image introuvable sur le serveur : poster de la vidéo affiché", tone: "bg-red-50 text-red-800", dot: "bg-red-600" }
      : photo
        ? { label: "Poster personnalisé en ligne", tone: "bg-emerald-50 text-emerald-900", dot: "bg-emerald-500" }
        : { label: "Poster par défaut de la vidéo", tone: "bg-mist text-institution", dot: "bg-institution/50" };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-night/[0.07]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-night/5 px-5 py-4">
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", status.tone)}>
            <span className={cn("size-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          <div className="inline-grid grid-cols-2 rounded-full bg-mist p-1" role="group" aria-label="Format de l'aperçu">
            {(
              [
                ["desktop", "Ordinateur", Monitor],
                ["mobile", "Mobile", Smartphone],
              ] as const
            ).map(([value, label, DeviceIcon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={device === value}
                onClick={() => setDevice(value)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm transition",
                  device === value ? "bg-night text-white shadow" : "text-institution hover:text-night",
                )}
              >
                <DeviceIcon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid min-h-[28rem] place-items-center bg-mist bg-[radial-gradient(circle_at_1px_1px,rgba(11,27,58,0.09)_1px,transparent_0)] bg-[size:18px_18px] p-4 md:p-8">
          {device === "desktop" ? (
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-40px_rgba(11,27,58,0.55)] ring-1 ring-night/10">
              <div className="flex items-center gap-3 bg-[#e8ecf2] px-4 py-2.5">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </span>
                <span className="mx-auto rounded-full bg-white px-4 py-0.5 text-[11px] text-institution">Accueil du site</span>
              </div>
              <div className="@container relative aspect-[16/10]">
                <MiniHero image={shown} title={title} slogan={slogan} day={day} place={place} />
              </div>
            </div>
          ) : (
            <div className="w-[17rem] rounded-[2.6rem] bg-night p-2.5 shadow-[0_40px_90px_-30px_rgba(11,27,58,0.7)]">
              <div className="@container relative aspect-[9/19] overflow-hidden rounded-[2.1rem]">
                <MiniHero image={shown} title={title} slogan={slogan} day={day} place={place} mobile />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4">
        <form action={saveHeroImage} className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <div>
            <h2 className="text-lg font-medium text-night">Nouveau poster</h2>
            <p className="mt-1 text-sm text-institution">JPG, PNG ou WebP, 16 Mo maximum.</p>
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
              "group relative grid cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-night/15 bg-mist/50 text-center transition hover:border-gold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
              draft ? "aspect-[16/10] border-solid border-sun/60" : "px-6 py-9",
              dragging && "border-sun bg-dawn",
            )}
          >
            {draft ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-x-2 bottom-2 rounded-xl bg-night/80 px-3 py-2 text-start text-xs text-beige backdrop-blur">
                  <span className="block truncate font-medium text-white">{draft.name}</span>
                  {draft.width} × {draft.height} px · {(draft.size / (1024 * 1024)).toFixed(1)} Mo
                </span>
              </>
            ) : (
              <span className="grid justify-items-center gap-2">
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-sun-ink shadow-sm transition group-hover:scale-105">
                  <CloudUpload className="size-6" aria-hidden="true" />
                </span>
                <span className="mt-1 font-medium text-night">Glissez une image ici</span>
                <span className="text-xs text-institution">ou cliquez pour parcourir vos fichiers</span>
              </span>
            )}
            <input
              ref={input}
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => pick(event.target.files?.[0])}
            />
          </label>
          {draft && draft.width < MIN_WIDTH ? (
            <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Image étroite ({draft.width} px) : elle risque d&apos;être floue sur grand écran. Visez 1920 px de large.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <PublishButton disabled={!draft} />
            {draft ? (
              <button type="button" onClick={reset} className="h-11 rounded-full px-4 text-sm text-institution transition hover:bg-mist">
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        {photo ? (
          <form action={saveHeroImage} className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            <input type="hidden" name="remove" value="on" />
            <p className="text-sm text-institution">Retirer l&apos;image rétablit le poster par défaut, tiré de la vidéo.</p>
            {confirmRemove ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <RemoveButton />
                <button type="button" onClick={() => setConfirmRemove(false)} className="h-10 rounded-full px-4 text-sm text-institution transition hover:bg-mist">
                  Garder cette image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-night/15 px-4 text-sm text-night transition hover:bg-mist"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Revenir au poster par défaut
              </button>
            )}
          </form>
        ) : null}

        <section className="rounded-2xl bg-night p-5 text-white">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.26em] text-sun">Conseils de cadrage</h2>
          <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-white/85">
            <li>Format paysage, 1920 × 1080 px au minimum.</li>
            <li>Gardez le sujet au centre : sur mobile, les côtés sont recadrés.</li>
            <li>Le texte occupe le bas à gauche ; évitez d&apos;y placer un détail important.</li>
            <li>Un voile bleu nuit est ajouté automatiquement pour la lisibilité.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function PublishButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={disabled || pending}
      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-night px-5 text-sm font-semibold text-beige transition hover:bg-institution disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {pending ? "Publication…" : "Publier le poster"}
    </button>
  );
}

function RemoveButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="h-10 rounded-full bg-red-700 px-4 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-60">
      {pending ? "Retrait…" : "Oui, retirer l'image"}
    </button>
  );
}

// Réplique réduite du Hero public ; les tailles suivent la largeur du cadre (unités cqw).
function MiniHero({
  image,
  title,
  slogan,
  day,
  place,
  mobile = false,
}: {
  image: string | null;
  title: string;
  slogan: string;
  day: string;
  place: string;
  mobile?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-night text-white">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/75 via-night/25 to-transparent" />
          {mobile ? <div className="absolute inset-0 bg-night/35" /> : null}
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_0%,#173D70_0%,#0B1B3A_52%,#071226_100%)]">
          <div className="absolute end-[-10%] top-[10%] h-[45%] w-[55%] rounded-full bg-gold/25 blur-3xl" />
          <div className={cn("absolute aspect-[2/1] rounded-t-full bg-gradient-to-t from-[#fff4dc] via-[#e8cb9c]/80 to-transparent opacity-70", mobile ? "end-[-12%] top-[21%] w-[60%]" : "end-[10%] top-[16%] w-[18%]")} />
          <div className={cn("absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f6e3bd] to-transparent", mobile ? "top-[36%]" : "top-[31%]")} />
        </div>
      )}
      <div className="noise absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-night/70 to-transparent px-[4cqw] py-[3cqw]" aria-hidden="true">
        <span className={cn("rounded-[1cqw] bg-white", mobile ? "h-[9cqw] w-[24cqw]" : "h-[4cqw] w-[11cqw]")} />
        {mobile ? null : (
          <span className="flex gap-[2cqw]">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span key={index} className="h-[0.7cqw] w-[4.5cqw] rounded-full bg-beige/50" />
            ))}
          </span>
        )}
        <span className={cn("rounded-full", mobile ? "size-[9cqw] border border-white/30" : "h-[3.6cqw] w-[10cqw] bg-sun")} />
      </div>
      <div className={cn("absolute inset-x-0 bottom-0", mobile ? "p-[6cqw] pb-[10cqw]" : "p-[5cqw] pb-[5.5cqw]")}>
        <span className={cn("inline-flex items-center gap-[1cqw] rounded-full border border-white/20 bg-white/10 text-beige", mobile ? "px-[3cqw] py-[1.2cqw] text-[3.4cqw]" : "px-[1.4cqw] py-[0.5cqw] text-[1.3cqw]")}>
          <span className={cn("rounded-full bg-emerald-400", mobile ? "size-[1.8cqw]" : "size-[0.8cqw]")} />
          Inscriptions ouvertes
        </span>
        {/* La taille précède l'interligne : tailwind-merge retire un leading placé avant un text-[…]. */}
        <p className={cn("display mt-[2.5cqw] text-balance", mobile ? "text-[11cqw]" : "max-w-[80%] text-[6.2cqw]", "leading-[0.92]")}>{title}</p>
        <p className={cn("text-sun-sheen font-accent mt-[0.6cqw] italic", mobile ? "text-[11.5cqw]" : "text-[6.6cqw]", "leading-none")}>{slogan}</p>
        <div
          className={cn(
            "mt-[4cqw] grid grid-cols-2 rounded-[2cqw] border border-white/15 bg-white/[0.08] backdrop-blur-md",
            mobile ? "text-[3.4cqw]" : "max-w-[62%] text-[1.5cqw]",
          )}
        >
          {[
            ["Date", day],
            ["Lieu", place],
          ].map(([label, value], index) => (
            <span key={label} className={cn(mobile ? "p-[3.5cqw]" : "p-[1.6cqw]", index && "border-s border-white/10")}>
              <span className="block uppercase tracking-[0.2em] text-sun" style={{ fontSize: "0.7em" }}>{label}</span>
              <span className="display mt-[0.5cqw] block truncate">{value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
