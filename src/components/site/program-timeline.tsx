"use client";

import { MapPin, Mic } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: string;
  speakerName: string;
  category: string;
  categoryLabel: string;
};

// Les temps forts sont mis en avant ; accueil, pauses et clôture restent plus discrets.
const KEY_MOMENTS = new Set(["plenary", "roundtable", "workshop"]);

export function ProgramTimeline({
  items,
  filterable = false,
  labels,
}: {
  items: TimelineItem[];
  filterable?: boolean;
  // count : gabarit avec {n}, une fonction ne pouvant pas traverser la frontière serveur/client.
  labels: { all: string; filter: string; count: string };
}) {
  const [category, setCategory] = useState("all");
  const categories = [...new Map(items.map((item) => [item.category, item.categoryLabel])).entries()];
  const showFilters = filterable && categories.length > 1;
  const visible = category === "all" ? items : items.filter((item) => item.category === category);

  return (
    <div>
      {showFilters ? (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label={labels.filter} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {[["all", labels.all] as const, ...categories].map(([value, label]) => {
              const active = category === value;
              const count = value === "all" ? items.length : items.filter((item) => item.category === value).length;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                    active ? "border-night bg-night text-white" : "border-night/15 bg-white text-night hover:border-night/40",
                  )}
                >
                  {label}
                  <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-sun text-night" : "bg-night/[0.06] text-muted")}>{count}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted" aria-live="polite">
            {labels.count.replace("{n}", String(visible.length))}
          </p>
        </div>
      ) : null}

      {/* Rail vertical : grands horaires, temps forts en cartes nuit, moments logistiques en lignes discrètes. */}
      <ol className="relative">
        <span aria-hidden="true" className="absolute inset-y-4 start-[5.25rem] w-px bg-gradient-to-b from-sun via-night/15 to-night/5 sm:start-[9.25rem]" />
        {visible.map((item) => {
          const key = KEY_MOMENTS.has(item.category);
          return (
            <li key={item.id} className="scroll-reveal relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-6 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-10">
              <div className={cn("text-end", key ? "pt-6 sm:pt-7" : "pt-4")} dir="ltr">
                <time className={cn("display block tabular-nums leading-none", key ? "text-[1.7rem] text-night sm:text-5xl" : "text-xl text-night/55 sm:text-3xl")}>
                  {item.startTime}
                </time>
                <span className="mt-1.5 block text-xs tabular-nums text-muted sm:text-sm">{item.endTime}</span>
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute start-[calc(5.25rem-6px)] size-3 rounded-full ring-4 ring-white sm:start-[calc(9.25rem-6px)]",
                  key ? "top-9 bg-sun sm:top-10" : "top-6 bg-night/25",
                )}
              />
              <div
                className={cn(
                  "min-w-0",
                  key
                    ? "surface-dark relative isolate overflow-clip rounded-[1.5rem] bg-night p-5 text-white transition duration-300 hover:shadow-[0_30px_70px_-34px_rgba(11,27,58,0.7)] sm:p-7"
                    : "py-3",
                )}
              >
                {key ? <span aria-hidden="true" className="absolute -end-16 -top-16 -z-10 size-48 rounded-full bg-sun/25 blur-[60px]" /> : null}
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                    key ? "bg-sun text-night" : "bg-night/[0.06] text-night/70",
                  )}
                >
                  {item.categoryLabel}
                </span>
                <h3 className={cn("mt-3 font-semibold leading-snug", key ? "display text-2xl font-normal text-white sm:text-3xl" : "text-lg text-night")}>{item.title}</h3>
                {item.description ? <p className={cn("mt-2 max-w-2xl leading-7", key ? "text-haze" : "text-muted")}>{item.description}</p> : null}
                {item.location || item.speakerName ? (
                  <p className={cn("mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm", key ? "text-white/80" : "text-night/70")}>
                    {item.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className={cn("size-4", key ? "text-sun" : "text-sun-ink")} aria-hidden="true" />
                        {item.location}
                      </span>
                    ) : null}
                    {item.speakerName ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mic className={cn("size-4", key ? "text-sun" : "text-sun-ink")} aria-hidden="true" />
                        {item.speakerName}
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
