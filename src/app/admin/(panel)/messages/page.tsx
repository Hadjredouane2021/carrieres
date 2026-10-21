import { Inbox, Mail } from "lucide-react";
import { connection } from "next/server";
import { AdminHeader } from "@/components/admin/kit";
import { SubmitButton } from "@/components/admin/kit-client";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { markMessage } from "@/server/actions/admin";

export const instant = false;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const messages = await db().contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((message) => !message.read).length;
  return (
    <div className="grid gap-6">
      <AdminHeader eyebrow="Pilotage" title="Messages" description={`${messages.length} message${messages.length > 1 ? "s" : ""}, dont ${unread} non lu${unread > 1 ? "s" : ""}.`} />
      <Flash error={query.error} ok={query.ok} />
      {messages.length ? (
        <ul className="grid gap-3">
          {messages.map((message) => (
            <li key={message.id}>
              <article className={cn("rounded-2xl bg-white p-5 ring-1", message.read ? "ring-night/[0.07]" : "ring-sun/50")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-night">{message.subject}</h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {message.name} ·{" "}
                      <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="text-institution underline-offset-4 hover:underline">
                        {message.email}
                      </a>{" "}
                      · {message.createdAt.toLocaleString("fr-MA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" })}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", message.read ? "bg-night/[0.06] text-muted" : "bg-sun/15 text-sun-ink")}>
                    {message.read ? "Lu" : "Nouveau"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-night/85">{message.message}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-night/[0.07] pt-4">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-night px-4 text-sm font-semibold text-white transition hover:bg-institution"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    Répondre
                  </a>
                  <form action={markMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                    <SubmitButton variant="outline" size="sm" pendingLabel="…">
                      {message.read ? "Marquer comme non lu" : "Marquer comme lu"}
                    </SubmitButton>
                  </form>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-night/15 px-5 py-14 text-center text-sm text-muted">
          <Inbox className="size-8 text-muted/60" aria-hidden="true" />
          Aucun message pour le moment.
        </p>
      )}
    </div>
  );
}
