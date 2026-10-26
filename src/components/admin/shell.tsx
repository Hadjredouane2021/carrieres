"use client";

import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Copyright,
  Handshake,
  HelpCircle,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Mic,
  Palette,
  PanelTop,
  QrCode,
  Settings,
  Sparkles,
  Type,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, admin: false },
      { href: "/admin/inscriptions", label: "Inscriptions", icon: Users, admin: false },
      { href: "/admin/checkin", label: "Accueil QR", icon: QrCode, admin: false },
      { href: "/admin/messages", label: "Messages", icon: Mail, admin: false },
    ],
  },
  {
    label: "Contenus du site",
    items: [
      { href: "/admin/hero", label: "Hero de l'accueil", icon: PanelTop, admin: true },
      { href: "/admin/menus", label: "Menus", icon: Menu, admin: true },
      { href: "/admin/couleurs", label: "Couleurs et polices", icon: Palette, admin: true },
      { href: "/admin/formulaire", label: "Formulaire d'inscription", icon: ClipboardList, admin: true },
      { href: "/admin/programme", label: "Programme", icon: CalendarDays, admin: true },
      { href: "/admin/metiers", label: "Métiers", icon: Briefcase, admin: true },
      { href: "/admin/intervenants", label: "Intervenants", icon: Mic, admin: true },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, admin: true },
      { href: "/admin/pourquoi", label: "Pourquoi participer", icon: Sparkles, admin: true },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle, admin: true },
      { href: "/admin/galerie", label: "Galerie", icon: Images, admin: true },
      { href: "/admin/contenu", label: "Textes", icon: Type, admin: true },
      { href: "/admin/credits", label: "Crédits", icon: Copyright, admin: true },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, admin: true },
      { href: "/admin/utilisateurs", label: "Comptes", icon: UserCog, admin: true, super: true },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  name,
  role,
  children,
}: {
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const visible = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => ("super" in item && item.super ? role === "SUPER_ADMIN" : role !== "STAFF" || !item.admin)),
    }))
    .filter((group) => group.items.length);
  const current = groups.flatMap((group) => group.items).find((item) => isActive(pathname, item.href));

  // Changement d'écran : le tiroir mobile se referme.
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-mist text-ink md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      {open ? <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-night/40 md:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        id="admin-nav"
        className={cn(
          "surface-dark fixed inset-y-0 start-0 z-40 flex w-[264px] flex-col overflow-y-auto bg-night text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full md:rtl:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-assurcarriere.png" alt="Assur'Carrière" width={466} height={187} className="h-9 w-auto brightness-0 invert" />
          </Link>
          <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-white/10 md:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mx-5 mb-4 rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/70">
          Espace {role === "STAFF" ? "accueil" : "administration"}
        </p>
        <nav aria-label="Back-office" className="grid gap-5 px-3 pb-6">
          {visible.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">{group.label}</p>
              <ul className="grid gap-0.5">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                          active ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <ItemIcon className={cn("size-4", active ? "text-sun" : "")} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 p-3">
          <Link href="/" target="_blank" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
            Voir le site public
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-night/10 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-night/10 md:hidden"
              onClick={() => {
                setOpenedAt(pathname);
                setOpen(true);
              }}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              aria-controls="admin-nav"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <p className="truncate text-sm font-medium text-night">{current?.label ?? "Back-office"}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted sm:block">
              {name} · <span className="font-medium text-night">{role === "SUPER_ADMIN" ? "Super administration" : role === "ADMIN" ? "Administration" : "Accueil"}</span>
            </p>
            <form action={logout}>
              <button className="inline-flex h-9 items-center gap-2 rounded-full border border-night/10 px-3 text-sm text-night transition hover:bg-mist">
                <LogOut className="size-4" aria-hidden="true" /> Sortir
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return (
      <p className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
        <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
        Enregistrement effectué.
      </p>
    );
  }
  return null;
}
