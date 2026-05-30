/**
 * Email Service for MzansiBiz AI
 * Handles sending compliance reminders and notifications via Manus Notification API
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email using Manus Notification API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const forgeUrl = process.env.BUILT_IN_FORGE_API_URL;
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (!forgeUrl || !forgeKey) {
      console.warn('[EMAIL] Forge API not configured, logging email instead');
      console.log(`[EMAIL] To: ${options.to}`);
      console.log(`[EMAIL] Subject: ${options.subject}`);
      return true;
    }

    const response = await fetch(`${forgeUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${forgeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      console.error('[EMAIL ERROR] Failed to send email:', response.statusText);
      return false;
    }

    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}

/**
 * Send SARS tax deadline reminder
 */
export async function sendSarsTaxReminder(
  userEmail: string,
  userName: string,
  deadlineDate: Date,
  taxType: string
): Promise<boolean> {
  const formattedDate = deadlineDate.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF1493 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">SARS Tax Deadline Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>This is a reminder that your <strong>${taxType}</strong> tax submission is due on:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #FF1493; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #FF1493;">${formattedDate}</p>
        </div>
        
        <p>To avoid penalties and ensure compliance with SARS regulations, please ensure your submission is completed before the deadline.</p>
        
        <p>You can manage your compliance deadlines in your MzansiBiz AI dashboard:</p>
        
        <a href="https://mzansibiz.co.za/compliance" style="display: inline-block; background: #FF1493; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Compliance Tracker
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          This is an automated reminder from MzansiBiz AI. If you have questions about your tax obligations, 
          use the AI Chat feature to get expert guidance on SARS tax requirements.
        </p>
      </div>
    </div>
  `;

  const text = `
SARS Tax Deadline Reminder

Hi ${userName},

This is a reminder that your ${taxType} tax submission is due on:
${formattedDate}

To avoid penalties and ensure compliance with SARS regulations, please ensure your submission is completed before the deadline.

View your compliance tracker: https://mzansibiz.co.za/compliance

This is an automated reminder from MzansiBiz AI.
  `;

  return sendEmail({
    to: userEmail,
    subject: `SARS ${taxType} Deadline - ${formattedDate}`,
    html,
    text,
  });
}

/**
 * Send UIF payment reminder
 */
export async function sendUifReminder(
  userEmail: string,
  userName: string,
  deadlineDate: Date
): Promise<boolean> {
  const formattedDate = deadlineDate.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF1493 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">UIF Payment Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>This is a reminder that your <strong>UIF (Unemployment Insurance Fund) contribution</strong> payment is due on:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #00FFFF; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00FFFF;">${formattedDate}</p>
        </div>
        
        <p>Ensure timely payment to maintain compliance with UIF regulations and avoid penalties.</p>
        
        <a href="https://mzansibiz.co.za/compliance" style="display: inline-block; background: #00FFFF; color: black; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Compliance Tracker
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          This is an automated reminder from MzansiBiz AI. For questions about UIF requirements, 
          use the AI Chat feature to get expert guidance.
        </p>
      </div>
    </div>
  `;

  const text = `
UIF Payment Reminder

Hi ${userName},

This is a reminder that your UIF (Unemployment Insurance Fund) contribution payment is due on:
${formattedDate}

Ensure timely payment to maintain compliance with UIF regulations and avoid penalties.

View your compliance tracker: https://mzansibiz.co.za/compliance

This is an automated reminder from MzansiBiz AI.
  `;

  return sendEmail({
    to: userEmail,
    subject: `UIF Payment Due - ${formattedDate}`,
    html,
    text,
  });
}

/**
 * Send CCMA compliance reminder
 */
export async function sendCcmaReminder(
  userEmail: string,
  userName: string,
  deadlineDate: Date,
  requirementType: string
): Promise<boolean> {
  const formattedDate = deadlineDate.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF1493 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">CCMA Compliance Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>This is a reminder that your <strong>CCMA (Commission for Conciliation, Mediation and Arbitration) ${requirementType}</strong> is due on:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #FF1493; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #FF1493;">${formattedDate}</p>
        </div>
        
        <p>Ensure compliance with CCMA regulations to protect your business and employees.</p>
        
        <a href="https://mzansibiz.co.za/compliance" style="display: inline-block; background: #FF1493; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Compliance Tracker
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          This is an automated reminder from MzansiBiz AI. For guidance on CCMA requirements and labour law, 
          use the AI Chat feature to get expert advice.
        </p>
      </div>
    </div>
  `;

  const text = `
CCMA Compliance Reminder

Hi ${userName},

This is a reminder that your CCMA ${requirementType} is due on:
${formattedDate}

Ensure compliance with CCMA regulations to protect your business and employees.

View your compliance tracker: https://mzansibiz.co.za/compliance

This is an automated reminder from MzansiBiz AI.
  `;

  return sendEmail({
    to: userEmail,
    subject: `CCMA ${requirementType} Due - ${formattedDate}`,
    html,
    text,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF1493 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to MzansiBiz AI</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>Welcome to <strong>MzansiBiz AI</strong> - Your AI-Powered Business Compliance Partner for South Africa!</p>
        
        <p>We're excited to help you navigate SARS tax requirements, CCMA labour laws, and regulatory compliance with confidence.</p>
        
        <h2 style="color: #FF1493; margin-top: 20px;">Get Started:</h2>
        <ul style="color: #333;">
          <li><strong>Ask the AI Chatbot:</strong> Get expert guidance on tax, labour law, and business compliance in your preferred language (English, isiZulu, isiXhosa, or Afrikaans)</li>
          <li><strong>Generate Documents:</strong> Create professional invoices, employment contracts, business plans, and health & safety files</li>
          <li><strong>Track Compliance:</strong> Never miss a deadline with automated reminders for SARS, UIF, and CCMA requirements</li>
        </ul>
        
        <a href="https://mzansibiz.co.za/dashboard" style="display: inline-block; background: #FF1493; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Go to Dashboard
        </a>
        
        <h2 style="color: #00FFFF; margin-top: 20px;">Upgrade to Pro:</h2>
        <p>Start with 10 free AI queries per month. Upgrade to Pro for just <strong>R199/month</strong> for unlimited consultations and features.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please use the AI Chat feature or contact our support team.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to MzansiBiz AI

Hi ${userName},

Welcome to MzansiBiz AI - Your AI-Powered Business Compliance Partner for South Africa!

We're excited to help you navigate SARS tax requirements, CCMA labour laws, and regulatory compliance with confidence.

Get Started:
- Ask the AI Chatbot: Get expert guidance on tax, labour law, and business compliance
- Generate Documents: Create professional invoices, employment contracts, and business plans
- Track Compliance: Never miss a deadline with automated reminders

Go to your dashboard: https://mzansibiz.co.za/dashboard

Upgrade to Pro for just R199/month for unlimited consultations and features.

If you have any questions, please use the AI Chat feature or contact our support team.
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to MzansiBiz AI',
    html,
    text,
  });
}

/**
 * Send subscription renewal reminder
 */
export async function sendSubscriptionRenewalReminder(
  userEmail: string,
  userName: string,
  renewalDate: Date
): Promise<boolean> {
  const formattedDate = renewalDate.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF1493 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Subscription Renewal Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>Your MzansiBiz AI Pro subscription will renew on:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #00FFFF; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00FFFF;">${formattedDate}</p>
        </div>
        
        <p>Your subscription will automatically renew at <strong>R199/month</strong>. You'll continue to enjoy:</p>
        <ul style="color: #333;">
          <li>Unlimited AI consultations</li>
          <li>Professional document generation</li>
          <li>Advanced compliance tracking</li>
          <li>Priority support</li>
        </ul>
        
        <p>If you'd like to manage your subscription, visit your account settings:</p>
        
        <a href="https://mzansibiz.co.za/settings" style="display: inline-block; background: #FF1493; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Manage Subscription
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;

  const text = `
Subscription Renewal Reminder

Hi ${userName},

Your MzansiBiz AI Pro subscription will renew on:
${formattedDate}

Your subscription will automatically renew at R199/month. You'll continue to enjoy unlimited AI consultations, professional document generation, advanced compliance tracking, and priority support.

Manage your subscription: https://mzansibiz.co.za/settings

If you have any questions, please contact our support team.
  `;

  return sendEmail({
    to: userEmail,
    subject: `Subscription Renewal Reminder - ${formattedDate}`,
    html,
    text,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  userEmail: string,
  userName: string,
  amount: number,
  planType: string,
  transactionId: string
): Promise<boolean> {
  const formattedAmount = `R${amount.toFixed(2)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00FF00 0%, #00FFFF 100%); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Payment Confirmed</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5;">
        <p>Hi ${userName},</p>
        
        <p>Thank you for upgrading to the <strong>${planType}</strong> plan!</p>
        
        <div style="background: white; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planType}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        
        <p>Your account has been upgraded and you now have access to:</p>
        <ul style="color: #333;">
          <li>Unlimited AI consultations</li>
          <li>Professional document generation</li>
          <li>Advanced compliance tracking</li>
          <li>Priority support</li>
        </ul>
        
        <a href="https://mzansibiz.co.za/dashboard" style="display: inline-block; background: #00FF00; color: black; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Go to Dashboard
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact our support team or use the AI Chat feature.
        </p>
      </div>
    </div>
  `;

  const text = `
Payment Confirmed

Hi ${userName},

Thank you for upgrading to the ${planType} plan!

Plan: ${planType}
Amount: ${formattedAmount}
Transaction ID: ${transactionId}

Your account has been upgraded and you now have access to:
- Unlimited AI consultations
- Professional document generation
- Advanced compliance tracking
- Priority support

Go to your dashboard: https://mzansibiz.co.za/dashboard

If you have any questions, please contact our support team or use the AI Chat feature.
  `;

  return sendEmail({
    to: userEmail,
    subject: `Payment Confirmation - ${planType} Plan`,
    html,
    text,
  });
}
