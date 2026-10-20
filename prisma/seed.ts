import "dotenv/config";
import bcrypt from "bcryptjs";
import { fallbackSections } from "../src/lib/site-types";
import { db } from "../src/lib/prisma";

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const staffPassword = process.env.STAFF_PASSWORD ?? "";
  if (adminPassword.length < 10 || staffPassword.length < 10) {
    throw new Error("ADMIN_PASSWORD et STAFF_PASSWORD doivent contenir au moins 10 caractères.");
  }

  await db().user.upsert({
    where: { email: (process.env.ADMIN_EMAIL ?? "admin@forum-assurance.ma").toLowerCase() },
    update: { name: process.env.ADMIN_NAME ?? "Administrateur FMA", role: "ADMIN", active: true, passwordHash: await bcrypt.hash(adminPassword, 12) },
    create: {
      email: (process.env.ADMIN_EMAIL ?? "admin@forum-assurance.ma").toLowerCase(),
      name: process.env.ADMIN_NAME ?? "Administrateur FMA",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });
  await db().user.upsert({
    where: { email: (process.env.STAFF_EMAIL ?? "accueil@forum-assurance.ma").toLowerCase() },
    update: { name: process.env.STAFF_NAME ?? "Accueil Forum", role: "STAFF", active: true, passwordHash: await bcrypt.hash(staffPassword, 12) },
    create: {
      email: (process.env.STAFF_EMAIL ?? "accueil@forum-assurance.ma").toLowerCase(),
      name: process.env.STAFF_NAME ?? "Accueil Forum",
      role: "STAFF",
      passwordHash: await bcrypt.hash(staffPassword, 12),
    },
  });

  await db().eventSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      eventDate: new Date("2026-11-18T08:00:00.000Z"),
      venueName: "Casablanca",
      address: "Le lieu exact sera confirmé aux inscrits.",
      city: "Casablanca",
      sloganFr: "Choisis ton avenir",
      sloganAr: "اختر مستقبلك",
      contactEmail: "contact@forum-assurance.ma",
      contactPhone: "+212 5 22 00 00 00",
      registrationOpen: true,
      capacity: 1500,
    },
  });

  await db().siteSection.deleteMany();
  await db().siteSection.createMany({
    data: Object.entries(fallbackSections).map(([key, section]) => ({
      key,
      titleFr: section.title.fr,
      titleAr: section.title.ar,
      bodyFr: section.body.fr,
      bodyAr: section.body.ar,
    })),
  });

  await db().whyItem.deleteMany();
  await db().whyItem.createMany({
    data: [
      ["Rencontrer les employeurs", "لقاء المشغلين", "Compagnies, courtiers et partenaires recrutent et expliquent leurs métiers sans filtre.", "شركات ووسطاء وشركاء يشرحون مهنهم بلا مسافة.", "handshake", 1],
      ["Clarifier un parcours", "توضيح المسار", "Des ateliers courts pour relier une filière à un métier réel.", "ورشات قصيرة تربط الشعبة بمهنة حقيقية.", "compass", 2],
      ["Écouter des praticiens", "الاستماع إلى المهنيين", "Des retours d'expérience sur le quotidien, les compétences et les premières années.", "تجارب عن اليومي والكفاءات والسنوات الأولى.", "messages", 3],
      ["Élargir son réseau", "توسيع الشبكة", "Étudiants, enseignants et recruteurs dans le même lieu, le temps d'une journée.", "طلبة وأساتذة ومسؤولون توظيف في مكان واحد.", "users", 4],
      ["Repérer les compétences", "رصد الكفاءات", "Données, conformité, relation client : les profils recherchés sont nommés clairement.", "المعطيات والامتثال والعلاقة مع الزبناء: الكفاءات المطلوبة مذكورة بوضوح.", "search", 5],
      ["Repartir avec un cap", "المغادرة بخارطة", "Un échange suffit parfois à confirmer, ou à écarter, une voie.", "حوار واحد قد يكفي لتأكيد مسار أو استبعاده.", "sparkles", 6],
    ].map(([titleFr, titleAr, bodyFr, bodyAr, icon, sortOrder]) => ({
      titleFr: String(titleFr),
      titleAr: String(titleAr),
      bodyFr: String(bodyFr),
      bodyAr: String(bodyAr),
      icon: String(icon),
      sortOrder: Number(sortOrder),
      published: true,
    })),
  });

  await db().career.deleteMany();
  await db().career.createMany({
    data: [
      ["Actuariat", "الاكتواريات", "Modéliser les risques, tarifer les garanties et éclairer les décisions financières.", "نمذجة الأخطار وتسعير الضمانات وإنارة القرارات المالية.", "calculator"],
      ["Souscription", "الاكتتاب", "Analyser un dossier, apprécier le risque et proposer des conditions justes.", "دراسة الملف وتقدير الخطر واقتراح شروط عادلة.", "search"],
      ["Gestion des sinistres", "تدبير الحوادث", "Accompagner l'assuré au moment où le contrat prend tout son sens.", "مواكبة المؤمن له في اللحظة التي يصبح فيها العقد ملموساً.", "headset"],
      ["Indemnisation", "التعويض", "Instruction, expertise et règlement : un métier de rigueur et de relation.", "بحث وخبرة وأداء: مهنة دقة وعلاقة.", "scale"],
      ["Distribution et conseil", "التوزيع والاستشارة", "Agences, courtiers et centres de relation : expliquer, orienter, fidéliser.", "الوكالات والوسطاء ومراكز العلاقة: الشرح والتوجيه والوفاء.", "users"],
      ["Conformité et contrôle", "الامتثال والمراقبة", "Veiller au cadre réglementaire, à la lutte contre la fraude et à la maîtrise des risques.", "السهر على الإطار التنظيمي ومحاربة الغش وضبط المخاطر.", "shield"],
      ["Data et digital", "المعطيات والرقمنة", "Exploiter les données, concevoir des parcours et faire évoluer les outils.", "استثمار المعطيات وتصميم المسارات وتطوير الأدوات.", "laptop"],
      ["Audit et risques", "التدقيق والمخاطر", "Questionner les dispositifs, documenter les écarts et renforcer la solidité de l'entreprise.", "مساءلة الأجهزة وتوثيق الفجوات وتعزيز صلابة المقاولة.", "chart"],
    ].map(([titleFr, titleAr, summaryFr, summaryAr, icon], index) => ({
      titleFr, titleAr, summaryFr, summaryAr, icon, sortOrder: index + 1, published: true,
    })),
  });

  await db().programItem.deleteMany();
  await db().programItem.createMany({
    data: [
      ["08:30", "09:30", "Accueil des participants", "استقبال المشاركين", "Retrait des badges et premier contact avec les équipes.", "سحب الشارات وأول لقاء مع الفرق.", "Hall", "", "welcome"],
      ["09:30", "10:15", "Ouverture", "الافتتاح", "Mot de la Fédération et présentation de la journée.", "كلمة الجامعة وتقديم اليوم.", "Plénière", "Fédération Marocaine de l'Assurance", "plenary"],
      ["10:15", "11:15", "Table ronde des métiers", "مائدة مهن التأمين", "Quatre praticiens décrivent leur quotidien et les compétences qui comptent.", "أربعة مهنيين يصفون يومهم والكفاءات الأساسية.", "Plénière", "", "roundtable"],
      ["11:30", "12:30", "Ateliers au choix", "ورشات حسب الاختيار", "Actuariat, sinistres, digital ou conformité : un format court pour aller au concret.", "الاكتواريات أو الحوادث أو الرقمنة أو الامتثال.", "Salles", "", "workshop"],
      ["12:30", "14:00", "Déjeuner et rencontres", "غداء ولقاءات", "Un temps libre pour parler avec les entreprises présentes.", "وقت مفتوح للحديث مع المقاولات الحاضرة.", "Espace partenaires", "", "networking"],
      ["14:00", "15:15", "Parcours de jeunes diplômés", "مسارات الخريجين", "Des premières expériences, racontées sans langue de bois.", "تجارب أولى تُروى بصراحة.", "Plénière", "", "plenary"],
      ["15:30", "16:30", "Rendez-vous recruteurs", "لقاءات التوظيف", "Échanges ciblés selon les métiers cochés à l'inscription.", "لقاءات موجهة حسب المهن المختارة عند التسجيل.", "Espace carrière", "", "networking"],
      ["16:30", "17:00", "Clôture", "الاختتام", "Ce qu'il faut retenir pour la suite du parcours.", "ما ينبغي الاحتفاظ به لبقية المسار.", "Plénière", "", "closing"],
    ].map(([startTime, endTime, titleFr, titleAr, descriptionFr, descriptionAr, location, speakerName, category], index) => ({
      startTime, endTime, titleFr, titleAr, descriptionFr, descriptionAr, location, speakerName, category, sortOrder: index + 1, published: true,
    })),
  });

  await db().speaker.deleteMany();
  await db().speaker.createMany({
    data: [
      ["Salma El Fassi", "Directrice actuariat", "مديرة الاكتواريات", "Compagnie invitée", "Elle relie modèles, tarifs et décisions. Profil de démonstration, à remplacer.", "تربط بين النماذج والأسعار والقرارات. بطاقة تجريبية."],
      ["Youssef Amrani", "Responsable indemnisation", "مسؤول التعويض", "Compagnie invitée", "Vingt ans de dossiers complexes, racontés pour les étudiants.", "عشرون سنة من الملفات المعقدة، تُروى للطلبة."],
      ["Nadia Cherkaoui", "Directrice des talents", "مديرة المواهب", "Compagnie invitée", "Elle dit quelles compétences ouvrent vraiment une porte.", "توضح الكفاءات التي تفتح الباب فعلاً."],
      ["Karim Bennani", "Directeur digital", "مدير الرقمنة", "Compagnie invitée", "Parcours clients, données et nouveaux métiers techniques.", "مسارات الزبناء والمعطيات والمهن التقنية الجديدة."],
      ["Leïla Ouazzani", "Enseignante-chercheuse", "أستاذة باحثة", "Université partenaire", "Elle aide à lire un métier depuis une filière universitaire.", "تساعد على قراءة المهنة انطلاقاً من شعبة جامعية."],
      ["Omar Idrissi", "Courtier", "وسيط تأمين", "Cabinet partenaire", "Le conseil de proximité, entre l'assuré et la compagnie.", "الاستشارة القريبة بين المؤمن له والشركة."],
    ].map(([name, roleFr, roleAr, org, bioFr, bioAr], index) => ({
      name, roleFr, roleAr, org, bioFr, bioAr, photoUrl: "", sortOrder: index + 1, published: true,
    })),
  });

  await db().partner.deleteMany();
  await db().partner.createMany({
    data: [
      ["Fédération Marocaine de l'Assurance", "INSTITUTIONAL", "", 1],
      ["Compagnies d'assurance", "GOLD", "", 2],
      ["Courtiers", "SILVER", "", 3],
      ["Écoles et universités", "PARTNER", "", 4],
      ["Presse spécialisée", "MEDIA", "", 5],
    ].map(([name, tier, website, sortOrder]) => ({
      name: String(name),
      tier: String(tier) as "INSTITUTIONAL" | "GOLD" | "SILVER" | "PARTNER" | "MEDIA",
      website: String(website),
      logoUrl: "",
      sortOrder: Number(sortOrder),
      published: true,
    })),
  });

  await db().faqItem.deleteMany();
  await db().faqItem.createMany({
    data: [
      ["Qui peut s'inscrire ?", "من يمكنه التسجيل؟", "Étudiants, jeunes diplômés, professionnels, enseignants et recruteurs du secteur ou en reconversion.", "الطلبة والخريجون والمهنيون والأساتذة ومسؤولو التوظيف."],
      ["L'inscription est-elle payante ?", "هل التسجيل مؤدى عنه؟", "Non. L'inscription ouvre droit à un billet nominatif tant que la capacité n'est pas atteinte.", "لا. التسجيل يمنح تذكرة اسمية ما دامت الطاقة الاستيعابية لم تكتمل."],
      ["Comment recevoir mon billet ?", "كيف أتوصل بالتذكرة؟", "Il s'affiche à la confirmation. Si le SMTP est configuré, il est aussi envoyé par e-mail avec le PDF.", "تظهر عند التأكيد. وإذا ضُبط البريد، تُرسل أيضاً مع ملف PDF."],
      ["Que contient le QR code ?", "ماذا يتضمن رمز QR؟", "Un lien d'accueil réservé à l'équipe. Présentez-le à l'entrée, sur téléphone ou sur le PDF.", "رابط استقبال خاص بالفريق. قدموه عند الدخول من الهاتف أو من PDF."],
      ["Puis-je venir sans inscription ?", "هل يمكن الحضور دون تسجيل؟", "L'accès se fait avec un billet. Écrivez à l'équipe si vous avez un empêchement de dernière minute.", "الدخول يتم بتذكرة. راسلوا الفريق إذا طرأ مانع."],
      ["Dans quelles langues se tient le Forum ?", "بأي لغات يُقام المنتدى؟", "Les échanges sont en français. Le site prépare déjà l'arabe.", "اللقاءات بالفرنسية. والموقع يهيئ العربية."],
      ["Faut-il un CV ?", "هل السيرة الذاتية ضرورية؟", "Non. Vous pouvez joindre un PDF ou un lien. Il n'est visible que par l'équipe organisatrice.", "لا. يمكن إرفاق PDF أو رابط. ولا يراه إلا الفريق المنظم."],
      ["Comment annuler ?", "كيف يتم الإلغاء؟", "Écrivez à l'adresse de contact avec votre référence. L'équipe mettra le dossier à jour.", "راسلوا عنوان الاتصال مع المرجع. وسيحدث الفريق الملف."],
    ].map(([questionFr, questionAr, answerFr, answerAr], index) => ({
      questionFr, questionAr, answerFr, answerAr, sortOrder: index + 1, published: true,
    })),
  });

  await db().galleryItem.deleteMany();
  await db().galleryItem.createMany({
    data: [
      ["Le hall, avant l'ouverture", "البهو قبل الافتتاح"],
      ["Une table ronde", "مائدة مستديرة"],
      ["Les ateliers", "الورشات"],
      ["Les rencontres", "اللقاءات"],
    ].map(([captionFr, captionAr], index) => ({
      type: "IMAGE" as const,
      url: "",
      captionFr,
      captionAr,
      sortOrder: index + 1,
      published: true,
    })),
  });
}

main()
  .then(async () => {
    await db().$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db().$disconnect();
    process.exit(1);
  });
