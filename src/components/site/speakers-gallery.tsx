"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { initials } from "@/lib/utils";

export type GallerySpeaker = { id: string; name: string; role: string; org: string; bio: string; photo: string | null };

// Monogramme solaire quand aucun portrait n'a été déposé.
function Portrait({ speaker, index, className }: { speaker: GallerySpeaker; index: number; className?: string }) {
  if (speaker.photo) {
    return (
      // Portraits déposés depuis le back-office, éventuellement sur un hôte https externe.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={speaker.photo} alt="" loading="lazy" decoding="async" className={className} />
    );
  }
  return (
    <div
      className={`grid place-items-center ${className ?? ""}`}
      style={{
        background: `radial-gradient(90% 55% at ${30 + ((index * 23) % 40)}% 70%, var(--sun-bright) 0%, var(--sun) 18%, #a8410f 36%, #33244a 60%, var(--night) 82%)`,
      }}
    >
      <span className="display -mt-10 text-6xl text-white sm:text-8xl">{initials(speaker.name)}</span>
    </div>
  );
}

export function SpeakersGallery({
  speakers,
  labels,
  columns = "lg:grid-cols-3",
}: {
  speakers: GallerySpeaker[];
  labels: { open: string; close: string };
  columns?: string;
}) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:gap-5 ${columns}`}>
      {speakers.map((speaker, index) => (
        <li key={speaker.id} className="scroll-reveal">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label={`${labels.open} : ${speaker.name}`}
                className="group block h-full w-full overflow-hidden rounded-[1.5rem] bg-white/[0.04] text-start ring-1 ring-white/10 transition hover:ring-sun/60 sm:rounded-[1.75rem]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Portrait speaker={speaker} index={index} className="size-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.04]" />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night via-night/60 to-transparent" />
                  <span
                    aria-hidden="true"
                    className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition group-hover:bg-sun group-hover:text-night"
                  >
                    <Plus className="size-4" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                    <span className="display block text-lg leading-tight text-white sm:text-2xl">{speaker.name}</span>
                    {speaker.role ? <span className="mt-1 block text-sm text-sun-bright">{speaker.role}</span> : null}
                  </div>
                </div>
                {speaker.org || speaker.bio ? (
                  <div className="p-4 sm:p-6">
                    {speaker.org ? <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-haze">{speaker.org}</span> : null}
                    {speaker.bio ? <span className="mt-2 line-clamp-3 text-sm leading-6 text-haze max-sm:hidden">{speaker.bio}</span> : null}
                  </div>
                ) : null}
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[70] bg-night-deep/80 backdrop-blur-sm motion-safe:animate-fade-in" />
              <Dialog.Content className="surface-dark fixed inset-x-3 bottom-3 top-auto z-[71] max-h-[88dvh] overflow-y-auto rounded-[2rem] bg-night text-white shadow-2xl outline-none motion-safe:animate-dialog-in sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(56rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2">
                <div className="grid sm:grid-cols-[18rem_minmax(0,1fr)]">
                  <Portrait speaker={speaker} index={index} className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full sm:min-h-[24rem]" />
                  <div className="p-6 sm:p-10">
                    <Dialog.Title className="display text-3xl leading-tight sm:text-4xl">{speaker.name}</Dialog.Title>
                    {speaker.role ? <p className="mt-2 text-sun-bright">{speaker.role}</p> : null}
                    {speaker.org ? <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-haze">{speaker.org}</p> : null}
                    <Dialog.Description className="mt-6 whitespace-pre-line leading-7 text-white/85">{speaker.bio || speaker.role}</Dialog.Description>
                  </div>
                </div>
                <Dialog.Close
                  className="absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-night/70 text-white backdrop-blur transition hover:bg-sun hover:text-night"
                  aria-label={labels.close}
                >
                  <X className="size-5" aria-hidden="true" />
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </li>
      ))}
    </ul>
  );
}
