# MzansiBiz AI - Project TODO

## Phase 1: Architecture & Design System
- [x] Create architecture documentation
- [x] Define database schema with all tables
- [x] Design cyberpunk color palette and typography system
- [x] Document regulatory framework (SARS, CCMA, UIF)
- [x] Create Tailwind CSS design tokens and theme configuration
- [x] Build reusable cyberpunk UI component library (buttons, cards, inputs, HUD elements)

## Phase 2: UI Foundation & Landing Page
- [x] Set up Tailwind CSS with cyberpunk color tokens and glow effects
- [x] Create global layout wrapper with navigation
- [x] Build landing page with hero section, feature highlights, pricing tiers, and CTA
- [x] Implement responsive design for mobile-first approach
- [ ] Create 404 and error pages with cyberpunk styling
- [x] Add Google Fonts integration (Space Mono, Space Grotesk, Inter)

## Phase 3: User Authentication & Dashboard
- [x] Extend user schema with business profile fields (businessName, businessType, taxNumber, etc.)
- [x] Create database helpers for user profile management
- [x] Build tRPC routers for auth, subscription, AI, documents, compliance, and payments
- [x] Create user registration flow with business profile setup (via Settings page)
- [x] Build user dashboard layout with sidebar navigation
- [x] Implement account settings page (business profile, language preference, email)
- [x] Create subscription status display component
- [x] Build usage stats dashboard (queries used, quota remaining)
- [x] Implement user logout functionality

## Phase 4: Multilingual AI Chatbot
- [x] Create AI chat interface component with message history
- [x] Implement language selector (English, isiZulu, isiXhosa, Afrikaans)
- [x] Build system prompts for SARS tax and CCMA labour law expertise
- [x] Integrate OpenAI GPT-4o API with multilingual support
- [x] Implement message streaming and real-time responses
- [x] Add conversation history storage to database
- [x] Create chat context persistence (remember user's business profile)
- [x] Add query usage tracking for subscription limits (tRPC router ready)
- [ ] Build conversation export/download feature
- [x] Write vitest tests for AI routing and language handling

## Phase 5: Document Generation
- [x] Create document template system (invoices, contracts, plans, H&S files)
- [x] Build document generation UI with form inputs
- [ ] Implement AI-powered document customization based on user business profile
- [x] Integrate S3 storage for generated documents (via storagePut)
- [x] Create PDF generation pipeline (HTML to PDF conversion)
- [x] Build document preview and download functionality
- [x] Implement document history and retrieval
- [x] Add document expiration and cleanup logic (30-day auto-expiry)
- [x] tRPC routers for document generation ready
- [x] Write vitest tests for document generation accuracy

## Phase 6: Compliance Tracker & Reminders
- [ ] Create compliance deadline database population logic
- [x] Build compliance tracker UI (calendar/list view of deadlines)
- [ ] Implement deadline calculation based on business profile (SARS, UIF, CCMA)
- [ ] Create email notification system for upcoming deadlines
- [x] Implement in-app deadline reminders
- [x] Build compliance report generation
- [x] Add deadline completion tracking
- [ ] Implement recurring deadline patterns (monthly, quarterly, annually)
- [x] Create compliance status dashboard
- [x] tRPC routers for compliance tracking ready
- [x] Write vitest tests for deadline calculation logic

## Phase 7: PayFast Integration & Subscriptions
- [x] Set up PayFast API credentials and webhook endpoints
- [x] Create subscription upgrade flow (free to Pro)
- [x] Implement PayFast checkout integration
- [x] Build subscription status management (active, cancelled, suspended)
- [x] Implement recurring billing with PayFast tokens
- [x] Create subscription cancellation flow
- [x] Build payment transaction logging and audit trail
- [x] Implement webhook handler for PayFast IPN (Instant Payment Notification)
- [ ] Create payment failure handling and retry logic
- [x] Build subscription management UI (upgrade, cancel, view history)
- [ ] Add pro-rata refund calculations
- [x] tRPC routers for payments and subscription management ready
- [x] Write vitest tests for PayFast integration

## Phase 8: Email Notifications & Automation
- [x] Set up email service provider integration (Manus Notification API)
- [x] Create email templates (deadline reminders, welcome, subscription renewal)
- [ ] Implement scheduled email sending for deadlines
- [ ] Build email preference management (user can opt-in/out)
- [ ] Create email delivery logging
- [ ] Implement email bounce and failure handling
- [ ] Add email open/click tracking (optional)
- [x] Write vitest tests for email notification logic

## Phase 9: Subscription Quota Management
- [ ] Implement monthly query quota tracking for free tier
- [ ] Create quota reset logic (monthly on billing cycle)
- [ ] Build quota warning notifications (80%, 100% usage)
- [ ] Implement upgrade prompts when quota exceeded
- [ ] Create usage analytics dashboard
- [ ] Write vitest tests for quota calculations

## Phase 10: Admin & Analytics
- [ ] Create admin dashboard (user count, MRR, conversion metrics)
- [ ] Build payment transaction history view
- [ ] Implement user analytics (signup trends, churn rate)
- [ ] Create compliance accuracy monitoring
- [ ] Build AI query analytics (popular topics, languages)
- [ ] Implement system health monitoring

## Phase 11: Polish & Optimization
- [ ] Optimize AI response times (caching, prompt engineering)
- [ ] Implement rate limiting and abuse prevention
- [ ] Add comprehensive error handling and user feedback
- [ ] Optimize database queries and indexing
- [ ] Implement caching strategies (Redis for session data)
- [ ] Add comprehensive logging for debugging
- [ ] Optimize bundle size and frontend performance
- [ ] Implement accessibility improvements (WCAG 2.1 AA)

## Phase 12: Testing & QA
- [ ] Write comprehensive vitest unit tests for all features
- [ ] Perform manual testing of all user flows
- [ ] Test multilingual support across all features
- [ ] Test subscription lifecycle (upgrade, cancel, renew)
- [ ] Test PayFast integration with sandbox credentials
- [ ] Test email notifications and compliance reminders
- [ ] Test document generation accuracy and compliance
- [ ] Performance testing under load
- [ ] Security testing (SQL injection, XSS, CSRF)

## Phase 13: Deployment & Launch
- [ ] Create production environment configuration
- [ ] Set up PayFast production credentials
- [ ] Configure email sending for production
- [ ] Implement monitoring and alerting
- [ ] Create deployment documentation
- [ ] Plan soft launch (beta users)
- [ ] Create user onboarding flow
- [ ] Set up customer support system
- [ ] Create marketing materials and landing page copy
- [ ] Launch public beta

## Known Issues & Blockers
- None yet

## Completed Milestones
- Project initialized with web-db-user scaffold
- Architecture documentation created
- Database schema designed
- Cyberpunk design system defined
