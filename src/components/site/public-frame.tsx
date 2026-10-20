import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import type { Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";

export function PageIntro({ kicker, title, intro }: { kicker: string; title: string; intro: string }) {
  return (
    <section className="bg-beige px-4 pb-4 pt-24 text-white sm:pt-28 md:px-6">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] bg-night px-5 py-8 sm:px-10 sm:py-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</p>
        <h1 className="display mt-3 max-w-4xl text-[clamp(2.1rem,6vw,5.2rem)] leading-[0.94] text-balance">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-beige/80 sm:text-lg">{intro}</p>
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
