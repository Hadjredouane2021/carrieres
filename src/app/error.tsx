"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="surface-dark relative isolate grid min-h-screen place-items-center overflow-clip bg-night px-6 py-16 text-center text-white">
      <div aria-hidden="true" className="absolute -bottom-40 start-[-10%] -z-10 size-[30rem] rounded-full bg-sun/20 blur-[120px]" />
      <div className="max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sun">Assur&apos;Carrière</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3rem)] leading-tight">La page n&apos;a pas pu s&apos;afficher</h1>
        <p className="mt-4 text-haze">Un incident temporaire empêche son chargement. Réessaie dans un instant ; si le problème persiste, écris à l&apos;équipe.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={cn(buttonVariants({ variant: "sun", size: "lg" }))}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Réessayer
          </button>
          <Link href="/" className={cn(buttonVariants({ variant: "glass", size: "lg" }))}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
