"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CloudUpload,
  ExternalLink,
  FileText,
  Gift,
  Pencil,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/site/icons";
import { PrivacyContent } from "@/components/site/legal";
import { participantIcons } from "@/components/site/participant-icons";
import { buttonVariants } from "@/components/ui/button";
import { CITIES, DISCOVERY_SOURCES, labelOf, PARTICIPANT_TYPES, STUDY_YEARS } from "@/lib/constants";
import { levelLabel } from "@/lib/education";
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

// Aucun choix présélectionné : chaque valeur est une décision du participant.
const blank = {
  civility: "",
  lastName: "",
  firstName: "",
  email: "",
  phone: "",
  city: "",
  cityOther: "",
  participantType: "",
  organization: "",
  educationLevel: "",
  fieldOfStudy: "",
  studyYear: "",
  interests: [],
  sessions: [],
  discoverySource: "",
  expectations: "",
  portfolioUrl: "",
  consentRules: false,
  consentContact: false,
  website: "",
} as unknown as RegistrationInput;

// Brouillon conservé le temps de l'onglet (hors CV, consentements et honeypot) en cas de rechargement accidentel.
const DRAFT_KEY = "assurcarriere:inscription";
const DRAFT_FIELDS = stepFields.slice(0, 3).flat();

// Les règles de validation restent celles du serveur ; seuls les messages affichés passent au tutoiement.
const friendly: Record<string, string> = {
  "Choisissez une civilité.": "Choisis une civilité.",
  "Le nom est obligatoire.": "Indique ton nom.",
  "Le prénom est obligatoire.": "Indique ton prénom.",
  "L'adresse e-mail est obligatoire.": "Indique ton adresse e-mail.",
  "Adresse e-mail invalide.": "Cette adresse e-mail n'est pas valide (exemple : nom@exemple.ma).",
  "Saisissez 9 chiffres, par exemple 612345678.": "Saisis les 9 chiffres après +212, par exemple 612345678.",
  "La ville est obligatoire.": "Choisis ta ville.",
  "Précisez votre ville.": "Précise ta ville.",
  "Indiquez l'établissement ou l'entreprise.": "Indique ton établissement ou ton entreprise.",
  "Indiquez le niveau d'études.": "Choisis ton niveau d'études.",
  "Indiquez un niveau d'études.": "Choisis un niveau d'études (pas « Non concerné » pour ce profil).",
  "Indiquez l'année ou la situation.": "Choisis ton année ou ta situation.",
  "Indiquez la filière.": "Indique ta filière.",
  "Sélectionnez au moins un métier.": "Sélectionne au moins un métier.",
  "L'adresse doit commencer par http:// ou https://.": "Le lien doit commencer par http:// ou https://.",
  "L'acceptation du règlement est nécessaire.": "Coche cette case pour confirmer ton inscription.",
};
const enumMessages: Partial<Record<keyof RegistrationInput, string>> = {
  civility: "Choisis une civilité.",
  participantType: "Choisis ton profil.",
  discoverySource: "Indique comment tu as connu le Forum.",
};

const CV_MAX = 2 * 1024 * 1024;
const perkIcons = [Gift, Ticket, QrCode];
const ease = [0.22, 1, 0.36, 1] as const;

const choiceCard =
  "relative flex cursor-pointer rounded-2xl border border-night/10 bg-white transition hover:border-night/30 has-[:checked]:border-sun has-[:checked]:bg-dawn has-[:checked]:shadow-[0_12px_30px_-16px_rgba(255,122,26,0.8)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun-ink";
const choiceIcon =
  "grid shrink-0 place-items-center rounded-xl bg-mist text-institution transition peer-checked:bg-night peer-checked:text-sun";
const choiceTick =
  "grid size-5 shrink-0 place-items-center rounded-full border border-night/20 bg-white text-transparent transition peer-checked:border-sun peer-checked:bg-sun peer-checked:text-night";

export function RegisterForm({ site, locale, when }: { site: SiteData; locale: Locale; when: ReturnType<typeof eventDateParts> }) {
  const copy = dictionary[locale].register;
  const hero = dictionary[locale].hero;
  const ar = locale === "ar";
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pending, setPending] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState("");
  const [attempted, setAttempted] = useState<number[]>([]);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);
  const form = useForm<RegistrationInput>({ defaultValues: blank });
  const values = form.watch();
  const errors = form.formState.errors;
  const err = (name: keyof RegistrationInput) => errors[name]?.message;

  // Reprise du brouillon de l'onglet, s'il existe.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "null") as Partial<RegistrationInput> | null;
      if (saved) form.reset({ ...blank, ...saved, consentRules: false, consentContact: false, website: "" });
    } catch {
      // Stockage indisponible (navigation privée) : on repart d'un formulaire vide.
    }
    const subscription = form.watch((current) => {
      try {
        const draft = Object.fromEntries(DRAFT_FIELDS.map((key) => [key, current[key as keyof RegistrationInput]]));
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // Le brouillon est un confort : son échec ne bloque pas la saisie.
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Après une tentative sur l'étape courante, les erreurs se mettent à jour pendant la saisie.
  useEffect(() => {
    if (!attempted.includes(step)) return;
    const subscription = form.watch(() => showIssues(stepFields[step]));
    return () => subscription.unsubscribe();
    // showIssues ne dépend que du formulaire, stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempted, step, form]);

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

  function message(key: keyof RegistrationInput, raw: string, code: string) {
    if (code === "invalid_value" && enumMessages[key]) return enumMessages[key];
    return ar ? raw : (friendly[raw] ?? raw);
  }

  // Valide tout le schéma, n'affiche que les champs demandés ; renvoie le premier champ en erreur.
  function showIssues(only?: string[]) {
    const parsed = registrationSchema.safeParse(form.getValues());
    form.clearErrors();
    if (parsed.success) return null;
    const allowed = only ? new Set(only) : null;
    let first: keyof RegistrationInput | null = null;
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "") as keyof RegistrationInput;
      if (allowed && !allowed.has(key)) continue;
      if (form.getFieldState(key).error) continue;
      form.setError(key, { message: message(key, issue.message, issue.code) });
      first ??= key;
    }
    return first;
  }

  function focusField(key: keyof RegistrationInput) {
    const node = formRef.current?.querySelector<HTMLElement>(`[name="${key}"]`);
    node?.focus();
  }

  function continueStep() {
    setAttempted((list) => (list.includes(step) ? list : [...list, step]));
    const first = showIssues(stepFields[step]);
    if (first) {
      focusField(first);
      return;
    }
    goTo(Math.min(step + 1, 3));
  }

  async function submit() {
    if (submitting.current) return;
    setAttempted((list) => (list.includes(3) ? list : [...list, 3]));
    const first = showIssues();
    if (first) {
      const index = stepFields.findIndex((fields) => fields.includes(first));
      if (index >= 0 && index !== step) goTo(index);
      else focusField(first);
      return;
    }
    submitting.current = true;
    setPending(true);
    setFormError("");
    try {
      const data = new FormData();
      if (cv) data.set("cv", cv);
      const result = await registerParticipant(form.getValues(), data);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      if (result.token) {
        try {
          window.sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          // Rien à nettoyer.
        }
        router.push(`/inscription/confirmation?token=${result.token}`);
        return;
      }
    } catch {
      setFormError(ar ? "تعذر الاتصال. أعد المحاولة." : "La connexion a échoué. Vérifie ton réseau puis réessaie : ta saisie est conservée.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  // Contrôle immédiat du CV ; le serveur revérifie le format et le contenu.
  function pickCv(file: File | null | undefined) {
    setCvError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setCvError(ar ? "يجب أن تكون السيرة الذاتية بصيغة PDF." : "Le CV doit être un fichier PDF.");
      return;
    }
    if (file.size > CV_MAX) {
      setCvError(ar ? "يجب أن يقل حجم السيرة الذاتية عن 2 ميغابايت." : "Le CV doit peser moins de 2 Mo.");
      return;
    }
    setCv(file);
  }

  function clearCv() {
    setCv(null);
    setCvError("");
    if (cvInput.current) cvInput.current.value = "";
  }

  const closed = !site.settings.registrationOpen;
  const full = site.settings.confirmedCount >= site.settings.capacity;
  if (closed || full) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-[0_40px_120px_-40px_rgba(11,27,58,0.35)] ring-1 ring-night/5 md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-night text-sun">
          <Ticket className="size-6" aria-hidden="true" />
        </span>
        <p className="display mt-6 text-3xl leading-tight text-night text-balance">{closed ? copy.closed : copy.full}</p>
        <Link href="/contact" className={cn(buttonVariants({ variant: "night", size: "lg" }), "mt-8")}>
          {copy.contactTeam}
        </Link>
      </div>
    );
  }

  const seats = Math.max(site.settings.capacity - site.settings.confirmedCount, 0);
  const chosenCareers = site.careers.filter((career) => values.interests?.includes(career.id));
  const sessions = site.program.filter((item) => item.category === "workshop" || item.category === "roundtable");
  const academic = ["STUDENT", "GRADUATE", "TEACHER"].includes(values.participantType);
  const stepErrors = stepFields[step].filter((key) => errors[key as keyof RegistrationInput]).length;
  const optional = ar ? "اختياري" : "facultatif";
  const choose = ar ? "اختر…" : "Choisir…";
  const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

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
        aria-busy={pending}
      >
        {/* Progression */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em]">
            <span className="text-sun-ink">
              {copy.step} {step + 1} / {copy.steps.length}
            </span>
            <span className="text-muted">{Math.round(((step + 1) / copy.steps.length) * 100)} %</span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-night/[0.07]"
            role="progressbar"
            aria-label={copy.title}
            aria-valuemin={1}
            aria-valuemax={copy.steps.length}
            aria-valuenow={step + 1}
            aria-valuetext={`${copy.step} ${step + 1} / ${copy.steps.length} : ${copy.steps[step]}`}
          >
            <span className="block h-full rounded-full bg-sun transition-[width] duration-500" style={{ width: `${((step + 1) / copy.steps.length) * 100}%` }} />
          </div>
          <ol className="mt-4 grid grid-cols-4 gap-2" aria-label={copy.title}>
            {copy.steps.map((label, index) => {
              const done = index < step;
              const current = index === step;
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!done || pending}
                    onClick={() => goTo(index)}
                    aria-current={current ? "step" : undefined}
                    className="flex w-full flex-col items-start gap-1.5 rounded-xl text-start enabled:hover:opacity-80 sm:flex-row sm:items-center sm:gap-2.5"
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors duration-300 sm:size-8",
                        done ? "bg-sun text-night" : current ? "bg-night text-white ring-4 ring-sun/25" : "bg-mist text-muted",
                      )}
                    >
                      {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                    </span>
                    <span className={cn("text-[11px] leading-tight sm:text-sm", current ? "font-semibold text-night" : "text-muted")}>
                      {label}
                      {done ? <span className="sr-only"> ({ar ? "مكتملة" : "terminée"})</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 md:mt-10">
          <h2 ref={headingRef} tabIndex={-1} className="display text-3xl text-night outline-none md:text-4xl">
            {copy.steps[step]}
          </h2>
          <p className="mt-2 text-muted">{copy.hints[step]}</p>
        </div>

        {attempted.includes(step) && stepErrors > 0 ? (
          <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-mist px-4 py-3 text-sm text-night" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            {ar
              ? `${stepErrors} حقل يحتاج إلى تصحيح.`
              : `${stepErrors} champ${stepErrors > 1 ? "s" : ""} à compléter ou corriger avant de continuer.`}
          </p>
        ) : null}

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
                <fieldset className="md:col-span-2" aria-describedby={err("civility") ? "civility-error" : undefined}>
                  <legend className="mb-2 text-sm font-medium text-night">{ar ? "اللقب" : "Civilité"}</legend>
                  <div className="inline-grid grid-cols-2 rounded-full bg-mist p-1" data-invalid={err("civility") ? "" : undefined}>
                    {(["MADAME", "MONSIEUR"] as const).map((value) => (
                      <label
                        key={value}
                        className="cursor-pointer rounded-full px-6 py-2.5 text-center text-sm text-institution transition has-[:checked]:bg-night has-[:checked]:text-white has-[:checked]:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun-ink"
                      >
                        <input type="radio" value={value} className="sr-only" {...form.register("civility")} />
                        {value === "MADAME" ? (ar ? "السيدة" : "Madame") : ar ? "السيد" : "Monsieur"}
                      </label>
                    ))}
                  </div>
                  {err("civility") ? <ErrorText id="civility-error">{err("civility")}</ErrorText> : null}
                </fieldset>
                <Field id="lastName" label={ar ? "الاسم العائلي" : "Nom"} error={err("lastName")}>
                  <input id="lastName" className="lux-field" aria-invalid={err("lastName") ? true : undefined} aria-describedby={describe("lastName", err("lastName"))} {...form.register("lastName")} autoComplete="family-name" />
                </Field>
                <Field id="firstName" label={ar ? "الاسم الشخصي" : "Prénom"} error={err("firstName")}>
                  <input id="firstName" className="lux-field" aria-invalid={err("firstName") ? true : undefined} aria-describedby={describe("firstName", err("firstName"))} {...form.register("firstName")} autoComplete="given-name" />
                </Field>
                <Field id="email" label={ar ? "البريد الإلكتروني" : "Adresse e-mail"} error={err("email")} hint={ar ? "ستتوصل بتذكرتك عليه." : "Ton billet y sera envoyé."}>
                  <input
                    id="email"
                    className="lux-field"
                    type="email"
                    inputMode="email"
                    aria-invalid={err("email") ? true : undefined}
                    aria-describedby={describe("email", err("email"), "hint")}
                    {...form.register("email")}
                    autoComplete="email"
                    placeholder="nom@exemple.ma"
                  />
                </Field>
                <Field id="phone" label={ar ? "الهاتف" : "Téléphone"} error={err("phone")} hint={ar ? "9 أرقام بعد ‎+212" : "9 chiffres après +212"}>
                  <div className="relative" dir="ltr">
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center gap-3 ps-4 text-sm font-medium text-institution">
                      +212
                      <span className="h-5 w-px bg-night/15" />
                    </span>
                    <input
                      id="phone"
                      className="lux-field"
                      style={{ paddingInlineStart: "4.75rem" }}
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="612345678"
                      aria-invalid={err("phone") ? true : undefined}
                      aria-describedby={describe("phone", err("phone"), "hint")}
                      {...form.register("phone")}
                      autoComplete="tel-national"
                    />
                  </div>
                </Field>
                <Field id="city" label={ar ? "المدينة" : "Ville"} error={err("city")}>
                  <select id="city" className="lux-field" aria-invalid={err("city") ? true : undefined} aria-describedby={describe("city", err("city"))} {...form.register("city")}>
                    <option value="" disabled>
                      {choose}
                    </option>
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {ar ? city.ar : city.fr}
                      </option>
                    ))}
                  </select>
                </Field>
                {values.city === "OTHER" ? (
                  <Field id="cityOther" label={ar ? "حدد المدينة" : "Précise ta ville"} error={err("cityOther")}>
                    <input id="cityOther" className="lux-field" aria-invalid={err("cityOther") ? true : undefined} aria-describedby={describe("cityOther", err("cityOther"))} {...form.register("cityOther")} />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5">
                <fieldset aria-describedby={err("participantType") ? "participantType-error" : undefined}>
                  <legend className="mb-3 text-sm font-medium text-night">{ar ? "نوع المشاركة" : "Tu es…"}</legend>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {PARTICIPANT_TYPES.map((type) => {
                      const TypeIcon = participantIcons[type.value];
                      return (
                        <label key={type.value} className={cn(choiceCard, "flex-col gap-3 p-4")}>
                          <input type="radio" value={type.value} className="peer sr-only" {...form.register("participantType")} />
                          <span className={cn(choiceIcon, "size-10")}>
                            <TypeIcon className="size-5" aria-hidden="true" />
                          </span>
                          <span className="pe-6 text-sm font-medium text-night">{ar ? type.ar : type.fr}</span>
                          <span className={cn(choiceTick, "absolute end-3 top-3")}>
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {err("participantType") ? <ErrorText id="participantType-error">{err("participantType")}</ErrorText> : null}
                </fieldset>
                <Field id="organization" label={ar ? "المؤسسة أو المقاولة" : "Établissement ou entreprise"} error={err("organization")}>
                  <input id="organization" className="lux-field" aria-invalid={err("organization") ? true : undefined} aria-describedby={describe("organization", err("organization"))} {...form.register("organization")} autoComplete="organization" />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id="educationLevel" label={ar ? "المستوى الدراسي" : "Niveau d'études"} error={err("educationLevel")}>
                    <select id="educationLevel" className="lux-field" aria-invalid={err("educationLevel") ? true : undefined} aria-describedby={describe("educationLevel", err("educationLevel"))} {...form.register("educationLevel")}>
                      <option value="" disabled>
                        {choose}
                      </option>
                      {site.settings.educationLevels.filter((level) => level.visible).map((level) => (
                        <option key={level.value} value={level.value}>
                          {ar ? level.ar || level.fr : level.fr}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="studyYear" label={ar ? "السنة" : "Année ou situation"} error={err("studyYear")}>
                    <select id="studyYear" className="lux-field" aria-invalid={err("studyYear") ? true : undefined} aria-describedby={describe("studyYear", err("studyYear"))} {...form.register("studyYear")}>
                      <option value="" disabled>
                        {choose}
                      </option>
                      {STUDY_YEARS.map((year) => (
                        <option key={year.value} value={year.value}>
                          {ar ? year.ar : year.fr}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field
                  id="fieldOfStudy"
                  label={ar ? "الشعبة" : "Filière"}
                  error={err("fieldOfStudy")}
                  optional={academic ? undefined : optional}
                  hint={academic ? (ar ? "إلزامية لهذا الملف." : "Obligatoire pour ce profil.") : undefined}
                >
                  <input id="fieldOfStudy" className="lux-field" aria-invalid={err("fieldOfStudy") ? true : undefined} aria-describedby={describe("fieldOfStudy", err("fieldOfStudy"), academic ? "hint" : undefined)} {...form.register("fieldOfStudy")} />
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-7">
                <fieldset aria-describedby={err("interests") ? "interests-error" : "interests-hint"}>
                  <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-night">
                    {ar ? "المهن التي تهمك" : "Métiers qui t'intéressent"}
                    {chosenCareers.length ? <span className="rounded-full bg-night px-2 py-0.5 text-[11px] text-sun">{chosenCareers.length}</span> : null}
                  </legend>
                  <p id="interests-hint" className="mb-3 text-xs text-muted">
                    {ar ? "واحدة على الأقل للطلبة والخريجين." : "Au moins un pour les étudiants et jeunes diplômés. Plusieurs choix possibles."}
                  </p>
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
                  {err("interests") ? <ErrorText id="interests-error">{err("interests")}</ErrorText> : null}
                </fieldset>
                {sessions.length ? (
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium text-night">
                      {ar ? "الجلسات المرغوبة" : "Sessions souhaitées"} <span className="font-normal text-muted">({optional})</span>
                    </legend>
                    <div className="grid gap-2.5">
                      {sessions.map((item) => (
                        <label key={item.id} className={cn(choiceCard, "items-center gap-3 p-3")}>
                          <input type="checkbox" value={item.id} className="peer sr-only" {...form.register("sessions")} />
                          <span className="shrink-0 rounded-lg bg-mist px-2.5 py-1.5 text-xs font-semibold tabular-nums text-institution transition peer-checked:bg-night peer-checked:text-sun" dir="ltr">
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
                ) : null}
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id="discoverySource" label={ar ? "كيف عرفت المنتدى؟" : "Comment as-tu connu le Forum ?"} error={err("discoverySource")}>
                    <select id="discoverySource" className="lux-field" aria-invalid={err("discoverySource") ? true : undefined} aria-describedby={describe("discoverySource", err("discoverySource"))} {...form.register("discoverySource")}>
                      <option value="" disabled>
                        {choose}
                      </option>
                      {DISCOVERY_SOURCES.map((source) => (
                        <option key={source.value} value={source.value}>
                          {ar ? source.ar : source.fr}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="portfolioUrl" label={ar ? "رابط معرض أعمال أو LinkedIn" : "Portfolio ou LinkedIn"} error={err("portfolioUrl")} optional={optional}>
                    <input id="portfolioUrl" className="lux-field" type="url" inputMode="url" placeholder="https://" aria-invalid={err("portfolioUrl") ? true : undefined} aria-describedby={describe("portfolioUrl", err("portfolioUrl"))} {...form.register("portfolioUrl")} />
                  </Field>
                </div>
                <Field id="expectations" label={ar ? "توقعاتك" : "Tes attentes"} error={err("expectations")} optional={optional}>
                  <textarea id="expectations" className="lux-field" aria-invalid={err("expectations") ? true : undefined} aria-describedby={describe("expectations", err("expectations"))} {...form.register("expectations")} />
                </Field>
                <div className="grid gap-2 text-sm">
                  <span className="font-medium text-night">
                    {ar ? "السيرة الذاتية PDF" : "CV au format PDF"} <span className="font-normal text-muted">({optional})</span>
                  </span>
                  {cv ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-sun/50 bg-dawn p-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-night text-sun">
                        <FileText className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-night">{cv.name}</span>
                        <span className="text-xs text-muted">{(cv.size / (1024 * 1024)).toFixed(2)} Mo</span>
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
                        pickCv(event.dataTransfer.files[0]);
                      }}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-night/15 bg-mist/40 px-6 py-8 text-center transition hover:border-sun has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun-ink",
                        dragging && "border-sun bg-dawn",
                        cvError && "border-red-400",
                      )}
                    >
                      <span className="grid size-12 place-items-center rounded-2xl bg-white text-sun-ink shadow-sm">
                        <CloudUpload className="size-6" aria-hidden="true" />
                      </span>
                      <span className="mt-1 font-medium text-night">{copy.dropCv}</span>
                      <span className="text-xs text-muted">{copy.dropCvHint}</span>
                      <input
                        ref={cvInput}
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        aria-invalid={cvError ? true : undefined}
                        aria-describedby={cvError ? "cv-error" : undefined}
                        onChange={(event) => pickCv(event.target.files?.[0])}
                      />
                    </label>
                  )}
                  {cvError ? <ErrorText id="cv-error">{cvError}</ErrorText> : null}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4">
                <Summary title={copy.steps[0]} edit={copy.edit} onEdit={() => goTo(0)}>
                  <p className="display text-2xl text-night">
                    {values.firstName} {values.lastName}
                  </p>
                  <p className="mt-1 break-all">{values.email}</p>
                  <p dir="ltr" className="text-start">
                    +212 {values.phone}
                  </p>
                  <p>{values.city === "OTHER" ? values.cityOther : labelOf(CITIES, values.city, locale)}</p>
                </Summary>
                <Summary title={copy.steps[1]} edit={copy.edit} onEdit={() => goTo(1)}>
                  <p className="font-medium text-night">
                    {labelOf(PARTICIPANT_TYPES, values.participantType, locale)} — {values.organization}
                  </p>
                  <p>
                    {levelLabel(site.settings.educationLevels, values.educationLevel, locale)}
                    {values.fieldOfStudy ? ` · ${values.fieldOfStudy}` : ""}
                  </p>
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
                  {cv ? <p className="mt-2 text-sm">CV : {cv.name}</p> : null}
                </Summary>
                <div data-invalid={err("consentRules") ? "" : undefined}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition has-[:checked]:border-sun has-[:checked]:bg-dawn",
                      err("consentRules") ? "border-red-400" : "border-night/10",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]"
                      aria-invalid={err("consentRules") ? true : undefined}
                      aria-describedby={err("consentRules") ? "consentRules-error" : undefined}
                      {...form.register("consentRules")}
                    />
                    <span className="text-sm leading-6 text-night">
                      {ar
                        ? "أوافق على نظام المنتدى وعلى معالجة معطياتي لتنظيم مشاركتي."
                        : "J'accepte le règlement du Forum et le traitement de mes données pour organiser ma participation."}
                    </span>
                  </label>
                  <PrivacyDialog locale={locale} />
                  {err("consentRules") ? <ErrorText id="consentRules-error">{err("consentRules")}</ErrorText> : null}
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-night/10 p-4 transition has-[:checked]:border-sun has-[:checked]:bg-dawn">
                  <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]" {...form.register("consentContact")} />
                  <span className="text-sm leading-6 text-night">
                    {ar ? "أوافق على أن تتواصل معي الشركات الشريكة بشأن الفرص." : "J'accepte d'être contacté par les entreprises partenaires au sujet d'opportunités."}{" "}
                    <span className="text-muted">({optional})</span>
                  </span>
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
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-night/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 text-institution transition hover:bg-mist disabled:opacity-40", step === 0 && "invisible max-sm:hidden")}
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
              "group/cta inline-flex h-14 w-full items-center justify-between gap-4 rounded-full pe-2 ps-7 font-semibold transition disabled:cursor-wait disabled:opacity-70 sm:w-auto",
              step < 3 ? "bg-night text-white hover:bg-institution" : "bg-sun text-night shadow-[0_18px_50px_-18px_rgba(255,122,26,0.95)] hover:bg-sun-bright",
            )}
          >
            {pending ? (ar ? "جارٍ التسجيل…" : "Inscription en cours…") : step < 3 ? copy.next : copy.submit}
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full transition-transform motion-safe:group-hover/cta:translate-x-0.5 rtl:motion-safe:group-hover/cta:-translate-x-0.5",
                step < 3 ? "bg-sun text-night" : "bg-night text-sun",
              )}
            >
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
        <p className="sr-only" aria-live="polite">
          {pending ? (ar ? "جارٍ التسجيل" : "Inscription en cours, merci de patienter.") : ""}
        </p>
      </form>

      <aside className="grid gap-4 lg:sticky lg:top-28" aria-label={copy.ticket}>
        <div className="ticket-notch surface-dark relative overflow-hidden rounded-[1.75rem] bg-night text-white shadow-[0_40px_90px_-40px_rgba(11,27,58,0.85)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_0%,rgba(255,122,26,0.45),transparent_55%),radial-gradient(90%_60%_at_0%_100%,rgba(45,99,179,0.5),transparent_60%)]" />
          <div aria-hidden="true" className="noise absolute inset-0 opacity-20" />
          <div className="relative p-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/70">
              <span>Assur&apos;Carrière</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-sun">2026</span>
            </div>
            <p className="mt-5 text-sm text-white/80">{tx(locale, site.sections.hero?.title.fr ?? hero.title, site.sections.hero?.title.ar ?? hero.title)}</p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-sun">{copy.ticket}</p>
            <p className={cn("display mt-2 line-clamp-2 min-h-[2.1em] break-words text-3xl leading-[1.05]", !(values.firstName || values.lastName) && "text-white/30")}>
              {`${values.firstName} ${values.lastName}`.trim() || copy.namePlaceholder}
            </p>
            <p className="mt-2 truncate text-sm text-white/70">
              {values.participantType ? labelOf(PARTICIPANT_TYPES, values.participantType, locale) : "—"}
              {values.organization ? ` · ${values.organization}` : ""}
            </p>
          </div>
          <div className="relative mx-6 border-t border-dashed border-white/25" />
          <div className="relative flex h-[8.5rem] items-center justify-between gap-4 px-6">
            <dl className="grid min-w-0 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-haze">{hero.when}</dt>
                <dd className="mt-0.5 truncate font-medium">{when?.day ?? hero.date}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-haze">{hero.where}</dt>
                <dd className="mt-0.5 truncate font-medium">{placeLabel(site.settings.venueName, site.settings.city) || site.settings.city}</dd>
              </div>
            </dl>
            <div className="grid w-24 shrink-0 justify-items-center gap-1.5 text-center">
              <span className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-sun backdrop-blur">
                <QrCode className="size-8" aria-hidden="true" />
              </span>
              <span className="text-[10px] leading-tight text-haze">{copy.qr}</span>
            </div>
          </div>
        </div>
        <ul className="grid gap-1 rounded-[1.75rem] bg-white p-3 shadow-[0_30px_80px_-50px_rgba(11,27,58,0.5)] ring-1 ring-night/5">
          {copy.perks.map(([title, text], index) => {
            const PerkIcon = perkIcons[index] ?? Sparkles;
            return (
              <li key={title} className="flex items-center gap-3 rounded-2xl p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-dawn text-sun-ink">
                  <PerkIcon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-medium text-night">{title}</span>
                  <span className="text-sm text-muted">{text}</span>
                </span>
              </li>
            );
          })}
          <li className="mt-1 flex items-center gap-3 rounded-2xl bg-night px-4 py-3.5 text-sm text-white">
            <ShieldCheck className="size-4 shrink-0 text-sun" aria-hidden="true" />
            <span>
              <strong className="font-semibold">{seats.toLocaleString(ar ? "ar-MA" : "fr-MA")}</strong> {copy.seats}
            </span>
          </li>
        </ul>
      </aside>
    </div>
  );
}

// Politique de confidentialité consultable sans quitter le formulaire : la saisie reste intacte.
function PrivacyDialog({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <Dialog.Root>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 ps-1 text-sm">
        <Dialog.Trigger className="font-medium text-night underline underline-offset-4 hover:text-sun-ink">
          {ar ? "قراءة سياسة الخصوصية" : "Lire la politique de confidentialité"}
        </Dialog.Trigger>
        <a href="/confidentialite" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-muted hover:text-night">
          {ar ? "في نافذة جديدة" : "nouvel onglet"}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </p>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-night-deep/70 backdrop-blur-sm motion-safe:animate-fade-in" />
        <Dialog.Content className="fixed inset-x-3 bottom-3 z-[71] max-h-[85dvh] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl outline-none motion-safe:animate-dialog-in sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(40rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-9">
          <Dialog.Title className="display pe-10 text-3xl text-night">{ar ? "الخصوصية" : "Confidentialité"}</Dialog.Title>
          <Dialog.Description className="mt-2 text-muted">
            {ar ? "ما يجمعه المنتدى ولماذا." : "Ce que le Forum collecte, pourquoi, et comment le demander."}
          </Dialog.Description>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-night/80">
            <PrivacyContent />
          </div>
          <Dialog.Close className={cn(buttonVariants({ variant: "night", size: "md" }), "mt-8")}>{ar ? "العودة إلى التسجيل" : "Revenir à mon inscription"}</Dialog.Close>
          <Dialog.Close className="absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-mist text-night transition hover:bg-sun" aria-label={ar ? "إغلاق" : "Fermer"}>
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-2 text-sm" data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className="font-medium text-night">
        {label}
        {optional ? <span className="ms-1.5 font-normal text-muted">({optional})</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <span id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  );
}

function ErrorText({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <span id={id} className="mt-0.5 flex items-start gap-1.5 text-[13px] leading-5 text-red-700">
      <CircleAlert className="mt-[3px] size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

function Summary({ title, edit, onEdit, children }: { title: string; edit: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-mist/60 p-5 leading-7 text-institution">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sun-ink">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-night transition hover:bg-white">
          <Pencil className="size-3" aria-hidden="true" />
          {edit}
          <span className="sr-only"> : {title}</span>
        </button>
      </div>
      {children}
    </section>
  );
}
