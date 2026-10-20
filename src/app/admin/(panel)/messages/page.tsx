import { connection } from "next/server";
import { Flash } from "@/components/admin/shell";
import { db } from "@/lib/prisma";
import { markMessage } from "@/server/actions/admin";

export const instant = false;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  const query = await searchParams;
  const messages = await db().contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-4">
      <h1 className="display text-4xl text-night">Messages</h1>
      <Flash error={query.error} ok={query.ok} />
      {messages.map((message) => (
        <article key={message.id} className="rounded-3xl bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl text-night">{message.subject}</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-gold">{message.read ? "Lu" : "Nouveau"}</span>
          </div>
          <p className="mt-1 text-sm text-institution">{message.name} — {message.email}</p>
          <p className="mt-3 whitespace-pre-wrap leading-7">{message.message}</p>
          <form action={markMessage} className="mt-3">
            <input type="hidden" name="id" value={message.id} />
            <input type="hidden" name="read" value={message.read ? "false" : "true"} />
            <button className="text-sm text-institution">{message.read ? "Marquer comme non lu" : "Marquer comme lu"}</button>
          </form>
        </article>
      ))}
      {messages.length === 0 ? <p className="text-institution">Aucun message.</p> : null}
    </div>
  );
}
