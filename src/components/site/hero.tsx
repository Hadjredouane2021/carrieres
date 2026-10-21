"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { formatEventDate } from "@/lib/datetime";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl, safeLinkUrl } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";

const ease = [0.22, 1, 0.36, 1] as const;

function rise(reduce: boolean | null, delay: number) {
  return {
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, delay, ease },
  } as const;
}

function useCountdown(target: string | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target || now === null) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return { done: true as const };
  const total = Math.floor(diff / 1000);
  return {
    done: false as const,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function Hero({ site, locale }: { site: SiteData; locale: Locale }) {
  const copy = dictionary[locale].hero;
  const reduce = useReducedMotion();
  const countdown = useCountdown(site.settings.eventDate);
  const title = tx(locale, site.sections.hero?.title.fr ?? copy.title, site.sections.hero?.title.ar ?? copy.title);
  const slogan = tx(locale, site.settings.slogan.fr, site.settings.slogan.ar);
  const photo = safeAssetUrl(site.settings.heroImage);
  const eventDate = formatEventDate(site.settings.eventDate, locale);
  const eventLink = safeLinkUrl(site.settings.eventLink.url);
  const eventLinkLabel = tx(locale, site.settings.eventLink.label.fr, site.settings.eventLink.label.ar) || (locale === "ar" ? "رابط الحدث" : "Lien de l'événement");
  const external = eventLink?.startsWith("https://") ?? false;
  const venue = site.settings.venueName.trim() !== site.settings.city.trim() ? site.settings.venueName.trim() : "";
  const intro = tx(locale, site.sections.hero?.body.fr ?? "", site.sections.hero?.body.ar ?? "").trim();
  const place = [venue, site.settings.address.trim()].filter(Boolean).join(" — ");
  const when = eventDate ? `${eventDate} — ${site.settings.city}` : copy.date;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-night text-white">
      {photo ? (
        <>
          {/* Photo déposée depuis le tableau de bord. */}
          <motion.img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            initial={reduce ? false : { scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3, ease }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3A]/92 via-[#0B1B3A]/25 to-[#0B1B3A]/20" />
        </>
      ) : (
        <Skyline reduce={reduce} />
      )}
      <div className={photo ? "grain pointer-events-none absolute inset-0 opacity-15" : "grain pointer-events-none absolute inset-0 opacity-40"} />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-20">
        <motion.p {...rise(reduce, 0.3)} className="text-[11px] font-semibold uppercase tracking-[0.38em] text-black"
        >
          {copy.kicker}
        </motion.p>
        <h1 className="hero-title mt-5 max-w-5xl text-[clamp(2.5rem,6.4vw,6.4rem)] leading-[0.95] text-balance">
          {title.split(" ").map((word, index) => (
            <Fragment key={index}>
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 + index * 0.12, ease }}
                >
                  {word}
                </motion.span>
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <motion.p {...rise(reduce, 1.1)} className="mt-6 text-xl font-semibold tracking-[0.22em] text-black uppercase md:text-2xl"
        >
          {slogan}
        </motion.p>
        {intro ? (
          <motion.p {...rise(reduce, 1.2)} className="mt-5 max-w-2xl text-base leading-7 text-beige/90 md:text-lg">
            {intro}
          </motion.p>
        ) : null}
        <motion.p {...rise(reduce, 1.35)} className="mt-5 text-sm tracking-[0.18em] text-beige/80 uppercase">{when}</motion.p>
        {place ? (
          <motion.p {...rise(reduce, 1.45)} className="mt-2 flex max-w-2xl items-start gap-2 text-sm text-beige/70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>{place}</span>
          </motion.p>
        ) : null}
        {countdown ? (
          <motion.div {...rise(reduce, 1.5)} className="mt-8 flex flex-wrap gap-3" aria-live="polite">
            {countdown.done ? (
              <p className="rounded-full border border-gold/40 px-4 py-2 text-gold">{copy.started}</p>
            ) : (
              [
                [copy.days, countdown.days],
                [copy.hours, countdown.hours],
                [copy.minutes, countdown.minutes],
                [copy.seconds, countdown.seconds],
              ].map(([label, value]) => (
                <div key={String(label)} className="min-w-20 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center backdrop-blur-md">
                  <div className="display text-3xl">{String(value).padStart(2, "0")}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-beige/70">{label}</div>
                </div>
              ))
            )}
          </motion.div>
        ) : null}
        <motion.div {...rise(reduce, 1.7)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/inscription" className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-7 font-semibold text-night hover:bg-gold-bright">
            {copy.participate}
          </Link>
          <Link href="/programme" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-white hover:bg-white/10">
            {copy.program}
          </Link>
          {eventLink ? (
            <a
              href={eventLink}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gold/50 bg-white/5 px-7 text-gold backdrop-blur hover:bg-gold hover:text-night"
            >
              {eventLinkLabel}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </a>
          ) : null}
          <FederationLogo className="sm:hidden" />
        </motion.div>
      </div>
      {/* Grand écran : collé au bord droit, à la hauteur des boutons. */}
      <motion.div {...rise(reduce, 1.8)} className="absolute bottom-[60px] end-4 z-10 hidden sm:block md:bottom-[76px] md:end-6">
        <FederationLogo />
      </motion.div>
    </section>
  );
}

function FederationLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-14 w-fit items-center rounded-2xl bg-white px-4 shadow-lg shadow-black/20 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-federation.png" alt="Fédération Marocaine de l'Assurance" width={1206} height={217} className="h-9 w-auto sm:h-10" />
    </span>
  );
}

function Skyline({ reduce }: { reduce: boolean | null }) {
  const towers = [
    [30, 150, 48], [84, 210, 42], [132, 170, 36], [176, 250, 54], [236, 190, 40],
    [980, 160, 44], [1030, 230, 50], [1088, 180, 38], [1134, 260, 58], [1200, 200, 46], [1254, 150, 70],
  ];
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#071226" />
          <stop offset="46%" stopColor="#173D70" />
          <stop offset="72%" stopColor="#C4A06A" />
          <stop offset="100%" stopColor="#F3E9DC" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6E8" />
          <stop offset="45%" stopColor="#F3E9DC" />
          <stop offset="100%" stopColor="#F3E9DC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8B57A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0B1B3A" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <motion.g
        initial={reduce ? false : { y: 140, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 3, ease }}
      >
        <circle cx="720" cy="470" r="180" fill="url(#sun)" />
        <circle cx="720" cy="470" r="54" fill="#F7E7CF" />
      </motion.g>
      {towers.map(([x, height, width], index) => (
        <motion.g
          key={`${x}-${height}`}
          style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, delay: 0.2 + index * 0.08, ease }}
        >
          <rect x={x} y={560 - height} width={width} height={height} fill="#0B1B3A" opacity="0.92" />
          {Array.from({ length: Math.floor(height / 28) }).map((_, index) => (
            <rect key={index} x={x + 8} y={560 - height + 16 + index * 26} width="7" height="10" fill="#D8B57A" opacity="0.75" />
          ))}
        </motion.g>
      ))}
      <path d="M430 900 L650 500 L790 500 L1010 900 Z" fill="url(#road)" />
      <motion.path
        d="M720 520 L720 900"
        stroke="#F3E9DC"
        strokeWidth="3"
        strokeDasharray="10 18"
        opacity="0.8"
        animate={reduce ? undefined : { strokeDashoffset: [0, -28] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
      <path d="M0 560 H1440" stroke="#D8B57A" strokeOpacity="0.35" />
    </svg>
  );
}
