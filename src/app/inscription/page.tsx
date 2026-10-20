import { RegisterForm } from "@/components/forms/register-form";
import { PageIntro, PublicFrame } from "@/components/site/public-frame";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/server/session";
import { getPublicSite } from "@/server/site";

export const metadata = { title: "Inscription" };
export const instant = false;

export default async function RegisterPage() {
  const [site, locale] = await Promise.all([getPublicSite(), getLocale()]);
  const copy = dictionary[locale].register;
  return (
    <PublicFrame locale={locale} site={site}>
      <PageIntro kicker="2026" title={copy.title} intro={copy.intro} />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <RegisterForm site={site} locale={locale} />
      </div>
    </PublicFrame>
  );
}
