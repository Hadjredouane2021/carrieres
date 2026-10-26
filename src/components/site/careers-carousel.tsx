"use client";

import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export type CarouselCareer = { id: string; title: string; summary: string; icon: string; category?: string };

const AUTOPLAY_MS = 5000;

/** Écart circulaire le plus court entre une carte et la carte active (−n/2 … n/2). */
function offsetOf(index: number, active: number, total: number) {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

// Carrousel 3D des métiers : la carte active au premier plan, les voisines pivotées en perspective.
export function CareersCarousel({
  careers,
  labels,
  syncHash = false,
}: {
  careers: CarouselCareer[];
  labels: { all: string; filters: string; register: string; counter: string; pause: string; play: string };
  /** Ancre #metier-<id> : la carte correspondante passe au premier plan et le défilement s'arrête. */
  syncHash?: boolean;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(careers.map((career) => career.category?.trim() ?? "").filter(Boolean))], [careers]);
  const shown = useMemo(() => (filter ? careers.filter((career) => career.category?.trim() === filter) : careers), [careers, filter]);
  const total = shown.length;
  const choose = (value: string | null) => {
    setFilter(value);
    setActive(0);
  };
  const go = useCallback((step: number) => setActive((current) => (current + step + total) % total), [total]);

  useEffect(() => {
    if (reduce || hovered || stopped || total < 2) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [go, hovered, reduce, stopped, total]);

  useEffect(() => {
    if (!syncHash) return;
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#metier-/, ""));
      const index = careers.findIndex((career) => career.id === id);
      if (index < 0) return;
      setFilter(null);
      setActive(index);
      setStopped(true);
      document.getElementById("carrousel-metiers")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [careers, reduce, syncHash]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  if (total === 0) return null;
  const current = shown[active] ?? shown[0];

  return (
    <div
      id={syncHash ? "carrousel-metiers" : undefined}
      className="relative mt-12 scroll-mt-28 sm:mt-16"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(document.dir === "rtl" ? -1 : 1);
        if (event.key === "ArrowLeft") go(document.dir === "rtl" ? 1 : -1);
      }}
      role="region"
      aria-roledescription="carrousel"
      aria-label={labels.counter}
      dir="ltr"
    >
      <motion.div
        className="relative mx-auto h-[25rem] cursor-grab touch-pan-y select-none [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] active:cursor-grabbing sm:h-[24rem]"
        style={{ perspective: "1600px" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
      >
        {shown.map((career, index) => {
          const offset = offsetOf(index, active, total);
          const distance = Math.abs(offset);
          const hidden = distance > 2;
          const focused = offset === 0;
          return (
            <motion.article
              key={career.id}
              aria-hidden={!focused}
              aria-roledescription="diapositive"
              aria-label={`${index + 1} / ${total}`}
              onClick={() => !focused && go(offset)}
              className="absolute inset-x-0 inset-y-0 mx-auto w-[min(84vw,23rem)]"
              style={{ transformStyle: "preserve-3d", zIndex: 20 - distance, pointerEvents: hidden ? "none" : "auto", visibility: hidden ? "hidden" : "visible" }}
              initial={false}
              animate={{
                x: `${offset * 64}%`,
                rotateY: offset * -34,
                z: -distance * 170,
                scale: 1 - distance * 0.05,
                opacity: hidden ? 0 : 1,
                filter: `brightness(${1 - distance * 0.28})`,
              }}
              transition={reduce || hidden ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 21, mass: 0.9 }}
            >
              <div
                className={cn(
                  "relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] border p-7 transition-colors duration-500",
                  focused
                    ? "border-sun/50 bg-gradient-to-br from-[#1B3A72] via-[#132B57] to-[#0D1F42] shadow-[0_50px_100px_-40px_color-mix(in_srgb,var(--sun)_55%,transparent)]"
                    : "border-white/10 bg-gradient-to-br from-[#142C58] to-[#0D1F42] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]",
                )}
              >
                <span aria-hidden="true" className="absolute -bottom-24 -end-20 -z-10 size-64 rounded-full bg-sun/25 blur-[70px]" />
                <span aria-hidden="true" className="display text-outline pointer-events-none absolute -end-3 -top-6 -z-10 text-[9rem] leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="grid size-14 place-items-center rounded-2xl bg-sun text-night shadow-[0_14px_34px_-14px_color-mix(in_srgb,var(--sun)_95%,transparent)]">
                  <Icon name={career.icon} className="size-7" />
                </span>
                <p className="mt-auto text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">
                  {labels.counter} {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </p>
                <h3 className="display mt-2 text-[1.75rem] leading-[1.05] text-white text-balance">{career.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-haze">{career.summary}</p>
                {focused ? (
                  <Link
                    href="/inscription"
                    tabIndex={focused ? 0 : -1}
                    className="group/cta mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white ps-5 pe-1.5 text-sm font-semibold text-night transition hover:bg-dawn"
                  >
                    {labels.register}
                    <span className="grid size-8 place-items-center rounded-full bg-sun transition group-hover/cta:translate-x-0.5">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {current.title}
      </p>

      {/* Filtres par famille : pilules contour, la pilule active en relief. */}
      <div className="mt-10 flex justify-center">
        <div role="group" aria-label={labels.filters} className="-mx-4 flex max-w-full items-center gap-3 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible">
          {[null, ...categories].map((category) => {
            const selected = filter === category;
            return (
              <button
                key={category ?? "tout"}
                type="button"
                onClick={() => choose(category)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex h-12 shrink-0 items-center gap-2 rounded-full border-2 px-6 font-rounded text-base font-bold transition duration-200",
                  selected
                    ? "-translate-x-0.5 -translate-y-0.5 border-night bg-[#3DD6AE] text-night shadow-[4px_4px_0_#fff]"
                    : "border-white/80 text-white hover:-translate-y-0.5 hover:border-white hover:bg-white/10",
                )}
              >
                {category ?? labels.all}
              </button>
            );
          })}
          {reduce || total < 2 ? null : (
            <button
              type="button"
              onClick={() => setStopped((value) => !value)}
              aria-label={stopped ? labels.play : labels.pause}
              className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-white/30 text-haze transition hover:border-white hover:text-white"
            >
              {stopped ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
