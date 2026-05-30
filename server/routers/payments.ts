/**
 * Payments Router
 * Handles payment-related operations including PayFast webhooks
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { processIpnCallback, PayFastIpnData } from "../_core/payfast";
import { getDb } from "../db";
import { subscriptions, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendPaymentConfirmation } from "../_core/emailService";

export const paymentsRouter = router({
  // Get transaction history (admin only)
  getTransactionHistory: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
      }

      return [] as any[];
    }),

  // PayFast IPN webhook - receives payment notifications
  ipnWebhook: publicProcedure
    .input(
      z.record(z.string(), z.any()).optional()
    )
    .mutation(async ({ input }) => {
      try {
        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No IPN data provided',
          });
        }

        const data = input as PayFastIpnData;

        // Process the IPN callback
        const result = await processIpnCallback(data);

        if (!result.success) {
          console.warn('[PayFast IPN] Payment not completed:', result);
          return { success: false, message: 'Payment not completed' };
        }

        // Update subscription to Pro tier
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        // Update subscription
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await db
          .update(subscriptions)
          .set({
            tier: 'pro',
            status: 'active',
            monthlyQuota: 999999,
            nextBillingDate,
            payFastCustomerId: result.paymentId,
            billingCycleStart: new Date(),
            billingCycleEnd: nextBillingDate,
          })
          .where(eq(subscriptions.userId, result.userId));

        // Get user to send confirmation email
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, result.userId))
          .limit(1);

        if (userResult[0]) {
          const user = userResult[0];
          await sendPaymentConfirmation(
            user.email || 'noemail@example.com',
            user.name || 'User',
            result.amount,
            'MzansiBiz AI Pro Plan',
            result.paymentId
          );
        }

        console.log('[PayFast IPN] Payment processed successfully:', {
          userId: result.userId,
          paymentId: result.paymentId,
          amount: result.amount,
        });

        return { success: true, message: 'IPN processed' };
      } catch (error: any) {
        console.error('[PayFast IPN Error]', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to process IPN',
        });
      }
    }),

  // Verify payment status
  verifyPayment: publicProcedure
    .input(z.object({
      paymentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        const result = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.payFastCustomerId, input.paymentId))
          .limit(1);

        if (!result[0]) {
          return { found: false, status: 'unknown' };
        }

        return {
          found: true,
          status: result[0].status,
          tier: result[0].tier,
          nextBillingDate: result[0].nextBillingDate,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to verify payment',
        });
      }
    }),
});
