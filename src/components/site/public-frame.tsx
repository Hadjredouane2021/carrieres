import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { AccentTitle, Eyebrow, Skyline } from "@/components/site/ui";
import type { Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import { FONT_FAMILIES } from "@/app/fonts";
import { themeCss } from "@/lib/theme";
import { cn } from "@/lib/utils";

// En-tête éditorial des pages internes : même univers que le Hero de l'accueil (nuit, halo solaire, Casablanca).
export function PageIntro({
  kicker,
  title,
  intro,
  children,
  className,
  watermark,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
  watermark?: string;
}) {
  return (
    <section
      className={cn(
        "surface-dark relative isolate overflow-clip rounded-b-[2rem] bg-night text-white md:rounded-b-[2.75rem]",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,#173D70_0%,#0B1B3A_55%,#071226_100%)]" />
        <div className="absolute -bottom-40 end-[-8%] size-[30rem] rounded-full bg-sun/30 blur-[120px] sm:size-[38rem]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_80%_at_70%_30%,#000,transparent)]" />
        <div className="noise absolute inset-0 opacity-[0.12]" />
        <Skyline className="absolute inset-x-0 bottom-0 h-20 w-full text-night-deep/80 sm:h-28" lights={false} />
        {watermark ? (
          <span className="display text-outline absolute -bottom-[0.18em] end-[-0.04em] whitespace-nowrap text-[clamp(6rem,19vw,17rem)] leading-none">
            {watermark}
          </span>
        ) : null}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:pb-24 sm:pt-36 md:px-6 md:pb-28 md:pt-44">
        <Eyebrow dark className="motion-safe:animate-rise">
          {kicker}
        </Eyebrow>
        <h1 className="display mt-5 max-w-5xl text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[0.96] text-balance motion-safe:animate-rise [animation-delay:0.06s]">
          <AccentTitle text={title} dark />
        </h1>
        {intro ? (
          <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-7 text-haze motion-safe:animate-rise [animation-delay:0.12s] sm:text-lg sm:leading-8">{intro}</p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap items-center gap-3 motion-safe:animate-rise [animation-delay:0.18s]">{children}</div> : null}
      </div>
    </section>
  );
}

// Bloc de texte long (mentions légales, confidentialité).
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <div className="grid gap-5 text-base leading-8 text-night/80">{children}</div>
    </div>
  );
}

export function PublicFrame({
  locale,
  site,
  children,
}: {
  locale: Locale;
  site: SiteData;
  children: React.ReactNode;
}) {
  const css = themeCss(site.settings.theme, FONT_FAMILIES);
  return (
    <>
      {/* Couleurs et polices choisies dans le back-office : valeurs validées côté serveur. */}
      {css ? <style>{css}</style> : null}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-sun focus:px-4 focus:py-2 focus:font-semibold focus:text-night"
      >
        {locale === "ar" ? "تخطي إلى المحتوى" : "Aller au contenu"}
      </a>
      <Header locale={locale} menu={site.settings.menu} />
      <main id="contenu" className="bg-white">
        {children}
      </main>
      <Footer locale={locale} site={site} />
    </>
  );
}
