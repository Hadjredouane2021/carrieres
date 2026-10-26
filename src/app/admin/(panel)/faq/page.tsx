import { ArrowUpRight, Copy, EyeOff, HelpCircle, MessageCircleQuestion, Pencil, Plus, Type } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminField, AdminHeader, BilingualFields, EditorHead, EmptyBlock, Panel, PublishedToggle, StatGrid } from "@/components/admin/kit";
import { DeleteForm, SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteFaq, saveFaq } from "@/server/actions/admin";

export const metadata = { title: "FAQ" };
export const instant = false;

function comparable(value: string) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "");
}

export default async function FaqAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; id?: string }> }) {
  await connection();
  const query = await searchParams;
  const items = await db().faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  const current = items.find((item) => item.id === query.id);

  const published = items.filter((item) => item.published).length;
  const average = items.length ? Math.round(items.reduce((sum, item) => sum + item.answerFr.trim().length, 0) / items.length) : 0;
  // Questions saisies deux fois : même intitulé une fois normalisé.
  const seen = new Map<string, number>();
  for (const item of items) seen.set(comparable(item.questionFr), (seen.get(comparable(item.questionFr)) ?? 0) + 1);
  const duplicates = new Set(items.filter((item) => (seen.get(comparable(item.questionFr)) ?? 0) > 1).map((item) => item.id));

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="FAQ"
        description="Questions affichées en accordéon sur la page FAQ, dans l'ordre indiqué."
        actions={
          <>
            <Link href="/faq" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              Voir la FAQ
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {current ? (
              <Link href="/admin/faq" className={cn(buttonVariants({ variant: "night", size: "md" }))}>
                <Plus className="size-4" aria-hidden="true" />
                Nouvelle question
              </Link>
            ) : null}
          </>
        }
      />
      <Flash error={query.error} ok={query.ok} />

      <StatGrid
        stats={[
          { label: "Questions", value: String(items.length), hint: `${published} publiée${published > 1 ? "s" : ""} · ${items.length - published} masquée${items.length - published > 1 ? "s" : ""}`, icon: MessageCircleQuestion },
          { label: "Publiées", value: `${published}/${items.length}`, hint: "Visibles sur la page FAQ", icon: HelpCircle },
          { label: "Réponse moyenne", value: average ? `${average} car.` : "—", hint: "Visez moins de 300 caractères", icon: Type },
          {
            label: "Doublons",
            value: String(duplicates.size),
            hint: duplicates.size ? "Questions identiques à fusionner" : "Aucune question en double",
            icon: Copy,
            alert: duplicates.size > 0,
          },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_32rem]">
        <section className="order-2 grid gap-2 xl:order-1" aria-label="Questions">
          {items.length === 0 ? (
            <EmptyBlock icon={HelpCircle} title="Aucune question pour le moment" text="Commencez par les questions qu'on vous pose le plus : public, gratuité, accès." />
          ) : (
            items.map((item, index) => {
              const active = current?.id === item.id;
              return (
                <details
                  key={item.id}
                  open={active}
                  className={cn(
                    "group overflow-hidden rounded-2xl bg-white ring-1 transition open:shadow-[0_18px_36px_-24px_rgba(11,27,58,0.35)]",
                    active ? "ring-2 ring-sun" : "ring-night/[0.07]",
                    !item.published && "opacity-60",
                  )}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="display grid size-10 shrink-0 place-items-center rounded-xl bg-dawn text-sm text-sun-ink tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-night">{item.questionFr}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                        {!item.published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-night/[0.06] px-2 py-0.5 text-muted">
                            <EyeOff className="size-3" aria-hidden="true" /> Masquée
                          </span>
                        ) : null}
                        {duplicates.has(item.id) ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">Doublon</span> : null}
                      </span>
                    </span>
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-mist text-lg leading-none text-night transition group-open:rotate-45 group-open:bg-sun">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-night/[0.06] px-4 pb-4 pt-3 sm:ps-[4.5rem]">
                    <p className="whitespace-pre-line text-sm leading-7 text-muted">{item.answerFr}</p>
                    <div className="mt-3 flex justify-end gap-1">
                      <Link
                        href={`?id=${item.id}`}
                        scroll={false}
                        className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm transition", active ? "bg-sun text-night" : "text-institution hover:bg-mist")}
                      >
                        <Pencil className="size-4" aria-hidden="true" /> Modifier
                      </Link>
                      <DeleteForm action={deleteFaq} id={item.id} label={item.questionFr} />
                    </div>
                  </div>
                </details>
              );
            })
          )}
        </section>

        <div className="order-1 xl:sticky xl:top-24 xl:order-2">
          <Panel className="overflow-hidden p-0 md:p-0">
            <EditorHead editing={Boolean(current)} kicker="Nouvelle question" title={current ? current.questionFr : "Ajouter une question"} cancelHref="/admin/faq" />
            <form key={current?.id ?? "new"} action={saveFaq} className="grid gap-5 p-5 md:p-6">
              {current ? <input type="hidden" name="id" value={current.id} /> : null}
              <BilingualFields
                fr={
                  <AdminField label="Question">
                    <input className="field" name="questionFr" placeholder="Ex. Qui peut participer ?" defaultValue={current?.questionFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Question (arabe)">
                    <input className="field" name="questionAr" dir="rtl" defaultValue={current?.questionAr ?? ""} />
                  </AdminField>
                }
              />
              <BilingualFields
                fr={
                  <AdminField label="Réponse" hint="Courte et concrète ; les retours à la ligne sont conservés.">
                    <textarea className="field min-h-36" name="answerFr" defaultValue={current?.answerFr ?? ""} required />
                  </AdminField>
                }
                ar={
                  <AdminField label="Réponse (arabe)">
                    <textarea className="field min-h-36" name="answerAr" dir="rtl" defaultValue={current?.answerAr ?? ""} />
                  </AdminField>
                }
              />
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-night/[0.07] pt-5">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Ordre" className="w-28">
                    <input className="field" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? items.length + 1} />
                  </AdminField>
                  <PublishedToggle defaultChecked={current?.published ?? true} />
                </div>
                <SubmitButton variant="sun">{current ? "Enregistrer" : "Ajouter la question"}</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
