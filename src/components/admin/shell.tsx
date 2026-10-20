"use client";

import {
  CalendarDays,
  HelpCircle,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  QrCode,
  Settings,
  Sparkles,
  Users,
  Briefcase,
  Handshake,
  Mic,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, admin: false },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users, admin: false },
  { href: "/admin/checkin", label: "Accueil QR", icon: QrCode, admin: false },
  { href: "/admin/messages", label: "Messages", icon: Mail, admin: false },
  { href: "/admin/programme", label: "Programme", icon: CalendarDays, admin: true },
  { href: "/admin/metiers", label: "Métiers", icon: Briefcase, admin: true },
  { href: "/admin/intervenants", label: "Intervenants", icon: Mic, admin: true },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, admin: true },
  { href: "/admin/pourquoi", label: "Pourquoi participer", icon: Sparkles, admin: true },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle, admin: true },
  { href: "/admin/galerie", label: "Galerie", icon: Images, admin: true },
  { href: "/admin/contenu", label: "Textes", icon: Menu, admin: true },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, admin: true },
  { href: "/admin/utilisateurs", label: "Comptes", icon: Users, admin: true },
];

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
  const links = items.filter((item) => role === "ADMIN" || !item.admin);

  return (
    <div className="min-h-screen bg-mist text-ink md:grid md:grid-cols-[260px_1fr]">
      <aside className={cn("fixed inset-y-0 start-0 z-40 w-64 bg-night text-beige transition md:static md:translate-x-0", open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full md:rtl:translate-x-0")}>
        <div className="flex items-center justify-between px-5 py-6">
          <Link href="/admin" className="rounded-xl bg-white px-3 py-2">
            <img src="/logo-fma.png" alt="Assur' Carrière" className="h-12 w-auto" />
          </Link>
          <button type="button" className="md:hidden" onClick={() => setOpen(false)} aria-label="Fermer">
            <X />
          </button>
        </div>
        <nav className="grid gap-1 px-3">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", active ? "bg-white/10 text-gold" : "text-beige/80 hover:bg-white/5")} onClick={() => setOpen(false)}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-night/10 bg-white px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
              <Menu />
            </button>
            <img src="/logo-fma.png" alt="" className="h-9 w-auto md:hidden" />
          </div>
          <p className="text-sm">{name} · {role === "ADMIN" ? "Administration" : "Accueil"}</p>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 text-sm text-institution">
              <LogOut className="size-4" /> Sortir
            </button>
          </form>
        </header>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}

export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (ok) return <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Enregistrement effectué.</p>;
  return null;
}
