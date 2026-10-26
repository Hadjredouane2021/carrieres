"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/site/icons";

type Career = { id: string; title: string; summary: string; icon: string };

const desktop = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(desktop);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Liste verticale sur grand écran, défilante horizontalement sur mobile : les flèches du clavier suivent le sens affiché.
function useOrientation() {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(desktop).matches ? "vertical" : "horizontal"),
    () => "horizontal" as const,
  );
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

// Liens directs vers un métier : /metiers#metier-<id>.
function useHash() {
  return useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
}

export function CareersExplorer({
  careers,
  labels,
  syncHash = false,
}: {
  careers: Career[];
  labels: { list: string; counter: string; register: string };
  syncHash?: boolean;
}) {
  const orientation = useOrientation();
  const total = String(careers.length).padStart(2, "0");
  const hash = useHash();
  const [value, setValue] = useState(careers[0]?.id);
  const [seenHash, setSeenHash] = useState("");

  // Un nouveau fragment d'URL désigne un métier : il devient l'onglet actif.
  if (syncHash && hash !== seenHash) {
    setSeenHash(hash);
    const target = hash.startsWith("#metier-") ? hash.slice("#metier-".length) : "";
    if (careers.some((career) => career.id === target)) setValue(target);
  }

  function select(next: string) {
    setValue(next);
    if (syncHash) window.history.replaceState(null, "", `#metier-${next}`);
  }

  return (
    <Tabs.Root
      value={value}
      onValueChange={select}
      orientation={orientation}
      className="relative mt-8 grid gap-5 sm:mt-12 md:mt-16 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-10"
    >
      {syncHash
        ? careers.map((career) => <span key={career.id} id={`metier-${career.id}`} aria-hidden="true" className="absolute top-0 scroll-mt-28" />)
        : null}
      <Tabs.List
        aria-label={labels.list}
        className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:content-start lg:gap-1 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {careers.map((career, index) => (
          <Tabs.Trigger
            key={career.id}
            value={career.id}
            className="group flex shrink-0 snap-start items-center gap-3 rounded-full border border-white/15 px-4 py-2.5 text-start text-sm text-haze outline-none transition hover:border-white/35 hover:text-white focus-visible:ring-2 focus-visible:ring-sun data-[state=active]:border-sun data-[state=active]:bg-sun data-[state=active]:text-night lg:rounded-2xl lg:border-transparent lg:px-4 lg:py-3.5 lg:text-base lg:data-[state=active]:border-white/10 lg:data-[state=active]:bg-white/[0.07] lg:data-[state=active]:text-white"
          >
            <span className="hidden w-6 text-xs tabular-nums text-haze/70 transition group-data-[state=active]:text-sun lg:inline">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="whitespace-nowrap lg:whitespace-normal">{career.title}</span>
            <ArrowRight
              className="ms-auto hidden size-4 shrink-0 text-sun opacity-0 transition group-data-[state=active]:opacity-100 lg:block rtl:-scale-x-100"
              aria-hidden="true"
            />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {careers.map((career, index) => {
        const number = String(index + 1).padStart(2, "0");
        return (
          <Tabs.Content
            key={career.id}
            value={career.id}
            className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 outline-none focus-visible:ring-2 focus-visible:ring-sun motion-safe:animate-fade-up sm:p-10 lg:p-12"
          >
            <span
              aria-hidden="true"
              className="display pointer-events-none absolute -bottom-8 end-2 -z-10 text-[9rem] leading-none text-white/[0.05] sm:-bottom-12 sm:text-[15rem]"
            >
              {number}
            </span>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -top-24 -z-10 size-72 rounded-full bg-sun/20 blur-[90px]"
            />
            <div className="flex flex-col sm:min-h-[22rem]">
              <span className="grid size-14 place-items-center rounded-2xl bg-sun text-night shadow-[0_18px_40px_-16px_color-mix(in_srgb,var(--sun)_90%,transparent)]">
                <Icon name={career.icon} className="size-7" />
              </span>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-sun">
                {labels.counter} {number} / {total}
              </p>
              <h3 className="display mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] text-white text-balance">{career.title}</h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-haze sm:text-lg sm:leading-8">{career.summary}</p>
              <div className="mt-auto pt-8 sm:pt-10">
                <Link
                  href="/inscription"
                  className="group/cta inline-flex h-12 items-center gap-3 rounded-full bg-white pe-1.5 ps-5 text-sm font-semibold text-night transition hover:bg-dawn"
                >
                  {labels.register}
                  <span className="grid size-9 place-items-center rounded-full bg-sun text-night transition-transform motion-safe:group-hover/cta:translate-x-0.5 rtl:motion-safe:group-hover/cta:-translate-x-0.5">
                    <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </div>
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
}
