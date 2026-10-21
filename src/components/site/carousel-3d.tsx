"use client";

import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/site/icons";

export type CarouselItem = { id: string; title: string; body: string; icon: string };

const AUTOPLAY_MS = 4500;

/** Écart circulaire le plus court entre la carte et la carte active (−n/2 … n/2). */
function offsetOf(index: number, active: number, total: number) {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

export function Carousel3D({ items, labels }: { items: CarouselItem[]; labels: { previous: string; next: string; goTo: string } }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  const go = useCallback((step: number) => setActive((current) => (current + step + total) % total), [total]);

  useEffect(() => {
    if (reduce || paused || total < 2) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [go, paused, reduce, total]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  if (total === 0) return null;

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
      role="region"
      aria-roledescription="carrousel"
    >
      <motion.div
        className="relative mx-auto h-[23rem] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[22rem]"
        style={{ perspective: "1400px" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onDragEnd}
      >
        {items.map((item, index) => {
          const offset = offsetOf(index, active, total);
          const distance = Math.abs(offset);
          const hidden = distance > 2;
          return (
            <motion.article
              key={item.id}
              aria-hidden={offset !== 0}
              aria-roledescription="diapositive"
              aria-label={`${index + 1} / ${total}`}
              onClick={() => offset !== 0 && go(offset)}
              className="absolute inset-x-0 inset-y-0 mx-auto w-[min(82vw,22rem)]"
              style={{ transformStyle: "preserve-3d", zIndex: 10 - distance }}
              initial={false}
              animate={{
                x: `${offset * 62}%`,
                rotateY: offset * -38,
                z: -distance * 160,
                scale: 1 - distance * 0.06,
                opacity: hidden ? 0 : 1,
                filter: `brightness(${1 - distance * 0.25})`,
              }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
            >
              <div
                className={`flex h-full flex-col rounded-[1.75rem] border p-7 transition-colors duration-500 ${
                  offset === 0
                    ? "border-gold/40 bg-gradient-to-br from-[#1D3A70] to-[#0F2349] shadow-[0_40px_80px_-30px_rgba(216,181,122,0.45)]"
                    : "border-white/10 bg-gradient-to-br from-[#142C58] to-[#0D1F42] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
                }`}
              >
                <div className="flex items-center justify-between text-gold">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gold/15">
                    <Icon name={item.icon} className="size-6" />
                  </span>
                  <span className="display text-3xl text-white/15">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-auto text-2xl text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-beige/75">{item.body}</p>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className="grid size-11 place-items-center rounded-full border border-white/15 text-beige transition hover:border-gold hover:text-gold">
          <ChevronLeft className="size-5 rtl:-scale-x-100" />
        </button>
        <div className="flex gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${labels.goTo} ${index + 1}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all duration-500 ${index === active ? "w-8 bg-gold" : "w-2 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={labels.next} className="grid size-11 place-items-center rounded-full border border-white/15 text-beige transition hover:border-gold hover:text-gold">
          <ChevronRight className="size-5 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
