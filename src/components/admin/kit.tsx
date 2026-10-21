import { Pencil, X } from "lucide-react";
import { DeleteForm } from "@/components/admin/kit-client";
import { cn } from "@/lib/utils";

// Composants d'écran du back-office : plus sobres que le site public, mêmes couleurs et mêmes rayons.

export function AdminHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{eyebrow}</p> : null}
        <h1 className="display mt-1 text-3xl text-night md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(11,27,58,0.06)] ring-1 ring-night/[0.07] md:p-6", className)}>
      {title ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-night">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminField({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm", className)}>
      <span className="font-medium text-night">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function PublishedToggle({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-night/10 px-3 py-2.5 text-sm text-night has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
      <input type="checkbox" name="published" defaultChecked={defaultChecked} className="size-4 accent-[#0b1b3a]" />
      Publié sur le site
    </label>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        published ? "bg-emerald-50 text-emerald-800" : "bg-night/[0.06] text-muted",
      )}
    >
      <span className={cn("size-1.5 rounded-full", published ? "bg-emerald-500" : "bg-muted")} aria-hidden="true" />
      {published ? "Publié" : "Masqué"}
    </span>
  );
}

// En-tête du formulaire d'édition : création ou modification, avec retour à la création.
export function FormTitle({ editing, noun }: { editing?: string | null; noun: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-night">{editing ? `Modifier « ${editing} »` : `Ajouter ${noun}`}</h2>
      {editing ? (
        <a href="?" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-mist hover:text-night">
          <X className="size-4" aria-hidden="true" />
          Annuler la modification
        </a>
      ) : null}
    </div>
  );
}

export type ListItem = { id: string; title: string; meta?: string; published?: boolean; thumbnail?: string | null };

export function ItemList({
  items,
  currentId,
  deleteAction,
  empty,
}: {
  items: ListItem[];
  currentId?: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  empty: string;
}) {
  if (!items.length) return <p className="rounded-2xl border border-dashed border-night/15 px-5 py-8 text-center text-sm text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-night/[0.07] overflow-hidden rounded-2xl bg-white ring-1 ring-night/[0.07]">
      {items.map((item) => (
        <li key={item.id} className={cn("flex items-center gap-3 px-4 py-3 transition", item.id === currentId ? "bg-dawn" : "hover:bg-mist/60")}>
          {item.thumbnail !== undefined ? (
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-mist">
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumbnail} alt="" className="size-full object-cover" />
              ) : null}
            </span>
          ) : null}
          <a href={`?id=${item.id}`} className="min-w-0 flex-1" aria-current={item.id === currentId ? "true" : undefined}>
            <span className="block truncate font-medium text-night">{item.title}</span>
            {item.meta ? <span className="block truncate text-xs text-muted">{item.meta}</span> : null}
          </a>
          {item.published !== undefined ? <StatusBadge published={item.published} /> : null}
          <a href={`?id=${item.id}`} aria-label={`Modifier ${item.title}`} className="grid size-9 place-items-center rounded-full text-institution transition hover:bg-mist">
            <Pencil className="size-4" aria-hidden="true" />
          </a>
          <DeleteForm action={deleteAction} id={item.id} label={item.title} />
        </li>
      ))}
    </ul>
  );
}

// Disposition commune des écrans de contenu : formulaire à gauche, liste à droite sur grand écran.
export function EditorLayout({ form, list }: { form: React.ReactNode; list: React.ReactNode }) {
  return <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">{form}<div className="grid gap-3 xl:sticky xl:top-24">{list}</div></div>;
}

// Choix d'icône : liste fermée des icônes connues, la valeur actuelle reste sélectionnable même si elle est inconnue.
export function IconSelect({ names, value }: { names: string[]; value: string }) {
  const options = names.includes(value) ? names : [value, ...names];
  return (
    <select className="field" name="icon" defaultValue={value}>
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

export function BilingualFields({
  fr,
  ar,
}: {
  fr: React.ReactNode;
  ar: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fr}
      {ar}
    </div>
  );
}
