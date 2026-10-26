"use client";

import { AtSign, CalendarDays, Check, CircleDashed, Link2, MapPin, Megaphone, Phone, Rows3, Ticket, Users } from "lucide-react";
import { useState } from "react";
import { AdminField, Panel } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { SocialIcon } from "@/components/site/social-icon";
import { cn, placeLabel } from "@/lib/utils";

export type SettingsValues = {
  eventDate: string;
  venueName: string;
  city: string;
  address: string;
  capacity: number;
  registrationOpen: boolean;
  sloganFr: string;
  sloganAr: string;
  contactEmail: string;
  contactPhone: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  ribbonItems: string;
  heroMarquee: string;
};

const SOCIALS = [
  { name: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/…" },
  { name: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { name: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/…" },
  { name: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@…" },
] as const;

const SECTIONS = [
  { id: "evenement", label: "Date et lieu", icon: CalendarDays },
  { id: "inscriptions", label: "Inscriptions", icon: Ticket },
  { id: "slogan", label: "Slogan", icon: Megaphone },
  { id: "bandeau", label: "Bandeaux défilants", icon: Rows3 },
  { id: "contact", label: "Contact", icon: AtSign },
  { id: "reseaux", label: "Réseaux sociaux", icon: Link2 },
];

// La saisie datetime-local est déjà à l'heure du Maroc : on l'affiche telle quelle, sans conversion de fuseau.
function describeDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(`${value}:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" }).format(date);
  return { weekday: format({ weekday: "long" }), day: format({ day: "numeric", month: "long", year: "numeric" }), time: `${match[4]}:${match[5]}` };
}

export function SettingsForm({
  action,
  initial,
  registered,
  today,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial: SettingsValues;
  registered: number;
  today: string;
}) {
  const [values, setValues] = useState(initial);
  const set = <K extends keyof SettingsValues>(key: K) => (value: SettingsValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const text = (key: keyof SettingsValues) => ({
    name: key,
    value: String(values[key]),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(event.target.value as never),
  });

  const when = describeDate(values.eventDate);
  const daysLeft = values.eventDate ? Math.ceil((new Date(`${values.eventDate.slice(0, 10)}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000) : null;
  const capacity = Math.max(Number(values.capacity) || 0, 0);
  const fill = capacity ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const place = placeLabel(values.venueName, values.city);
  const linked = SOCIALS.filter(({ name }) => values[name].startsWith("https://"));
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail);

  const checklist = [
    { label: "Date et heure", done: Boolean(when), href: "#evenement" },
    { label: "Lieu et adresse", done: Boolean(values.venueName.trim() && values.address.trim()), href: "#evenement" },
    { label: "Capacité", done: capacity > 0, href: "#inscriptions" },
    { label: "Slogan", done: Boolean(values.sloganFr.trim()), href: "#slogan" },
    { label: "E-mail de contact", done: emailValid, href: "#contact" },
    { label: "Téléphone", done: Boolean(values.contactPhone.trim()), href: "#contact" },
    { label: "Au moins un réseau social", done: linked.length > 0, href: "#reseaux" },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const customRibbon = values.ribbonItems.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 12);
  const customMarquee = values.heroMarquee.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 20);
  const heroMarquee = customMarquee.length ? customMarquee : ["Liste des métiers publiés"];
  const ribbon = customRibbon.length ? customRibbon : [values.sloganFr, when?.day ?? "Novembre 2026", values.city, "Inscription gratuite"].filter(Boolean);

  return (
    <form action={action} className="grid items-start gap-6 xl:grid-cols-[13rem_minmax(0,1fr)_22rem]">
      <nav aria-label="Sections" className="hidden xl:sticky xl:top-24 xl:block">
        <ul className="grid gap-1 rounded-2xl bg-white p-2 ring-1 ring-night/[0.07]">
          {SECTIONS.map(({ id, label, icon: SectionIcon }) => (
            <li key={id}>
              <a href={`#${id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-night transition hover:bg-mist">
                <SectionIcon className="size-4 text-sun-ink" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid min-w-0 gap-5 [&>*]:min-w-0">
        <div id="evenement" className="scroll-mt-24">
          <Panel title="Date et lieu" description="Heure du Maroc. Laissez la date vide pour masquer le compte à rebours.">
            <div className="grid gap-4">
              <AdminField label="Date et heure" className="sm:max-w-xs">
                <input className="field" type="datetime-local" {...text("eventDate")} />
              </AdminField>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Lieu" hint="Non répété s'il est identique à la ville.">
                  <span className="relative">
                    <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                    <input className="field ps-9" {...text("venueName")} />
                  </span>
                </AdminField>
                <AdminField label="Ville">
                  <input className="field" {...text("city")} />
                </AdminField>
              </div>
              <AdminField label="Adresse">
                <textarea className="field min-h-20" {...text("address")} />
              </AdminField>
            </div>
          </Panel>
        </div>

        <div id="inscriptions" className="scroll-mt-24">
          <Panel title="Inscriptions" description="Elles se ferment aussi d'elles-mêmes quand la capacité est atteinte.">
            <div className="grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)] md:items-end">
              <AdminField label="Capacité d'accueil">
                <span className="relative">
                  <Users className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input className="field ps-9" type="number" min={1} max={20000} {...text("capacity")} />
                </span>
              </AdminField>
              <div className="grid gap-1.5 rounded-xl bg-mist/70 p-3.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted">Places prises</span>
                  <span className="font-semibold tabular-nums text-night">
                    {registered} / {capacity || "—"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-sun to-sun-bright transition-all" style={{ width: `${Math.max(fill, 2)}%` }} />
                </div>
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-night/10 px-4 py-3 text-sm text-night transition has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun">
              <span>
                <span className="block font-medium">Inscriptions ouvertes</span>
                <span className="block text-xs text-muted">Désactivez pour afficher « Inscriptions closes » sur le site.</span>
              </span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  name="registrationOpen"
                  checked={values.registrationOpen}
                  onChange={(event) => set("registrationOpen")(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-night/15 transition peer-checked:bg-emerald-500" />
                <span className="absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
              </span>
            </label>
          </Panel>
        </div>

        <div id="slogan" className="scroll-mt-24">
          <Panel title="Slogan" description="La phrase en italique orange sous le titre du Hero.">
            <AdminField label="Slogan">
              <input className="field" {...text("sloganFr")} />
            </AdminField>
            <input type="hidden" name="sloganAr" value={values.sloganAr} />
          </Panel>
        </div>

        <div id="bandeau" className="scroll-mt-24">
          <Panel title="Bandeaux défilants" description="Une mention par ligne, dans l'ordre d'affichage.">
            <AdminField label="Ruban orange de l'accueil" hint="Laissez vide pour afficher automatiquement : slogan, date, ville et « Inscription gratuite ».">
              <textarea
                className="field min-h-36 font-medium"
                placeholder={"« L'assurance, n'est pas ce que tu crois… »\n26 novembre 2026\nCasablanca\nInscription gratuite"}
                {...text("ribbonItems")}
              />
            </AdminField>
            <div className="mt-4 overflow-hidden rounded-xl bg-[#F8F5EC] py-4" aria-hidden="true">
              <div className="-mx-4 -rotate-1 bg-sun py-2.5">
                <div className="flex w-max items-center gap-5 px-6 text-sm font-semibold text-night">
                  {ribbon.map((item, index) => (
                    <span key={`${item}-${index}`} className="flex items-center gap-5 whitespace-nowrap">
                      {index ? <span className="size-1.5 rotate-45 bg-night" /> : null}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <AdminField label="Bandeau du bas du hero" hint="Laissez vide pour faire défiler la liste des métiers publiés." className="mt-5">
              <textarea className="field min-h-36 font-medium uppercase tracking-[0.12em]" placeholder={"Talks\nMasterclass\nXP Corner\nSpeed Meeting"} {...text("heroMarquee")} />
            </AdminField>
            <div className="mt-3 overflow-hidden rounded-xl bg-night py-3" aria-hidden="true">
              <div className="flex w-max items-center gap-6 px-5 text-[11px] uppercase tracking-[0.22em] text-white/75">
                {heroMarquee.map((item, index) => (
                  <span key={`${item}-${index}`} className="flex items-center gap-6 whitespace-nowrap">
                    {index ? <span className="size-1.5 rotate-45 bg-sun" /> : null}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div id="contact" className="scroll-mt-24">
          <Panel title="Contact" description="Coordonnées publiques, reprises sur la page Contact et dans les e-mails.">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="E-mail de contact" hint={values.contactEmail && !emailValid ? "Adresse e-mail invalide." : undefined}>
                <span className="relative">
                  <AtSign className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input className={cn("field ps-9", values.contactEmail && !emailValid && "border-red-300")} type="email" required {...text("contactEmail")} />
                </span>
              </AdminField>
              <AdminField label="Téléphone">
                <span className="relative">
                  <Phone className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input className="field ps-9" dir="ltr" {...text("contactPhone")} />
                </span>
              </AdminField>
            </div>
          </Panel>
        </div>

        <div id="reseaux" className="scroll-mt-24">
          <Panel title="Réseaux sociaux" description="Un lien ne s'affiche sur le site que s'il commence par https://.">
            <div className="grid gap-4 md:grid-cols-2">
              {SOCIALS.map(({ name, label, placeholder }) => {
                const value = values[name];
                const valid = value.startsWith("https://");
                return (
                  <AdminField key={name} label={label} hint={value ? (valid ? "Affiché sur le site" : "Ignoré : doit commencer par https://") : "Non renseigné"}>
                    <span className="relative">
                      <SocialIcon name={label} className={cn("pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2", valid ? "text-sun-ink" : "text-muted")} />
                      <input className={cn("field ps-9", value && !valid && "border-amber-300")} placeholder={placeholder} {...text(name)} />
                    </span>
                  </AdminField>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl bg-night/95 p-2 ps-5 text-sm text-white shadow-2xl shadow-night/30 backdrop-blur">
          <span className="hidden text-haze sm:inline">Les changements s&apos;appliquent dès l&apos;enregistrement.</span>
          <SubmitButton variant="sun">Enregistrer les paramètres</SubmitButton>
        </div>
      </div>

      <aside className="grid min-w-0 gap-4 xl:sticky xl:top-24" aria-label="Aperçu">
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-night p-6 text-white shadow-[0_30px_60px_-30px_rgba(11,27,58,0.6)]">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,#173D70_0%,#0B1B3A_55%,#071226_100%)]" />
          <div aria-hidden="true" className="absolute -bottom-24 -end-16 -z-10 size-64 rounded-full bg-sun/30 blur-[80px]" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">Aperçu en direct</p>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", values.registrationOpen ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-haze")}>
              <span className={cn("size-1.5 rounded-full", values.registrationOpen ? "bg-emerald-400" : "bg-haze")} />
              {values.registrationOpen ? "Inscriptions ouvertes" : "Inscriptions closes"}
            </span>
          </div>
          <p className="display mt-5 text-3xl leading-tight first-letter:uppercase">{when ? when.day : "Date à définir"}</p>
          {when ? (
            <p className="mt-1 text-sm text-haze">
              <span className="capitalize">{when.weekday}</span> · {when.time}
            </p>
          ) : null}
          <div className="mt-5 flex items-start gap-2.5 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
            <span>
              <span className="block font-medium">{place || "Lieu à définir"}</span>
              {values.address.trim() ? <span className="block whitespace-pre-line text-haze">{values.address}</span> : null}
            </span>
          </div>
          {values.sloganFr.trim() ? <p className="font-accent mt-5 text-2xl italic leading-tight text-sun">{values.sloganFr}</p> : null}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-haze">Compte à rebours</p>
              <p className="display mt-1 text-2xl">{daysLeft === null ? "—" : daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? "Jour J" : "Passé"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-haze">Remplissage</p>
              <p className="display mt-1 text-2xl tabular-nums">{fill} %</p>
            </div>
          </div>
          {linked.length ? (
            <div className="mt-4 flex gap-2">
              {linked.map(({ label }) => (
                <span key={label} className="grid size-9 place-items-center rounded-full bg-white/10 text-sun" title={label}>
                  <SocialIcon name={label} className="size-4" />
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.07]">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-night">Complétude</h2>
            <span className="text-sm font-semibold tabular-nums text-night">
              {completed}/{checklist.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
            <div
              className={cn("h-full rounded-full transition-all", completed === checklist.length ? "bg-emerald-500" : "bg-gradient-to-r from-sun to-sun-bright")}
              style={{ width: `${Math.round((completed / checklist.length) * 100)}%` }}
            />
          </div>
          <ul className="mt-4 grid gap-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition hover:bg-mist">
                  {item.done ? (
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  ) : (
                    <CircleDashed className="size-5 text-muted" aria-hidden="true" />
                  )}
                  <span className={item.done ? "text-night" : "text-muted"}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </form>
  );
}
