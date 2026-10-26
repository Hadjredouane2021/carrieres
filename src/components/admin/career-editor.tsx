"use client";

import { useState } from "react";
import { AdminField, BilingualFields } from "@/components/admin/kit";
import { Icon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const SUMMARY_IDEAL = 140;

function Counter({ value, ideal }: { value: string; ideal: number }) {
  const length = value.trim().length;
  return (
    <span className={cn("text-xs tabular-nums", length > ideal ? "text-amber-700" : "text-muted")}>
      {length} / {ideal} caractères conseillés
    </span>
  );
}

// Champs du métier avec aperçu en direct de la carte affichée sur le site.
export function CareerEditorFields({
  names,
  number,
  initial,
}: {
  names: string[];
  number: number;
  initial: { titleFr: string; titleAr: string; summaryFr: string; summaryAr: string; icon: string };
}) {
  const [title, setTitle] = useState(initial.titleFr);
  const [summary, setSummary] = useState(initial.summaryFr);
  const [icon, setIcon] = useState(initial.icon);
  const options = names.includes(icon) ? names : [icon, ...names];

  return (
    <div className="grid gap-5">
      <div className="relative overflow-hidden rounded-2xl bg-night p-5 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -end-12 -top-14 size-44 rounded-full bg-sun/30 blur-3xl" />
        <span aria-hidden="true" className="display text-outline pointer-events-none absolute -bottom-4 end-3 text-7xl leading-none">
          {String(number).padStart(2, "0")}
        </span>
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">Aperçu sur le site</p>
        <div className="relative mt-4 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun text-night shadow-[0_12px_30px_-12px_rgba(255,122,26,0.9)]">
            <Icon name={icon} className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="display text-2xl leading-tight">{title || "Intitulé du métier"}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-haze">{summary || "Le résumé de la mission apparaîtra ici."}</p>
          </div>
        </div>
      </div>

      <BilingualFields
        fr={
          <AdminField label="Intitulé">
            <input className="field" name="titleFr" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Actuariat" required />
          </AdminField>
        }
        ar={
          <AdminField label="Intitulé (arabe)">
            <input className="field" name="titleAr" dir="rtl" defaultValue={initial.titleAr} />
          </AdminField>
        }
      />
      <BilingualFields
        fr={
          <label className="grid content-start gap-1.5 text-sm">
            <span className="font-medium text-night">Résumé de la mission</span>
            <textarea className="field min-h-28" name="summaryFr" value={summary} onChange={(event) => setSummary(event.target.value)} required />
            <Counter value={summary} ideal={SUMMARY_IDEAL} />
          </label>
        }
        ar={
          <AdminField label="Résumé (arabe)">
            <textarea className="field min-h-28" name="summaryAr" dir="rtl" defaultValue={initial.summaryAr} />
          </AdminField>
        }
      />

      <fieldset className="grid gap-2 text-sm">
        <legend className="mb-1 font-medium text-night">Icône</legend>
        <div className="grid grid-cols-7 gap-1.5">
          {options.map((name) => (
            <label
              key={name}
              title={name}
              className={cn(
                "grid aspect-square cursor-pointer place-items-center rounded-xl border transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun",
                icon === name ? "border-night bg-night text-sun shadow-md" : "border-night/10 bg-white text-institution hover:border-night/30 hover:text-night",
              )}
            >
              <input type="radio" name="icon" value={name} checked={icon === name} onChange={() => setIcon(name)} className="sr-only" />
              <Icon name={name} className="size-[18px]" />
              <span className="sr-only">{name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
