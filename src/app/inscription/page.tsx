import { Clock, Gift, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/forms/register-form";
import { PublicFrame } from "@/components/site/public-frame";
import { Skyline } from "@/components/site/ui";
import { eventDateParts } from "@/lib/datetime";
import { dictionary, tx } from "@/lib/i18n";
import { splitAccent } from "@/lib/site-types";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Inscription", description: "Réserve gratuitement ta place au Forum des Métiers de l'Assurance : billet nominatif et QR code d'accès." };
export const instant = false;

export default async function RegisterPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].register;
  const section = site.sections.register;
  const [heading, accent] = splitAccent(tx(locale, section.title.fr, section.title.ar));
  const reassurance = [
    [Gift, copy.kicker],
    [Clock, tx(locale, "Environ 2 minutes", "حوالي دقيقتين")],
    [ShieldCheck, tx(locale, "Données protégées", "معطيات محمية")],
  ] as const;
  return (
    <PublicFrame locale={locale} site={site}>
      <section className="surface-dark relative isolate overflow-clip rounded-b-[2rem] bg-night text-white md:rounded-b-[2.75rem]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,#173D70_0%,#0B1B3A_55%,#071226_100%)]" />
          <div className="absolute -top-1/3 end-[-10%] h-[38rem] w-[38rem] rounded-full bg-sun/25 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_80%_at_70%_30%,#000,transparent)]" />
          <div className="noise absolute inset-0 opacity-[0.12]" />
          <Skyline className="absolute inset-x-0 bottom-0 h-24 w-full text-night-deep/80 sm:h-32" lights={false} />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-36 pt-32 md:px-6 md:pb-44 md:pt-40">
          <ul className="flex flex-wrap gap-2 motion-safe:animate-rise">
            {reassurance.map(([ItemIcon, label]) => (
              <li key={label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
                <ItemIcon className="size-3.5 text-sun" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <h1 className="display mt-6 max-w-4xl text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.97] text-balance motion-safe:animate-rise [animation-delay:0.08s]">
            {heading}{" "}
            <span className={locale === "ar" ? "text-sun-sheen" : "text-sun-sheen pe-[0.1em] font-accent text-[1.06em] italic tracking-[-0.01em]"}>{accent}</span>
          </h1>
          <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-haze motion-safe:animate-rise [animation-delay:0.16s] md:text-lg md:leading-8">{tx(locale, section.body.fr, section.body.ar)}</p>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 pb-20 md:-mt-32 md:px-6 md:pb-28">
        <RegisterForm site={site} locale={locale} when={eventDateParts(site.settings.eventDate, locale)} />
      </div>
    </PublicFrame>
  );
}
