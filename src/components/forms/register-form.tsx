"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, Check, FileUp, GraduationCap, Lock, Sparkles, UserSearch } from "lucide-react";
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
  const reduce = useReducedMotion();
  const errors = form.formState.errors;
  const ar = locale === "ar";

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
    return (
      <div className="admin-card grid place-items-center gap-3 p-10 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-mist text-institution"><Lock className="size-6" /></span>
        <p className="display text-2xl text-night">{closed ? copy.closed : copy.full}</p>
      </div>
    );
  }

  const typeIcons: Record<string, typeof Briefcase> = {
    STUDENT: GraduationCap,
    GRADUATE: Award,
    PROFESSIONAL: Briefcase,
    TEACHER: BookOpen,
    RECRUITER: UserSearch,
    OTHER: Sparkles,
  };
  const sessions = site.program.filter((item) => item.category === "workshop" || item.category === "roundtable");
  const choice = (active: boolean) =>
    cn(
      "relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
      active ? "border-night bg-night text-beige shadow-lg shadow-night/15" : "border-night/10 bg-white hover:border-gold",
    );
  const tick = (active: boolean) =>
    cn("grid size-5 shrink-0 place-items-center rounded-md border transition", active ? "border-gold bg-gold text-night" : "border-night/20 bg-white text-transparent");

  return (
    <form
      className="relative overflow-hidden rounded-[2rem] border border-night/[0.06] bg-white p-5 shadow-[0_30px_80px_-40px_rgba(11,27,58,0.35)] md:p-9"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 3) continueStep();
        else void submit();
      }}
      noValidate
    >
      <ol className="mb-9 flex items-center" aria-label={copy.title}>
        {copy.steps.map((label, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={label} className={cn("flex items-center", index < copy.steps.length - 1 && "flex-1")}>
              <span className="flex items-center gap-2.5">
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition duration-500",
                    done ? "bg-gold text-night" : current ? "bg-night text-gold shadow-lg shadow-night/25" : "bg-mist text-institution/60",
                  )}
                >
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span className={cn("hidden text-sm sm:inline", current ? "font-medium text-night" : "text-institution/70")}>{label}</span>
              </span>
              {index < copy.steps.length - 1 ? (
                <span className="mx-3 h-px flex-1 overflow-hidden rounded-full bg-mist">
                  <span className={cn("block h-full bg-gold transition-all duration-700", done ? "w-full" : "w-0")} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mb-6 text-sm text-institution sm:hidden">
        {step + 1}/4 · <span className="font-medium text-night">{copy.steps[step]}</span>
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: ar ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: ar ? 24 : -24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <fieldset className="md:col-span-2">
                <legend className="mb-2 text-sm font-medium text-night">{ar ? "اللقب" : "Civilité"}</legend>
                <div className="inline-flex rounded-full bg-mist p-1">
                  {(["MADAME", "MONSIEUR"] as const).map((value) => (
                    <label
                      key={value}
                      className={cn(
                        "cursor-pointer rounded-full px-5 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
                        values.civility === value ? "bg-night text-white shadow" : "text-institution hover:text-night",
                      )}
                    >
                      <input type="radio" value={value} className="sr-only" {...form.register("civility")} />
                      {value === "MADAME" ? (ar ? "السيدة" : "Madame") : ar ? "السيد" : "Monsieur"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={ar ? "الاسم العائلي" : "Nom"} error={errors.lastName?.message}>
                <input className="field" {...form.register("lastName")} autoComplete="family-name" />
              </Field>
              <Field label={ar ? "الاسم الشخصي" : "Prénom"} error={errors.firstName?.message}>
                <input className="field" {...form.register("firstName")} autoComplete="given-name" />
              </Field>
              <Field label={ar ? "البريد الإلكتروني" : "Adresse e-mail"} error={errors.email?.message}>
                <input className="field" type="email" {...form.register("email")} autoComplete="email" />
              </Field>
              <Field label={ar ? "الهاتف" : "Téléphone"} error={errors.phone?.message}>
                <div className="flex">
                  <span className="grid place-items-center rounded-s-[0.9rem] border border-e-0 border-night/15 bg-mist px-3 text-sm text-institution">+212</span>
                  <input className="field rounded-s-none" inputMode="numeric" maxLength={9} placeholder="6XXXXXXXX" {...form.register("phone")} autoComplete="tel-national" />
                </div>
              </Field>
              <Field label={ar ? "المدينة" : "Ville"} error={errors.city?.message}>
                <select className="field" {...form.register("city")}>
                  {CITIES.map((city) => (
                    <option key={city.value} value={city.value}>{ar ? city.ar : city.fr}</option>
                  ))}
                </select>
              </Field>
              {values.city === "OTHER" ? (
                <Field label={ar ? "حدد المدينة" : "Précisez la ville"} error={errors.cityOther?.message}>
                  <input className="field" {...form.register("cityOther")} />
                </Field>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5">
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-night">{ar ? "أنا" : "Je suis"}</legend>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {PARTICIPANT_TYPES.map((type) => {
                    const Icon = typeIcons[type.value] ?? Sparkles;
                    const active = values.participantType === type.value;
                    return (
                      <label key={type.value} className={cn(choice(active), "flex-col gap-2 p-3.5")}>
                        <input type="radio" value={type.value} className="sr-only" {...form.register("participantType")} />
                        <Icon className={cn("size-5", active ? "text-gold" : "text-institution")} />
                        <span className="text-sm font-medium">{ar ? type.ar : type.fr}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.participantType ? <p className="mt-2 text-sm text-red-700">{errors.participantType.message}</p> : null}
              </fieldset>
              <Field label={ar ? "المؤسسة أو المقاولة" : "Établissement ou entreprise"} error={errors.organization?.message}>
                <input className="field" {...form.register("organization")} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={ar ? "المستوى الدراسي" : "Niveau d'études"} error={errors.educationLevel?.message}>
                  <select className="field" {...form.register("educationLevel")}>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{ar ? level.ar : level.fr}</option>
                    ))}
                  </select>
                </Field>
                <Field label={ar ? "السنة" : "Année"} error={errors.studyYear?.message}>
                  <select className="field" {...form.register("studyYear")}>
                    {STUDY_YEARS.map((year) => (
                      <option key={year.value} value={year.value}>{ar ? year.ar : year.fr}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label={ar ? "الشعبة" : "Filière"} error={errors.fieldOfStudy?.message}>
                <input className="field" {...form.register("fieldOfStudy")} />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-7">
              <fieldset>
                <legend className="mb-1 font-medium text-night">{ar ? "المهن التي تهمكم" : "Métiers qui vous intéressent"}</legend>
                <p className="mb-3 text-sm text-institution">{ar ? "اختر واحداً أو أكثر." : "Choisissez-en un ou plusieurs."}</p>
                <div className="flex flex-wrap gap-2">
                  {site.careers.map((career) => {
                    const active = values.interests?.includes(career.id);
                    return (
                      <label
                        key={career.id}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
                          active ? "border-night bg-night text-white" : "border-night/15 bg-white text-night hover:border-gold",
                        )}
                      >
                        <input type="checkbox" value={career.id} className="sr-only" {...form.register("interests")} />
                        {active ? <Check className="size-3.5 text-gold" /> : null}
                        {tx(locale, career.title.fr, career.title.ar)}
                      </label>
                    );
                  })}
                </div>
                {errors.interests ? <p className="mt-2 text-sm text-red-700">{errors.interests.message}</p> : null}
              </fieldset>
              {sessions.length ? (
                <fieldset>
                  <legend className="mb-3 font-medium text-night">{ar ? "الجلسات المرغوبة" : "Sessions souhaitées"}</legend>
                  <div className="grid gap-2 md:grid-cols-2">
                    {sessions.map((item) => {
                      const active = Boolean(values.sessions?.includes(item.id));
                      return (
                        <label key={item.id} className={choice(active)}>
                          <input type="checkbox" value={item.id} className="sr-only" {...form.register("sessions")} />
                          <span className={tick(active)}><Check className="size-3.5" /></span>
                          <span className="grid gap-0.5">
                            <span className={cn("text-xs", active ? "text-gold" : "text-institution")}>{item.startTime} – {item.endTime}</span>
                            <span className="text-sm font-medium">{tx(locale, item.title.fr, item.title.ar)}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ) : null}
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={ar ? "كيف عرفتم بالمنتدى؟" : "Comment avez-vous connu le Forum ?"}>
                  <select className="field" {...form.register("discoverySource")}>
                    {DISCOVERY_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>{ar ? source.ar : source.fr}</option>
                    ))}
                  </select>
                </Field>
                <Field label={ar ? "رابط معرض أعمال أو LinkedIn" : "Portfolio ou LinkedIn"} error={errors.portfolioUrl?.message}>
                  <input className="field" placeholder="https://" {...form.register("portfolioUrl")} />
                </Field>
              </div>
              <Field label={ar ? "توقعاتكم" : "Vos attentes"} error={errors.expectations?.message}>
                <textarea className="field min-h-28" {...form.register("expectations")} />
              </Field>
              <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-night/15 p-5 transition hover:border-gold hover:bg-gold/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl transition", cv ? "bg-emerald-50 text-emerald-600" : "bg-mist text-institution group-hover:text-gold")}>
                  {cv ? <Check className="size-5" /> : <FileUp className="size-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-night">{cv ? cv.name : ar ? "أضف سيرتك الذاتية (PDF)" : "Ajouter mon CV (PDF)"}</span>
                  <span className="text-xs text-institution">{cv ? `${(cv.size / 1024 / 1024).toFixed(1)} Mo` : ar ? "اختياري" : "Facultatif · PDF uniquement"}</span>
                </span>
                <input type="file" accept="application/pdf" className="sr-only" onChange={(event) => setCv(event.target.files?.[0] ?? null)} />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-5">
              <div className="relative overflow-hidden rounded-3xl bg-night p-6 text-beige">
                <div className="pointer-events-none absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" />
                <p className="text-[11px] uppercase tracking-[0.24em] text-gold">{ar ? "ملخص" : "Récapitulatif"}</p>
                <p className="display mt-2 text-3xl text-white">{values.firstName} {values.lastName}</p>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    [ar ? "البريد" : "E-mail", values.email],
                    [ar ? "الهاتف" : "Téléphone", `+212 ${values.phone}`],
                    [ar ? "المدينة" : "Ville", values.city === "OTHER" ? values.cityOther : values.city],
                    [ar ? "الملف" : "Profil", `${labelOf(PARTICIPANT_TYPES, values.participantType, locale)}${values.organization ? ` · ${values.organization}` : ""}`],
                    [ar ? "المستوى" : "Niveau", `${labelOf(EDUCATION_LEVELS, values.educationLevel, locale)}${values.fieldOfStudy ? ` · ${values.fieldOfStudy}` : ""}`],
                    [ar ? "الاهتمامات" : "Intérêts", `${values.interests?.length ?? 0} ${ar ? "مهن" : "métier(s)"}${values.sessions?.length ? ` · ${values.sessions.length} session(s)` : ""}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/[0.06] px-4 py-3">
                      <dt className="text-xs text-beige/60">{label}</dt>
                      <dd className="truncate text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <label className={choice(Boolean(values.consentRules))}>
                <input type="checkbox" className="sr-only" {...form.register("consentRules")} />
                <span className={tick(Boolean(values.consentRules))}><Check className="size-3.5" /></span>
                <span className="text-sm leading-6">
                  {ar
                    ? "أوافق على نظام المنتدى وعلى معالجة معطياتي لتنظيم مشاركتي."
                    : "J'accepte le règlement du Forum et le traitement de mes données pour organiser ma participation."}{" "}
                  <a className="underline" href="/confidentialite">{ar ? "الخصوصية" : "Confidentialité"}</a>
                </span>
              </label>
              {errors.consentRules ? <p className="-mt-3 text-sm text-red-700">{errors.consentRules.message}</p> : null}
              <label className={choice(Boolean(values.consentContact))}>
                <input type="checkbox" className="sr-only" {...form.register("consentContact")} />
                <span className={tick(Boolean(values.consentContact))}><Check className="size-3.5" /></span>
                <span className="text-sm leading-6">{ar ? "أوافق على أن تتواصل معي الشركات الشريكة بشأن الفرص." : "J'accepte d'être contacté par les entreprises partenaires au sujet d'opportunités."}</span>
              </label>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          {copy.honeypot}
          <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
      </div>

      {formError ? <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{formError}</p> : null}
      <div className="mt-9 flex items-center justify-between gap-3 border-t border-night/[0.06] pt-6">
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-institution transition hover:bg-mist disabled:invisible"
          disabled={step === 0 || pending}
          onClick={() => setStep((current) => current - 1)}
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" /> {copy.back}
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "group inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold transition disabled:opacity-60",
            step < 3 ? "bg-night text-beige hover:bg-institution" : "bg-gold text-night shadow-lg shadow-gold/30 hover:bg-gold-bright",
          )}
        >
          {pending ? "…" : step < 3 ? copy.next : copy.submit}
          {pending ? null : <ArrowRight className="size-4 transition group-hover:translate-x-0.5 rtl:-scale-x-100" />}
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
