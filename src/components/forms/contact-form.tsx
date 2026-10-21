"use client";

import { CircleAlert, CircleCheck, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

const empty: Values = { name: "", email: "", subject: "", message: "", website: "" };

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = dictionary[locale].contact;
  const ar = locale === "ar";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  const form = useForm<Values>({ defaultValues: empty });
  const errors = form.formState.errors;

  async function submit(values: Values) {
    // Un seul envoi à la fois, même en cas de double clic.
    if (sending.current) return;
    setError("");
    form.clearErrors();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      let first: keyof Values | null = null;
      const seen = new Set<string>();
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "") as keyof Values;
        if (!(key in empty) || seen.has(key)) continue;
        seen.add(key);
        form.setError(key, { message: issue.message });
        first ??= key;
      }
      if (first) form.setFocus(first);
      return;
    }
    sending.current = true;
    setPending(true);
    try {
      const result = await sendContact(parsed.data);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDone(true);
      form.reset(empty);
    } catch {
      setError(ar ? "تعذر الإرسال. أعد المحاولة." : "L'envoi n'a pas abouti. Vérifie ta connexion puis réessaie.");
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="grid justify-items-start gap-4 rounded-[2rem] border border-emerald-200 bg-emerald-50/60 p-7 sm:p-10" role="status">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="display text-2xl text-night sm:text-3xl">{ar ? "تم الإرسال" : "Message envoyé"}</p>
        <p className="text-night/80">{copy.success}</p>
        <Button type="button" variant="outline" onClick={() => setDone(false)}>
          {ar ? "رسالة أخرى" : "Écrire un autre message"}
        </Button>
      </div>
    );
  }

  const fields = [
    { name: "name", label: ar ? "الاسم" : "Nom", autoComplete: "name" },
    { name: "email", label: ar ? "البريد الإلكتروني" : "E-mail", autoComplete: "email", type: "email" },
    { name: "subject", label: ar ? "الموضوع" : "Objet" },
  ] as const;

  return (
    <form
      className="grid gap-5 rounded-[2rem] border border-night/10 bg-white p-6 shadow-[0_40px_100px_-60px_rgba(11,27,58,0.45)] sm:p-9"
      onSubmit={(event) => void form.handleSubmit(submit)(event)}
      noValidate
      aria-busy={pending}
    >
      <div>
        <p className="display text-2xl text-night sm:text-3xl">{ar ? "اكتب لنا" : "Écris-nous"}</p>
        <p className="mt-1 text-sm text-muted">{ar ? "جميع الحقول إلزامية." : "Tous les champs sont obligatoires."}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.name === "subject" ? "grid gap-2 sm:col-span-2" : "grid gap-2"} data-invalid={errors[field.name] ? "" : undefined}>
            <label htmlFor={`contact-${field.name}`} className="text-sm font-medium text-night">
              {field.label}
            </label>
            <input
              id={`contact-${field.name}`}
              className="lux-field"
              type={"type" in field ? field.type : "text"}
              autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `contact-${field.name}-error` : undefined}
              {...form.register(field.name)}
            />
            {errors[field.name] ? <FieldError id={`contact-${field.name}-error`}>{errors[field.name]?.message}</FieldError> : null}
          </div>
        ))}
        <div className="grid gap-2 sm:col-span-2" data-invalid={errors.message ? "" : undefined}>
          <label htmlFor="contact-message" className="text-sm font-medium text-night">
            {ar ? "الرسالة" : "Message"}
          </label>
          <textarea
            id="contact-message"
            className="lux-field min-h-40"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...form.register("message")}
          />
          {errors.message ? <FieldError id="contact-message-error">{errors.message.message}</FieldError> : null}
        </div>
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          {dictionary[locale].register.honeypot}
          <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
      </div>
      {error ? (
        <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit">
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {pending ? (ar ? "جارٍ الإرسال…" : "Envoi en cours…") : copy.submit}
      </Button>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} className="flex items-start gap-1.5 text-[13px] leading-5 text-red-700">
      <CircleAlert className="mt-[3px] size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}
