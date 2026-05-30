import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, date, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with business profile fields for MzansiBiz AI.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Business profile fields
  businessName: varchar("businessName", { length: 255 }),
  businessType: mysqlEnum("businessType", ["sole_proprietor", "partnership", "cc", "pty_ltd", "npo"]),
  businessRegistration: varchar("businessRegistration", { length: 100 }),
  taxNumber: varchar("taxNumber", { length: 20 }),
  uifNumber: varchar("uifNumber", { length: 20 }),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "zu", "xh", "af"]).default("en"),
  businessAddress: text("businessAddress"),
  businessPhone: varchar("businessPhone", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table - tracks user subscription status and PayFast integration
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("tier", ["free", "pro"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "suspended"]).default("active").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["payfast", "manual"]).default("payfast"),
  payFastCustomerId: varchar("payFastCustomerId", { length: 100 }).unique(),
  payFastToken: varchar("payFastToken", { length: 255 }),
  nextBillingDate: timestamp("nextBillingDate"),
  billingCycleStart: timestamp("billingCycleStart"),
  billingCycleEnd: timestamp("billingCycleEnd"),
  monthlyQuota: int("monthlyQuota").default(10),
  queriesUsedThisMonth: int("queriesUsedThisMonth").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * AI Conversations table - stores chat history for context and analytics
 */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  language: mysqlEnum("language", ["en", "zu", "xh", "af"]).notNull(),
  topic: mysqlEnum("topic", ["sars_tax", "ccma_labour", "general_business", "document_help"]),
  messages: json("messages"), // Array of {role, content, timestamp}
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * Documents table - tracks generated documents for user retrieval and audit
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", ["invoice", "employment_contract", "business_plan", "health_safety"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  storageUrl: text("storageUrl"),
  metadata: json("metadata"), // Document-specific data
  generatedAt: timestamp("generatedAt").defaultNow(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Compliance Deadlines table - regulatory deadlines derived from user business profile
 */
export const complianceDeadlines = mysqlTable("compliance_deadlines", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  regulatoryBody: mysqlEnum("regulatoryBody", ["sars", "uif", "ccma", "dol", "cipc"]).notNull(),
  deadlineType: mysqlEnum("deadlineType", ["tax_return", "uif_submission", "annual_compliance", "payroll_audit"]).notNull(),
  dueDate: date("dueDate").notNull(),
  description: text("description"),
  isRecurring: boolean("isRecurring").default(false),
  recurringPattern: mysqlEnum("recurringPattern", ["monthly", "quarterly", "annually"]),
  reminderSentAt: timestamp("reminderSentAt"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "completed", "overdue"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceDeadline = typeof complianceDeadlines.$inferSelect;
export type InsertComplianceDeadline = typeof complianceDeadlines.$inferInsert;

/**
 * Payment Transactions table - audit trail for all PayFast transactions
 */
export const paymentTransactions = mysqlTable("payment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  payFastTransactionId: varchar("payFastTransactionId", { length: 100 }).unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ZAR"),
  status: mysqlEnum("status", ["pending", "success", "failed", "refunded"]).default("pending"),
  transactionType: mysqlEnum("transactionType", ["subscription", "upgrade", "downgrade", "refund"]).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Email Logs table - tracks sent notifications for compliance and support
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  emailType: mysqlEnum("emailType", ["deadline_reminder", "subscription_renewal", "welcome", "support"]).notNull(),
  subject: text("subject"),
  sentAt: timestamp("sentAt").defaultNow(),
  deliveredAt: timestamp("deliveredAt"),
  openedAt: timestamp("openedAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;