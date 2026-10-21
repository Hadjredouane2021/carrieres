"use client";

import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Handshake,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Mail,
  Menu,
  Mic,
  QrCode,
  Settings,
  Sparkles,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/server/actions/auth";
import { cn, initials } from "@/lib/utils";

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
    label: "Site public",
    items: [
      { href: "/admin/sections", label: "Sections de l'accueil", icon: LayoutList, admin: true },
      { href: "/admin/hero", label: "Hero", icon: ImageIcon, admin: true },
      { href: "/admin/programme", label: "Programme", icon: CalendarDays, admin: true },
      { href: "/admin/metiers", label: "Métiers", icon: Briefcase, admin: true },
      { href: "/admin/intervenants", label: "Intervenants", icon: Mic, admin: true },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, admin: true },
      { href: "/admin/pourquoi", label: "Pourquoi participer", icon: Sparkles, admin: true },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle, admin: true },
      { href: "/admin/galerie", label: "Galerie", icon: Images, admin: true },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, admin: true },
      { href: "/admin/utilisateurs", label: "Comptes", icon: UserCog, admin: true },
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
  role: "ADMIN" | "STAFF";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => role === "ADMIN" || !item.admin) }))
    .filter((group) => group.items.length > 0);
  const current = groups.flatMap((group) => group.items).find((item) => isActive(pathname, item.href));
  const roleLabel = role === "ADMIN" ? "Administration" : "Équipe d'accueil";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="admin-canvas min-h-screen text-ink md:grid md:grid-cols-[272px_1fr]">
      {open ? <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-night/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-[272px] flex-col bg-gradient-to-b from-[#0B1B3A] via-[#0D2148] to-[#10295A] text-beige transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full md:rtl:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <Link href="/admin" className="rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-fma.png" alt="Assur' Carrière" className="h-10 w-auto" />
          </Link>
          <button type="button" className="grid size-9 place-items-center rounded-full bg-white/5 md:hidden" onClick={() => setOpen(false)} aria-label="Fermer">
            <X className="size-4" />
          </button>
        </div>

        <nav className="admin-scroll flex-1 overflow-y-auto px-3 pb-4">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mt-5 first:mt-2">
              <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-beige/40">{group.label}</p>
              <div className="grid gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        active ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-beige/65 hover:bg-white/[0.04] hover:text-beige",
                      )}
                    >
                      {active ? <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-gold" /> : null}
                      <Icon className={cn("size-4 transition", active ? "text-gold" : "text-beige/45 group-hover:text-beige/80")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-[#B8935A] text-xs font-semibold text-night">{initials(name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{name}</p>
            <p className="text-xs text-beige/50">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button className="grid size-8 place-items-center rounded-full text-beige/60 hover:bg-white/10 hover:text-white" aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-night/[0.06] bg-white/70 px-4 backdrop-blur-xl md:px-8">
          <button type="button" className="grid size-9 place-items-center rounded-full border border-night/10 md:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <Menu className="size-4" />
          </button>
          <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-institution/60 sm:inline">Back-office</span>
            <span className="hidden text-institution/30 sm:inline">/</span>
            <span className="truncate font-medium text-night">{current?.label ?? "Back-office"}</span>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-night/10 bg-white px-4 text-sm text-night hover:border-gold">
              Voir le site <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">{eyebrow}</p> : null}
        <h1 className="display mt-1 text-3xl text-night md:text-4xl">{title}</h1>
        {intro ? <p className="mt-2 text-institution">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (ok) return <p className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Enregistrement effectué.</p>;
  return null;
}
