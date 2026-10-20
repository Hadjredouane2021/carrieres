import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Connexion", robots: { index: false, follow: false } };
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;
  const callback = params.callbackUrl?.startsWith("/admin") ? params.callbackUrl : "/admin";
  return (
    <main className="grid min-h-screen place-items-center bg-night px-4">
      <LoginForm callbackUrl={callback} />
    </main>
  );
}
