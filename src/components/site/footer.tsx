import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";

export function Footer({ locale, site }: { locale: Locale; site: SiteData }) {
  const copy = dictionary[locale];
  return (
    <footer className="bg-night text-beige">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <img src="/logo-fma.png" alt="Assur' Carrière" className="h-14 w-auto rounded-xl bg-white px-3 py-2" />
          <p className="display mt-4 text-3xl text-white">{copy.hero.title}</p>
          <p className="mt-4 max-w-md text-beige/70">{copy.footer.organizer}</p>
        </div>
        <div className="grid gap-2 text-sm">
          <Link href="/forum" className="hover:text-gold">{copy.nav.forum}</Link>
          <Link href="/programme" className="hover:text-gold">{copy.nav.program}</Link>
          <Link href="/metiers" className="hover:text-gold">{copy.nav.careers}</Link>
          <Link href="/inscription" className="hover:text-gold">{copy.footer.register}</Link>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p>{site.settings.city}</p>
          <a href={`mailto:${site.settings.contactEmail}`} className="hover:text-gold">{site.settings.contactEmail}</a>
          <Link href="/mentions-legales" className="hover:text-gold">{copy.footer.legal}</Link>
          <Link href="/confidentialite" className="hover:text-gold">{copy.footer.privacy}</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-beige/50">
        © 2026 {copy.footer.rights}
      </div>
    </footer>
  );
}
