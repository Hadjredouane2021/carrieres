import { AlertTriangle, ArrowUpRight, CalendarClock, Coffee, Eye, EyeOff, ListOrdered, MapPin, Mic, Pencil, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, Panel, PublishedToggle } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { CategoryPicker, TimeRange } from "@/components/admin/program-editor";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { labelOf, PROGRAM_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { formatDuration, PROGRAM_TONES, toMinutes } from "@/lib/program-tones";
import { cn } from "@/lib/utils";
import { deleteProgram, saveProgram } from "@/server/actions/admin";

export const metadata = { title: "Programme" };
export const instant = false;

const CHOICE = new Set(["workshop", "roundtable"]);

export default async function ProgramAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  // Même ordre que sur le site public.
  const items = await db().programItem.findMany({ orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }] });
  const current = items.find((item) => item.id === query.id);

  const slots = items.map((item) => ({ ...item, from: toMinutes(item.startTime), to: toMinutes(item.endTime) }));
  const published = slots.filter((slot) => slot.published);
  // Chevauchements entre créneaux publiés ; les ateliers et tables rondes peuvent se tenir en parallèle.
  const conflicts = new Set<string>();
  for (const a of published) {
    for (const b of published) {
      if (a.id >= b.id || a.from === null || a.to === null || b.from === null || b.to === null) continue;
      const parallel = CHOICE.has(a.category) && CHOICE.has(b.category);
      if (!parallel && a.from < b.to && b.from < a.to) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }
  const chronological = slots.every((slot, index) => index === 0 || (slot.from ?? 0) >= (slots[index - 1].from ?? 0));
  const starts = published.map((slot) => slot.from).filter((value): value is number => value !== null);
  const ends = published.map((slot) => slot.to).filter((value): value is number => value !== null);
  const dayStart = starts.length ? Math.min(...starts) : null;
  const dayEnd = ends.length ? Math.max(...ends) : null;
  const clock = (total: number) => `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  const choices = published.filter((slot) => CHOICE.has(slot.category)).length;
  const hidden = items.length - published.length;

  const stats = [
    {
      label: "Journée",
      value: dayStart !== null && dayEnd !== null ? `${clock(dayStart)} → ${clock(dayEnd)}` : "—",
      hint: dayStart !== null && dayEnd !== null ? formatDuration(dayEnd - dayStart) : "Aucun créneau publié",
      icon: CalendarClock,
      alert: false,
    },
    {
      label: "Créneaux",
      value: String(items.length),
      hint: `${published.length} publié${published.length > 1 ? "s" : ""} · ${hidden} masqué${hidden > 1 ? "s" : ""}`,
      icon: ListOrdered,
      alert: false,
    },
    { label: "Au choix à l'inscription", value: String(choices), hint: "Ateliers et tables rondes publiés", icon: Sparkles, alert: false },
    {
      label: "Chevauchements",
      value: String(conflicts.size),
      hint: conflicts.size ? "Créneaux qui se superposent" : "Aucun conflit d'horaire",
      icon: AlertTriangle,
      alert: conflicts.size > 0,
    },
  ];

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Programme"
        description="Les créneaux de la journée, affichés en frise sur le site. Les ateliers et tables rondes publiés sont proposés au choix lors de l'inscription."
        actions={
          <>
            <Link href="/programme" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir le programme
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/programme" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouveau créneau
              </Link>
            ) : null}
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, alert }) => (
          <article key={label} className={cn("rounded-2xl bg-white p-4 ring-1 ring-night/[0.07]", alert && "bg-amber-50 ring-amber-200")}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted">{label}</p>
              <span className={cn("grid size-8 place-items-center rounded-xl", alert ? "bg-amber-100 text-amber-700" : "bg-dawn text-sun-ink")}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="display mt-2 text-2xl text-night tabular-nums md:text-3xl">{value}</p>
            <p className={cn("mt-0.5 text-xs", alert ? "text-amber-800" : "text-muted")}>{hint}</p>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="order-2 grid gap-3 xl:order-1" aria-label="Frise de la journée">
          {!chronological ? (
            <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              L&apos;ordre des créneaux ne suit pas les horaires. Ajustez le champ « Ordre » pour que la frise du site reste chronologique.
            </p>
          ) : null}
          {slots.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-night/15 bg-white px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink">
                <CalendarClock className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium text-night">Aucun créneau pour le moment</p>
              <p className="text-sm text-muted">Commencez par l&apos;accueil des participants avec le formulaire.</p>
            </div>
          ) : (
            <ol className="relative">
              <span aria-hidden="true" className="absolute inset-y-6 start-[4.75rem] w-px bg-gradient-to-b from-sun via-night/15 to-transparent" />
              {slots.map((slot, index) => {
                const tone = PROGRAM_TONES[slot.category] ?? PROGRAM_TONES.plenary;
                const previous = slots[index - 1];
                const gap = previous && previous.to !== null && slot.from !== null ? slot.from - previous.to : 0;
                const active = current?.id === slot.id;
                const duration = slot.from !== null && slot.to !== null ? slot.to - slot.from : null;
                return (
                  <li key={slot.id}>
                    {gap > 0 ? (
                      <div className="flex items-center py-1.5 ps-[6.25rem]">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted ring-1 ring-night/[0.07]">
                          <Coffee className="size-3" aria-hidden="true" />
                          Pause de {formatDuration(gap)}
                        </span>
                      </div>
                    ) : null}
                    <div className="group grid grid-cols-[4.75rem_1fr] items-start pb-3">
                      <time className="pe-4 pt-4 text-end">
                        <span className="display block text-xl leading-none text-night tabular-nums">{slot.startTime}</span>
                        <span className="mt-1 block text-xs text-muted tabular-nums">{slot.endTime}</span>
                      </time>
                      <div className="relative ps-6">
                        <span aria-hidden="true" className={cn("absolute -start-[6px] top-5 size-3 rounded-full ring-4 ring-mist transition group-hover:scale-125", tone.dot)} />
                        <article
                          className={cn(
                            "relative overflow-hidden rounded-2xl border-s-4 bg-white p-4 shadow-[0_1px_2px_rgba(11,27,58,0.06)] ring-1 transition md:p-5",
                            tone.rail,
                            active ? "shadow-[0_20px_40px_-24px_rgba(255,122,26,0.6)] ring-2 ring-sun" : "ring-night/[0.07] group-hover:shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]",
                            !slot.published && "opacity-60",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", tone.chip)}>{labelOf(PROGRAM_CATEGORIES, slot.category, "fr")}</span>
                                {duration !== null && duration > 0 ? <span className="text-muted">{formatDuration(duration)}</span> : null}
                                {CHOICE.has(slot.category) && slot.published ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-night px-2 py-0.5 font-medium text-white">
                                    <Sparkles className="size-3 text-sun" aria-hidden="true" /> Au choix
                                  </span>
                                ) : null}
                                {conflicts.has(slot.id) ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                                    <AlertTriangle className="size-3" aria-hidden="true" /> Chevauchement
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="mt-2 font-semibold text-night md:text-lg">{slot.titleFr}</h3>
                              {slot.descriptionFr ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{slot.descriptionFr}</p> : null}
                              {slot.location || slot.speakerName ? (
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-institution">
                                  {slot.location ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="size-3.5 text-sun-ink" aria-hidden="true" /> {slot.location}
                                    </span>
                                  ) : null}
                                  {slot.speakerName ? (
                                    <span className="inline-flex items-center gap-1">
                                      <Mic className="size-3.5 text-sun-ink" aria-hidden="true" /> {slot.speakerName}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span
                                title={slot.published ? "Publié sur le site" : "Masqué sur le site"}
                                className={cn("grid size-7 place-items-center rounded-full", slot.published ? "bg-emerald-50 text-emerald-700" : "bg-night/[0.06] text-muted")}
                              >
                                {slot.published ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                                <span className="sr-only">{slot.published ? "Publié" : "Masqué"}</span>
                              </span>
                              <div className="flex items-center gap-0.5 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                                <Link
                                  href={`?id=${slot.id}`}
                                  scroll={false}
                                  aria-label={`Modifier ${slot.titleFr}`}
                                  className={cn("grid size-9 place-items-center rounded-full transition", active ? "bg-sun text-night" : "text-institution hover:bg-mist")}
                                >
                                  <Pencil className="size-4" aria-hidden="true" />
                                </Link>
                                <DeleteForm action={deleteProgram} id={slot.id} label={`${slot.startTime} · ${slot.titleFr}`} />
                              </div>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <div className="relative overflow-hidden bg-night px-5 py-5 text-white md:px-6">
              <div aria-hidden="true" className="pointer-events-none absolute -end-10 -top-12 size-40 rounded-full bg-sun/30 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun">{current ? "Modification" : "Nouveau créneau"}</p>
                  <h2 className="display mt-1 truncate text-xl">{current ? current.titleFr : "Ajouter à la journée"}</h2>
                  {current ? (
                    <p className="mt-0.5 text-xs text-haze tabular-nums">
                      {current.startTime} → {current.endTime}
                    </p>
                  ) : null}
                </div>
                {current ? (
                  <Link
                    href="/admin/programme"
                    scroll={false}
                    aria-label="Annuler la modification"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
            <form key={current?.id ?? "new"} action={saveProgram} className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <TimeRange start={current?.startTime ?? ""} end={current?.endTime ?? ""} />
              <CategoryPicker value={current?.category ?? "plenary"} />
              <BilingualFields
                fr={
                  <AdminField label="Titre">
                    <input className="field" name="titleFr" placeholder="Ex. Table ronde des métiers" defaultValue={current?.titleFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Titre (arabe)">
                    <input className="field" name="titleAr" dir="rtl" defaultValue={current?.titleAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Description">
                    <textarea className="field min-h-24" name="descriptionFr" defaultValue={current?.descriptionFr ?? ""} />
                  </AdminField>
                }
                ar={
                  <AdminField label="Description (arabe)">
                    <textarea className="field min-h-24" name="descriptionAr" dir="rtl" defaultValue={current?.descriptionAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Lieu">
                  <span className="relative">
                    <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                    <input className="field ps-9" name="location" placeholder="Plénière, Salle A…" defaultValue={current?.location ?? ""} />
                  </span>
                </AdminField>
                <AdminField label="Intervenant">
                  <span className="relative">
                    <Mic className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                    <input className="field ps-9" name="speakerName" placeholder="Facultatif" defaultValue={current?.speakerName ?? ""} />
                  </span>
                </AdminField>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" hint="Position sur le site" className="w-28">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter le créneau"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
