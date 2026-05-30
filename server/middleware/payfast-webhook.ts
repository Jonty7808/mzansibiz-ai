/**
 * PayFast Webhook Middleware
 * Registers the /api/payfast/ipn endpoint to handle IPN callbacks
 */

import { Router, Request, Response } from 'express';
import { processIpnCallback, PayFastIpnData } from '../_core/payfast';
import { getDb } from '../db';
import { subscriptions, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendPaymentConfirmation } from '../_core/emailService';

export function createPayFastWebhookRouter(): Router {
  const router = Router();

  /**
   * POST /api/payfast/ipn
   * Receives IPN callbacks from PayFast
   */
  router.post('/ipn', async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as PayFastIpnData;

      console.log('[PayFast IPN] Received callback:', {
        paymentId: data.pf_payment_id,
        status: data.payment_status,
        amount: data.amount_gross,
      });

      // Process the IPN callback
      const result = await processIpnCallback(data);

      if (!result.success) {
        console.warn('[PayFast IPN] Payment not completed:', result);
        res.status(200).json({ success: false, message: 'Payment not completed' });
        return;
      }

      // Update subscription to Pro tier
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
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

      res.status(200).json({ success: true, message: 'IPN processed' });
    } catch (error: any) {
      console.error('[PayFast IPN Error]', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
