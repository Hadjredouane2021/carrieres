import Link from "next/link";
import { Skyline } from "@/components/site/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="surface-dark relative isolate grid min-h-screen place-items-center overflow-clip bg-night px-4 py-16 text-center text-white">
      <div aria-hidden="true" className="absolute -top-40 end-[-10%] -z-10 size-[34rem] rounded-full bg-sun/25 blur-[120px]" />
      <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-night-deep sm:h-40" lights={false} />
      <div className="max-w-xl">
        <p className="display text-[clamp(5rem,18vw,9rem)] leading-none text-sun">404</p>
        <h1 className="display mt-4 text-[clamp(2rem,5vw,3.2rem)] leading-tight">Cette page n&apos;existe pas</h1>
        <p className="mt-4 text-haze">Le lien est peut-être incomplet, ou la page a changé d&apos;adresse.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ variant: "sun", size: "lg" }))}>
            Retour à l&apos;accueil
          </Link>
          <Link href="/programme" className={cn(buttonVariants({ variant: "glass", size: "lg" }))}>
            Voir le programme
          </Link>
        </div>
      </div>
    </main>
  );
}
