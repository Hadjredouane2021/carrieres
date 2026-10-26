import { connection } from "next/server";
import { auth } from "@/auth";
import type { Locale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export async function getLocale(): Promise<Locale> {
  return "fr";
}

export async function requireUser(admin = false) {
  await connection();
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (admin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/admin?error=Cette%20action%20est%20r%C3%A9serv%C3%A9e%20%C3%A0%20l%27administrateur.");
  }
  return session;
}

// Gestion des comptes : réservée au super administrateur.
export async function requireSuperAdmin() {
  const session = await requireUser(false);
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin?error=La%20gestion%20des%20comptes%20est%20r%C3%A9serv%C3%A9e%20au%20super%20administrateur.");
  }
  return session;
}
