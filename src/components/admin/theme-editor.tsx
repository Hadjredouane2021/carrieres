"use client";

import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/admin/kit-client";
import { FONT_OPTIONS, FONT_ROLES, type FontRole } from "@/lib/font-options";
import { COLOR_GROUPS, contrast, DEFAULT_THEME, safeHex, THEME_PRESETS, type ThemeColors, type ThemeConfig } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { saveTheme } from "@/server/actions/admin";

const mix = (color: string, other: string, share: number) => `color-mix(in srgb, ${color} ${share}%, ${other})`;

// Paires fond / texte contrôlées : seuil WCAG AA (4,5:1) pour le texte courant.
const CHECKS: { bg: keyof ThemeColors | "white"; fg: keyof ThemeColors; label: string; min?: number }[] = [
  { bg: "header", fg: "headerText", label: "Menu" },
  { bg: "sections", fg: "sectionsText", label: "Sections sombres (texte secondaire)" },
  { bg: "white", fg: "text", label: "Texte courant" },
  { bg: "white", fg: "muted", label: "Texte secondaire" },
  { bg: "cta", fg: "ctaText", label: "Bloc inscription" },
  { bg: "footer", fg: "footerText", label: "Pied de page" },
  { bg: "sections", fg: "accent", label: "Accent sur les sections sombres", min: 3 },
];

// Éditeur du thème : toutes les couleurs par zone, polices par rôle, palettes prêtes, aperçu et alertes de lisibilité.
export function ThemeEditor({ initial, families }: { initial: ThemeConfig; families: Record<string, string> }) {
  const [theme, setTheme] = useState(initial);
  const [drafts, setDrafts] = useState<Partial<Record<keyof ThemeColors, string>>>({});
  const colors: ThemeColors = theme;
  const font = (role: FontRole) => families[theme.fonts[role]] ?? "inherit";

  const setColor = (key: keyof ThemeColors, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }));
    setDrafts((current) => ({ ...current, [key]: undefined }));
  };
  const typeColor = (key: keyof ThemeColors, value: string) => {
    setDrafts((current) => ({ ...current, [key]: value }));
    const hex = safeHex(value.startsWith("#") ? value : `#${value}`);
    if (hex) setTheme((current) => ({ ...current, [key]: hex }));
  };
  const warnings = CHECKS.filter(({ bg, fg, min = 4.5 }) => contrast(bg === "white" ? "#ffffff" : colors[bg], colors[fg]) < min).map(
    ({ label }) => `${label} : contraste insuffisant, le texte sera difficile à lire.`,
  );

  return (
    <form action={saveTheme} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <input type="hidden" name="theme" value={JSON.stringify(theme)} />

      {/* Aperçu du site avec les couleurs et polices choisies. */}
      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-night/[0.07] xl:sticky xl:top-24" aria-label="Aperçu">
        <p className="border-b border-night/[0.06] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Aperçu</p>
        <div className="p-4 sm:p-5" style={{ fontFamily: font("sans") }}>
          <div className="overflow-hidden rounded-xl ring-1 ring-night/10">
            <div className="flex items-center gap-4 px-4 py-3" style={{ background: colors.header, color: colors.headerText }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-assurcarriere.png" alt="" width={466} height={187} className="h-6 w-auto brightness-0 invert" />
              <div className="hidden flex-1 gap-4 text-xs sm:flex">
                <span className="relative">
                  Le Forum
                  <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full" style={{ background: colors.accent }} />
                </span>
                <span style={{ opacity: 0.7 }}>Programme</span>
                <span style={{ opacity: 0.7 }}>Métiers</span>
              </div>
              <span className="ms-auto rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: colors.accent, color: colors.sections }}>
                Je m&apos;inscris
              </span>
            </div>
            <div className="relative overflow-hidden px-5 py-8 text-white" style={{ background: colors.sections }}>
              <span aria-hidden="true" className="absolute -end-10 -top-16 size-48 rounded-full blur-3xl" style={{ background: mix(colors.accent, "transparent", 35) }} />
              <p className="relative text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: colors.accent }}>
                Section sombre
              </p>
              <p className="relative mt-2 text-2xl leading-tight tracking-tight" style={{ fontFamily: font("display") }}>
                Choisis ton{" "}
                <span className="italic" style={{ color: colors.accent, fontFamily: font("accent") }}>
                  avenir
                </span>
              </p>
              <p className="relative mt-2 text-sm" style={{ color: colors.sectionsText }}>
                Découvre les métiers et rencontre les entreprises du secteur.
              </p>
              <span className="relative mt-4 inline-flex rounded-full px-4 py-2 text-xs font-semibold" style={{ background: colors.accent, color: colors.sections }}>
                Découvrir le programme
              </span>
            </div>
            <div className="px-5 py-6" style={{ background: colors.cream }}>
              <p className="text-xl tracking-tight" style={{ color: colors.sections, fontFamily: font("display") }}>
                Section claire
              </p>
              <p className="mt-1 text-sm" style={{ color: colors.text }}>
                Texte courant d&apos;un paragraphe.
              </p>
              <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                Texte secondaire, légendes et aides.
              </p>
              <span
                className="mt-3 inline-flex rounded-full border-2 px-4 py-1.5 text-xs font-bold"
                style={{ fontFamily: font("rounded"), borderColor: colors.sections, background: "#3DD6AE", color: colors.sections, boxShadow: `3px 3px 0 ${colors.sections}` }}
              >
                Tech &amp; data
              </span>
            </div>
            <div className="px-5 py-6 text-center" style={{ background: colors.cta, color: colors.ctaText }}>
              <p className="text-lg tracking-tight" style={{ fontFamily: font("display") }}>
                Votre place vous{" "}
                <span className="italic" style={{ color: colors.accent, fontFamily: font("accent") }}>
                  attend
                </span>
              </p>
              <span className="mt-3 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: colors.accent, color: colors.sections }}>
                Je réserve ma place
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs" style={{ background: colors.footer, color: colors.footerText }}>
              <span>© Fédération Marocaine de l&apos;Assurance</span>
              <span className="flex gap-3" style={{ opacity: 0.75 }}>
                <span>Mentions légales</span>
                <span>Crédits</span>
              </span>
            </div>
          </div>
          {warnings.length ? (
            <div className="mt-4 grid gap-2">
              {warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {warning}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="grid gap-4">
        <section className="grid gap-2 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <h2 className="font-medium text-night">Palettes prêtes</h2>
          <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
            {THEME_PRESETS.map((preset) => {
              const selected = (Object.keys(preset.colors) as (keyof ThemeColors)[]).every((key) => preset.colors[key] === colors[key]);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setTheme((current) => ({ ...current, ...preset.colors }));
                    setDrafts({});
                  }}
                  aria-pressed={selected}
                  className={cn("flex items-center gap-3 rounded-xl border px-3 py-2 text-start text-sm transition", selected ? "border-sun bg-dawn" : "border-night/10 hover:border-night/25")}
                >
                  <span className="flex -space-x-1.5" aria-hidden="true">
                    {[preset.colors.header, preset.colors.sections, preset.colors.accent, preset.colors.cream, preset.colors.footer].map((color, index) => (
                      <span key={index} className="size-5 rounded-full ring-2 ring-white" style={{ background: color }} />
                    ))}
                  </span>
                  <span className="flex-1 text-night">{preset.name}</span>
                  {selected ? <Check className="size-4 text-sun-ink" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        {COLOR_GROUPS.map((group) => (
          <section key={group.title} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            <h2 className="font-medium text-night">{group.title}</h2>
            {group.fields.map(({ key, label, hint }) => {
              const draft = drafts[key];
              return (
                <div key={key} className="grid gap-1">
                  <label htmlFor={`couleur-${key}`} className="text-sm text-night">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`couleur-${key}`}
                      type="color"
                      value={colors[key]}
                      onChange={(event) => setColor(key, event.target.value)}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-night/15 bg-white p-1"
                    />
                    <input
                      aria-label={`${group.title} — ${label} (hexadécimal)`}
                      className={cn("field h-10 font-mono uppercase", draft !== undefined && !safeHex(`#${draft.replace(/^#/, "")}`) && "border-red-300")}
                      value={draft ?? colors[key]}
                      maxLength={7}
                      onChange={(event) => typeColor(key, event.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted">{hint}</p>
                </div>
              );
            })}
          </section>
        ))}

        <section className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <h2 className="font-medium text-night">Polices</h2>
          {FONT_ROLES.map(({ role, label, hint, sample }) => (
            <div key={role} className="grid gap-1">
              <label htmlFor={`police-${role}`} className="text-sm text-night">
                {label}
              </label>
              <select
                id={`police-${role}`}
                className="field h-11 py-0 leading-normal"
                value={theme.fonts[role]}
                onChange={(event) => setTheme((current) => ({ ...current, fonts: { ...current.fonts, [role]: event.target.value } }))}
              >
                {FONT_OPTIONS[role].map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className={cn("truncate text-lg text-night", role === "accent" && "italic")} style={{ fontFamily: font(role) }}>
                {sample}
              </p>
              <p className="text-xs text-muted">{hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <SubmitButton variant="sun" className="w-full">
            Enregistrer
          </SubmitButton>
          <button
            type="submit"
            name="reset"
            value="1"
            onClick={(event) => {
              if (!window.confirm("Revenir aux couleurs et polices d'origine ?")) event.preventDefault();
              else setTheme(DEFAULT_THEME);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm text-muted transition hover:bg-mist hover:text-night"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Couleurs et polices d&apos;origine
          </button>
        </section>
      </aside>
    </form>
  );
}
