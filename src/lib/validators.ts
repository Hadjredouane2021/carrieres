import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

export const registrationSchema = z
  .object({
    civility: z.enum(["MADAME", "MONSIEUR"], { error: "Choisissez une civilité." }),
    lastName: required("Le nom est obligatoire.").max(80),
    firstName: required("Le prénom est obligatoire.").max(80),
    email: required("L'adresse e-mail est obligatoire.")
      .max(160)
      .refine((value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Adresse e-mail invalide."),
    phone: z
      .string()
      .trim()
      .regex(/^[5-8]\d{8}$/, "Saisissez 9 chiffres, par exemple 612345678."),
    city: required("La ville est obligatoire."),
    cityOther: z.string().trim().max(80).optional().default(""),
    participantType: z.enum(["STUDENT", "GRADUATE", "PROFESSIONAL", "TEACHER", "RECRUITER", "OTHER"]),
    organization: required("Indiquez l'établissement ou l'entreprise.").max(160),
    educationLevel: required("Indiquez le niveau d'études."),
    fieldOfStudy: z.string().trim().max(160).optional().default(""),
    studyYear: required("Indiquez l'année ou la situation."),
    interests: z.array(z.string()).default([]),
    sessions: z.array(z.string()).default([]),
    discoverySource: z.enum(["SCHOOL", "SOCIAL", "WEB", "PRESS", "WORD", "OTHER"]),
    expectations: z.string().trim().max(1000).optional().default(""),
    portfolioUrl: z
      .string()
      .trim()
      .max(300)
      .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "L'adresse doit commencer par http:// ou https://.")
      .optional()
      .default(""),
    consentRules: z.boolean().refine((value) => value, "L'acceptation du règlement est nécessaire."),
    consentContact: z.boolean().optional().default(false),
    website: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.city === "OTHER" && !data.cityOther?.trim()) {
      ctx.addIssue({ code: "custom", path: ["cityOther"], message: "Précisez votre ville." });
    }
    const academic = ["STUDENT", "GRADUATE", "TEACHER"].includes(data.participantType);
    if (academic && !data.fieldOfStudy?.trim()) {
      ctx.addIssue({ code: "custom", path: ["fieldOfStudy"], message: "Indiquez la filière." });
    }
    if (academic && data.educationLevel === "NA") {
      ctx.addIssue({ code: "custom", path: ["educationLevel"], message: "Indiquez un niveau d'études." });
    }
    if (["STUDENT", "GRADUATE"].includes(data.participantType) && data.interests.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["interests"],
        message: "Sélectionnez au moins un métier.",
      });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const contactSchema = z.object({
  name: required("Le nom est obligatoire.").max(120),
  email: required("L'adresse e-mail est obligatoire.")
    .max(160)
    .refine((value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Adresse e-mail invalide."),
  subject: required("L'objet est obligatoire.").max(160),
  message: required("Le message est obligatoire.").max(4000),
  website: z.string().optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
  callbackUrl: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: required("Le nom est obligatoire.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  role: z.enum(["ADMIN", "STAFF"]),
  password: z.string().optional(),
});
