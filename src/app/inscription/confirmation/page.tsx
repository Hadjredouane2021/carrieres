import { redirect } from "next/navigation";

export const instant = false;

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) redirect("/inscription");
  redirect(`/billet/${token}`);
}
