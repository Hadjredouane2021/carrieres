"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  CircleAlert,
  CloudUpload,
  FileText,
  Gift,
  GraduationCap,
  Pencil,
  Presentation,
  QrCode,
  Sparkles,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/site/icons";
import {
  CITIES,
  DISCOVERY_SOURCES,
  EDUCATION_LEVELS,
  labelOf,
  PARTICIPANT_TYPES,
  STUDY_YEARS,
} from "@/lib/constants";
import type { eventDateParts } from "@/lib/datetime";
import { dictionary, tx, type Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import { registrationSchema, type RegistrationInput } from "@/lib/validators";
import { registerParticipant } from "@/server/actions/public";
import { cn, placeLabel } from "@/lib/utils";

const stepFields = [
  ["civility", "lastName", "firstName", "email", "phone", "city", "cityOther"],
  ["participantType", "organization", "educationLevel", "fieldOfStudy", "studyYear"],
  ["interests", "sessions", "discoverySource", "expectations", "portfolioUrl"],
  ["consentRules"],
];

const typeIcons: Record<RegistrationInput["participantType"], LucideIcon> = {
  STUDENT: GraduationCap,
  GRADUATE: BadgeCheck,
  PROFESSIONAL: Briefcase,
  TEACHER: Presentation,
  RECRUITER: Users,
  OTHER: Sparkles,
};
const perkIcons = [Gift, Ticket, QrCode];
const ease = [0.22, 1, 0.36, 1] as const;

const choiceCard =
  "relative flex cursor-pointer rounded-2xl border border-night/10 bg-mist/40 transition hover:border-night/25 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:shadow-[0_12px_30px_-16px_rgba(216,181,122,0.9)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold";
const choiceIcon =
  "grid shrink-0 place-items-center rounded-xl bg-white text-institution shadow-sm transition peer-checked:bg-night peer-checked:text-gold";
const choiceTick =
  "grid size-5 shrink-0 place-items-center rounded-full border border-night/15 bg-white text-transparent transition peer-checked:border-gold peer-checked:bg-gold peer-checked:text-night";

export function RegisterForm({ site, locale, when }: { site: SiteData; locale: Locale; when: ReturnType<typeof eventDateParts> }) {
  const copy = dictionary[locale].register;
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pending, setPending] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);
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
  const errors = form.formState.errors;
  const invalid = (name: keyof RegistrationInput) => (errors[name] ? true : undefined);

  // Après un changement d'étape : focus sur le titre, et retour en haut du formulaire s'il est sorti de l'écran.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    if (formRef.current && formRef.current.getBoundingClientRect().top < 0) {
      formRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [step, reduce]);

  function goTo(index: number) {
    setDirection(index > step ? 1 : -1);
    setStep(index);
  }

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
    if (showIssues(stepFields[step])) goTo(Math.min(step + 1, 3));
  }

  async function submit() {
    if (!showIssues()) {
      const parsed = registrationSchema.safeParse(form.getValues());
      const first = String(parsed.success ? "" : parsed.error.issues[0]?.path[0] ?? "");
      const index = stepFields.findIndex((fields) => fields.includes(first));
      if (index >= 0) goTo(index);
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

  function clearCv() {
    setCv(null);
    if (cvInput.current) cvInput.current.value = "";
  }

  const closed = !site.settings.registrationOpen;
  const full = site.settings.confirmedCount >= site.settings.capacity;
  if (closed || full) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-[0_40px_120px_-40px_rgba(11,27,58,0.35)] ring-1 ring-night/5 md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-night text-gold">
          <Ticket className="size-6" aria-hidden="true" />
        </span>
        <p className="display mt-6 text-3xl leading-tight text-night text-balance">{closed ? copy.closed : copy.full}</p>
        <Link href="/contact" className="mt-8 inline-flex h-12 items-center rounded-full bg-night px-6 font-semibold text-beige transition hover:bg-institution">
          {copy.contactTeam}
        </Link>
      </div>
    );
  }

  const seats = Math.max(site.settings.capacity - site.settings.confirmedCount, 0);
  const chosenCareers = site.careers.filter((career) => values.interests?.includes(career.id));
  const hero = dictionary[locale].hero;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        ref={formRef}
        className="scroll-mt-28 rounded-[2rem] bg-white p-5 shadow-[0_40px_120px_-40px_rgba(11,27,58,0.35)] ring-1 ring-night/5 sm:p-8 md:p-10"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) continueStep();
          else void submit();
        }}
        noValidate
      >
        <ol className="flex items-center gap-2" aria-label={copy.title}>
          {copy.steps.map((label, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                <button
                  type="button"
                  disabled={!done || pending}
                  onClick={() => goTo(index)}
                  aria-current={current ? "step" : undefined}
                  className="flex items-center gap-2.5 rounded-full text-start enabled:hover:opacity-80"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-300",
                      done ? "bg-gold text-night" : current ? "bg-night text-white ring-4 ring-gold/25" : "bg-mist text-institution/60",
                    )}
                  >
                    {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={cn("hidden whitespace-nowrap text-sm md:block", current ? "font-medium text-night" : "text-institution/70")}>{label}</span>
                </button>
                {index < copy.steps.length - 1 ? (
                  <span className="relative h-px flex-1 overflow-hidden bg-night/10">
                    <span className={cn("absolute inset-0 origin-left bg-gold transition-transform duration-500 rtl:origin-right", done ? "scale-x-100" : "scale-x-0")} />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 md:mt-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#9a7640]">
            {copy.step} {step + 1} / {copy.steps.length}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="display mt-2 text-3xl text-night outline-none md:text-4xl">
            {copy.steps[step]}
          </h2>
          <p className="mt-2 text-institution">{copy.hints[step]}</p>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={reduce ? false : { opacity: 0, x: 28 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -28 * direction }}
            transition={{ duration: 0.28, ease }}
            className="mt-8"
          >
            {step === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <fieldset className="md:col-span-2">
                  <legend className="mb-2 text-sm font-medium text-night">Civilité</legend>
                  <div className="inline-grid grid-cols-2 rounded-full bg-mist p-1">
                    {(["MADAME", "MONSIEUR"] as const).map((value) => (
                      <label
                        key={value}
                        className="cursor-pointer rounded-full px-6 py-2.5 text-center text-sm text-institution transition has-[:checked]:bg-night has-[:checked]:text-white has-[:checked]:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold"
                      >
                        <input type="radio" value={value} className="sr-only" {...form.register("civility")} />
                        {value === "MADAME" ? (locale === "ar" ? "السيدة" : "Madame") : locale === "ar" ? "السيد" : "Monsieur"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label={locale === "ar" ? "الاسم العائلي" : "Nom"} error={errors.lastName?.message}>
                  <input className="lux-field" aria-invalid={invalid("lastName")} {...form.register("lastName")} autoComplete="family-name" />
                </Field>
                <Field label={locale === "ar" ? "الاسم الشخصي" : "Prénom"} error={errors.firstName?.message}>
                  <input className="lux-field" aria-invalid={invalid("firstName")} {...form.register("firstName")} autoComplete="given-name" />
                </Field>
                <Field label={locale === "ar" ? "البريد الإلكتروني" : "Adresse e-mail"} error={errors.email?.message}>
                  <input className="lux-field" type="email" aria-invalid={invalid("email")} {...form.register("email")} autoComplete="email" placeholder="nom@exemple.ma" />
                </Field>
                <Field label={locale === "ar" ? "الهاتف" : "Téléphone"} error={errors.phone?.message}>
                  <div className="relative" dir="ltr">
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center gap-3 ps-4 text-sm font-medium text-institution">
                      +212
                      <span className="h-5 w-px bg-night/15" />
                    </span>
                    <input
                      className="lux-field"
                      style={{ paddingInlineStart: "4.75rem" }}
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="612345678"
                      aria-invalid={invalid("phone")}
                      {...form.register("phone")}
                      autoComplete="tel-national"
                    />
                  </div>
                </Field>
                <Field label={locale === "ar" ? "المدينة" : "Ville"} error={errors.city?.message}>
                  <select className="lux-field" aria-invalid={invalid("city")} {...form.register("city")}>
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>{locale === "ar" ? city.ar : city.fr}</option>
                    ))}
                  </select>
                </Field>
                {values.city === "OTHER" ? (
                  <Field label={locale === "ar" ? "حدد المدينة" : "Précisez la ville"} error={errors.cityOther?.message}>
                    <input className="lux-field" aria-invalid={invalid("cityOther")} {...form.register("cityOther")} />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-night">{locale === "ar" ? "نوع المشاركة" : "Type de participant"}</legend>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {PARTICIPANT_TYPES.map((type) => {
                      const TypeIcon = typeIcons[type.value];
                      return (
                        <label key={type.value} className={cn(choiceCard, "flex-col gap-3 p-4")}>
                          <input type="radio" value={type.value} className="peer sr-only" {...form.register("participantType")} />
                          <span className={cn(choiceIcon, "size-10")}>
                            <TypeIcon className="size-5" aria-hidden="true" />
                          </span>
                          <span className="pe-6 text-sm font-medium text-night">{locale === "ar" ? type.ar : type.fr}</span>
                          <span className={cn(choiceTick, "absolute end-3 top-3")}>
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label={locale === "ar" ? "المؤسسة أو المقاولة" : "Établissement ou entreprise"} error={errors.organization?.message}>
                  <input className="lux-field" aria-invalid={invalid("organization")} {...form.register("organization")} />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={locale === "ar" ? "المستوى الدراسي" : "Niveau d'études"} error={errors.educationLevel?.message}>
                    <select className="lux-field" aria-invalid={invalid("educationLevel")} {...form.register("educationLevel")}>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{locale === "ar" ? level.ar : level.fr}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={locale === "ar" ? "السنة" : "Année"} error={errors.studyYear?.message}>
                    <select className="lux-field" aria-invalid={invalid("studyYear")} {...form.register("studyYear")}>
                      {STUDY_YEARS.map((year) => (
                        <option key={year.value} value={year.value}>{locale === "ar" ? year.ar : year.fr}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={locale === "ar" ? "الشعبة" : "Filière"} error={errors.fieldOfStudy?.message}>
                  <input className="lux-field" aria-invalid={invalid("fieldOfStudy")} {...form.register("fieldOfStudy")} />
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-7">
                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-medium text-night">
                    {locale === "ar" ? "المهن التي تهمكم" : "Métiers qui vous intéressent"}
                    {chosenCareers.length ? (
                      <span className="rounded-full bg-night px-2 py-0.5 text-[11px] text-gold">{chosenCareers.length}</span>
                    ) : null}
                  </legend>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {site.careers.map((career) => (
                      <label key={career.id} className={cn(choiceCard, "items-center gap-3 p-3")}>
                        <input type="checkbox" value={career.id} className="peer sr-only" {...form.register("interests")} />
                        <span className={cn(choiceIcon, "size-9")}>
                          <Icon name={career.icon} className="size-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium text-night">{tx(locale, career.title.fr, career.title.ar)}</span>
                        <span className={cn(choiceTick, "rounded-md")}>
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.interests ? <ErrorText>{errors.interests.message}</ErrorText> : null}
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-night">{locale === "ar" ? "الجلسات المرغوبة" : "Sessions souhaitées"}</legend>
                  <div className="grid gap-2.5">
                    {site.program.filter((item) => item.category === "workshop" || item.category === "roundtable").map((item) => (
                      <label key={item.id} className={cn(choiceCard, "items-center gap-3 p-3")}>
                        <input type="checkbox" value={item.id} className="peer sr-only" {...form.register("sessions")} />
                        <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-institution shadow-sm transition peer-checked:bg-night peer-checked:text-gold" dir="ltr">
                          {item.startTime}
                        </span>
                        <span className="flex-1 text-sm font-medium text-night">{tx(locale, item.title.fr, item.title.ar)}</span>
                        <span className={cn(choiceTick, "rounded-md")}>
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={locale === "ar" ? "كيف عرفتم بالمنتدى؟" : "Comment avez-vous connu le Forum ?"}>
                    <select className="lux-field" {...form.register("discoverySource")}>
                      {DISCOVERY_SOURCES.map((source) => (
                        <option key={source.value} value={source.value}>{locale === "ar" ? source.ar : source.fr}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={locale === "ar" ? "رابط معرض أعمال أو LinkedIn" : "Portfolio ou LinkedIn"} error={errors.portfolioUrl?.message}>
                    <input className="lux-field" placeholder="https://" aria-invalid={invalid("portfolioUrl")} {...form.register("portfolioUrl")} />
                  </Field>
                </div>
                <Field label={locale === "ar" ? "توقعاتكم" : "Vos attentes"} error={errors.expectations?.message}>
                  <textarea className="lux-field" aria-invalid={invalid("expectations")} {...form.register("expectations")} />
                </Field>
                <div className="grid gap-2 text-sm">
                  <span className="font-medium text-night">{locale === "ar" ? "سيرة ذاتية PDF، اختيارية" : "CV au format PDF, facultatif"}</span>
                  {cv ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-gold/60 bg-gold/10 p-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-night text-gold">
                        <FileText className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-night">{cv.name}</span>
                        <span className="text-xs text-institution">{(cv.size / (1024 * 1024)).toFixed(2)} Mo</span>
                      </span>
                      <button type="button" onClick={clearCv} className="rounded-full px-3 py-1.5 text-sm text-institution transition hover:bg-white">
                        {copy.removeFile}
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        setCv(event.dataTransfer.files[0] ?? null);
                      }}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-night/15 bg-mist/40 px-6 py-8 text-center transition hover:border-gold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
                        dragging && "border-gold bg-gold/10",
                      )}
                    >
                      <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#9a7640] shadow-sm">
                        <CloudUpload className="size-6" aria-hidden="true" />
                      </span>
                      <span className="mt-1 font-medium text-night">{copy.dropCv}</span>
                      <span className="text-xs text-institution">{copy.dropCvHint}</span>
                      <input ref={cvInput} type="file" accept="application/pdf" className="sr-only" onChange={(event) => setCv(event.target.files?.[0] ?? null)} />
                    </label>
                  )}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4">
                <Summary title={copy.steps[0]} edit={copy.edit} onEdit={() => goTo(0)}>
                  <p className="display text-2xl text-night">{values.firstName} {values.lastName}</p>
                  <p className="mt-1">{values.email}</p>
                  <p dir="ltr" className="text-start">+212 {values.phone}</p>
                  <p>{values.city === "OTHER" ? values.cityOther : labelOf(CITIES, values.city, locale)}</p>
                </Summary>
                <Summary title={copy.steps[1]} edit={copy.edit} onEdit={() => goTo(1)}>
                  <p className="font-medium text-night">{labelOf(PARTICIPANT_TYPES, values.participantType, locale)} — {values.organization}</p>
                  <p>{labelOf(EDUCATION_LEVELS, values.educationLevel, locale)}{values.fieldOfStudy ? ` · ${values.fieldOfStudy}` : ""}</p>
                </Summary>
                <Summary title={copy.steps[2]} edit={copy.edit} onEdit={() => goTo(2)}>
                  {chosenCareers.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {chosenCareers.map((career) => (
                        <li key={career.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-night ring-1 ring-night/10">
                          {tx(locale, career.title.fr, career.title.ar)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>—</p>
                  )}
                </Summary>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-night/10 p-4 transition has-[:checked]:border-gold has-[:checked]:bg-gold/5" data-invalid={errors.consentRules ? "" : undefined}>
                  <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]" aria-invalid={invalid("consentRules")} {...form.register("consentRules")} />
                  <span className="text-sm leading-6">
                    {locale === "ar"
                      ? "أوافق على نظام المنتدى وعلى معالجة معطياتي لتنظيم مشاركتي."
                      : "J'accepte le règlement du Forum et le traitement de mes données pour organiser ma participation."}{" "}
                    <a className="font-medium underline underline-offset-2" href="/confidentialite">{locale === "ar" ? "الخصوصية" : "Confidentialité"}</a>
                  </span>
                </label>
                {errors.consentRules ? <ErrorText>{errors.consentRules.message}</ErrorText> : null}
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-night/10 p-4 transition has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                  <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]" {...form.register("consentContact")} />
                  <span className="text-sm leading-6">{locale === "ar" ? "أوافق على أن تتواصل معي الشركات الشريكة بشأن الفرص." : "J'accepte d'être contacté par les entreprises partenaires au sujet d'opportunités."}</span>
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

        {formError ? (
          <p className="mt-6 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        ) : null}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-night/10 pt-6">
          <button
            type="button"
            className={cn("inline-flex h-12 items-center gap-2 rounded-full px-4 text-institution transition hover:bg-mist disabled:opacity-40", step === 0 && "invisible")}
            disabled={pending}
            onClick={() => goTo(step - 1)}
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {copy.back}
          </button>
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "group/cta inline-flex h-14 items-center gap-4 rounded-full pe-2 ps-7 font-semibold transition disabled:opacity-60",
              step < 3
                ? "bg-night text-beige shadow-[0_18px_40px_-18px_rgba(11,27,58,0.8)] hover:bg-institution"
                : "bg-gold text-night shadow-[0_18px_50px_-18px_rgba(216,181,122,0.95)] hover:bg-gold-bright",
            )}
          >
            {step < 3 ? copy.next : copy.submit}
            <span className={cn("grid size-10 place-items-center rounded-full transition-transform group-hover/cta:translate-x-0.5 rtl:group-hover/cta:-translate-x-0.5", step < 3 ? "bg-gold text-night" : "bg-night text-gold")}>
              {pending ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              ) : step < 3 ? (
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>
      </form>

      <aside className="grid gap-4 lg:sticky lg:top-28">
        <div className="ticket-notch relative overflow-hidden rounded-[1.75rem] bg-night text-white shadow-[0_40px_90px_-40px_rgba(11,27,58,0.85)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_0%,rgba(216,181,122,0.38),transparent_55%),radial-gradient(90%_60%_at_0%_100%,rgba(45,99,179,0.5),transparent_60%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[conic-gradient(from_210deg_at_75%_15%,#fff4dc,#9ad0ff,#e8cb9c,#c6a5ff,#fff4dc)] opacity-[0.16] mix-blend-overlay" />
          <div aria-hidden="true" className="noise absolute inset-0 opacity-20" />
          <div className="relative p-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-beige/70">
              <span>Assur&apos; Carrière</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-gold">2026</span>
            </div>
            <p className="mt-5 text-sm text-beige/80">{tx(locale, site.sections.hero?.title.fr ?? hero.title, site.sections.hero?.title.ar ?? hero.title)}</p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-gold">{copy.ticket}</p>
            <p className={cn("display mt-2 line-clamp-2 min-h-[2.1em] break-words text-3xl leading-[1.05]", !(values.firstName || values.lastName) && "text-white/30")}>
              {`${values.firstName} ${values.lastName}`.trim() || copy.namePlaceholder}
            </p>
            <p className="mt-2 truncate text-sm text-beige/70">
              {labelOf(PARTICIPANT_TYPES, values.participantType, locale)}
              {values.organization ? ` · ${values.organization}` : ""}
            </p>
          </div>
          <div className="relative mx-6 border-t border-dashed border-white/25" />
          <div className="relative flex h-[8.5rem] items-center justify-between gap-4 px-6">
            <dl className="grid min-w-0 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-beige/55">{hero.when}</dt>
                <dd className="mt-0.5 truncate font-medium">{when?.day ?? hero.date}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-beige/55">{hero.where}</dt>
                <dd className="mt-0.5 truncate font-medium">{placeLabel(site.settings.venueName, site.settings.city) || site.settings.city}</dd>
              </div>
            </dl>
            <div className="grid w-24 shrink-0 justify-items-center gap-1.5 text-center">
              <span className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-gold backdrop-blur">
                <QrCode className="size-8" aria-hidden="true" />
              </span>
              <span className="text-[9px] leading-tight text-beige/55">{copy.qr}</span>
            </div>
          </div>
        </div>
        <ul className="grid gap-1 rounded-[1.75rem] bg-white p-3 shadow-[0_30px_80px_-50px_rgba(11,27,58,0.5)] ring-1 ring-night/5">
          {copy.perks.map(([title, text], index) => {
            const PerkIcon = perkIcons[index] ?? Sparkles;
            return (
              <li key={title} className="flex items-center gap-3 rounded-2xl p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-[#9a7640]">
                  <PerkIcon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-medium text-night">{title}</span>
                  <span className="text-sm text-institution">{text}</span>
                </span>
              </li>
            );
          })}
          <li className="mt-1 flex items-center gap-3 rounded-2xl bg-night px-4 py-3.5 text-sm text-beige">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative size-2 rounded-full bg-emerald-400" />
            </span>
            <span>
              <strong className="font-semibold text-white">{seats.toLocaleString(locale === "ar" ? "ar-MA" : "fr-MA")}</strong> {copy.seats}
            </span>
          </li>
        </ul>
      </aside>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid content-start gap-2 text-sm" data-invalid={error ? "" : undefined}>
      <span className="font-medium text-night">{label}</span>
      {children}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1 flex items-center gap-1.5 text-sm text-red-700">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

function Summary({ title, edit, onEdit, children }: { title: string; edit: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-mist/60 p-5 leading-7 text-institution">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9a7640]">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-night transition hover:bg-white">
          <Pencil className="size-3" aria-hidden="true" />
          {edit}
        </button>
      </div>
      {children}
    </section>
  );
}
