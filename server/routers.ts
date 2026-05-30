import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb, updateUserProfile, getOrCreateSubscription, getSubscription, incrementQueryUsage } from "./db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { subscriptions, users } from "../drizzle/schema";
import { getSystemPrompt } from "./_core/aiPrompts";
import { invokeLLM } from "./_core/llm";
import { createProPlanCheckout } from "./_core/payfast";
import { paymentsRouter } from "./routers/payments";

export const appRouter = router({
  system: systemRouter,
  payments: paymentsRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        businessName: z.string().optional(),
        businessType: z.enum(['sole_proprietor', 'partnership', 'cc', 'pty_ltd', 'npo']).optional(),
        businessRegistration: z.string().optional(),
        taxNumber: z.string().optional(),
        uifNumber: z.string().optional(),
        preferredLanguage: z.enum(['en', 'zu', 'xh', 'af']).optional(),
        businessAddress: z.string().optional(),
        businessPhone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        await updateUserProfile(ctx.user.id, input);

        // Return updated user
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        }

        const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        return result[0];
      }),
  }),

  subscription: router({
    getCurrentTier: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const subscription = await getOrCreateSubscription(ctx.user.id);
        return {
          tier: subscription.tier,
          status: subscription.status,
          monthlyQuota: subscription.monthlyQuota,
          queriesUsedThisMonth: subscription.queriesUsedThisMonth ?? 0,
          nextBillingDate: subscription.nextBillingDate,
        };
      }),

    getUsageStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const subscription = await getOrCreateSubscription(ctx.user.id);
        const used = subscription.queriesUsedThisMonth ?? 0;
        const quota = subscription.monthlyQuota ?? 10;

        return {
          used,
          quota,
          remaining: Math.max(0, quota - used),
          percentageUsed: Math.round((used / quota) * 100),
          isProTier: subscription.tier === 'pro',
        };
      }),

    upgradeToPro: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const user = ctx.user;
        const returnUrl = `${process.env.VITE_FRONTEND_URL || 'https://mzansibiz.co.za'}/dashboard?payment=success`;
        const cancelUrl = `${process.env.VITE_FRONTEND_URL || 'https://mzansibiz.co.za'}/dashboard?payment=cancelled`;
        const notifyUrl = `${process.env.VITE_FRONTEND_URL || 'https://mzansibiz.co.za'}/api/payfast/ipn`;

        const checkoutUrl = createProPlanCheckout(
          user.id,
          user.email || 'noemail@example.com',
          user.name || 'User',
          returnUrl,
          cancelUrl,
          notifyUrl
        );

        return {
          checkoutUrl,
          message: 'Redirecting to PayFast payment gateway',
        };
      }),

    cancelSubscription: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        }

        // Downgrade to free tier
        await db.update(subscriptions)
          .set({ tier: 'free', status: 'active', cancelledAt: new Date() })
          .where(eq(subscriptions.userId, ctx.user.id));

        return { success: true };
      }),
  }),

  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        language: z.enum(['en', 'zu', 'xh', 'af']).default('en'),
        topic: z.enum(['sars_tax', 'ccma_labour', 'general_business', 'document_help']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // Check subscription quota
        const subscription = await getOrCreateSubscription(ctx.user.id);
        if (!subscription) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No subscription found' });
        }

        // Free tier quota check
        if (subscription.tier === 'free') {
          const used = subscription.queriesUsedThisMonth ?? 0;
          const quota = subscription.monthlyQuota ?? 10;
          if (used >= quota) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Monthly query quota exceeded. Upgrade to Pro for unlimited queries.',
            });
          }
        }

        // Call OpenAI API with multilingual support
        const systemPrompt = getSystemPrompt(input.topic || 'general_business', input.language);
        
        try {
          const llmResponse = await invokeLLM({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: input.message },
            ],
          });

          const response = llmResponse.choices[0]?.message?.content || 'Unable to generate response';

          // Increment usage
          await incrementQueryUsage(ctx.user.id);

          return {
            response,
            language: input.language,
            topic: input.topic || 'general_business',
            timestamp: new Date(),
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Failed to generate AI response',
          });
        }
      }),

    getConversationHistory: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Fetch conversation history from database
        return [] as any[];
      }),

    clearConversation: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Clear conversation history from database
        return { success: true };
      }),
  }),

  documents: router({
    generateDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum(['invoice', 'employment_contract', 'business_plan', 'health_safety']),
        title: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // Check subscription tier
        const subscription = await getSubscription(ctx.user.id);
        if (subscription?.tier === 'free') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Document generation is only available in Pro tier.',
          });
        }

        // TODO: Generate document using AI and store in S3
        return {
          id: Math.random().toString(36),
          title: input.title,
          documentType: input.documentType,
          storageUrl: '/placeholder-document.pdf',
          createdAt: new Date(),
        };
      }),

    listDocuments: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Fetch documents from database
        return [] as any[];
      }),

    downloadDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Generate signed S3 URL
        return { url: '/placeholder-document.pdf' };
      }),

    deleteDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Delete document from database and S3
        return { success: true };
      }),
  }),

  compliance: router({
    getDeadlines: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Fetch compliance deadlines from database
        return [] as any[];
      }),

    markDeadlineComplete: protectedProcedure
      .input(z.object({ deadlineId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Update deadline status in database
        return { success: true };
      }),

    getComplianceReport: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // TODO: Generate compliance report
        return {
          totalDeadlines: 0,
          completedDeadlines: 0,
          pendingDeadlines: 0,
          overdueDeadlines: 0,
          complianceScore: 100,
        };
      }),
  }),


});

export type AppRouter = typeof appRouter;
