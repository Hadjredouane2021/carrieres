import { LoginForm } from "@/components/admin/login-form";
import { Skyline } from "@/components/site/ui";

export const metadata = { title: "Connexion", robots: { index: false, follow: false } };
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;
  const callback = params.callbackUrl?.startsWith("/admin") ? params.callbackUrl : "/admin";
  return (
    <main className="surface-dark relative isolate grid min-h-screen place-items-center overflow-clip bg-night px-4 py-12">
      <div aria-hidden="true" className="absolute -top-40 end-[-10%] -z-10 size-[34rem] rounded-full bg-sun/20 blur-[120px]" />
      <Skyline className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-night-deep sm:h-40" lights={false} />
      <div className="grid w-full justify-items-center gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-fma.png" alt="Assur'Carrière" width={185} height={74} className="h-12 w-auto brightness-0 invert" />
        <LoginForm callbackUrl={callback} />
      </div>
    </main>
  );
}
