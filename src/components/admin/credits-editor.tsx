"use client";

import { ArrowDown, ArrowUp, ChevronDown, ImageIcon, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/admin/kit-client";
import { CREDITS_LIMIT, safeHttps, type CreditItem, type CreditsConfig } from "@/lib/credits";
import { cn } from "@/lib/utils";
import { saveCredits } from "@/server/actions/admin";

const blank = (): CreditItem => ({
  id: `credit-${Date.now().toString(36)}`,
  title: "Nouvelle image",
  credit: "",
  author: "",
  authorUrl: "",
  source: "",
  sourceLabel: "",
  license: "",
  licenseUrl: "",
  changes: "",
});

const urlFields = ["authorUrl", "source", "licenseUrl"] as const;

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1 text-xs text-muted", className)}>
      {label}
      {children}
    </label>
  );
}

// Éditeur de la page Crédits : textes de la page et fiches des images, réordonnables.
export function CreditsEditor({ initial }: { initial: CreditsConfig }) {
  const [page, setPage] = useState({ kicker: initial.kicker, intro: initial.intro, note: initial.note });
  const [items, setItems] = useState<CreditItem[]>(initial.items);
  const [open, setOpen] = useState<string | null>(null);
  const badUrl = (item: CreditItem) => urlFields.some((key) => item[key].trim() && !safeHttps(item[key]));
  const invalid = items.some((item) => !item.title.trim() || badUrl(item));

  const update = (id: string, patch: Partial<CreditItem>) => setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const move = (index: number, step: number) =>
    setItems((list) => {
      const target = index + step;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <form action={saveCredits} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <input type="hidden" name="credits" value={JSON.stringify({ ...page, items })} />

      <div className="grid min-w-0 gap-6">
        <section className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07] md:p-6">
          <h2 className="text-lg font-medium text-night">Textes de la page</h2>
          <Field label="Surtitre" className="max-w-xs">
            <input className="field h-10" value={page.kicker} maxLength={40} onChange={(event) => setPage({ ...page, kicker: event.target.value })} />
          </Field>
          <Field label="Introduction">
            <textarea className="field min-h-24" value={page.intro} maxLength={1000} onChange={(event) => setPage({ ...page, intro: event.target.value })} />
          </Field>
          <Field label="Mention en bas de page">
            <textarea className="field min-h-20" value={page.note} maxLength={1000} onChange={(event) => setPage({ ...page, note: event.target.value })} />
          </Field>
        </section>

        <section className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-night/[0.07] md:p-5" aria-label="Images créditées">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-night">Images créditées</h2>
              <p className="text-sm text-muted">
                {items.length} image{items.length > 1 ? "s" : ""} · {CREDITS_LIMIT} au maximum
              </p>
            </div>
            <button
              type="button"
              disabled={items.length >= CREDITS_LIMIT}
              onClick={() => {
                const item = blank();
                setItems((list) => [...list, item]);
                setOpen(item.id);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 px-4 text-sm font-medium text-night transition hover:border-night/30 disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden="true" /> Ajouter une image
            </button>
          </div>

          <ol className="grid gap-2">
            {items.map((item, index) => {
              const expanded = open === item.id;
              const error = !item.title.trim() || badUrl(item);
              return (
                <li key={item.id} className={cn("rounded-xl border transition", expanded ? "border-sun/60 shadow-[0_14px_30px_-22px_rgba(11,27,58,0.4)]" : "border-night/10", error && "border-red-300")}>
                  <div className="flex items-center gap-2 p-2.5">
                    <span className="display grid size-9 shrink-0 place-items-center rounded-lg bg-dawn text-xs text-sun-ink tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => setOpen(expanded ? null : item.id)} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-2 text-start">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-night">{item.title || "Sans titre"}</span>
                        <span className="block truncate text-xs text-muted">{[item.author, item.license].filter(Boolean).join(" · ") || "Auteur et licence à compléter"}</span>
                      </span>
                      <ChevronDown className={cn("size-4 shrink-0 text-muted transition", expanded && "rotate-180")} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Monter ${item.title}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Descendre ${item.title}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-night disabled:opacity-30">
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Retirer « ${item.title} » des crédits ?`)) setItems((list) => list.filter((entry) => entry.id !== item.id));
                      }}
                      aria-label={`Supprimer ${item.title}`}
                      className="grid size-8 place-items-center rounded-lg text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  {expanded ? (
                    <div className="grid gap-3 border-t border-night/[0.06] p-4 sm:grid-cols-2">
                      <Field label="Titre de l'image" className="sm:col-span-2">
                        <input className={cn("field h-10", !item.title.trim() && "border-red-300")} value={item.title} maxLength={160} onChange={(event) => update(item.id, { title: event.target.value })} />
                      </Field>
                      <Field label="Mention de crédit" className="sm:col-span-2">
                        <textarea className="field min-h-20" value={item.credit} maxLength={500} placeholder="Photo : Prénom Nom / Unsplash" onChange={(event) => update(item.id, { credit: event.target.value })} />
                      </Field>
                      <Field label="Auteur">
                        <input className="field h-10" value={item.author} maxLength={160} onChange={(event) => update(item.id, { author: event.target.value })} />
                      </Field>
                      <Field label="Lien de l'auteur (https)">
                        <input className={cn("field h-10", item.authorUrl && !safeHttps(item.authorUrl) && "border-red-300")} value={item.authorUrl} placeholder="https://…" onChange={(event) => update(item.id, { authorUrl: event.target.value })} />
                      </Field>
                      <Field label="Lien de la source (https)">
                        <input className={cn("field h-10", item.source && !safeHttps(item.source) && "border-red-300")} value={item.source} placeholder="https://…" onChange={(event) => update(item.id, { source: event.target.value })} />
                      </Field>
                      <Field label="Nom de la source">
                        <input className="field h-10" value={item.sourceLabel} maxLength={60} placeholder="Unsplash, Wikimedia Commons…" onChange={(event) => update(item.id, { sourceLabel: event.target.value })} />
                      </Field>
                      <Field label="Licence">
                        <input className="field h-10" value={item.license} maxLength={160} placeholder="Licence Unsplash, CC BY 4.0…" onChange={(event) => update(item.id, { license: event.target.value })} />
                      </Field>
                      <Field label="Lien de la licence (https)">
                        <input className={cn("field h-10", item.licenseUrl && !safeHttps(item.licenseUrl) && "border-red-300")} value={item.licenseUrl} placeholder="https://…" onChange={(event) => update(item.id, { licenseUrl: event.target.value })} />
                      </Field>
                      <Field label="Modifications apportées" className="sm:col-span-2">
                        <input className="field h-10" value={item.changes} maxLength={500} onChange={(event) => update(item.id, { changes: event.target.value })} />
                      </Field>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {items.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-mist/60 px-4 py-3 text-sm text-muted">
              <ImageIcon className="size-4" aria-hidden="true" /> Aucune image créditée : seuls l&apos;introduction et la mention seront affichées.
            </p>
          ) : null}
        </section>
      </div>

      <aside className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-night/[0.07] xl:sticky xl:top-24">
        <h2 className="font-medium text-night">Publication</h2>
        <p className="text-sm text-muted">Les modifications sont visibles sur la page Crédits dès l&apos;enregistrement.</p>
        {invalid ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">Chaque image a besoin d&apos;un titre, et les liens doivent commencer par https://.</p> : null}
        <SubmitButton variant="sun" className={cn("w-full", invalid && "pointer-events-none opacity-60")}>
          Enregistrer les crédits
        </SubmitButton>
        <button
          type="submit"
          name="reset"
          value="1"
          onClick={(event) => {
            if (!window.confirm("Revenir aux crédits d'origine ? Vos modifications seront perdues.")) event.preventDefault();
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm text-muted transition hover:bg-mist hover:text-night"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Crédits d&apos;origine
        </button>
      </aside>
    </form>
  );
}
