import { RegisterForm } from "@/components/forms/register-form";
import { PublicFrame } from "@/components/site/public-frame";
import { eventDateParts } from "@/lib/datetime";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Inscription" };
export const instant = false;

export default async function RegisterPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].register;
  return (
    <PublicFrame locale={locale} site={site}>
      <section className="relative isolate overflow-hidden rounded-b-[2rem] bg-night text-white md:rounded-b-[2.75rem]">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,#173D70_0%,#0B1B3A_55%,#071226_100%)]" />
          <div className="absolute -top-1/3 end-[-10%] h-[38rem] w-[38rem] animate-aurora rounded-full bg-gold/20 blur-[120px]" />
          <div className="absolute -bottom-1/2 start-[-10%] h-[34rem] w-[46rem] animate-aurora rounded-full bg-[#2D63B3]/30 blur-[120px] [animation-delay:-9s]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(216,181,122,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(216,181,122,0.07)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_80%_at_70%_30%,#000,transparent)]" />
          <div className="noise absolute inset-0 opacity-[0.18]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-36 pt-32 md:px-6 md:pb-44 md:pt-40">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pe-4 ps-3 text-xs font-medium text-beige shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl motion-safe:animate-rise">
            <span className="size-2 rounded-full bg-emerald-400" />
            {copy.kicker}
          </span>
          <h1 className="display mt-6 max-w-4xl text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95] text-balance motion-safe:animate-rise" style={{ animationDelay: "0.08s" }}>
            {copy.heading}{" "}
            <span className={locale === "ar" ? "text-gold-sheen" : "text-gold-sheen font-accent text-[1.06em] italic tracking-[-0.01em] pe-[0.1em]"}>
              {copy.accent}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-beige/80 motion-safe:animate-rise md:text-lg md:leading-8" style={{ animationDelay: "0.16s" }}>
            {copy.intro}
          </p>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 pb-20 md:-mt-32 md:px-6 md:pb-28">
        <RegisterForm site={site} locale={locale} when={eventDateParts(site.settings.eventDate, locale)} />
      </div>
    </PublicFrame>
  );
}
