"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { dictionary, type Locale } from "@/lib/i18n";
import { contactSchema } from "@/lib/validators";
import { sendContact } from "@/server/actions/public";

type Values = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = dictionary[locale].contact;
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const form = useForm<Values>({ defaultValues: { name: "", email: "", subject: "", message: "", website: "" } });

  async function submit(values: Values) {
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "");
      return;
    }
    setPending(true);
    const result = await sendContact(parsed.data);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(true);
  }

  if (done) return <p className="rounded-3xl bg-white p-8 text-lg" role="status">{copy.success}</p>;

  return (
    <form className="grid gap-4 rounded-[2rem] bg-white p-6 md:p-8" onSubmit={form.handleSubmit(submit)} noValidate>
      <label className="grid gap-1 text-sm">
        <span>{locale === "ar" ? "الاسم" : "Nom"}</span>
        <input className="field" {...form.register("name")} autoComplete="name" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{locale === "ar" ? "البريد الإلكتروني" : "E-mail"}</span>
        <input className="field" type="email" {...form.register("email")} autoComplete="email" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{locale === "ar" ? "الموضوع" : "Objet"}</span>
        <input className="field" {...form.register("subject")} />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{locale === "ar" ? "الرسالة" : "Message"}</span>
        <textarea className="field min-h-36" {...form.register("message")} />
      </label>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>
      {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
      <button disabled={pending} className="h-12 rounded-full bg-gold font-semibold text-night disabled:opacity-60">
        {copy.submit}
      </button>
    </form>
  );
}
