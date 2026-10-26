import { connection } from "next/server";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { parseCredits } from "@/lib/credits";
import { db } from "@/lib/prisma";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Crédits" };
export const instant = false;

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-night underline underline-offset-4 hover:text-sun-ink">
      {children}
    </a>
  );
}

export default async function CreditsPage() {
  await connection();
  const [site, locale, settings] = await Promise.all([
    getPublicSite(),
    getLocale(),
    db().eventSettings.findUnique({ where: { id: "main" }, select: { credits: true } }).catch(() => null),
  ]);
  const credits = parseCredits(settings?.credits);
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="Crédits" kicker={credits.kicker || "Crédits"} title="Crédits" intro={credits.intro} />
      <article className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-5 px-4 py-14 text-night/80 md:px-6 md:py-20">
        {credits.items.length ? (
          <ol className="grid gap-4">
            {credits.items.map((item) => (
              <li key={item.id} className="min-w-0 rounded-[1.75rem] border border-night/10 bg-white p-6 leading-7 sm:p-7">
                <h2 className="text-lg font-semibold text-night">{item.title}</h2>
                {item.credit ? <p className="mt-2 whitespace-pre-line text-night [overflow-wrap:anywhere]">{item.credit}</p> : null}
                <dl className="mt-4 grid gap-1.5 text-sm [overflow-wrap:anywhere] sm:grid-cols-[7rem_minmax(0,1fr)]">
                  {item.author ? (
                    <>
                      <dt className="text-muted">Auteur</dt>
                      <dd>{item.authorUrl ? <External href={item.authorUrl}>{item.author}</External> : item.author}</dd>
                    </>
                  ) : null}
                  {item.source ? (
                    <>
                      <dt className="text-muted">Source</dt>
                      <dd className="break-words">
                        <External href={item.source}>{item.sourceLabel || new URL(item.source).hostname.replace(/^www\./, "")}</External>
                      </dd>
                    </>
                  ) : null}
                  {item.license ? (
                    <>
                      <dt className="text-muted">Licence</dt>
                      <dd>{item.licenseUrl ? <External href={item.licenseUrl}>{item.license}</External> : item.license}</dd>
                    </>
                  ) : null}
                  {item.changes ? (
                    <>
                      <dt className="text-muted">Modifications</dt>
                      <dd>{item.changes}</dd>
                    </>
                  ) : null}
                </dl>
              </li>
            ))}
          </ol>
        ) : null}
        {credits.note ? <p className="whitespace-pre-line text-sm leading-6">{credits.note}</p> : null}
      </article>
    </PublicFrame>
  );
}
