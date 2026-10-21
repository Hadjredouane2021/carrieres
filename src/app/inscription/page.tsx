import { CalendarDays, Gift, MapPin, QrCode, Sparkles, Ticket } from "lucide-react";
import { RegisterForm } from "@/components/forms/register-form";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { formatEventDate } from "@/lib/datetime";
import { dictionary } from "@/lib/i18n";
import { placeLabel } from "@/lib/utils";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Inscription" };
export const instant = false;

export default async function RegisterPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].register;
  const ar = locale === "ar";
  const { capacity, confirmedCount } = site.settings;
  const seats = Math.max(capacity - confirmedCount, 0);
  const fill = Math.min(100, Math.round((confirmedCount / Math.max(capacity, 1)) * 100));
  const when = formatEventDate(site.settings.eventDate, locale) ?? (ar ? "نونبر 2026" : "Novembre 2026");
  const perks = ar
    ? [
        { icon: Gift, text: "تسجيل مجاني" },
        { icon: Ticket, text: "تذكرة اسمية بصيغة PDF" },
        { icon: QrCode, text: "رمز QR للدخول السريع" },
        { icon: Sparkles, text: "ورشات ولقاءات مع المشغلين" },
      ]
    : [
        { icon: Gift, text: "Inscription gratuite" },
        { icon: Ticket, text: "Billet nominatif en PDF" },
        { icon: QrCode, text: "QR code pour un accès rapide" },
        { icon: Sparkles, text: "Ateliers et rencontres recruteurs" },
      ];

  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="2026" title={copy.title} intro={copy.intro} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[22rem_1fr] lg:gap-10 lg:py-16">
        <aside className="h-fit lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-night p-7 text-beige shadow-[0_30px_60px_-30px_rgba(11,27,58,0.6)]">
            <div className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gold/25 blur-3xl" />
            <div className="grain pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative grid gap-6">
              <div className="grid gap-3 text-sm">
                <p className="flex items-start gap-3 capitalize">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold" /> {when}
                </p>
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    {placeLabel(site.settings.venueName, site.settings.city)}
                    {site.settings.address ? <span className="block text-beige/60">{site.settings.address}</span> : null}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-baseline justify-between">
                  <p className="display text-3xl text-white">{seats}</p>
                  <p className="text-xs text-beige/60">{ar ? `من ${capacity}` : `sur ${capacity}`}</p>
                </div>
                <p className="text-xs text-beige/70">{ar ? "مقاعد متبقية" : "places encore disponibles"}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright" style={{ width: `${Math.max(fill, 3)}%` }} />
                </div>
              </div>

              <ul className="grid gap-3 border-t border-white/10 pt-6 text-sm">
                {perks.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-beige/85">
                    <span className="grid size-8 place-items-center rounded-xl bg-gold/15 text-gold">
                      <Icon className="size-4" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
        <RegisterForm site={site} locale={locale} />
      </div>
    </PublicFrame>
  );
}
