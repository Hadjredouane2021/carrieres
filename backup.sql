-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: forum_assurance
-- ------------------------------------------------------
-- Server version	8.4.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('20891bf6-f00b-49a1-bce5-98a5db895f46','f063c3846ab00166dac6ce052ebd72962833a6a62bb58879335c42db62fa432e','2026-10-13 19:53:28.955','20261013205000_hero_image',NULL,NULL,'2026-10-13 19:53:28.711',1),('aa81ba5c-c14b-4be3-b32f-1f0f0df7e7aa','a99f21e231064bd4e3598cc15b1631da65b97198d39b895334465a1e4ba77d0c','2026-10-13 17:25:22.670','20261013172521_init',NULL,NULL,'2026-10-13 17:25:21.493',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `careers`
--

DROP TABLE IF EXISTS `careers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `careers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summaryFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `summaryAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'briefcase',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `careers`
--

LOCK TABLES `careers` WRITE;
/*!40000 ALTER TABLE `careers` DISABLE KEYS */;
INSERT INTO `careers` VALUES ('cmv6yecpz0008jc0ku0h0m65w','Actuariat','الاكتواريات','Modéliser les risques, tarifer les garanties et éclairer les décisions financières.','نمذجة الأخطار وتسعير الضمانات وإنارة القرارات المالية.','calculator',1,1),('cmv6yecq00009jc0k7a1gbnky','Souscription','الاكتتاب','Analyser un dossier, apprécier le risque et proposer des conditions justes.','دراسة الملف وتقدير الخطر واقتراح شروط عادلة.','search',2,1),('cmv6yecq0000ajc0kb3q63ntk','Gestion des sinistres','تدبير الحوادث','Accompagner l\'assuré au moment où le contrat prend tout son sens.','مواكبة المؤمن له في اللحظة التي يصبح فيها العقد ملموساً.','headset',3,1),('cmv6yecq0000bjc0k8epik1ku','Indemnisation','التعويض','Instruction, expertise et règlement : un métier de rigueur et de relation.','بحث وخبرة وأداء: مهنة دقة وعلاقة.','scale',4,1),('cmv6yecq0000cjc0kqpabv0zu','Distribution et conseil','التوزيع والاستشارة','Agences, courtiers et centres de relation : expliquer, orienter, fidéliser.','الوكالات والوسطاء ومراكز العلاقة: الشرح والتوجيه والوفاء.','users',5,1),('cmv6yecq0000djc0k9q4svur7','Conformité et contrôle','الامتثال والمراقبة','Veiller au cadre réglementaire, à la lutte contre la fraude et à la maîtrise des risques.','السهر على الإطار التنظيمي ومحاربة الغش وضبط المخاطر.','shield',6,1),('cmv6yecq0000ejc0k8ou2588m','Data et digital','المعطيات والرقمنة','Exploiter les données, concevoir des parcours et faire évoluer les outils.','استثمار المعطيات وتصميم المسارات وتطوير الأدوات.','laptop',7,1),('cmv6yecq0000fjc0k2y2f4v9q','Audit et risques','التدقيق والمخاطر','Questionner les dispositifs, documenter les écarts et renforcer la solidité de l\'entreprise.','مساءلة الأجهزة وتوثيق الفجوات وتعزيز صلابة المقاولة.','chart',8,1);
/*!40000 ALTER TABLE `careers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `contact_messages_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_settings`
--

DROP TABLE IF EXISTS `event_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'main',
  `eventDate` datetime(3) DEFAULT NULL,
  `venueName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Casablanca',
  `address` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Casablanca',
  `sloganFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Choisis ton avenir',
  `sloganAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'اختر مستقبلك',
  `contactEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'contact@forum-assurance.ma',
  `contactPhone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '+212 5 22 00 00 00',
  `facebook` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `linkedin` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `instagram` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `youtube` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `registrationOpen` tinyint(1) NOT NULL DEFAULT '1',
  `capacity` int NOT NULL DEFAULT '1500',
  `updatedAt` datetime(3) NOT NULL,
  `heroImage` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_settings`
--

LOCK TABLES `event_settings` WRITE;
/*!40000 ALTER TABLE `event_settings` DISABLE KEYS */;
INSERT INTO `event_settings` VALUES ('main','2026-11-18 08:00:00.000','Casablanca','Le lieu exact sera confirmé aux inscrits.','Casablanca','Choisis ton avenir','اختر مستقبلك','contact@forum-assurance.ma','+212 5 22 00 00 00','','','','',1,1500,'2026-10-18 12:29:04.457','/uploads/d1558967ee1d2a0d1a9c04b0ec7c26d1.png');
/*!40000 ALTER TABLE `event_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq_items`
--

DROP TABLE IF EXISTS `faq_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq_items`
--

LOCK TABLES `faq_items` WRITE;
/*!40000 ALTER TABLE `faq_items` DISABLE KEYS */;
INSERT INTO `faq_items` VALUES ('cmv6yecty000zjc0ke0tlv4r7','Qui peut s\'inscrire ?','من يمكنه التسجيل؟','Étudiants, jeunes diplômés, professionnels, enseignants et recruteurs du secteur ou en reconversion.','الطلبة والخريجون والمهنيون والأساتذة ومسؤولو التوظيف.',1,1),('cmv6yecty0010jc0kohzcc5se','L\'inscription est-elle payante ?','هل التسجيل مؤدى عنه؟','Non. L\'inscription ouvre droit à un billet nominatif tant que la capacité n\'est pas atteinte.','لا. التسجيل يمنح تذكرة اسمية ما دامت الطاقة الاستيعابية لم تكتمل.',2,1),('cmv6yectz0011jc0kzwsamlg3','Comment recevoir mon billet ?','كيف أتوصل بالتذكرة؟','Il s\'affiche à la confirmation. Si le SMTP est configuré, il est aussi envoyé par e-mail avec le PDF.','تظهر عند التأكيد. وإذا ضُبط البريد، تُرسل أيضاً مع ملف PDF.',3,1),('cmv6yectz0012jc0kd4sshxfy','Que contient le QR code ?','ماذا يتضمن رمز QR؟','Un lien d\'accueil réservé à l\'équipe. Présentez-le à l\'entrée, sur téléphone ou sur le PDF.','رابط استقبال خاص بالفريق. قدموه عند الدخول من الهاتف أو من PDF.',4,1),('cmv6yectz0013jc0k2irdcwqp','Puis-je venir sans inscription ?','هل يمكن الحضور دون تسجيل؟','L\'accès se fait avec un billet. Écrivez à l\'équipe si vous avez un empêchement de dernière minute.','الدخول يتم بتذكرة. راسلوا الفريق إذا طرأ مانع.',5,1),('cmv6yectz0014jc0kxhulbm25','Dans quelles langues se tient le Forum ?','بأي لغات يُقام المنتدى؟','Les échanges sont en français. Le site prépare déjà l\'arabe.','اللقاءات بالفرنسية. والموقع يهيئ العربية.',6,1),('cmv6yectz0015jc0ka6asd03y','Faut-il un CV ?','هل السيرة الذاتية ضرورية؟','Non. Vous pouvez joindre un PDF ou un lien. Il n\'est visible que par l\'équipe organisatrice.','لا. يمكن إرفاق PDF أو رابط. ولا يراه إلا الفريق المنظم.',7,1),('cmv6yectz0016jc0k9e6wefwn','Comment annuler ?','كيف يتم الإلغاء؟','Écrivez à l\'adresse de contact avec votre référence. L\'équipe mettra le dossier à jour.','راسلوا عنوان الاتصال مع المرجع. وسيحدث الفريق الملف.',8,1);
/*!40000 ALTER TABLE `faq_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_items`
--

DROP TABLE IF EXISTS `gallery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('IMAGE','VIDEO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE',
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `captionFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `captionAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_items`
--

LOCK TABLES `gallery_items` WRITE;
/*!40000 ALTER TABLE `gallery_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `website` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tier` enum('INSTITUTIONAL','GOLD','SILVER','PARTNER','MEDIA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PARTNER',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
INSERT INTO `partners` VALUES ('cmvdzocgi000215sa0ybh3jnv','AtlantaSanad','/uploads/5a4e54c9daa7a518e81cac03c079c032.png','','PARTNER',1,1),('cmvdzqeq2000315saeimg9goz','Alliaz','/uploads/ca8bd61a58569b39a6dea310772be0e5.png','','PARTNER',2,1),('cmvdzr055000415sak6dotc6e','Axa','/uploads/de148501d1e4344ec9fd18df73b5b76d.png','','PARTNER',3,1),('cmvdzryqf000515sapyj6tcl7','Rma','/uploads/6eafa1d9fbd2028229ff07992800d1dd.png','','PARTNER',4,1),('cmve0cm56000015lly7617xdy','Sanlam','/uploads/f482a87bb01d017df34af76a98c345d9.png','','PARTNER',5,1);
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_items`
--

DROP TABLE IF EXISTS `program_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descriptionFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `descriptionAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `speakerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'plenary',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_items`
--

LOCK TABLES `program_items` WRITE;
/*!40000 ALTER TABLE `program_items` DISABLE KEYS */;
INSERT INTO `program_items` VALUES ('cmv6yecr9000gjc0kd5qbxwx3','08:30','09:30','Accueil des participants','استقبال المشاركين','Retrait des badges et premier contact avec les équipes.','سحب الشارات وأول لقاء مع الفرق.','Hall','','welcome',1,1),('cmv6yecr9000hjc0kamxu1txk','09:30','10:15','Ouverture','الافتتاح','Mot de la Fédération et présentation de la journée.','كلمة الجامعة وتقديم اليوم.','Plénière','Fédération Marocaine de l\'Assurance','plenary',2,1),('cmv6yecr9000ijc0kiyb56kk7','10:15','11:15','Table ronde des métiers','مائدة مهن التأمين','Quatre praticiens décrivent leur quotidien et les compétences qui comptent.','أربعة مهنيين يصفون يومهم والكفاءات الأساسية.','Plénière','','roundtable',3,1),('cmv6yecr9000jjc0kc4wije8a','11:30','12:30','Ateliers au choix','ورشات حسب الاختيار','Actuariat, sinistres, digital ou conformité : un format court pour aller au concret.','الاكتواريات أو الحوادث أو الرقمنة أو الامتثال.','Salles','','workshop',4,1),('cmv6yecr9000kjc0kzg34bmj3','12:30','14:00','Déjeuner et rencontres','غداء ولقاءات','Un temps libre pour parler avec les entreprises présentes.','وقت مفتوح للحديث مع المقاولات الحاضرة.','Espace partenaires','','networking',5,1),('cmv6yecr9000ljc0k2atw8rie','14:00','15:15','Parcours de jeunes diplômés','مسارات الخريجين','Des premières expériences, racontées sans langue de bois.','تجارب أولى تُروى بصراحة.','Plénière','','plenary',6,1),('cmv6yecr9000mjc0k0aw91svj','15:30','16:30','Rendez-vous recruteurs','لقاءات التوظيف','Échanges ciblés selon les métiers cochés à l\'inscription.','لقاءات موجهة حسب المهن المختارة عند التسجيل.','Espace carrière','','networking',7,1),('cmv6yecr9000njc0kvku8xtlq','16:30','17:00','Clôture','الاختتام','Ce qu\'il faut retenir pour la suite du parcours.','ما ينبغي الاحتفاظ به لبقية المسار.','Plénière','','closing',8,1);
/*!40000 ALTER TABLE `program_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `civility` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participantType` enum('STUDENT','GRADUATE','PROFESSIONAL','TEACHER','RECRUITER','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `educationLevel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fieldOfStudy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `studyYear` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `interests` json NOT NULL,
  `sessions` json NOT NULL,
  `discoverySource` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expectations` varchar(4000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `portfolioUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `cvPath` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `consentRules` tinyint(1) NOT NULL,
  `consentContact` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('PENDING','CONFIRMED','CHECKED_IN','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `qrToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailSent` tinyint(1) NOT NULL DEFAULT '0',
  `emailError` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `checkedInAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registrations_reference_key` (`reference`),
  UNIQUE KEY `registrations_email_key` (`email`),
  UNIQUE KEY `registrations_qrToken_key` (`qrToken`),
  KEY `registrations_status_idx` (`status`),
  KEY `registrations_participantType_idx` (`participantType`),
  KEY `registrations_createdAt_idx` (`createdAt`),
  KEY `registrations_city_idx` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES ('cmv6ymsgv00008c0ker16zdej','FMA26-SXXF6G','MONSIEUR','Aaaaaaa','Aaaaa','aaaaaa@qqqq.com','+212661942343','Casablanca','STUDENT','ssssssss','BAC3','Zzzzzzz','Y3','[\"cmv6yecpz0008jc0ku0h0m65w\", \"cmv6yecq0000ajc0kb3q63ntk\"]','[\"cmv6yecr9000ijc0kiyb56kk7\", \"cmv6yecr9000jjc0kc4wije8a\"]','SCHOOL','','','',1,1,'CONFIRMED','0d498fff6247b25d05f8b37837cddea74b8bf446274322f0',0,'SMTP non configuré',NULL,'2026-10-13 17:33:49.855','2026-10-13 17:33:50.397'),('cmv6z37h400018c0kmz34mdtx','FMA26-F6BVSZ','MADAME','Alami','Sara','sara.alami.2026@example.com','+212612345678','Casablanca','STUDENT','Université Hassan II','BAC3','Économie et gestion','Y3','[\"cmv6yecpz0008jc0ku0h0m65w\"]','[]','SCHOOL','','','',1,0,'CHECKED_IN','c84505c4ea5bb0bcd4163273f073d79f4377ee9099ad5aae',0,'SMTP non configuré','2026-10-13 17:49:14.848','2026-10-13 17:46:35.800','2026-10-13 17:49:14.859'),('cmvgu7isb00001ellhmjfqxgx','FMA26-AVHYVY','MADAME','zzzz','zzz','zzzzz@zzzz.org','+212661942343','Casablanca','STUDENT','zdcfdszqcvqzsdcv','BAC3','zcedfzad','Y3','[\"cmv6yecpz0008jc0ku0h0m65w\", \"cmv6yecq0000ajc0kb3q63ntk\", \"cmv6yecq0000cjc0kqpabv0zu\", \"cmv6yecq0000djc0k9q4svur7\"]','[\"cmv6yecr9000ijc0kiyb56kk7\", \"cmv6yecr9000jjc0kc4wije8a\"]','SCHOOL','','','',1,1,'CONFIRMED','dec9d4a9163e1a754b83d89fd5dcff1c6aee761c881acd0a',0,'SMTP non configuré',NULL,'2026-10-20 15:27:40.763','2026-10-20 15:27:40.960');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_sections`
--

DROP TABLE IF EXISTS `site_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_sections` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bodyFr` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `bodyAr` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_sections`
--

LOCK TABLES `site_sections` WRITE;
/*!40000 ALTER TABLE `site_sections` DISABLE KEYS */;
INSERT INTO `site_sections` VALUES ('about','Une journée pour tracer sa route','يوم لرسم مسارك','Le Forum des Métiers de l\'Assurance réunit, à l\'initiative de la Fédération Marocaine de l\'Assurance, les étudiants, les jeunes diplômés, les enseignants et les recruteurs du secteur.\n\nAu programme : des métiers expliqués sans détour, des rencontres avec les entreprises et des ateliers pour choisir une voie concrète.','يجمع منتدى مهن التأمين، بمبادرة من الجامعة المغربية لشركات التأمين، الطلبة والخريجين والأساتذة ومسؤولي التوظيف.\n\nفي البرنامج: مهن تُشرح بوضوح، ولقاءات مع المقاولات، وورشات لاختيار مسار ملموس.','2026-10-13 17:27:16.110'),('careers','Les métiers de l\'assurance','مهن التأمين','Du calcul du risque à la relation avec l\'assuré, le secteur offre des trajectoires variées.','من حساب الخطر إلى العلاقة مع المؤمن له، يتيح القطاع مسارات متنوعة.','2026-10-13 17:27:16.110'),('contact','Écrire à l\'équipe','راسلوا الفريق','Une question sur l\'accès, les écoles invitées ou les partenariats : laissez un message.','سؤال عن الولوج أو المؤسسات المدعوة أو الشراكات: اتركوا رسالة.','2026-10-13 17:27:16.110'),('cta','Votre place vous attend','مقعدك في انتظارك','L\'inscription est gratuite. Vous repartez avec un billet nominatif et un QR code d\'accès.','التسجيل مجاني. تغادرون بتذكرة اسمية ورمز QR للدخول.','2026-10-13 17:27:16.110'),('faq','Questions fréquentes','أسئلة متداولة','L\'essentiel avant de vous déplacer.','الأساسي قبل الحضور.','2026-10-13 17:27:16.110'),('gallery','Galerie','معرض','Les images et les replays de l\'édition prendront place ici.','ستأخذ صور الدورة وإعادات المشاهدة مكانها هنا.','2026-10-13 17:27:16.110'),('hero','Le Forum des Métiers de l\'Assurance','منتدى مهن التأمين','Choisis ton avenir','اختر مستقبلك','2026-10-13 17:27:16.110'),('partners','Entreprises et partenaires','المقاولات والشركاء','Compagnies, courtiers, écoles et médias qui portent l\'édition avec la FMA.','شركات ووسطاء ومدارس ووسائل إعلام تحمل هذه الدورة مع الجامعة.','2026-10-13 17:27:16.110'),('program','Le fil de la journée','مجرى اليوم','Plénières, tables rondes et ateliers. Le détail reste modifiable depuis le back-office.','جلسات عامة وموائد مستديرة وورشات. يمكن تعديل التفاصيل من لوحة التحكم.','2026-10-13 17:27:16.110'),('speakers','Intervenants','المتحدثون','Des professionnels et des enseignants pour éclairer les choix, pas pour les enfermer.','مهنيون وأساتذة لإضاءة الاختيارات، لا لتقييدها.','2026-10-13 17:27:16.110'),('why','Pourquoi participer','لماذا المشاركة','Un rendez-vous utile, précis et ouvert à celles et ceux qui construisent la suite de leur parcours.','موعد مفيد ودقيق، مفتوح لمن يبني الخطوة التالية في مساره.','2026-10-13 17:27:16.110');
/*!40000 ALTER TABLE `site_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `speakers`
--

DROP TABLE IF EXISTS `speakers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `speakers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `org` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bioFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bioAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `photoUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `speakers`
--

LOCK TABLES `speakers` WRITE;
/*!40000 ALTER TABLE `speakers` DISABLE KEYS */;
INSERT INTO `speakers` VALUES ('cmvdtby0w000015saktui7sjf','Hb','fffff','','','','','/uploads/cfabfb3926e31387d0ef4cc120a696be.jpg',2,1);
/*!40000 ALTER TABLE `speakers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','STAFF') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STAFF',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmv6yeb9u0000jc0k04lm2m1y','admin@forum-assurance.ma','Administrateur FMA','$2b$12$umUeLxVP8jdOF/nQ79wape3cLYvopm.Ht1MyXRJV.fUewpsogPBWu','ADMIN',1,'2026-10-13 17:27:14.324','2026-10-13 17:27:14.324'),('cmv6yecdl0001jc0k0ksr4cy4','accueil@forum-assurance.ma','Accueil Forum','$2b$12$5L8mdJe2b5DfJTNeFOatw.rZE12WkQNi6EjM0I3aVy1oU8/huySja','STAFF',1,'2026-10-13 17:27:15.753','2026-10-13 17:27:15.753');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `why_items`
--

DROP TABLE IF EXISTS `why_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `why_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleFr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleAr` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bodyFr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bodyAr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sparkles',
  `sortOrder` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `why_items`
--

LOCK TABLES `why_items` WRITE;
/*!40000 ALTER TABLE `why_items` DISABLE KEYS */;
INSERT INTO `why_items` VALUES ('cmv6yecp00002jc0k1uq195ai','Rencontrer les employeurs','لقاء المشغلين','Compagnies, courtiers et partenaires recrutent et expliquent leurs métiers sans filtre.','شركات ووسطاء وشركاء يشرحون مهنهم بلا مسافة.','handshake',1,1),('cmv6yecp00003jc0kmbvlagtt','Clarifier un parcours','توضيح المسار','Des ateliers courts pour relier une filière à un métier réel.','ورشات قصيرة تربط الشعبة بمهنة حقيقية.','compass',2,1),('cmv6yecp00004jc0kgl3xewl5','Écouter des praticiens','الاستماع إلى المهنيين','Des retours d\'expérience sur le quotidien, les compétences et les premières années.','تجارب عن اليومي والكفاءات والسنوات الأولى.','messages',3,1),('cmv6yecp00005jc0kaehg9ayb','Élargir son réseau','توسيع الشبكة','Étudiants, enseignants et recruteurs dans le même lieu, le temps d\'une journée.','طلبة وأساتذة ومسؤولون توظيف في مكان واحد.','users',4,1),('cmv6yecp00006jc0kqt5fqq5i','Repérer les compétences','رصد الكفاءات','Données, conformité, relation client : les profils recherchés sont nommés clairement.','المعطيات والامتثال والعلاقة مع الزبناء: الكفاءات المطلوبة مذكورة بوضوح.','search',5,1),('cmv6yecp00007jc0ko1qkn7bg','Repartir avec un cap','المغادرة بخارطة','Un échange suffit parfois à confirmer, ou à écarter, une voie.','حوار واحد قد يكفي لتأكيد مسار أو استبعاده.','sparkles',6,1);
/*!40000 ALTER TABLE `why_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20 16:02:58
