/**
 * PayFast Integration for MzansiBiz AI
 * Handles subscription payments and recurring billing in ZAR
 */

import crypto from 'crypto';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || 'test_merchant';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || 'test_key';
const PAYFAST_SANDBOX = process.env.NODE_ENV !== 'production';
const PAYFAST_BASE_URL = PAYFAST_SANDBOX
  ? 'https://sandbox.payfast.co.za'
  : 'https://www.payfast.co.za';

interface PayFastCheckoutParams {
  userId: number;
  userEmail: string;
  userName: string;
  amount: number;
  itemName: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Generate PayFast signature for payment requests
 */
function generateSignature(data: Record<string, string>): string {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');

  const hashString = `${queryString}&passphrase=${encodeURIComponent(PAYFAST_MERCHANT_KEY)}`;
  return crypto.createHash('md5').update(hashString).digest('hex');
}

/**
 * Create a one-time payment checkout URL
 */
export function createCheckoutUrl(params: PayFastCheckoutParams): string {
  const paymentData: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: params.userName.split(' ')[0] || 'User',
    name_last: params.userName.split(' ').slice(1).join(' ') || 'Account',
    email_address: params.userEmail,
    m_payment_id: `user_${params.userId}_${Date.now()}`,
    amount: (params.amount * 100).toFixed(0),
    item_name: params.itemName,
    item_description: params.itemName,
    custom_int1: String(params.userId),
    custom_str1: 'pro_upgrade',
  };

  const signature = generateSignature(paymentData);
  const queryParams = new URLSearchParams();
  
  Object.entries({ ...paymentData, signature }).forEach(([key, value]) => {
    queryParams.append(key, value);
  });

  return `${PAYFAST_BASE_URL}/eng/process?${queryParams.toString()}`;
}

/**
 * Create a subscription checkout URL for recurring billing
 */
export function createSubscriptionUrl(
  userId: number,
  userEmail: string,
  userName: string,
  amount: number,
  itemName: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string
): string {
  const paymentData: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: userName.split(' ')[0] || 'User',
    name_last: userName.split(' ').slice(1).join(' ') || 'Account',
    email_address: userEmail,
    m_payment_id: `sub_${userId}_${Date.now()}`,
    amount: (amount * 100).toFixed(0),
    item_name: itemName,
    item_description: itemName,
    custom_int1: String(userId),
    custom_str1: 'subscription',
    subscription_type: '1',
    billing_frequency: '1',
    cycle_frequency: '1',
    cycles: '0',
    recurring: '1',
  };

  const signature = generateSignature(paymentData);
  const queryParams = new URLSearchParams();
  
  Object.entries({ ...paymentData, signature }).forEach(([key, value]) => {
    queryParams.append(key, value);
  });

  return `${PAYFAST_BASE_URL}/eng/process?${queryParams.toString()}`;
}

/**
 * Verify PayFast IPN (Instant Payment Notification) signature
 */
export function verifyIpnSignature(data: Record<string, string>): boolean {
  const signature = data.signature;
  const dataCopy = { ...data };
  delete dataCopy.signature;

  const calculatedSignature = generateSignature(dataCopy);
  return calculatedSignature === signature;
}

/**
 * Parse PayFast IPN data
 */
export interface PayFastIpnData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_int1: string;
  custom_str1: string;
  name_first: string;
  name_last: string;
  email_address: string;
  merchant_id: string;
  signature: string;
  [key: string]: any;
}

/**
 * Process PayFast IPN callback
 */
export async function processIpnCallback(data: PayFastIpnData): Promise<{
  success: boolean;
  userId: number;
  paymentId: string;
  status: string;
  amount: number;
}> {
  const stringData: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    stringData[key] = String(value);
  });

  if (!verifyIpnSignature(stringData)) {
    throw new Error('Invalid IPN signature');
  }

  if (data.merchant_id !== PAYFAST_MERCHANT_ID) {
    throw new Error('Invalid merchant ID');
  }

  const userId = parseInt(data.custom_int1);
  const paymentId = data.pf_payment_id;
  const status = data.payment_status;
  const amount = parseFloat(data.amount_net);

  return {
    success: status === 'COMPLETE',
    userId,
    paymentId,
    status,
    amount,
  };
}

/**
 * Create Pro Plan subscription checkout
 */
export function createProPlanCheckout(
  userId: number,
  userEmail: string,
  userName: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string
): string {
  return createSubscriptionUrl(
    userId,
    userEmail,
    userName,
    199,
    'MzansiBiz AI Pro Plan - Monthly Subscription',
    returnUrl,
    cancelUrl,
    notifyUrl
  );
}

/**
 * Create one-time upgrade payment
 */
export function createUpgradeCheckout(
  userId: number,
  userEmail: string,
  userName: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string
): string {
  return createCheckoutUrl({
    userId,
    userEmail,
    userName,
    amount: 199,
    itemName: 'MzansiBiz AI Pro Plan - One Time Payment',
    returnUrl,
    cancelUrl,
    notifyUrl,
  });
}
