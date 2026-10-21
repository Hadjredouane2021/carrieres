"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" },
  { href: "/forum", key: "forum" },
  { href: "/programme", key: "program" },
  { href: "/metiers", key: "careers" },
  { href: "/intervenants", key: "speakers" },
  { href: "/partenaires", key: "partners" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ locale }: { locale: Locale }) {
  const copy = dictionary[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  // Transparent uniquement au-dessus du Hero de l'accueil : les autres pages débutent sur fond clair.
  const solid = scrolled || open || pathname !== "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 border-b border-white/10 bg-night/80 shadow-[0_10px_40px_rgba(11,27,58,0.12)] backdrop-blur-xl transition-opacity duration-500",
          solid ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night/70 to-transparent transition-opacity duration-500",
          solid ? "opacity-0" : "opacity-100",
        )}
      />
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="rounded-xl bg-white px-2.5 py-1.5">
          <img src="/logo-fma.png" alt="Assur' Carrière" className="h-10 w-auto sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-beige/80 transition hover:text-white",
                pathname === link.href && "text-gold",
              )}
            >
              {copy.nav[link.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/inscription" className="hidden h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-night hover:bg-gold-bright sm:inline-flex">
            {copy.nav.register}
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white xl:hidden"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            className="relative overflow-hidden border-t border-white/10 bg-night xl:hidden"
            aria-label="Mobile"
          >
            <div className="grid gap-1 px-4 py-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl px-3 py-3 text-beige hover:bg-white/5">
                  {copy.nav[link.key]}
                </Link>
              ))}
              <Link href="/inscription" className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-gold font-semibold text-night">
                {copy.nav.register}
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
