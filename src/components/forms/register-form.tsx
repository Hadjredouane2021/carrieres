"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  CITIES,
  DISCOVERY_SOURCES,
  EDUCATION_LEVELS,
  labelOf,
  PARTICIPANT_TYPES,
  STUDY_YEARS,
} from "@/lib/constants";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import { registrationSchema, type RegistrationInput } from "@/lib/validators";
import { registerParticipant } from "@/server/actions/public";
import { cn } from "@/lib/utils";

const stepFields = [
  ["civility", "lastName", "firstName", "email", "phone", "city", "cityOther"],
  ["participantType", "organization", "educationLevel", "fieldOfStudy", "studyYear"],
  ["interests", "sessions", "discoverySource", "expectations", "portfolioUrl"],
  ["consentRules"],
];

export function RegisterForm({ site, locale }: { site: SiteData; locale: Locale }) {
  const copy = dictionary[locale].register;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const form = useForm<RegistrationInput>({
    defaultValues: {
      civility: "MADAME",
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      city: "Casablanca",
      cityOther: "",
      participantType: "STUDENT",
      organization: "",
      educationLevel: "BAC3",
      fieldOfStudy: "",
      studyYear: "Y3",
      interests: [],
      sessions: [],
      discoverySource: "SCHOOL",
      expectations: "",
      portfolioUrl: "",
      consentRules: false,
      consentContact: false,
      website: "",
    },
  });
  const values = form.watch();

  function showIssues(only?: string[]) {
    const parsed = registrationSchema.safeParse(form.getValues());
    form.clearErrors();
    if (parsed.success) return true;
    const allowed = only ? new Set(only) : null;
    let found = false;
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (allowed && !allowed.has(key)) continue;
      found = true;
      form.setError(key as keyof RegistrationInput, { message: issue.message });
    }
    return !found;
  }

  function continueStep() {
    if (showIssues(stepFields[step])) setStep((current) => Math.min(current + 1, 3));
  }

  async function submit() {
    if (!showIssues()) {
      const parsed = registrationSchema.safeParse(form.getValues());
      const first = String(parsed.success ? "" : parsed.error.issues[0]?.path[0] ?? "");
      const index = stepFields.findIndex((fields) => fields.includes(first));
      if (index >= 0) setStep(index);
      return;
    }
    setPending(true);
    setFormError("");
    const data = new FormData();
    if (cv) data.set("cv", cv);
    const result = await registerParticipant(form.getValues(), data);
    setPending(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    if (result.token) router.push(`/inscription/confirmation?token=${result.token}`);
  }

  const closed = !site.settings.registrationOpen;
  const full = site.settings.confirmedCount >= site.settings.capacity;
  if (closed || full) {
    return <p className="rounded-3xl bg-white p-8 text-lg text-night">{closed ? copy.closed : copy.full}</p>;
  }

  return (
    <form
      className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(11,27,58,0.06)] md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 3) continueStep();
        else void submit();
      }}
      noValidate
    >
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={copy.title}>
        {copy.steps.map((label, index) => (
          <li key={label} className="grid gap-2">
            <span className={cn("h-1 rounded-full", index <= step ? "bg-gold" : "bg-mist")} />
            <span className={cn("text-[11px] uppercase tracking-[0.14em]", index === step ? "text-night" : "text-institution/60")}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium">Civilité</legend>
            <div className="flex gap-3">
              {(["MADAME", "MONSIEUR"] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 rounded-full border border-night/10 px-4 py-2">
                  <input type="radio" value={value} {...form.register("civility")} />
                  {value === "MADAME" ? (locale === "ar" ? "السيدة" : "Madame") : locale === "ar" ? "السيد" : "Monsieur"}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={locale === "ar" ? "الاسم العائلي" : "Nom"} error={form.formState.errors.lastName?.message}>
            <input className="field" {...form.register("lastName")} autoComplete="family-name" />
          </Field>
          <Field label={locale === "ar" ? "الاسم الشخصي" : "Prénom"} error={form.formState.errors.firstName?.message}>
            <input className="field" {...form.register("firstName")} autoComplete="given-name" />
          </Field>
          <Field label={locale === "ar" ? "البريد الإلكتروني" : "Adresse e-mail"} error={form.formState.errors.email?.message}>
            <input className="field" type="email" {...form.register("email")} autoComplete="email" />
          </Field>
          <Field label={locale === "ar" ? "الهاتف" : "Téléphone"} error={form.formState.errors.phone?.message}>
            <div className="flex">
              <span className="grid place-items-center rounded-s-2xl border border-e-0 border-night/15 bg-mist px-3 text-sm">+212</span>
              <input className="field rounded-s-none" inputMode="numeric" maxLength={9} {...form.register("phone")} autoComplete="tel-national" />
            </div>
          </Field>
          <Field label={locale === "ar" ? "المدينة" : "Ville"} error={form.formState.errors.city?.message}>
            <select className="field" {...form.register("city")}>
              {CITIES.map((city) => (
                <option key={city.value} value={city.value}>{locale === "ar" ? city.ar : city.fr}</option>
              ))}
            </select>
          </Field>
          {values.city === "OTHER" ? (
            <Field label={locale === "ar" ? "حدد المدينة" : "Précisez la ville"} error={form.formState.errors.cityOther?.message}>
              <input className="field" {...form.register("cityOther")} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4">
          <Field label={locale === "ar" ? "نوع المشاركة" : "Type de participant"} error={form.formState.errors.participantType?.message}>
            <select className="field" {...form.register("participantType")}>
              {PARTICIPANT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{locale === "ar" ? type.ar : type.fr}</option>
              ))}
            </select>
          </Field>
          <Field label={locale === "ar" ? "المؤسسة أو المقاولة" : "Établissement ou entreprise"} error={form.formState.errors.organization?.message}>
            <input className="field" {...form.register("organization")} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={locale === "ar" ? "المستوى الدراسي" : "Niveau d'études"} error={form.formState.errors.educationLevel?.message}>
              <select className="field" {...form.register("educationLevel")}>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{locale === "ar" ? level.ar : level.fr}</option>
                ))}
              </select>
            </Field>
            <Field label={locale === "ar" ? "السنة" : "Année"} error={form.formState.errors.studyYear?.message}>
              <select className="field" {...form.register("studyYear")}>
                {STUDY_YEARS.map((year) => (
                  <option key={year.value} value={year.value}>{locale === "ar" ? year.ar : year.fr}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={locale === "ar" ? "الشعبة" : "Filière"} error={form.formState.errors.fieldOfStudy?.message}>
            <input className="field" {...form.register("fieldOfStudy")} />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6">
          <fieldset>
            <legend className="mb-3 font-medium">{locale === "ar" ? "المهن التي تهمكم" : "Métiers qui vous intéressent"}</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {site.careers.map((career) => (
                <label key={career.id} className="flex items-start gap-3 rounded-2xl border border-night/10 p-3">
                  <input type="checkbox" value={career.id} {...form.register("interests")} className="mt-1" />
                  <span>{tx(locale, career.title.fr, career.title.ar)}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.interests ? <p className="mt-2 text-sm text-red-700">{form.formState.errors.interests.message}</p> : null}
          </fieldset>
          <fieldset>
            <legend className="mb-3 font-medium">{locale === "ar" ? "الجلسات المرغوبة" : "Sessions souhaitées"}</legend>
            <div className="grid gap-2">
              {site.program.filter((item) => item.category === "workshop" || item.category === "roundtable").map((item) => (
                <label key={item.id} className="flex items-start gap-3 rounded-2xl border border-night/10 p-3">
                  <input type="checkbox" value={item.id} {...form.register("sessions")} className="mt-1" />
                  <span>{item.startTime} — {tx(locale, item.title.fr, item.title.ar)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={locale === "ar" ? "كيف عرفتم بالمنتدى؟" : "Comment avez-vous connu le Forum ?"}>
            <select className="field" {...form.register("discoverySource")}>
              {DISCOVERY_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>{locale === "ar" ? source.ar : source.fr}</option>
              ))}
            </select>
          </Field>
          <Field label={locale === "ar" ? "توقعاتكم" : "Vos attentes"} error={form.formState.errors.expectations?.message}>
            <textarea className="field min-h-28" {...form.register("expectations")} />
          </Field>
          <Field label={locale === "ar" ? "رابط معرض أعمال أو LinkedIn" : "Portfolio ou LinkedIn"} error={form.formState.errors.portfolioUrl?.message}>
            <input className="field" placeholder="https://" {...form.register("portfolioUrl")} />
          </Field>
          <Field label={locale === "ar" ? "سيرة ذاتية PDF، اختيارية" : "CV au format PDF, facultatif"}>
            <input
              className="field"
              type="file"
              accept="application/pdf"
              onChange={(event) => setCv(event.target.files?.[0] ?? null)}
            />
          </Field>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <div className="rounded-3xl bg-mist p-5 leading-7">
            <p className="text-2xl text-night">{values.firstName} {values.lastName}</p>
            <p>{values.email}</p>
            <p>+212 {values.phone}</p>
            <p>{values.city === "OTHER" ? values.cityOther : values.city}</p>
            <p>{labelOf(PARTICIPANT_TYPES, values.participantType, locale)} — {values.organization}</p>
            <p>{labelOf(EDUCATION_LEVELS, values.educationLevel, locale)} · {values.fieldOfStudy}</p>
          </div>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" {...form.register("consentRules")} />
            <span>
              {locale === "ar"
                ? "أوافق على نظام المنتدى وعلى معالجة معطياتي لتنظيم مشاركتي."
                : "J'accepte le règlement du Forum et le traitement de mes données pour organiser ma participation."}{" "}
              <a className="underline" href="/confidentialite">{locale === "ar" ? "الخصوصية" : "Confidentialité"}</a>
            </span>
          </label>
          {form.formState.errors.consentRules ? <p className="text-sm text-red-700">{form.formState.errors.consentRules.message}</p> : null}
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" {...form.register("consentContact")} />
            <span>{locale === "ar" ? "أوافق على أن تتواصل معي الشركات الشريكة بشأن الفرص." : "J'accepte d'être contacté par les entreprises partenaires au sujet d'opportunités."}</span>
          </label>
        </div>
      ) : null}

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          {copy.honeypot}
          <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
      </div>

      {formError ? <p className="mt-4 text-sm text-red-700" role="alert">{formError}</p> : null}
      <div className="mt-8 flex justify-between gap-3">
        <button type="button" className="h-11 rounded-full px-5 text-institution disabled:opacity-40" disabled={step === 0 || pending} onClick={() => setStep((current) => current - 1)}>
          {copy.back}
        </button>
        <button type="submit" disabled={pending} className="h-12 rounded-full bg-night px-6 font-semibold text-beige disabled:opacity-60">
          {pending ? "…" : step < 3 ? copy.next : copy.submit}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-night">{label}</span>
      {children}
      {error ? <span className="text-red-700">{error}</span> : null}
    </label>
  );
}
