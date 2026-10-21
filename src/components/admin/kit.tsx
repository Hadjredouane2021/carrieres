import { ArrowUpRight, Eye, EyeOff, PenLine, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Carte de formulaire : titre, sous-titre et contenu. */
export function Panel({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("admin-card p-5 md:p-6", className)}>
      <div className="mb-5 flex items-start gap-3">
        {icon ? <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold/15 text-[#8A6A33]">{icon}</span> : null}
        <div>
          <h2 className="font-medium text-night">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-institution">{description}</p> : null}
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function FormField({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="font-medium text-night">{label}</span>
      {children}
      {hint ? <span className="text-xs text-institution/80">{hint}</span> : null}
    </label>
  );
}

/** Paire de champs français / arabe côte à côte. */
export function LangFields({
  label,
  name,
  fr,
  ar,
  multiline = false,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  fr?: string;
  ar?: string;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-medium text-night">{label}</span>
      <div className="grid gap-2 md:grid-cols-2">
        <span className="relative">
          <span className="pointer-events-none absolute end-3 top-3 rounded-md bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-institution">FR</span>
          <Input className={cn("field pe-12", multiline && "min-h-28")} name={`${name}Fr`} defaultValue={fr} required={required} placeholder={placeholder} />
        </span>
        <span className="relative">
          <span className="pointer-events-none absolute start-3 top-3 rounded-md bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-institution">AR</span>
          <Input className={cn("field ps-12", multiline && "min-h-28")} name={`${name}Ar`} dir="rtl" defaultValue={ar} />
        </span>
      </div>
    </div>
  );
}

/** Interrupteur « Publié » en pur CSS (case à cocher stylée). */
export function PublishedToggle({ checked, name = "published", label = "Publié sur le site" }: { checked: boolean; name?: string; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-mist/70 px-4 py-3 text-sm text-night">
      {label}
      <span className="relative inline-flex">
        <input type="checkbox" name={name} defaultChecked={checked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-night/15 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
        <span className="absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  );
}

export function SaveButton({ editing, label }: { editing?: boolean; label?: string }) {
  return (
    <button className="h-11 w-full rounded-full bg-night px-6 text-sm font-medium text-beige shadow-lg shadow-night/15 transition hover:bg-institution sm:w-auto">
      {label ?? (editing ? "Enregistrer les modifications" : "Ajouter")}
    </button>
  );
}

export function StatusDot({ published }: { published: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", published ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
      {published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      {published ? "En ligne" : "Masqué"}
    </span>
  );
}

/** Mise en page liste + éditeur des pages de contenu. */
export function ContentLayout({
  list,
  editor,
}: {
  list: React.ReactNode;
  editor: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="order-2 xl:order-1">{list}</div>
      <div className="order-1 xl:sticky xl:top-24 xl:order-2">{editor}</div>
    </div>
  );
}

export function EditorHeader({ editing, title, newLabel, basePath }: { editing: boolean; title: string; newLabel: string; basePath: string }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">{editing ? "Modification" : "Nouveau"}</p>
        <h2 className="display mt-1 truncate text-2xl text-night">{editing ? title : newLabel}</h2>
      </div>
      {editing ? (
        <Link href={basePath} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-night/10 px-3 text-sm text-institution hover:border-gold">
          <Plus className="size-4" /> Nouveau
        </Link>
      ) : null}
    </div>
  );
}

export function ListHeader({ count, label, publicHref }: { count: number; label: string; publicHref?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 px-1">
      <p className="text-sm text-institution">
        <span className="font-semibold text-night">{count}</span> {label}
      </p>
      {publicHref ? (
        <Link href={publicHref} target="_blank" className="inline-flex items-center gap-1 text-sm text-institution hover:text-night">
          Voir sur le site <ArrowUpRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function EditLink({ href, active }: { href: string; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs transition",
        active ? "bg-night text-gold" : "border border-night/10 text-night hover:border-gold",
      )}
    >
      <PenLine className="size-3.5" /> {active ? "En cours" : "Modifier"}
    </Link>
  );
}

export function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="admin-card grid place-items-center gap-2 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-mist text-institution">{icon}</span>
      <p className="font-medium text-night">{title}</p>
      <p className="max-w-sm text-sm text-institution">{text}</p>
    </div>
  );
}
