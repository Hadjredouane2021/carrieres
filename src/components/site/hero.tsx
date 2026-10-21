"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";
import type { eventDateParts } from "@/lib/datetime";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";
import { cn, placeLabel } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

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

const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

const VIDEO = {
  poster: "/video/assurcarriere-hero-poster.webp",
  webm: "/video/assurcarriere-hero.webm",
  mp4: "/video/assurcarriere-hero.mp4",
};
// Cadrage portrait : la skyline et le soleil se trouvent à droite du centre.
const framing = "object-cover object-[62%_50%] md:object-center";

// Le poster s'affiche tout de suite (image légère, prioritaire pour le LCP). La vidéo ne se charge qu'une fois le Hero
// à l'écran, jamais en mouvement réduit ni en mode économie de données, puis apparaît en fondu au-dessus du poster.
// Mémoïsé : le compte à rebours re-rend le Hero chaque seconde.
const HeroVideo = memo(function HeroVideo({ reduce, poster, onPosterError }: { reduce: boolean; poster: string; onPosterError: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Un poster déjà en échec avant l'hydratation ne déclenche plus onError.
  const watchPoster = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth === 0) onPosterError();
    },
    [onPosterError],
  );

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // autoplay est posé ici plutôt que dans le HTML serveur, rendu avant de connaître la préférence de mouvement.
    if (reduce || saveData) {
      node.autoplay = false;
      node.pause();
      return;
    }
    node.muted = true;
    node.autoplay = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Lecture refusée par le navigateur : le poster reste en place.
        if (entry.isIntersecting) node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.pause();
    };
  }, [reduce]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={watchPoster}
        src={poster}
        alt=""
        fetchPriority="high"
        onError={onPosterError}
        className={cn("absolute inset-0 h-full w-full", framing)}
      />
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-1000", framing, playing && !reduce ? "opacity-100" : "opacity-0")}
      >
        <source src={VIDEO.webm} type="video/webm" />
        <source src={VIDEO.mp4} type="video/mp4" />
      </video>
    </>
  );
});

// Les entrées sont animées en CSS pour que le Hero s'affiche avant l'hydratation.
// La date arrive formatée par le serveur : les navigateurs ne s'accordent pas tous sur le fuseau de Casablanca.
export function Hero({ site, locale, when }: { site: SiteData; locale: Locale; when: ReturnType<typeof eventDateParts> }) {
  const copy = dictionary[locale].hero;
  const { settings } = site;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const countdown = useCountdown(settings.eventDate);
  const title = tx(locale, site.sections.hero?.title.fr ?? copy.title, site.sections.hero?.title.ar ?? copy.title);
  const slogan = tx(locale, settings.slogan.fr, settings.slogan.ar);
  const photo = safeAssetUrl(settings.heroImage);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  // Poster : l'image choisie dans Hero Studio, sinon celui de la vidéo ; en dernier recours, l'illustration.
  const customPoster = photo && !photoFailed ? photo : null;
  const onPosterError = useCallback(() => (customPoster ? setPhotoFailed(true) : setPosterFailed(true)), [customPoster]);
  const place = placeLabel(settings.venueName, settings.city) || settings.city;
  const seats = Math.max(settings.capacity - settings.confirmedCount, 0);
  const fill = settings.capacity > 0 ? Math.min(Math.max(settings.confirmedCount / settings.capacity, 0.03), 1) : 0;
  const status = !settings.registrationOpen ? "closed" : seats === 0 ? "full" : "open";
  const careers = site.careers.map((career) => tx(locale, career.title.fr, career.title.ar));
  const numbers = locale === "ar" ? "ar-MA" : "fr-MA";
  const words = title.split(/\s+/).filter(Boolean);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);


  function spotlight(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  const units = [
    [copy.days, countdown && !countdown.done ? countdown.days : null],
    [copy.hours, countdown && !countdown.done ? countdown.hours : null],
    [copy.minutes, countdown && !countdown.done ? countdown.minutes : null],
    [copy.seconds, countdown && !countdown.done ? countdown.seconds : null],
  ] as const;

  return (
    <section
      ref={ref}
      onPointerMove={spotlight}
      className="group/hero relative isolate flex min-h-[100svh] flex-col overflow-hidden rounded-b-[2rem] bg-night text-white md:rounded-b-[2.75rem]"
    >
      {!posterFailed ? (
        <motion.div style={{ y: reduce ? 0 : photoY }} className="absolute inset-0">
          <HeroVideo reduce={Boolean(reduce)} poster={customPoster ?? VIDEO.poster} onPosterError={onPosterError} />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-night/20 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-night/10 md:hidden" />
        </motion.div>
      ) : (
        <Aurora />
      )}
      <div className="noise pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100"
        style={{ background: "radial-gradient(560px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(255,122,26,0.12), transparent 62%)" }}
      />

      <motion.div
        style={{ y: reduce ? 0 : contentY, opacity: reduce ? 1 : contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-10 pt-28 md:px-6 md:pb-12 md:pt-32"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 motion-safe:animate-rise">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pe-4 ps-3 text-xs font-medium text-beige shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <span className="relative flex size-2">
              {status === "open" ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" /> : null}
              <span className={cn("relative size-2 rounded-full", status === "open" ? "bg-emerald-400" : "bg-sun")} />
            </span>
            {copy[status]}
          </span>
          <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-beige/70">
            <span className="h-px w-8 bg-sun/80" />
            {copy.kicker}
          </span>
        </div>

        <h1 className="display mt-7 max-w-6xl text-[clamp(2.7rem,6.6vw,6.6rem)] leading-[0.92] text-balance md:mt-9">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                <span className="inline-block motion-safe:animate-reveal" style={delay(0.12 + index * 0.06)}>
                  {word}
                </span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
          <span className="-mb-[0.14em] mt-1 block overflow-hidden pb-[0.14em]">
            <span className="inline-block motion-safe:animate-reveal" style={delay(0.2 + words.length * 0.06)}>
              <span
                className={cn(
                  "text-sun-sheen inline-block animate-shimmer pe-[0.12em]",
                  locale === "ar" ? "display" : "font-accent text-[1.08em] italic tracking-[-0.01em]",
                )}
              >
                {slogan}
              </span>
            </span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-6 motion-safe:animate-rise md:mt-10 lg:flex-row lg:items-end lg:justify-between" style={delay(0.75)}>
          <p className="max-w-lg text-base leading-7 text-beige/80 md:text-lg md:leading-8">{copy.lead}</p>
          <div className="flex shrink-0 flex-col gap-3 whitespace-nowrap sm:flex-row">
            <Link
              href="/inscription"
              className="group/cta relative inline-flex h-14 items-center justify-between gap-4 overflow-hidden rounded-full bg-sun pe-2 ps-7 font-semibold text-night shadow-[0_18px_50px_-18px_rgba(255,122,26,0.85)] transition hover:bg-sun-bright"
            >
              <span className="pointer-events-none absolute inset-y-0 start-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-white/45 blur-md transition-transform duration-700 group-hover/cta:translate-x-[420%]" />
              <span className="relative">{copy.participate}</span>
              <span className="relative grid size-10 place-items-center rounded-full bg-night text-sun transition-transform group-hover/cta:translate-x-0.5 rtl:group-hover/cta:-translate-x-0.5">
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/programme"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition hover:border-white/35 hover:bg-white/[0.12]"
            >
              {copy.program}
            </Link>
          </div>
        </div>

        <dl
          className="relative mt-10 grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-30px_rgba(3,8,20,0.8)] backdrop-blur-2xl motion-safe:animate-rise md:mt-12 lg:flex"
          style={delay(0.9)}
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sun/60 to-transparent" />
          <Cell label={copy.when} className="lg:flex-1">
            <dd className="display text-xl leading-tight md:text-2xl">{when?.day ?? copy.date}</dd>
            {when ? (
              <dd className="mt-1 text-sm text-beige/60">
                <span className="capitalize">{when.weekday}</span> · {when.time}
              </dd>
            ) : null}
          </Cell>
          <Cell label={copy.where} className="border-s border-white/10 lg:flex-1">
            <dd className="display text-xl leading-tight md:text-2xl">{place}</dd>
            <dd className="mt-1 truncate text-sm text-beige/60" title={settings.address || undefined}>
              {settings.address || copy.country}
            </dd>
          </Cell>
          {settings.eventDate ? (
            <Cell label={copy.startsIn} className="col-span-2 border-t border-white/10 md:col-span-1 lg:flex-[1.5] lg:border-s lg:border-t-0">
              {countdown?.done ? (
                <dd className="display text-xl text-sun md:text-2xl">{copy.started}</dd>
              ) : (
                <dd className="flex items-start gap-2.5 sm:gap-3.5" role="timer">
                  {units.map(([label, value], index) => (
                    <Fragment key={label}>
                      {index ? <span className="display text-2xl leading-none text-white/25 md:text-3xl">:</span> : null}
                      <span className="text-center">
                        <span className="display block text-[1.7rem] leading-none tabular-nums md:text-3xl">
                          <Digit value={value} reduce={Boolean(reduce)} />
                        </span>
                        <span className="mt-2 block text-[9px] uppercase tracking-[0.18em] text-beige/55">{label}</span>
                      </span>
                    </Fragment>
                  ))}
                </dd>
              )}
            </Cell>
          ) : null}
          <Cell
            label={copy.seats}
            className={cn(
              "col-span-2 border-t border-white/10 lg:flex-[1.15] lg:border-s lg:border-t-0",
              settings.eventDate && "md:col-span-1 md:border-s",
            )}
          >
            <dd className="flex items-baseline gap-2">
              <span className="display text-xl leading-tight tabular-nums md:text-2xl">{seats.toLocaleString(numbers)}</span>
              <span className="text-sm text-beige/60">
                {copy.seatsOf} {settings.capacity.toLocaleString(numbers)}
              </span>
            </dd>
            <dd className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-sun to-sun-bright motion-safe:animate-grow rtl:origin-right rtl:bg-gradient-to-l"
                style={{ width: `${fill * 100}%`, ...delay(1.2) }}
              />
            </dd>
          </Cell>
        </dl>
      </motion.div>

      {careers.length ? (
        <div className="relative z-10 border-t border-white/10 bg-night/30 backdrop-blur-md motion-safe:animate-rise" style={delay(1.1)} dir="ltr">
          <div className="flex overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[0, 1].map((round) => (
                <ul key={round} aria-hidden={round === 1 || undefined} className="flex shrink-0 items-center gap-8 pe-8">
                  {careers.map((career, index) => (
                    <li key={`${career}-${index}`} className="flex items-center gap-8 whitespace-nowrap text-xs uppercase tracking-[0.26em] text-beige/65 md:text-sm">
                      {career}
                      <span className="size-1.5 rotate-45 bg-sun/80" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Cell({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0 px-5 py-5 md:px-7 md:py-6", className)}>
      <dt className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.26em] text-sun">{label}</dt>
      {children}
    </div>
  );
}

function Digit({ value, reduce }: { value: number | null; reduce: boolean }) {
  const text = value === null ? "--" : String(value).padStart(2, "0");
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { y: "-70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "70%", opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Horizon et soleil (viewBox 1440×900) : assez haut pour rester au-dessus du texte, même en portrait.
const HORIZON = 280;
const SUN_X = 1150;

function Aurora() {
  const rays = Array.from({ length: 25 }, (_, index) => (index - 12) * 150);
  const rows = Array.from({ length: 11 }, (_, index) => HORIZON + (900 - HORIZON) * ((index + 1) / 11) ** 2);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_0%,#173D70_0%,#0B1B3A_52%,#071226_100%)]" />
      <div className="absolute -top-1/4 start-[-12%] h-[75vh] w-[70vw] animate-aurora rounded-full bg-[#2D63B3]/35 blur-[120px]" />
      <div className="absolute end-[-18%] top-[18%] h-[60vh] w-[55vw] animate-aurora rounded-full bg-gold/25 blur-[140px] [animation-delay:-9s]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMid slice">
        <defs>
          <radialGradient id="hero-sun" cx="50%" cy="100%" r="100%">
            <stop offset="0%" stopColor="#FFF4DC" />
            <stop offset="40%" stopColor="#E8CB9C" />
            <stop offset="100%" stopColor="#D8B57A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8CB9C" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E8CB9C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D8B57A" stopOpacity="0" />
            <stop offset="50%" stopColor="#F6E3BD" />
            <stop offset="100%" stopColor="#D8B57A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-floor-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="hero-floor">
            <rect x="0" y={HORIZON} width="1440" height={900 - HORIZON} fill="url(#hero-floor-fade)" />
          </mask>
          <clipPath id="hero-sky">
            <rect x="0" y="0" width="1440" height={HORIZON} />
          </clipPath>
          <filter id="hero-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>
        <ellipse cx={SUN_X - 70} cy={HORIZON} rx="620" ry="230" fill="url(#hero-glow)" />
        <circle cx={SUN_X} cy={HORIZON} r="150" fill="#E8CB9C" opacity="0.32" filter="url(#hero-blur)" />
        <g clipPath="url(#hero-sky)" opacity="0.72">
          <circle cx={SUN_X} cy={HORIZON} r="132" fill="url(#hero-sun)" />
          {[190, 260, 345].map((radius) => (
            <circle key={radius} cx={SUN_X} cy={HORIZON} r={radius} fill="none" stroke="#D8B57A" strokeOpacity={0.5 - radius / 900} />
          ))}
        </g>
        <path d={`M0 ${HORIZON} H1440`} stroke="url(#hero-line)" strokeWidth="1.5" />
        <g mask="url(#hero-floor)" stroke="#D8B57A" strokeOpacity="0.3">
          {rays.map((x) => (
            <path key={x} d={`M${SUN_X} ${HORIZON} L${SUN_X + x * 1.9} 900`} />
          ))}
          {rows.map((y) => (
            <path key={y} d={`M0 ${y.toFixed(1)} H1440`} />
          ))}
        </g>
      </svg>
    </div>
  );
}
