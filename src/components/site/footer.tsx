import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Skyline } from "@/components/site/ui";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import { placeLabel } from "@/lib/utils";

export function Footer({ locale, site }: { locale: Locale; site: SiteData }) {
  const copy = dictionary[locale];
  const { settings } = site;
  const columns = [
    {
      title: tx(locale, "Découvrir", "اكتشف"),
      links: [
        ["/forum", copy.nav.forum],
        ["/programme", copy.nav.program],
        ["/metiers", copy.nav.careers],
        ["/intervenants", copy.nav.speakers],
        ["/partenaires", copy.nav.partners],
        ["/galerie", copy.nav.gallery],
      ],
    },
    {
      title: tx(locale, "Participer", "شارك"),
      links: [
        ["/inscription", copy.footer.register],
        ["/faq", copy.nav.faq],
        ["/contact", copy.nav.contact],
      ],
    },
    {
      title: tx(locale, "Informations", "معلومات"),
      links: [
        ["/mentions-legales", copy.footer.legal],
        ["/confidentialite", copy.footer.privacy],
        ["/credits", copy.footer.credits],
      ],
    },
  ] as const;
  const socials = [
    [settings.linkedin, "LinkedIn"],
    [settings.instagram, "Instagram"],
    [settings.facebook, "Facebook"],
    [settings.youtube, "YouTube"],
  ].filter(([href]) => href.startsWith("https://"));

  return (
    <footer className="surface-dark relative isolate overflow-clip bg-night text-white print:hidden">
      <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-white/[0.035] sm:h-40" lights={false} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 md:px-6 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10 lg:pt-20">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-fma.png" alt="Assur'Carrière" width={185} height={74} className="h-12 w-auto brightness-0 invert" />
          <p className="display mt-6 max-w-sm text-2xl leading-tight text-white">{copy.hero.title}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-haze">{copy.footer.organizer}</p>
          <ul className="mt-6 grid gap-2.5 text-sm text-white/85">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
              {placeLabel(settings.venueName, settings.city) || settings.city}
            </li>
            {settings.contactEmail ? (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2.5 hover:text-sun-bright">
                  <Mail className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {settings.contactEmail}
                </a>
              </li>
            ) : null}
            {settings.contactPhone ? (
              <li>
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2.5 hover:text-sun-bright" dir="ltr">
                  <Phone className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {settings.contactPhone}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">{column.title}</p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {column.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-white/75 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-haze sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>© 2026 Assur&apos;Carrière · {copy.footer.rights}</p>
          {socials.length ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map(([href, label]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    {label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{tx(locale, "(nouvel onglet)", "(نافذة جديدة)")}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
