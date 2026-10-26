import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { ThemeEditor } from "@/components/admin/theme-editor";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { FONT_FAMILIES } from "@/app/fonts";
import { parseTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const metadata = { title: "Couleurs et polices" };
export const instant = false;

export default async function ColorsAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  await requireUser(true);
  const query = await searchParams;
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Couleurs et polices"
        description="Toutes les couleurs et les polices du site public. Les nuances (survol, fonds teintés, textes accentués) sont calculées automatiquement."
        actions={
          <Link href="/" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
            Voir le site
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <ThemeEditor key={settings?.updatedAt?.toISOString() ?? "default"} initial={parseTheme(settings?.theme)} families={FONT_FAMILIES} />
    </div>
  );
}
