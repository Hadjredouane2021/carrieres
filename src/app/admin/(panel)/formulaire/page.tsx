import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { EducationEditor } from "@/components/admin/education-editor";
import { AdminHeader } from "@/components/admin/kit";
import { Flash } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { parseLevels } from "@/lib/education";
import { db } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";

export const metadata = { title: "Formulaire d'inscription" };
export const instant = false;

export default async function FormAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await connection();
  await requireUser(true);
  const query = await searchParams;
  const [settings, usage] = await Promise.all([
    db().eventSettings.findUnique({ where: { id: "main" } }),
    db().registration.groupBy({ by: ["educationLevel"], _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(usage.map((row) => [row.educationLevel, row._count._all]));

  return (
    <div className="grid gap-6">
      <AdminHeader
        eyebrow="Inscriptions"
        title="Formulaire d'inscription"
        description="Choix proposés dans l'étape « Profil » du formulaire. Les niveaux d'origine peuvent être renommés ou masqués, mais pas supprimés, pour garder le libellé des inscriptions déjà reçues."
        actions={
          <Link href="/inscription" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
            Voir le formulaire
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Flash error={query.error} ok={query.ok} />
      <EducationEditor key={settings?.updatedAt?.toISOString() ?? "default"} initial={parseLevels(settings?.educationLevels)} counts={counts} />
    </div>
  );
}
