import { Pencil, X } from "lucide-react";
import { DeleteForm, PublishedSwitch } from "@/components/admin/kit-client";
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
  return <PublishedSwitch defaultChecked={defaultChecked} />;
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
  // Le back-office n'affiche que le français : les champs arabes restent dans le formulaire, cachés,
  // pour renvoyer tels quels les textes déjà traduits au lieu de les effacer.
  return (
    <div className="grid gap-4">
      {fr}
      <div hidden>{ar}</div>
    </div>
  );
}

export type Stat = { label: string; value: string; hint?: string; icon: React.ComponentType<{ className?: string }>; alert?: boolean };

// Rangée d'indicateurs en tête des écrans du back-office.
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(({ label, value, hint, icon: StatIcon, alert }) => (
        <article key={label} className={cn("rounded-2xl bg-white p-4 ring-1 ring-night/[0.07]", alert && "bg-amber-50 ring-amber-200")}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted">{label}</p>
            <span className={cn("grid size-8 place-items-center rounded-xl", alert ? "bg-amber-100 text-amber-700" : "bg-dawn text-sun-ink")}>
              <StatIcon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="display mt-2 truncate text-2xl text-night tabular-nums md:text-3xl">{value}</p>
          {hint ? <p className={cn("mt-0.5 truncate text-xs", alert ? "text-amber-800" : "text-muted")}>{hint}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function EmptyBlock({ icon: EmptyIcon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
        <EmptyIcon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-medium text-night">{title}</p>
      <p className="max-w-sm text-sm text-muted">{text}</p>
    </div>
  );
}

// En-tête de l'éditeur latéral : création ou modification, avec retour à la création.
export function EditorHead({ editing, kicker, title, cancelHref }: { editing: boolean; kicker: string; title: string; cancelHref: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-night/[0.07] px-5 py-4 md:px-6">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{editing ? "Modification" : kicker}</p>
        <h2 className="display mt-1 truncate text-xl text-night">{title}</h2>
      </div>
      {editing ? (
        <a href={cancelHref} aria-label="Annuler la modification" className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-night">
          <X className="size-4" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
