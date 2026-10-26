import { Highlighted } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { WHY_TONES } from "@/lib/why-bento";

// Réplique réduite d'un élément « Pourquoi participer » tel qu'il apparaît sur le site, selon sa position :
// position 0 = la citation en grand, ensuite les cartes à ombre décalée (blanc, nuit, jaune, corail).
export function WhyCardVisual({
  position,
  title,
  body,
  className,
  children,
}: {
  position: number;
  title: string;
  body: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (position === 0) {
    return (
      <div className={cn("relative rounded-2xl bg-[#F8F5EC] p-5 ring-1 ring-night/10", className)}>
        {children ? <div className="absolute end-3 top-3">{children}</div> : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Citation · {title || "titre non affiché"}</p>
        <p className="font-rounded mt-2 pe-16 text-lg font-extrabold leading-snug text-night md:text-xl">
          <Highlighted text={body || "La citation apparaîtra ici. Entourez un mot d'astérisques pour le surligner."} />
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative flex h-full min-h-44 flex-col rounded-[1.5rem] border-2 border-night p-5 shadow-[5px_5px_0_0_#0B1B3A]",
        WHY_TONES[(position - 1) % WHY_TONES.length],
        className,
      )}
    >
      {children ? <div className="absolute end-3 top-3">{children}</div> : null}
      <h3 className="font-rounded pe-16 text-xl font-extrabold leading-tight">{title || "Titre de la carte"}</h3>
      <p className="mt-4 line-clamp-4 text-sm leading-6 opacity-90">
        <Highlighted text={body || "Le texte de la carte apparaîtra ici."} />
      </p>
    </div>
  );
}
