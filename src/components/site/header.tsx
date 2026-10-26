"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { dictionary, type Locale } from "@/lib/i18n";
import { DEFAULT_MENU, isExternal, type MenuConfig } from "@/lib/menu";
import { cn } from "@/lib/utils";


function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ locale, menu = DEFAULT_MENU }: { locale: Locale; menu?: MenuConfig }) {
  const copy = dictionary[locale];
  // Libellés personnalisés en français ; en arabe, traduction des liens d'origine.
  const links = menu.items
    .filter((item) => item.visible)
    .map((item) => ({ href: item.href, label: locale === "ar" && item.key ? copy.nav[item.key] : item.label, external: isExternal(item.href) }));
  const external = (href: string) => (isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  // Toutes les pages publiques débutent sur un en-tête nuit : le bandeau reste transparent jusqu'au défilement.
  const solid = scrolled || open;

  // Changement de page : le menu mobile se referme.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu ouvert : page figée, Échap pour fermer, focus rendu au bouton.
  useEffect(() => {
    if (!open) return;
    const button = toggle.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <header className={cn("surface-dark fixed inset-x-0 top-0 z-50 print:hidden", solid && "[--color-white:var(--header-fg)]")}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 border-b border-white/10 bg-header/95 shadow-[0_10px_40px_rgba(11,27,58,0.18)] backdrop-blur-xl transition-opacity duration-500",
          solid ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-header/70 to-transparent transition-opacity duration-500",
          solid ? "opacity-0" : "opacity-100",
        )}
      />
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="shrink-0 rounded-lg" aria-label={`Assur'Carrière — ${copy.nav.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-assurcarriere.png" alt="" width={466} height={187} className="h-10 w-auto brightness-0 invert sm:h-11" />
        </Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Navigation principale"}>
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                {...external(link.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm transition",
                  active ? "text-white" : "text-white/70 hover:text-white",
                )}
              >
                {link.label}
                {active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-sun" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {menu.cta.visible ? (
            <Link href={menu.cta.href} {...external(menu.cta.href)} className={cn(buttonVariants({ variant: "sun", size: "md" }), "h-10 px-4 sm:h-11 sm:px-5")}>
              {locale === "ar" ? copy.nav.register : menu.cta.label}
            </Link>
          ) : null}
          <button
            ref={toggle}
            type="button"
            className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/35 sm:size-11 xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? (locale === "ar" ? "إغلاق القائمة" : "Fermer le menu") : locale === "ar" ? "فتح القائمة" : "Ouvrir le menu"}
            onClick={() => {
              setOpenedAt(pathname);
              setOpen((value) => !value);
            }}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="menu-mobile"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/10 bg-header xl:hidden"
            aria-label={locale === "ar" ? "القائمة" : "Menu"}
          >
            <ul className="mx-auto grid max-w-7xl gap-1 px-4 py-6 md:px-6">
              <li>
                <Link
                  href="/"
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={cn("flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg", pathname === "/" ? "bg-white/[0.07] text-white" : "text-white/80 hover:bg-white/5")}
                >
                  {copy.nav.home}
                </Link>
              </li>
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...external(link.href)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg",
                        active ? "bg-white/[0.07] text-white" : "text-white/80 hover:bg-white/5",
                      )}
                    >
                      {link.label}
                      {active ? <span aria-hidden="true" className="size-2 rounded-full bg-sun" /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
