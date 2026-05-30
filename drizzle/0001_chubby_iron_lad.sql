CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` enum('en','zu','xh','af') NOT NULL,
	`topic` enum('sars_tax','ccma_labour','general_business','document_help'),
	`messages` json,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_deadlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`regulatoryBody` enum('sars','uif','ccma','dol','cipc') NOT NULL,
	`deadlineType` enum('tax_return','uif_submission','annual_compliance','payroll_audit') NOT NULL,
	`dueDate` date NOT NULL,
	`description` text,
	`isRecurring` boolean DEFAULT false,
	`recurringPattern` enum('monthly','quarterly','annually'),
	`reminderSentAt` timestamp,
	`completedAt` timestamp,
	`status` enum('pending','completed','overdue') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_deadlines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('invoice','employment_contract','business_plan','health_safety') NOT NULL,
	`title` varchar(255) NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`storageUrl` text,
	`metadata` json,
	`generatedAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`emailType` enum('deadline_reminder','subscription_renewal','welcome','support') NOT NULL,
	`subject` text,
	`sentAt` timestamp DEFAULT (now()),
	`deliveredAt` timestamp,
	`openedAt` timestamp,
	`status` enum('pending','sent','failed','bounced') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`payFastTransactionId` varchar(100),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'ZAR',
	`status` enum('pending','success','failed','refunded') DEFAULT 'pending',
	`transactionType` enum('subscription','upgrade','downgrade','refund') NOT NULL,
	`paymentMethod` varchar(50),
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_transactions_payFastTransactionId_unique` UNIQUE(`payFastTransactionId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','pro') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','suspended') NOT NULL DEFAULT 'active',
	`paymentMethod` enum('payfast','manual') DEFAULT 'payfast',
	`payFastCustomerId` varchar(100),
	`payFastToken` varchar(255),
	`nextBillingDate` timestamp,
	`billingCycleStart` timestamp,
	`billingCycleEnd` timestamp,
	`monthlyQuota` int DEFAULT 10,
	`queriesUsedThisMonth` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`cancelledAt` timestamp,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_payFastCustomerId_unique` UNIQUE(`payFastCustomerId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `businessName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `businessType` enum('sole_proprietor','partnership','cc','pty_ltd','npo');--> statement-breakpoint
ALTER TABLE `users` ADD `businessRegistration` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `taxNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `uifNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','zu','xh','af') DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `users` ADD `businessAddress` text;--> statement-breakpoint
ALTER TABLE `users` ADD `businessPhone` varchar(20);