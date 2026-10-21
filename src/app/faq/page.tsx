import { HelpCircle, MessageCircle } from "lucide-react";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { Badge, Container, CtaLink, EmptyState, TextLink } from "@/components/site/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { tx } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "FAQ", description: "Les réponses aux questions fréquentes sur le Forum des Métiers de l'Assurance." };
export const instant = false;

export default async function FaqPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const section = site.sections.faq;
  const count = site.faqs.length;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro watermark="FAQ" kicker="FAQ" title={tx(locale, section.title.fr, section.title.ar)} intro={tx(locale, section.body.fr, section.body.ar)}>
        {count ? <Badge tone="glass">{tx(locale, `${count} question${count > 1 ? "s" : ""}`, `${count} أسئلة`)}</Badge> : null}
      </PageIntro>

      <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:py-24">
        {count ? (
          <Accordion type="single" collapsible className="grid content-start gap-3">
            {site.faqs.map((item, index) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <span className="flex items-baseline gap-4">
                    <span className="w-6 shrink-0 text-xs tabular-nums text-sun-ink" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {tx(locale, item.question.fr, item.question.ar)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="ps-[3.75rem] sm:ps-[4.75rem]">{tx(locale, item.answer.fr, item.answer.ar)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <EmptyState
            icon={HelpCircle}
            title={tx(locale, "Les réponses arrivent bientôt", "الأجوبة قريباً")}
            text={tx(locale, "Une question en attendant ? L'équipe te répond.", "سؤال في الأثناء؟ الفريق يجيبك.")}
            action={<TextLink href="/contact">{tx(locale, "Écrire à l'équipe", "راسلوا الفريق")}</TextLink>}
          />
        )}

        <aside className="grid content-start gap-4 lg:sticky lg:top-28 lg:self-start">
          <div className="surface-dark relative isolate overflow-clip rounded-[1.75rem] bg-night p-6 text-white sm:p-7">
            <div aria-hidden="true" className="absolute -bottom-20 -end-16 -z-10 size-56 rounded-full bg-sun/30 blur-[70px]" />
            <span className="grid size-11 place-items-center rounded-2xl bg-sun text-night">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <p className="display mt-6 text-2xl leading-tight">{tx(locale, "Tu ne trouves pas ta réponse ?", "لم تجد جوابك؟")}</p>
            <p className="mt-2 text-sm leading-6 text-haze">{tx(locale, section.body.fr, section.body.ar)}</p>
            <CtaLink href="/contact" variant="light" size="md" className="mt-6">
              {tx(locale, "Écrire à l'équipe", "راسلوا الفريق")}
            </CtaLink>
          </div>
          <div className="rounded-[1.75rem] border border-night/10 p-6 sm:p-7">
            <p className="display text-xl text-night">{tx(locale, "Prêt·e à participer ?", "مستعد للمشاركة؟")}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{tx(locale, site.sections.cta.body.fr, site.sections.cta.body.ar)}</p>
            <CtaLink href="/inscription" size="md" className="mt-5">
              {tx(locale, "Je réserve ma place", "أحجز مقعدي")}
            </CtaLink>
          </div>
        </aside>
      </Container>
    </PublicFrame>
  );
}
