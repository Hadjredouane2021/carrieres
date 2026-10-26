import { ArrowUp, Compass } from "lucide-react";
import { CareersCarousel } from "@/components/site/careers-carousel";
import { Icon } from "@/components/site/icons";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink, EmptyState, Section, SectionHeading } from "@/components/site/ui";
import { dictionary, tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Métiers", description: "Actuariat, souscription, sinistres, data… Explore les métiers de l'assurance présentés au Forum." };
export const instant = false;

export default async function CareersPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].home;
  const section = site.sections.careers;
  const careers = site.careers.map((career) => ({
    id: career.id,
    title: tx(locale, career.title.fr, career.title.ar),
    summary: tx(locale, career.summary.fr, career.summary.ar),
    icon: career.icon,
    category: career.category,
  }));

  return (
    <PublicFrame locale={locale} site={site}>
      {/* Fond nuit : l'en-tête se prolonge sans couture dans l'explorateur. */}
      <div className={careers.length ? "bg-night" : undefined}>
      <PageIntro watermark="Métiers" kicker={copy.careers} title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)}>
        {careers.length ? <Badge tone="glass">{tx(locale, `${careers.length} métiers`, `${careers.length} مهن`)}</Badge> : null}
      </PageIntro>
      </div>

      {careers.length ? (
        <>
          {/* Même carrousel 3D que l'accueil, prolongé depuis l'en-tête nuit. */}
          <section aria-labelledby="metiers-carrousel" className="surface-dark relative isolate overflow-clip rounded-b-[2rem] bg-night pb-14 pt-6 text-white sm:pb-20 md:rounded-b-[3rem] md:pb-28">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute -top-48 end-[-12%] size-[38rem] rounded-full bg-sun/20 blur-[130px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(70%_60%_at_80%_10%,#000,transparent)]" />
            </div>
            <div className="mx-auto max-w-7xl px-4 md:px-6">
              <h2 id="metiers-carrousel" className="display text-center text-[clamp(1.9rem,4vw,3rem)] leading-tight">
                {tx(locale, "Choisis un métier, découvre sa mission", "اختر مهنة واكتشف مهمتها")}
              </h2>
              <CareersCarousel
                careers={careers}
                syncHash
                labels={
                  locale === "ar"
                    ? { all: "الكل", filters: "تصفية حسب المجال", register: copy.careerCta, counter: copy.careerOf, pause: "إيقاف", play: "تشغيل" }
                    : { all: "Tout", filters: "Filtrer par famille de métiers", register: copy.careerCta, counter: copy.careerOf, pause: "Mettre en pause", play: "Relancer le défilement" }
                }
              />
            </div>
          </section>

          <Section labelledBy="metiers-index">
            <Container>
              <SectionHeading
                id="metiers-index"
                eyebrow={tx(locale, "Toutes les fiches", "كل البطاقات")}
                title={tx(locale, "Un secteur, des trajectoires", "قطاع واحد، مسارات متعددة")}
                intro={tx(locale, section.body.fr, section.body.ar)}
              />
              <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
                {careers.map((career, index) => (
                  <li key={career.id} className="scroll-reveal">
                    {/* Ancre native : le carrousel suit l'évènement hashchange, que le routeur de Next ne déclenche pas. */}
                    <a
                      href={`#metier-${career.id}`}
                      className="group flex h-full flex-col rounded-[1.75rem] border border-night/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-sun/60 hover:shadow-[0_24px_60px_-34px_rgba(11,27,58,0.4)] motion-reduce:hover:translate-y-0"
                    >
                      <span className="flex items-center justify-between">
                        <span className="grid size-12 place-items-center rounded-2xl bg-dawn text-sun-ink transition group-hover:bg-sun group-hover:text-night">
                          <Icon name={career.icon} className="size-6" />
                        </span>
                        <span className="text-xs font-semibold tabular-nums tracking-[0.2em] text-muted">{String(index + 1).padStart(2, "0")}</span>
                      </span>
                      <span className="display mt-8 text-2xl leading-tight text-night">{career.title}</span>
                      <span className="mt-3 flex-1 text-sm leading-6 text-muted">{career.summary}</span>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-night">
                        {tx(locale, "Voir dans le carrousel", "عرض في العارض")}
                        <ArrowUp className="size-4 text-sun-ink transition-transform motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        </>
      ) : (
        <Container className="py-14 sm:py-20">
          <EmptyState icon={Compass} title={copy.careersEmpty} />
        </Container>
      )}

      <Container className="pb-14 sm:pb-20 lg:pb-24">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-dawn p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="display text-2xl leading-tight text-night sm:text-3xl">{tx(locale, "Un métier t'attire ?", "هل تجذبك مهنة؟")}</p>
            <p className="mt-2 max-w-xl text-muted">{tx(locale, site.sections.cta.body.fr, site.sections.cta.body.ar)}</p>
          </div>
          <CtaLink href="/inscription" className="shrink-0">
            {copy.register}
          </CtaLink>
        </div>
      </Container>
    </PublicFrame>
  );
}
