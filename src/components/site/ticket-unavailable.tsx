import { TicketX } from "lucide-react";
import Link from "next/link";
import { Skyline } from "@/components/site/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Billet inconnu, mal recopié ou annulé : message explicite sans révéler si le jeton a existé.
export function TicketUnavailable() {
  return (
    <main className="surface-dark relative isolate grid min-h-screen place-items-center overflow-clip bg-night px-4 py-16 text-white">
      <div aria-hidden="true" className="absolute -bottom-40 end-[-10%] -z-10 size-[30rem] rounded-full bg-sun/25 blur-[120px]" />
      <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-night-deep sm:h-40" lights={false} />
      <div className="max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/[0.07] text-sun">
          <TicketX className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-sun">Billet indisponible</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[0.98] text-balance">Ce billet est introuvable ou n&apos;est plus valide.</h1>
        <p className="mt-5 text-haze">
          Vérifie que le lien a été copié en entier depuis l&apos;e-mail de confirmation. Si ton inscription a été annulée ou si le lien ne fonctionne
          toujours pas, écris à l&apos;équipe en indiquant ta référence FMA26.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className={cn(buttonVariants({ variant: "sun", size: "lg" }))}>
            Écrire à l&apos;équipe
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "glass", size: "lg" }))}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
