import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminHeader } from "@/components/admin/kit";
import { MenuEditor } from "@/components/admin/menu-editor";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { parseMenu } from "@/lib/menu";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const metadata = { title: "Menus" };
export const instant = false;

export default async function MenusAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  await requireUser(true);
  const query = await searchParams;
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });
  const menu = parseMenu(settings?.menuItems);

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Menus"
        description="Ordre, libellés et visibilité des liens de l'en-tête et du menu mobile, reprise dans le pied de page, et bouton d'inscription. Les liens d'origine restent traduits en arabe."
        actions={
          <Link href="/" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
            Voir le site
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <MenuEditor key={settings?.updatedAt?.toISOString() ?? "default"} initial={menu} />
    </div>
  );
}
