import { ArrowLeft, CalendarDays, MapPin, QrCode, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/login-form";
import { Skyline } from "@/components/site/ui";
import { eventDateParts } from "@/lib/datetime";
import { safeAssetUrl } from "@/lib/media";
import { db } from "@/lib/prisma";
import { placeLabel } from "@/lib/utils";

export const metadata = { title: "Connexion", robots: { index: false, follow: false } };
export const instant = false;

const features = [
  { icon: Users, text: "Inscriptions et export des participants" },
  { icon: QrCode, text: "Accueil le jour J par QR code" },
  { icon: Sparkles, text: "Contenus du site public" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  await connection();
  const params = await searchParams;
  const callback = params.callbackUrl?.startsWith("/admin") ? params.callbackUrl : "/admin";
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } }).catch(() => null);
  const when = eventDateParts(settings?.eventDate?.toISOString() ?? null, "fr");
  const place = placeLabel(settings?.venueName, settings?.city) || "Casablanca";
  const photo = safeAssetUrl(settings?.heroImage ?? "") ?? "/video/assurcarriere-hero-poster.webp";

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Visuel : photo du Forum, voile nuit, infos de l'édition. */}
      <section className="surface-dark relative isolate hidden overflow-clip bg-night text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/80 to-night/40" />
        <div aria-hidden="true" className="absolute -bottom-40 -end-24 -z-10 size-[30rem] rounded-full bg-sun/30 blur-[120px]" />
        <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-night-deep/80" lights={false} />

        <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-white/[0.12]">
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour au site
        </Link>

        <div className="max-w-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-assurcarriere.png" alt="Assur'Carrière" width={466} height={187} className="h-14 w-auto brightness-0 invert" />
          <h2 className="display mt-10 text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02]">
            Le back-office du <span className="font-accent italic text-sun">Forum</span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-haze">Pilotez les inscriptions, l&apos;accueil des participants et les contenus du site, au même endroit.</p>
          <ul className="mt-8 grid gap-3 text-sm">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-sun backdrop-blur">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 backdrop-blur">
            <CalendarDays className="size-4 text-sun" aria-hidden="true" />
            {when ? `${when.day} · ${when.time}` : "Novembre 2026"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 backdrop-blur">
            <MapPin className="size-4 text-sun" aria-hidden="true" />
            {place}
          </span>
        </div>
      </section>

      {/* Formulaire. */}
      <section className="relative isolate flex min-h-screen flex-col justify-center overflow-clip px-5 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div aria-hidden="true" className="absolute -end-32 -top-32 -z-10 size-[26rem] rounded-full bg-sun/10 blur-[100px]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(11,27,58,0.07)_1px,transparent_0)] bg-[size:22px_22px] [mask-image:radial-gradient(60%_60%_at_70%_20%,#000,transparent)]" />

        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-assurcarriere.png" alt="Assur'Carrière" width={466} height={187} className="h-11 w-auto" />
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-night">
              <ArrowLeft className="size-4" aria-hidden="true" /> Le site
            </Link>
          </div>

          <p className="mt-10 inline-flex items-center gap-2 rounded-full bg-dawn px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sun-ink lg:mt-0">
            <span className="size-1.5 rounded-full bg-sun" aria-hidden="true" /> Espace équipe
          </p>
          <h1 className="display mt-4 text-4xl leading-tight text-night sm:text-5xl">Bon retour parmi nous</h1>
          <p className="mt-3 text-muted">Connectez-vous avec votre adresse professionnelle pour accéder au back-office.</p>

          <div className="mt-9">
            <LoginForm callbackUrl={callback} />
          </div>

          <p className="mt-8 flex items-start gap-2.5 rounded-2xl bg-mist/70 px-4 py-3 text-xs leading-5 text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            Accès réservé à l&apos;équipe du Forum. Mot de passe oublié ou compte bloqué : contactez un super administrateur.
          </p>
        </div>
      </section>
    </main>
  );
}
