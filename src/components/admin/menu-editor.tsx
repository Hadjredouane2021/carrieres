"use client";

import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Link2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/admin/kit-client";
import { MENU_LIMIT, isExternal, safeMenuHref, type MenuConfig, type MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { saveMenu } from "@/server/actions/admin";

// Éditeur du menu public : aperçu de l'en-tête en direct, liens réordonnables, bouton d'appel.
export function MenuEditor({ initial }: { initial: MenuConfig }) {
  const [items, setItems] = useState<MenuItem[]>(initial.items);
  const [cta, setCta] = useState(initial.cta);
  const visible = items.filter((item) => item.visible);
  const invalid = items.some((item) => !item.label.trim() || !safeMenuHref(item.href)) || (cta.visible && (!cta.label.trim() || !safeMenuHref(cta.href)));

  const update = (id: string, patch: Partial<MenuItem>) => setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const move = (index: number, step: number) =>
    setItems((list) => {
      const next = [...list];
      const target = index + step;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const add = () =>
    setItems((list) => [...list, { id: `lien-${Date.now().toString(36)}`, label: "Nouveau lien", href: "/", visible: true, footer: true }]);

  return (
    <div className="grid gap-6">
      {/* Aperçu de l'en-tête public. */}
      <section className="overflow-hidden rounded-2xl bg-night ring-1 ring-night/[0.07]" aria-label="Aperçu de l'en-tête">
        <p className="border-b border-white/10 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-haze">Aperçu de l&apos;en-tête</p>
        <div className="flex items-center gap-4 overflow-x-auto px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-assurcarriere.png" alt="" width={466} height={187} className="h-8 w-auto shrink-0 brightness-0 invert" />
          <div className="flex flex-1 items-center gap-1">
            {visible.length ? (
              visible.map((item, index) => (
                <span key={item.id} className={cn("relative inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm", index === 0 ? "text-white" : "text-white/70")}>
                  {item.label || "—"}
                  {isExternal(item.href) ? <ExternalLink className="size-3" aria-hidden="true" /> : null}
                  {index === 0 ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-sun" /> : null}
                </span>
              ))
            ) : (
              <span className="text-sm text-red-300">Aucun lien visible</span>
            )}
          </div>
          {cta.visible ? <span className="shrink-0 rounded-full bg-sun px-4 py-2 text-sm font-semibold text-night">{cta.label || "—"}</span> : null}
        </div>
      </section>

      <form action={saveMenu} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <input type="hidden" name="menu" value={JSON.stringify({ items, cta })} />

        <section className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-night/[0.07] md:p-5" aria-label="Liens du menu">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-night">Liens du menu</h2>
              <p className="text-sm text-muted">
                {visible.length} visible{visible.length > 1 ? "s" : ""} sur {items.length} · {MENU_LIMIT} liens au maximum
              </p>
            </div>
            <button
              type="button"
              onClick={add}
              disabled={items.length >= MENU_LIMIT}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 px-4 text-sm font-medium text-night transition hover:border-night/30 disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden="true" /> Ajouter un lien
            </button>
          </div>

          <ol className="grid gap-2">
            {items.map((item, index) => {
              const hrefOk = Boolean(safeMenuHref(item.href));
              return (
                <li
                  key={item.id}
                  className={cn("grid gap-3 rounded-xl border p-3 transition md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center", item.visible ? "border-night/10 bg-white" : "border-dashed border-night/15 bg-mist/50")}
                >
                  <div className="flex items-center gap-1">
                    <span className="display grid size-8 place-items-center rounded-lg bg-dawn text-xs text-sun-ink tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Monter ${item.label}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Descendre ${item.label}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <label className="grid gap-1 text-xs text-muted">
                    Libellé
                    <input className="field h-10" value={item.label} maxLength={40} onChange={(event) => update(item.id, { label: event.target.value })} aria-invalid={!item.label.trim()} />
                  </label>
                  <label className="grid gap-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      Lien {item.key ? <span className="rounded bg-mist px-1.5 text-[10px] text-institution">page d&apos;origine</span> : null}
                    </span>
                    <span className="relative">
                      <Link2 className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
                      <input
                        className={cn("field h-10 ps-8", !hrefOk && "border-red-300")}
                        value={item.href}
                        maxLength={300}
                        placeholder="/page ou https://…"
                        onChange={(event) => update(item.id, { href: event.target.value })}
                        aria-invalid={!hrefOk}
                      />
                    </span>
                  </label>
                  <div className="flex items-center gap-1 md:justify-end">
                    <button
                      type="button"
                      onClick={() => update(item.id, { visible: !item.visible })}
                      aria-pressed={item.visible}
                      className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition", item.visible ? "bg-emerald-50 text-emerald-800" : "bg-night/[0.06] text-muted")}
                    >
                      {item.visible ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                      {item.visible ? "Visible" : "Masqué"}
                    </button>
                    <button
                      type="button"
                      onClick={() => update(item.id, { footer: !item.footer })}
                      aria-pressed={item.footer}
                      title="Afficher aussi dans la colonne « Découvrir » du pied de page"
                      className={cn("inline-flex h-9 items-center rounded-full px-3 text-xs font-medium transition", item.footer ? "bg-dawn text-sun-ink" : "bg-night/[0.06] text-muted")}
                    >
                      Pied de page
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((list) => list.filter((entry) => entry.id !== item.id))}
                      aria-label={`Supprimer ${item.label}`}
                      className="grid size-9 place-items-center rounded-full text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted">Liens acceptés : une page du site (« /programme »), une ancre (« #contact ») ou une adresse externe en https, ouverte dans un nouvel onglet.</p>
        </section>

        <aside className="grid gap-4 xl:sticky xl:top-24">
          <section className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium text-night">Bouton d&apos;appel</h2>
              <button
                type="button"
                onClick={() => setCta((value) => ({ ...value, visible: !value.visible }))}
                aria-pressed={cta.visible}
                className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition", cta.visible ? "bg-emerald-50 text-emerald-800" : "bg-night/[0.06] text-muted")}
              >
                {cta.visible ? "Affiché" : "Masqué"}
              </button>
            </div>
            <label className="grid gap-1 text-xs text-muted">
              Texte du bouton
              <input className="field h-10" value={cta.label} maxLength={30} onChange={(event) => setCta((value) => ({ ...value, label: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-xs text-muted">
              Lien
              <input className="field h-10" value={cta.href} maxLength={300} onChange={(event) => setCta((value) => ({ ...value, href: event.target.value }))} />
            </label>
          </section>

          <section className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
            {invalid ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">Complétez les libellés et corrigez les liens en rouge avant d&apos;enregistrer.</p> : null}
            <SubmitButton variant="sun" className={cn("w-full", (invalid || !visible.length) && "pointer-events-none opacity-60")}>
              Enregistrer le menu
            </SubmitButton>
            <button
              type="submit"
              name="reset"
              value="1"
              formNoValidate
              onClick={(event) => {
                if (!window.confirm("Revenir au menu d'origine ? Vos libellés et liens personnalisés seront perdus.")) event.preventDefault();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm text-muted transition hover:bg-mist hover:text-night"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Menu d&apos;origine
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
}
