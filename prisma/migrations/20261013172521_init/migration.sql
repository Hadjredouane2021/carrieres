-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `eventDate` DATETIME(3) NULL,
    `venueName` VARCHAR(191) NOT NULL DEFAULT 'Casablanca',
    `address` VARCHAR(2000) NOT NULL DEFAULT '',
    `city` VARCHAR(191) NOT NULL DEFAULT 'Casablanca',
    `sloganFr` VARCHAR(191) NOT NULL DEFAULT 'Choisis ton avenir',
    `sloganAr` VARCHAR(191) NOT NULL DEFAULT 'اختر مستقبلك',
    `contactEmail` VARCHAR(191) NOT NULL DEFAULT 'contact@forum-assurance.ma',
    `contactPhone` VARCHAR(191) NOT NULL DEFAULT '+212 5 22 00 00 00',
    `facebook` VARCHAR(191) NOT NULL DEFAULT '',
    `linkedin` VARCHAR(191) NOT NULL DEFAULT '',
    `instagram` VARCHAR(191) NOT NULL DEFAULT '',
    `youtube` VARCHAR(191) NOT NULL DEFAULT '',
    `registrationOpen` BOOLEAN NOT NULL DEFAULT true,
    `capacity` INTEGER NOT NULL DEFAULT 1500,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_sections` (
    `key` VARCHAR(191) NOT NULL,
    `titleFr` TEXT NOT NULL,
    `titleAr` TEXT NOT NULL,
    `bodyFr` LONGTEXT NOT NULL,
    `bodyAr` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `why_items` (
    `id` VARCHAR(191) NOT NULL,
    `titleFr` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NOT NULL,
    `bodyFr` TEXT NOT NULL,
    `bodyAr` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'sparkles',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `careers` (
    `id` VARCHAR(191) NOT NULL,
    `titleFr` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NOT NULL,
    `summaryFr` TEXT NOT NULL,
    `summaryAr` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'briefcase',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_items` (
    `id` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `titleFr` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NOT NULL,
    `descriptionFr` TEXT NOT NULL,
    `descriptionAr` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL DEFAULT '',
    `speakerName` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT 'plenary',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `speakers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `roleFr` VARCHAR(191) NOT NULL,
    `roleAr` VARCHAR(191) NOT NULL,
    `org` VARCHAR(191) NOT NULL,
    `bioFr` TEXT NOT NULL,
    `bioAr` TEXT NOT NULL,
    `photoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partners` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `website` VARCHAR(191) NOT NULL DEFAULT '',
    `tier` ENUM('INSTITUTIONAL', 'GOLD', 'SILVER', 'PARTNER', 'MEDIA') NOT NULL DEFAULT 'PARTNER',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq_items` (
    `id` VARCHAR(191) NOT NULL,
    `questionFr` VARCHAR(191) NOT NULL,
    `questionAr` VARCHAR(191) NOT NULL,
    `answerFr` TEXT NOT NULL,
    `answerAr` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_items` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
    `url` VARCHAR(191) NOT NULL DEFAULT '',
    `captionFr` VARCHAR(191) NOT NULL DEFAULT '',
    `captionAr` VARCHAR(191) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `civility` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `participantType` ENUM('STUDENT', 'GRADUATE', 'PROFESSIONAL', 'TEACHER', 'RECRUITER', 'OTHER') NOT NULL,
    `organization` VARCHAR(191) NOT NULL,
    `educationLevel` VARCHAR(191) NOT NULL,
    `fieldOfStudy` VARCHAR(191) NOT NULL DEFAULT '',
    `studyYear` VARCHAR(191) NOT NULL DEFAULT '',
    `interests` JSON NOT NULL,
    `sessions` JSON NOT NULL,
    `discoverySource` VARCHAR(191) NOT NULL,
    `expectations` VARCHAR(4000) NOT NULL DEFAULT '',
    `portfolioUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `cvPath` VARCHAR(191) NOT NULL DEFAULT '',
    `consentRules` BOOLEAN NOT NULL,
    `consentContact` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `qrToken` VARCHAR(191) NOT NULL,
    `emailSent` BOOLEAN NOT NULL DEFAULT false,
    `emailError` VARCHAR(1000) NOT NULL DEFAULT '',
    `checkedInAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registrations_reference_key`(`reference`),
    UNIQUE INDEX `registrations_email_key`(`email`),
    UNIQUE INDEX `registrations_qrToken_key`(`qrToken`),
    INDEX `registrations_status_idx`(`status`),
    INDEX `registrations_participantType_idx`(`participantType`),
    INDEX `registrations_createdAt_idx`(`createdAt`),
    INDEX `registrations_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contact_messages_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
