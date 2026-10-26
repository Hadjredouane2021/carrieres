"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useState } from "react";

export type GalleryEntry = { id: string; kind: "image" | "youtube" | "vimeo"; src: string; caption: string };

export function GalleryGrid({
  items,
  labels,
}: {
  items: GalleryEntry[];
  labels: { open: string; close: string; previous: string; next: string; video: string; of: string };
}) {
  const images = items.filter((item) => item.kind === "image");
  const [current, setCurrent] = useState<number | null>(null);
  const shown = current === null ? null : images[current];

  function move(step: number) {
    setCurrent((index) => (index === null ? index : (index + step + images.length) % images.length));
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map((item) => {
          return (
            <li key={item.id} className="scroll-reveal">
              <figure className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-night ring-1 ring-night/10">
                {item.kind === "image" ? (
                  <button
                    type="button"
                    onClick={() => setCurrent(images.indexOf(item))}
                    className="relative block aspect-[4/3] w-full overflow-hidden"
                    aria-label={`${labels.open}${item.caption ? ` : ${item.caption}` : ""}`}
                  >
                    {/* Fond : la même image floutée, pour remplir le cadre sans déformer ni rogner la photo. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl" />
                    {/* Image entière, jamais agrandie au-delà de sa taille réelle (pas de flou sur les petits fichiers). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.caption}
                      loading="lazy"
                      decoding="async"
                      className="relative size-full object-scale-down transition duration-700 motion-safe:group-hover:scale-[1.03]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-night/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <Expand className="size-4" />
                    </span>
                  </button>
                ) : (
                  <iframe
                    src={item.src}
                    title={item.caption || labels.video}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                )}
                {item.caption ? <figcaption className="mt-auto px-5 py-4 text-sm text-haze">{item.caption}</figcaption> : null}
              </figure>
            </li>
          );
        })}
      </ul>

      <Dialog.Root open={shown !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-night-deep/95 motion-safe:animate-fade-in" />
          <Dialog.Content
            className="surface-dark fixed inset-0 z-[71] flex flex-col text-white outline-none"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") move(document.dir === "rtl" ? -1 : 1);
              if (event.key === "ArrowLeft") move(document.dir === "rtl" ? 1 : -1);
            }}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Dialog.Title className="text-sm text-haze">
                {current !== null ? `${current + 1} ${labels.of} ${images.length}` : ""}
              </Dialog.Title>
              <Dialog.Close className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-sun hover:text-night" aria-label={labels.close}>
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
            {shown ? (
              <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:px-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shown.src} alt={shown.caption} className="max-h-[75dvh] w-auto max-w-full rounded-2xl object-contain motion-safe:animate-fade-in" key={shown.id} />
                <Dialog.Description asChild>
                  <figcaption className="max-w-2xl text-center text-sm text-white/85">{shown.caption}</figcaption>
                </Dialog.Description>
              </figure>
            ) : null}
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label={labels.previous}
                  className="absolute start-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-sun hover:text-night sm:start-6"
                >
                  <ChevronLeft className="size-6 rtl:-scale-x-100" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label={labels.next}
                  className="absolute end-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-sun hover:text-night sm:end-6"
                >
                  <ChevronRight className="size-6 rtl:-scale-x-100" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
