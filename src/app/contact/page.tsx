import { ArrowUpRight, HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Container, TextLink } from "@/components/site/ui";
import { tx } from "@/lib/i18n";
import { placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Contact", description: "Écrire à l'équipe du Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function ContactPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.contact;
  const { settings } = site;
  const socials = [
    [settings.linkedin, "LinkedIn"],
    [settings.instagram, "Instagram"],
    [settings.facebook, "Facebook"],
    [settings.youtube, "YouTube"],
  ].filter(([href]) => href.startsWith("https://"));

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Contact" kicker={tx(locale, "Contact", "اتصال")} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)} />
      <Container className="grid gap-6 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10 lg:py-24">
        <ContactForm locale={locale} />
        <aside className="grid content-start gap-4">
          <div className="surface-dark relative isolate overflow-clip rounded-[2rem] bg-night p-6 text-white sm:p-8">
            <div aria-hidden="true" className="absolute -end-20 -top-20 -z-10 size-60 rounded-full bg-sun/25 blur-[80px]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">{tx(locale, "Coordonnées", "معلومات الاتصال")}</p>
            <ul className="mt-5 grid gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-white">{placeLabel(settings.venueName, settings.city) || settings.city}</span>
                  {settings.address ? <span className="mt-0.5 block text-haze">{settings.address}</span> : null}
                </span>
              </li>
              {settings.contactEmail ? (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 break-all hover:text-sun-bright">
                    <Mail className="size-4 shrink-0 text-sun" aria-hidden="true" />
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
              {settings.contactPhone ? (
                <li>
                  <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-sun-bright" dir="ltr">
                    <Phone className="size-4 shrink-0 text-sun" aria-hidden="true" />
                    {settings.contactPhone}
                  </a>
                </li>
              ) : null}
            </ul>
            {socials.length ? (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {socials.map(([href, label]) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/85 transition hover:border-white/40"
                    >
                      {label}
                      <ArrowUpRight className="size-3.5 text-sun" aria-hidden="true" />
                      <span className="sr-only">{tx(locale, "(nouvel onglet)", "(نافذة جديدة)")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex items-start gap-4 rounded-[2rem] border border-night/10 p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-dawn text-sun-ink">
              <HelpCircle className="size-5" aria-hidden="true" />
            </span>
            <div className="grid gap-2">
              <p className="font-semibold text-night">{tx(locale, "Une réponse immédiate ?", "جواب فوري؟")}</p>
              <p className="text-sm text-muted">{tx(locale, "Les questions les plus fréquentes sont déjà réunies.", "أكثر الأسئلة تداولاً مجمعة هنا.")}</p>
              <TextLink href="/faq">{tx(locale, "Consulter la FAQ", "الأسئلة المتداولة")}</TextLink>
            </div>
          </div>
        </aside>
      </Container>
    </PublicFrame>
  );
}
