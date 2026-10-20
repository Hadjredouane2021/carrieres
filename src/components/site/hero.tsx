"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";

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

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-night text-white">
      {photo ? (
        <>
          {/* Photo déposée depuis le tableau de bord. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3A]/92 via-[#0B1B3A]/25 to-[#0B1B3A]/20" />
        </>
      ) : (
        <Skyline />
      )}
      <div className={photo ? "grain pointer-events-none absolute inset-0 opacity-15" : "grain pointer-events-none absolute inset-0 opacity-40"} />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-20">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[11px] uppercase tracking-[0.38em] text-gold"
        >
          {copy.kicker}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="display mt-5 max-w-5xl text-[clamp(2.7rem,7vw,7rem)] leading-[0.9] text-balance"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-xl tracking-[0.22em] text-gold uppercase md:text-2xl"
        >
          {slogan}
        </motion.p>
        <p className="mt-4 text-sm tracking-[0.18em] text-beige/80 uppercase">{copy.date}</p>
        {countdown ? (
          <div className="mt-8 flex flex-wrap gap-3" aria-live="polite">
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
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inscription" className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-7 font-semibold text-night hover:bg-gold-bright">
            {copy.participate}
          </Link>
          <Link href="/programme" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-white hover:bg-white/10">
            {copy.program}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Skyline() {
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
      <circle cx="720" cy="470" r="180" fill="url(#sun)" />
      <circle cx="720" cy="470" r="54" fill="#F7E7CF" />
      {towers.map(([x, height, width]) => (
        <g key={`${x}-${height}`}>
          <rect x={x} y={560 - height} width={width} height={height} fill="#0B1B3A" opacity="0.92" />
          {Array.from({ length: Math.floor(height / 28) }).map((_, index) => (
            <rect key={index} x={x + 8} y={560 - height + 16 + index * 26} width="7" height="10" fill="#D8B57A" opacity="0.75" />
          ))}
        </g>
      ))}
      <path d="M430 900 L650 500 L790 500 L1010 900 Z" fill="url(#road)" />
      <path d="M720 520 L720 900" stroke="#F3E9DC" strokeWidth="3" strokeDasharray="10 18" opacity="0.8" />
      <path d="M0 560 H1440" stroke="#D8B57A" strokeOpacity="0.35" />
    </svg>
  );
}
