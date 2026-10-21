import { ArrowDown, Compass } from "lucide-react";
import { CareersExplorer } from "@/components/site/careers-explorer";
import { Icon } from "@/components/site/icons";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink, EmptyState, NightDecor, Section, SectionHeading } from "@/components/site/ui";
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
          <Section tone="night" labelledBy="metiers-explorer" className="rounded-b-[2rem] md:rounded-b-[2.75rem]">
            <NightDecor />
            <Container>
              <h2 id="metiers-explorer" className="display text-[clamp(1.9rem,4vw,3rem)] leading-tight">
                {tx(locale, "Choisis un métier, découvre sa mission", "اختر مهنة واكتشف مهمتها")}
              </h2>
              <CareersExplorer careers={careers} labels={{ list: copy.careersList, counter: copy.careerOf, register: copy.careerCta }} syncHash />
            </Container>
          </Section>

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
                    {/* Ancre native : l'explorateur suit l'évènement hashchange, que le routeur de Next ne déclenche pas. */}
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
                        {tx(locale, "Voir dans l'explorateur", "عرض في المستكشف")}
                        <ArrowDown className="size-4 text-sun-ink transition-transform motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
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
