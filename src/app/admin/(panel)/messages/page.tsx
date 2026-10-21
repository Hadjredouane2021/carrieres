import { Inbox, Mail, MailOpen, Reply } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/kit";
import { Flash, PageHeader } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { cn, initials } from "@/lib/utils";
import { markMessage } from "@/server/actions/admin";
import { requireUser } from "@/server/session";

export const instant = false;

type Query = { error?: string; ok?: string; id?: string; f?: string };

function href(query: Query, changes: Partial<Query>) {
  const params = new URLSearchParams();
  const next = { f: query.f, id: query.id, ...changes };
  if (next.f) params.set("f", next.f);
  if (next.id) params.set("id", next.id);
  const text = params.toString();
  return text ? `/admin/messages?${text}` : "/admin/messages";
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Query> }) {
  await requireUser(false);
  const query = await searchParams;
  const all = await db().contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const unread = all.filter((message) => !message.read).length;
  const filter = query.f === "unread" || query.f === "read" ? query.f : undefined;
  const messages = all.filter((message) => (filter === "unread" ? !message.read : filter === "read" ? message.read : true));
  const current = all.find((message) => message.id === query.id) ?? messages[0];
  const now = new Date().getTime();
  const short = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Casablanca" });
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });
  const full = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Casablanca" });
  const when = (date: Date) => (now - date.getTime() < 86_400_000 ? time.format(date) : short.format(date));
  const tabs = [
    { value: undefined, label: "Tous", count: all.length },
    { value: "unread", label: "Non lus", count: unread },
    { value: "read", label: "Lus", count: all.length - unread },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Pilotage"
        title="Messages"
        intro={unread ? `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""} sur ${all.length}.` : "Tous les messages ont été lus."}
      />
      <Flash error={query.error} ok={query.ok} />

      {all.length === 0 ? (
        <EmptyState icon={<Inbox className="size-5" />} title="Boîte vide" text="Les messages envoyés depuis le formulaire de contact du site arriveront ici." />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[24rem_1fr]">
          <div className="admin-card overflow-hidden">
            <nav className="flex gap-1 border-b border-night/[0.06] p-2" aria-label="Filtrer">
              {tabs.map((tab) => {
                const active = filter === tab.value;
                return (
                  <Link
                    key={tab.label}
                    href={href(query, { f: tab.value, id: undefined })}
                    className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm transition", active ? "bg-night text-white" : "text-institution hover:bg-mist")}
                  >
                    {tab.label}
                    <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/15" : "bg-mist")}>{tab.count}</span>
                  </Link>
                );
              })}
            </nav>
            <ul className="admin-scroll max-h-[70vh] divide-y divide-night/[0.05] overflow-y-auto">
              {messages.map((message) => {
                const active = current?.id === message.id;
                return (
                  <li key={message.id}>
                    <Link
                      href={href(query, { id: message.id })}
                      scroll={false}
                      className={cn("relative flex gap-3 px-4 py-3.5 transition", active ? "bg-gold/[0.09]" : "hover:bg-mist/60")}
                    >
                      {active ? <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-gold" /> : null}
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold", message.read ? "bg-mist text-institution" : "bg-night text-gold")}>
                        {initials(message.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cn("truncate text-sm", message.read ? "text-institution" : "font-semibold text-night")}>{message.name}</span>
                          <span className="shrink-0 text-[11px] text-institution/70">{when(message.createdAt)}</span>
                        </span>
                        <span className={cn("block truncate text-sm", message.read ? "text-institution" : "font-medium text-night")}>{message.subject}</span>
                        <span className="block truncate text-xs text-institution/70">{message.message}</span>
                      </span>
                      {!message.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-label="Non lu" /> : null}
                    </Link>
                  </li>
                );
              })}
              {messages.length === 0 ? <li className="px-4 py-10 text-center text-sm text-institution">Aucun message dans ce filtre.</li> : null}
            </ul>
          </div>

          {current ? (
            <article className="admin-card overflow-hidden lg:sticky lg:top-24">
              <header className="relative overflow-hidden bg-night p-6 text-beige md:p-8">
                <div className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gold/20 blur-3xl" />
                <p className="relative text-[11px] uppercase tracking-[0.22em] text-gold">{full.format(current.createdAt)}</p>
                <h2 className="display relative mt-2 text-2xl text-white md:text-3xl">{current.subject}</h2>
                <div className="relative mt-5 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold to-[#B8935A] text-sm font-semibold text-night">{initials(current.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-white">{current.name}</p>
                    <a href={`mailto:${current.email}`} className="truncate text-sm text-beige/70 hover:text-gold">{current.email}</a>
                  </div>
                </div>
              </header>
              <div className="p-6 md:p-8">
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{current.message}</p>
              </div>
              <footer className="flex flex-wrap items-center gap-2 border-t border-night/[0.06] bg-mist/40 p-4 md:px-8">
                <a
                  href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject}`)}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-night px-5 text-sm text-beige hover:bg-institution"
                >
                  <Reply className="size-4" /> Répondre
                </a>
                <form action={markMessage}>
                  <input type="hidden" name="id" value={current.id} />
                  <input type="hidden" name="read" value={current.read ? "false" : "true"} />
                  <button className="inline-flex h-10 items-center gap-2 rounded-full border border-night/10 bg-white px-5 text-sm text-night hover:border-gold">
                    {current.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                    {current.read ? "Marquer comme non lu" : "Marquer comme lu"}
                  </button>
                </form>
              </footer>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
