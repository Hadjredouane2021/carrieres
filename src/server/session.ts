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
  if (admin && session.user.role !== "ADMIN") {
    redirect("/admin?error=Cette%20action%20est%20r%C3%A9serv%C3%A9e%20%C3%A0%20l%27administrateur.");
  }
  return session;
}
