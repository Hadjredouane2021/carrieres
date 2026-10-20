"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

function safeCallback(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return "/admin";
  }
  return value;
}

export async function login(formData: FormData) {
  const key = await clientKey("login");
  if (!rateLimit(key, 8, 15 * 60 * 1000).ok) {
    return { error: "Trop de tentatives. Réessayez dans quinze minutes." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeCallback(String(formData.get("callbackUrl") ?? "/admin"));
  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Identifiants incorrects." };
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
