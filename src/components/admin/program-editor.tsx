"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { formatDuration, PROGRAM_TONES, toMinutes } from "@/lib/program-tones";
import { cn } from "@/lib/utils";

// Horaires du créneau, avec la durée calculée à la volée et un contrôle fin > début.
export function TimeRange({ start, end }: { start: string; end: string }) {
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const a = toMinutes(from);
  const b = toMinutes(to);
  const duration = a !== null && b !== null ? b - a : null;
  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-medium text-night">Horaire</span>
      <div className="flex items-center gap-2 rounded-2xl border border-night/10 bg-mist/40 p-1.5">
        <label className="relative flex-1">
          <span className="sr-only">Début</span>
          <Clock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input className="field border-0 bg-white ps-9 shadow-sm" type="time" name="startTime" value={from} onChange={(event) => setFrom(event.target.value)} required />
        </label>
        <span className="text-muted" aria-hidden="true">→</span>
        <label className="relative flex-1">
          <span className="sr-only">Fin</span>
          <input className="field border-0 bg-white shadow-sm" type="time" name="endTime" value={to} onChange={(event) => setTo(event.target.value)} required />
        </label>
        <span
          className={cn(
            "hidden min-w-20 rounded-xl px-3 py-2 text-center text-xs font-semibold sm:block",
            duration === null ? "bg-white text-muted" : duration > 0 ? "bg-dawn text-sun-ink" : "bg-red-50 text-red-700",
          )}
        >
          {duration === null ? "—" : duration > 0 ? formatDuration(duration) : "Fin < début"}
        </span>
      </div>
      {duration !== null && duration <= 0 ? <span className="text-xs text-red-700">L&apos;heure de fin doit suivre l&apos;heure de début.</span> : null}
    </div>
  );
}

// Type d'activité en pastilles colorées, mêmes couleurs que la frise.
export function CategoryPicker({ value }: { value: string }) {
  const [current, setCurrent] = useState(value);
  return (
    <fieldset className="grid gap-1.5 text-sm">
      <legend className="mb-1.5 font-medium text-night">Type d&apos;activité</legend>
      <div className="flex flex-wrap gap-1.5">
        {PROGRAM_CATEGORIES.map((category) => {
          const tone = PROGRAM_TONES[category.value] ?? PROGRAM_TONES.plenary;
          const active = current === category.value;
          return (
            <label
              key={category.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
                active ? "border-night bg-night text-white shadow-md" : "border-night/10 bg-white text-night hover:border-night/30",
              )}
            >
              <input type="radio" name="category" value={category.value} checked={active} onChange={() => setCurrent(category.value)} className="sr-only" />
              <span className={cn("size-2 rounded-full", tone.dot)} aria-hidden="true" />
              {category.fr}
            </label>
          );
        })}
      </div>
      {current === "workshop" || current === "roundtable" ? (
        <span className="text-xs text-muted">Publié, ce créneau sera proposé au choix lors de l&apos;inscription.</span>
      ) : null}
    </fieldset>
  );
}
