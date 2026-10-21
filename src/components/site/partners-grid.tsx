import { ArrowUpRight } from "lucide-react";
import { PartnerLogo } from "@/components/site/partner-logo";
import { labelOf, PARTNER_TIERS } from "@/lib/constants";
import { tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";
import { cn } from "@/lib/utils";

type Partner = SiteData["partners"][number];

// Seuls les liens https bien formés sont rendus cliquables.
function safeWebsite(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function Tile({ partner, locale, dark }: { partner: Partner; locale: Locale; dark: boolean }) {
  const website = safeWebsite(partner.website);
  const tile = (
    <span
      className={cn(
        "relative flex h-28 items-center justify-center rounded-2xl bg-white p-5 text-center transition duration-300 sm:h-32",
        dark ? "group-hover:shadow-[0_0_0_3px_var(--sun)]" : "ring-1 ring-night/10 group-hover:ring-2 group-hover:ring-sun",
      )}
    >
      <PartnerLogo src={safeAssetUrl(partner.logoUrl)} name={partner.name} />
      {website ? <ArrowUpRight className="absolute end-3 top-3 size-4 text-night/30 transition group-hover:text-sun-ink" aria-hidden="true" /> : null}
    </span>
  );
  return website ? (
    <a href={website} target="_blank" rel="noreferrer" className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sun">
      {tile}
      <span className="sr-only">
        {tx(locale, `Site web de ${partner.name} (nouvel onglet)`, `الموقع الإلكتروني لـ ${partner.name} (نافذة جديدة)`)}
      </span>
    </a>
  ) : (
    <div className="group">{tile}</div>
  );
}

export function PartnersGrid({
  partners,
  locale,
  grouped = false,
  dark = false,
}: {
  partners: Partner[];
  locale: Locale;
  grouped?: boolean;
  dark?: boolean;
}) {
  const tiers = PARTNER_TIERS.map((tier) => ({ ...tier, items: partners.filter((partner) => partner.tier === tier.value) })).filter((tier) => tier.items.length);
  const list = (items: Partner[]) => (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((partner) => (
        <li key={partner.id} className="scroll-reveal">
          <Tile partner={partner} locale={locale} dark={dark} />
        </li>
      ))}
    </ul>
  );

  if (!grouped || tiers.length < 2) return list(partners);
  return (
    <div className="grid gap-12">
      {tiers.map((tier) => (
        <section key={tier.value} aria-label={labelOf(PARTNER_TIERS, tier.value, locale)}>
          <p className={cn("mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em]", dark ? "text-sun" : "text-sun-ink")}>
            {labelOf(PARTNER_TIERS, tier.value, locale)}
            <span className={cn("h-px flex-1", dark ? "bg-white/10" : "bg-night/10")} aria-hidden="true" />
            <span className={dark ? "text-haze" : "text-muted"}>{tier.items.length}</span>
          </p>
          {list(tier.items)}
        </section>
      ))}
    </div>
  );
}
