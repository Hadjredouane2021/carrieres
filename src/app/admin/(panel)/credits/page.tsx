import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { CreditsEditor } from "@/components/admin/credits-editor";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { parseCredits } from "@/lib/credits";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const metadata = { title: "Crédits" };
export const instant = false;

export default async function CreditsAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  await requireUser(true);
  const query = await searchParams;
  const settings = await db().eventSettings.findUnique({ where: { id: "main" } });

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Site public"
        title="Crédits"
        description="Sources, auteurs et licences des images utilisées sur le site. Chaque image réutilisée doit citer son auteur et sa licence."
        actions={
          <Link href="/credits" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
            Voir la page
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <CreditsEditor key={settings?.updatedAt?.toISOString() ?? "default"} initial={parseCredits(settings?.credits)} />
    </div>
  );
}
