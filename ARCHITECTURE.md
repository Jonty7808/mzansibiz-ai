# MzansiBiz AI - Architecture & Design System

## Overview

MzansiBiz AI is a multilingual, AI-powered compliance and business consulting platform tailored for South African small, medium, and micro enterprises (SMMEs). The platform combines a futuristic cyberpunk aesthetic with practical regulatory guidance, document automation, and subscription-based monetization.

## Core Features

| Feature | Description | Business Value |
|---------|-------------|-----------------|
| **Multilingual AI Chatbot** | Conversational AI supporting English, isiZulu, isiXhosa, and Afrikaans for SARS tax and CCMA labour law queries | Removes language barriers for 90%+ of SA population |
| **Document Generation** | Automated creation of invoices, employment contracts, business plans, and H&S files per SA regulations | Reduces legal/admin costs for SMMEs |
| **Compliance Tracker** | Deadline reminders for SARS, UIF, and other regulatory submissions | Prevents costly penalties and compliance failures |
| **Email Notifications** | Automated reminders for tax deadlines, UIF submissions, and regulatory dates | Ensures timely compliance actions |
| **Freemium Subscription** | Free tier (limited queries) + Pro Plan (R199/month unlimited) | Sustainable revenue model |
| **PayFast Integration** | ZAR-based recurring billing with full lifecycle management | Locally-relevant payment processing |
| **User Dashboard** | Account management, usage stats, saved documents, subscription status | Centralized control and transparency |
| **Landing Page** | Public-facing site with SA branding, features, pricing, and CTA | Conversion funnel for user acquisition |

## Technology Stack

- **Frontend**: React 19 + TailwindCSS 4 (cyberpunk design tokens)
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB (managed by Manus)
- **AI**: OpenAI GPT-4o API (multilingual reasoning)
- **Payments**: PayFast API (ZAR recurring billing)
- **Auth**: Manus OAuth 2.0
- **Email**: Manus Notification API (built-in)
- **Storage**: S3 (document storage)

## Database Schema

### Core Tables

#### `users`
Extends the default Manus auth table with business profile data.

```sql
-- Extended user fields (added to existing users table)
- businessName: varchar(255)
- businessType: enum('sole_proprietor', 'partnership', 'cc', 'pty_ltd', 'npo')
- businessRegistration: varchar(100) -- CIPC registration number
- taxNumber: varchar(20) -- SARS tax number (not stored plaintext in production)
- uifNumber: varchar(20) -- UIF registration number
- preferredLanguage: enum('en', 'zu', 'xh', 'af') default 'en'
- businessAddress: text
- businessPhone: varchar(20)
- createdAt: timestamp
- updatedAt: timestamp
```

#### `subscriptions`
Tracks subscription status and PayFast integration.

```sql
CREATE TABLE subscriptions (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  tier: enum('free', 'pro') default 'free'
  status: enum('active', 'cancelled', 'suspended') default 'active'
  paymentMethod: enum('payfast', 'manual') default 'payfast'
  payFastCustomerId: varchar(100) UNIQUE -- PayFast subscription ID
  payFastToken: varchar(255) -- Recurring billing token
  nextBillingDate: timestamp
  billingCycleStart: timestamp
  billingCycleEnd: timestamp
  monthlyQuota: int default 10 -- Free tier: 10 queries/month
  queriesUsedThisMonth: int default 0
  createdAt: timestamp
  updatedAt: timestamp
  cancelledAt: timestamp
)
```

#### `ai_conversations`
Stores chat history for context and analytics.

```sql
CREATE TABLE ai_conversations (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  language: enum('en', 'zu', 'xh', 'af')
  topic: enum('sars_tax', 'ccma_labour', 'general_business', 'document_help')
  messages: json -- Array of {role, content, timestamp}
  summary: text -- AI-generated summary for analytics
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `documents`
Tracks generated documents for user retrieval and audit.

```sql
CREATE TABLE documents (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  documentType: enum('invoice', 'employment_contract', 'business_plan', 'health_safety')
  title: varchar(255)
  storageKey: varchar(255) -- S3 key for file retrieval
  storageUrl: text -- Signed S3 URL
  metadata: json -- Document-specific data (client name, dates, etc.)
  generatedAt: timestamp
  expiresAt: timestamp -- For temporary documents
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `compliance_deadlines`
Regulatory deadlines derived from user business profile.

```sql
CREATE TABLE compliance_deadlines (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  regulatoryBody: enum('sars', 'uif', 'ccma', 'dol', 'cipc')
  deadlineType: enum('tax_return', 'uif_submission', 'annual_compliance', 'payroll_audit')
  dueDate: date
  description: text
  isRecurring: boolean
  recurringPattern: enum('monthly', 'quarterly', 'annually') -- If recurring
  reminderSentAt: timestamp
  completedAt: timestamp
  status: enum('pending', 'completed', 'overdue')
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `payment_transactions`
Audit trail for all PayFast transactions.

```sql
CREATE TABLE payment_transactions (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  subscriptionId: int FOREIGN KEY (subscriptions.id)
  payFastTransactionId: varchar(100) UNIQUE
  amount: decimal(10, 2) -- In ZAR
  currency: varchar(3) default 'ZAR'
  status: enum('pending', 'success', 'failed', 'refunded')
  transactionType: enum('subscription', 'upgrade', 'downgrade', 'refund')
  paymentMethod: varchar(50) -- e.g., 'credit_card', 'bank_transfer'
  failureReason: text -- If status = failed
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `email_logs`
Tracks sent notifications for compliance and support.

```sql
CREATE TABLE email_logs (
  id: int PRIMARY KEY AUTO_INCREMENT
  userId: int FOREIGN KEY (users.id)
  recipientEmail: varchar(320)
  emailType: enum('deadline_reminder', 'subscription_renewal', 'welcome', 'support')
  subject: text
  sentAt: timestamp
  deliveredAt: timestamp
  openedAt: timestamp
  status: enum('pending', 'sent', 'failed', 'bounced')
  createdAt: timestamp
  updatedAt: timestamp
)
```

## API Procedures (tRPC Routers)

### `auth` Router
- `me()` - Get current user profile with business details
- `updateProfile()` - Update business name, type, tax number, preferred language
- `logout()` - Clear session

### `subscription` Router
- `getCurrentTier()` - Get user's current subscription status
- `getUsageStats()` - Monthly query count, quota remaining
- `upgradeToPro()` - Initiate PayFast payment flow
- `cancelSubscription()` - Downgrade to free tier
- `getPayFastCheckoutUrl()` - Generate one-time checkout link

### `ai` Router
- `chat()` - Send message to multilingual AI chatbot
- `getConversationHistory()` - Retrieve past chat sessions
- `clearConversation()` - Delete conversation history

### `documents` Router
- `generateDocument()` - Create invoice, contract, plan, or H&S file
- `listDocuments()` - Retrieve user's saved documents
- `downloadDocument()` - Get signed S3 URL for file
- `deleteDocument()` - Remove document from storage

### `compliance` Router
- `getDeadlines()` - List upcoming regulatory deadlines
- `markDeadlineComplete()` - Update compliance status
- `getComplianceReport()` - Summary of user's regulatory standing

### `payments` Router (Admin only)
- `getTransactionHistory()` - Audit trail of all payments
- `handlePayFastCallback()` - Webhook handler for PayFast IPN

## Cyberpunk Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| **Primary Neon Pink** | `#FF1493` | CTAs, highlights, active states |
| **Primary Neon Cyan** | `#00D9FF` | Secondary highlights, borders, accents |
| **Deep Black** | `#0A0E27` | Background, card backgrounds |
| **Dark Gray** | `#1A1F3A` | Secondary backgrounds, borders |
| **Neon Green** | `#39FF14` | Success states, positive indicators |
| **Neon Orange** | `#FF6B00` | Warning states, alerts |
| **Neon Red** | `#FF0055` | Error states, critical alerts |
| **Text Primary** | `#FFFFFF` | Main text on dark backgrounds |
| **Text Secondary** | `#B0B8D4` | Secondary text, labels |

### Typography

- **Headings**: "Space Mono" or "IBM Plex Mono" (geometric, monospace)
- **Body**: "Inter" or "Roboto" (clean, modern sans-serif)
- **Accent**: "Space Grotesk" (bold, futuristic)
- **Font Sizes**: 
  - H1: 3.5rem (56px) with 2px neon glow
  - H2: 2.5rem (40px) with 1.5px glow
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### UI Elements

- **Buttons**: Neon pink background, deep black text, 2px cyan border, 4px outer glow
- **Cards**: Deep black background, 1px cyan border, subtle shadow with pink/cyan accent
- **Inputs**: Deep black background, cyan border on focus, pink placeholder text
- **HUD Elements**: Thin technical lines, corner brackets `[ ]`, minimal rounded corners (4px max)
- **Animations**: Snappy transitions (150-250ms), glow pulse effects on hover
- **Shadows**: Cyan/pink neon glow (blur-radius: 12px, spread: 2px)

### Glow Effects (CSS)

```css
/* Neon Pink Glow */
.glow-pink {
  text-shadow: 0 0 10px #FF1493, 0 0 20px #FF1493, 0 0 30px #FF1493;
  box-shadow: 0 0 10px #FF1493, inset 0 0 10px rgba(255, 20, 147, 0.2);
}

/* Neon Cyan Glow */
.glow-cyan {
  text-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF;
  box-shadow: 0 0 10px #00D9FF, inset 0 0 10px rgba(0, 217, 255, 0.2);
}

/* Dual Glow (Pink + Cyan) */
.glow-dual {
  text-shadow: 0 0 10px #FF1493, 0 0 20px #00D9FF, 0 0 30px #FF1493;
  box-shadow: 0 0 15px #FF1493, 0 0 20px #00D9FF;
}
```

## Regulatory Framework

### SARS (South African Revenue Service)

- **Tax Year**: March 1 - February 28
- **Filing Deadlines**:
  - Individual tax returns: June 15 (extension to September 15)
  - Company tax returns: September 30
  - Provisional tax payments: Quarterly (June, September, December, March)
- **Monthly PAYE**: Due by 7th of following month
- **VAT**: Quarterly (if turnover < R1M) or monthly (if > R1M)

### CCMA (Commission for Conciliation, Mediation and Arbitration)

- **Employment Contracts**: Must comply with BCEA (Basic Conditions of Employment Act)
- **Minimum Wage**: R27.58/hour (as of 2024, indexed annually)
- **Leave Entitlements**: 21 days annual, 3 days sick, 5 days family responsibility
- **Dismissal Procedures**: Must follow fair process (warnings, hearing, appeal)

### UIF (Unemployment Insurance Fund)

- **Registration**: Mandatory for all employers
- **Contributions**: 1% employee + 1% employer (capped at R1,050/month per employee)
- **Submission**: Monthly PAYE reconciliation
- **Claims**: Employees can claim up to 8 months of benefits

## Subscription Model

### Free Tier

- 10 AI queries per month
- Basic document templates (read-only)
- Compliance deadline viewing (no reminders)
- No email notifications

### Pro Tier (R199/month)

- Unlimited AI queries
- Full document generation (invoices, contracts, plans, H&S files)
- Automated compliance deadline reminders (email + in-app)
- Priority support
- Monthly compliance report

### Billing

- **Currency**: ZAR (South African Rand)
- **Payment Gateway**: PayFast (South Africa's leading provider)
- **Billing Cycle**: Monthly (recurring)
- **Cancellation**: Immediate, pro-rata refund available
- **Upgrade/Downgrade**: Effective immediately

## Security & Compliance

- **Data Encryption**: TLS 1.3 for all transit; AES-256 for sensitive fields at rest
- **PCI DSS**: PayFast handles all card data (no direct storage)
- **POPIA Compliance**: User consent for email notifications, data retention policies
- **Audit Logging**: All transactions, document generation, and AI queries logged
- **Rate Limiting**: 100 requests/minute per user (prevents abuse)

## Deployment & Scaling

- **Hosting**: Manus Cloud Run (Node.js runtime)
- **Database**: Managed TiDB (MySQL-compatible)
- **Storage**: S3 for documents and assets
- **Email**: Manus Notification API
- **AI**: OpenAI API (external, rate-limited)
- **Monitoring**: Manus built-in observability (logs, metrics)

## Success Metrics

- **User Acquisition**: Target 1,000 users in first 6 months
- **Conversion Rate**: Free to Pro conversion target 5-10%
- **Monthly Recurring Revenue (MRR)**: Target R20,000+ by month 6
- **User Retention**: Target 70% month-over-month retention
- **Compliance Accuracy**: 99%+ accuracy on regulatory deadlines
- **AI Response Quality**: 4.5+ stars on user satisfaction surveys

## Roadmap (Future Phases)

1. **Phase 2**: Integration with SARS e-filing system for direct tax submissions
2. **Phase 3**: Multi-user business accounts (accountant/manager roles)
3. **Phase 4**: Mobile app (iOS/Android) for on-the-go compliance checks
4. **Phase 5**: Integration with accounting software (Xero, Wave)
5. **Phase 6**: AI-powered business growth recommendations based on compliance data
