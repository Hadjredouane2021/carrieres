"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, GraduationCap, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/admin/kit-client";
import { CORE_LEVELS, EDUCATION_LIMIT, type EducationLevel } from "@/lib/education";
import { cn } from "@/lib/utils";
import { saveEducationLevels } from "@/server/actions/admin";

// Éditeur des niveaux d'études : aperçu de la liste déroulante, ordre, libellés, visibilité (libellés arabes conservés tels quels).
export function EducationEditor({ initial, counts }: { initial: EducationLevel[]; counts: Record<string, number> }) {
  const [levels, setLevels] = useState(initial);
  const visible = levels.filter((level) => level.visible);
  const custom = levels.filter((level) => !CORE_LEVELS.includes(level.value)).length;
  const invalid = levels.some((level) => !level.fr.trim());

  const update = (value: string, patch: Partial<EducationLevel>) => setLevels((list) => list.map((level) => (level.value === value ? { ...level, ...patch } : level)));
  const move = (index: number, step: number) =>
    setLevels((list) => {
      const target = index + step;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <form action={saveEducationLevels} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <input type="hidden" name="levels" value={JSON.stringify(levels)} />

      <section className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-night/[0.07] md:p-5" aria-label="Niveaux d'études">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-medium text-night">
              <GraduationCap className="size-5 text-sun-ink" aria-hidden="true" /> Niveau d&apos;études
            </h2>
            <p className="text-sm text-muted">
              {visible.length} proposé{visible.length > 1 ? "s" : ""} sur {levels.length}
            </p>
          </div>
          <button
            type="button"
            disabled={custom >= EDUCATION_LIMIT}
            onClick={() => setLevels((list) => [...list, { value: `N${Date.now().toString(36).toUpperCase()}`, fr: "Nouveau niveau", ar: "", visible: true }])}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 px-4 text-sm font-medium text-night transition hover:border-night/30 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" /> Ajouter un niveau
          </button>
        </div>

        <ol className="grid gap-2">
          {levels.map((level, index) => {
            const core = CORE_LEVELS.includes(level.value);
            const used = counts[level.value] ?? 0;
            return (
              <li
                key={level.value}
                className={cn(
                  "grid gap-3 rounded-xl border p-3 transition md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center",
                  level.visible ? "border-night/10 bg-white" : "border-dashed border-night/15 bg-mist/50",
                  !level.fr.trim() && "border-red-300",
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="display grid size-8 place-items-center rounded-lg bg-dawn text-xs text-sun-ink tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Monter ${level.fr}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === levels.length - 1} aria-label={`Descendre ${level.fr}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <label className="grid gap-1 text-xs text-muted">
                  Libellé
                  <input className="field h-10" value={level.fr} maxLength={80} onChange={(event) => update(level.value, { fr: event.target.value })} aria-invalid={!level.fr.trim()} />
                </label>
                <div className="flex items-center gap-1 md:justify-end">
                  <span className="me-1 text-xs tabular-nums text-muted" title="Inscriptions ayant choisi ce niveau">
                    {used} inscrit{used > 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => update(level.value, { visible: !level.visible })}
                    aria-pressed={level.visible}
                    className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition", level.visible ? "bg-emerald-50 text-emerald-800" : "bg-night/[0.06] text-muted")}
                  >
                    {level.visible ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                    {level.visible ? "Proposé" : "Masqué"}
                  </button>
                  {core || used > 0 ? (
                    <span className="grid size-9 place-items-center text-muted" title={core ? "Niveau d'origine : masquez-le plutôt que de le supprimer" : "Déjà choisi par des inscrits : masquez-le plutôt"}>
                      <Lock className="size-3.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLevels((list) => list.filter((item) => item.value !== level.value))}
                      aria-label={`Supprimer ${level.fr}`}
                      className="grid size-9 place-items-center rounded-full text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted">« Non concerné » est refusé pour les étudiants, jeunes diplômés et enseignants, même s&apos;il est proposé.</p>
      </section>

      <aside className="grid gap-4 xl:sticky xl:top-24">
        {/* Aperçu de la liste telle que la voit le participant. */}
        <section className="grid gap-2 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <h2 className="font-medium text-night">Aperçu</h2>
          <p className="text-sm font-medium text-night">Niveau d&apos;études</p>
          <div className="relative">
            <div className="flex h-11 items-center justify-between rounded-xl border border-night/15 px-4 text-sm text-muted">
              Choisir… <ChevronDown className="size-4" aria-hidden="true" />
            </div>
            <ul className="mt-1 grid max-h-72 overflow-y-auto rounded-xl border border-night/10 bg-white py-1 text-sm shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]">
              {visible.length ? (
                visible.map((level) => (
                  <li key={level.value} className="px-4 py-2 text-night">
                    {level.fr || "—"}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-red-700">Aucun niveau proposé</li>
              )}
            </ul>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          {invalid ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">Chaque niveau a besoin d&apos;un libellé.</p> : null}
          <SubmitButton variant="sun" className={cn("w-full", (invalid || !visible.length) && "pointer-events-none opacity-60")}>
            Enregistrer
          </SubmitButton>
          <button
            type="submit"
            name="reset"
            value="1"
            onClick={(event) => {
              if (!window.confirm("Revenir à la liste d'origine ? Les niveaux ajoutés seront retirés.")) event.preventDefault();
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm text-muted transition hover:bg-mist hover:text-night"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Liste d&apos;origine
          </button>
        </section>
      </aside>
    </form>
  );
}
