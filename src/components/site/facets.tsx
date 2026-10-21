import { Reveal } from "@/components/site/reveal";
import { tx, type Locale } from "@/lib/i18n";
import { FACET_KEYS, type SiteData } from "@/lib/site-types";

// Une couleur par carte, comme sur le modèle : bleu, orange, vert, rouge.
const accents = ["#1F5AA6", "#E29A2D", "#2F8F4E", "#C8354A"];

function Frame({ color }: { color: string }) {
  const line = "pointer-events-none absolute rounded-full";
  return (
    <>
      {/* Montants gauches */}
      <span className={`${line} -start-3 -top-5 -bottom-6 w-[3px]`} style={{ backgroundColor: color }} />
      <span className={`${line} -start-6 top-1/3 -bottom-9 w-[3px] opacity-80`} style={{ backgroundColor: color }} />
      {/* Traverses basses */}
      <span className={`${line} -bottom-3 -start-10 -end-2 h-[3px]`} style={{ backgroundColor: color }} />
      <span className={`${line} -bottom-6 -start-5 h-[3px] w-1/2 opacity-80`} style={{ backgroundColor: color }} />
      {/* Angle haut droit */}
      <span className={`${line} -top-1.5 -end-3 h-[3px] w-1/2`} style={{ backgroundColor: color }} />
      <span className={`${line} -top-3.5 -end-5 h-[3px] w-1/4 opacity-80`} style={{ backgroundColor: color }} />
      <span className={`${line} -top-6 end-4 h-12 w-[3px] opacity-80`} style={{ backgroundColor: color }} />
    </>
  );
}

export function Facets({ site, locale }: { site: SiteData; locale: Locale }) {
  const facets = FACET_KEYS.map((key) => site.sections[key]).filter((facet) => facet && tx(locale, facet.title.fr, facet.title.ar));
  if (facets.length === 0) return null;

  return (
    <div className="mt-14 grid gap-x-20 gap-y-20 px-8 sm:grid-cols-2 sm:gap-y-24 sm:px-10">
      {facets.map((facet, index) => {
        const color = accents[index % accents.length];
        return (
          <Reveal key={index} delay={0.08 * index} className="group relative">
            <Frame color={color} />
            <article className="relative rounded-md bg-gradient-to-br from-white to-[#F1F3F7] px-6 py-7 shadow-[0_18px_40px_-22px_rgba(11,27,58,0.35)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_26px_50px_-24px_rgba(11,27,58,0.45)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-night">{tx(locale, facet.title.fr, facet.title.ar)}</h3>
              <span className="mt-2 block h-px w-24 bg-night/20" />
              <p className="mt-4 text-sm leading-6 text-institution">{tx(locale, facet.body.fr, facet.body.ar)}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
