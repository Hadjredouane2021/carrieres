import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Reveal } from "@/components/site/reveal";
import type { Locale } from "@/lib/i18n";
import { pageTitleSize } from "@/lib/typography";
import type { SiteData } from "@/lib/site-types";

export function PageIntro({ kicker, title, intro }: { kicker: string; title: string; intro: string }) {
  return (
    <section className="bg-beige px-4 pb-4 pt-24 text-white sm:pt-28 md:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-night px-5 py-9 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -end-24 -top-32 size-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 end-1/4 size-80 rounded-full bg-institution/60 blur-3xl" />
        <div className="grain pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative">
          <Reveal as="p" className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</Reveal>
          <Reveal as="h1" delay={0.1} className={`display mt-4 text-balance ${pageTitleSize(title)}`}>{title}</Reveal>
          <Reveal as="p" delay={0.2} className="mt-5 max-w-2xl text-base leading-7 text-beige/80 sm:mt-6 sm:text-lg">{intro}</Reveal>
        </div>
      </div>
    </section>
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
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:m-3 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2">
        {locale === "ar" ? "تخطي إلى المحتوى" : "Aller au contenu"}
      </a>
      <Header locale={locale} />
      <main id="contenu">{children}</main>
      <Footer locale={locale} site={site} />
    </>
  );
}
