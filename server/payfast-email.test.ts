import { describe, it, expect } from "vitest";
import { createProPlanCheckout } from "./_core/payfast";

describe("PayFast Integration", () => {
  describe("createProPlanCheckout", () => {
    it("generates a PayFast checkout URL", () => {
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url).toBeDefined();
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(0);
    });

    it("includes PayFast domain in checkout URL", () => {
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url).toContain("payfast.co.za");
    });

    it("includes merchant credentials in URL", () => {
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url).toContain("merchant_id");
      expect(url).toContain("merchant_key");
    });

    it("includes signature for security", () => {
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url).toContain("signature");
    });

    it("includes Pro Plan price (R199)", () => {
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      // The URL should contain the amount in some form
      expect(url).toContain("199");
    });

    it("includes user ID in custom fields for tracking", () => {
      const url = createProPlanCheckout(
        42,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      // User ID should be encoded in the URL
      expect(url).toContain("42");
    });

    it("handles different user IDs correctly", () => {
      const url1 = createProPlanCheckout(
        1,
        "user1@example.com",
        "User 1",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      const url2 = createProPlanCheckout(
        2,
        "user2@example.com",
        "User 2",
        "https://example.com/return",
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url1).not.toBe(url2);
    });

    it("includes return URL for post-payment redirect", () => {
      const returnUrl = "https://example.com/success";
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        returnUrl,
        "https://example.com/cancel",
        "https://example.com/notify"
      );

      expect(url).toContain(encodeURIComponent(returnUrl));
    });

    it("includes cancel URL for payment cancellation", () => {
      const cancelUrl = "https://example.com/cancelled";
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        cancelUrl,
        "https://example.com/notify"
      );

      expect(url).toContain(encodeURIComponent(cancelUrl));
    });

    it("includes notify URL for IPN callbacks", () => {
      const notifyUrl = "https://example.com/api/payfast/ipn";
      const url = createProPlanCheckout(
        1,
        "test@example.com",
        "Test User",
        "https://example.com/return",
        "https://example.com/cancel",
        notifyUrl
      );

      expect(url).toContain(encodeURIComponent(notifyUrl));
    });
  });
});

describe("Email Service", () => {
  it("email service module exports required functions", async () => {
    const emailService = await import("./_core/emailService");
    
    expect(emailService.sendEmail).toBeDefined();
    expect(emailService.sendSarsTaxReminder).toBeDefined();
    expect(emailService.sendUifReminder).toBeDefined();
    expect(emailService.sendCcmaReminder).toBeDefined();
    expect(emailService.sendPaymentConfirmation).toBeDefined();
    expect(emailService.sendWelcomeEmail).toBeDefined();
    expect(emailService.sendSubscriptionRenewalReminder).toBeDefined();
  });

  it("email functions are callable", async () => {
    const emailService = await import("./_core/emailService");
    
    expect(typeof emailService.sendEmail).toBe("function");
    expect(typeof emailService.sendSarsTaxReminder).toBe("function");
    expect(typeof emailService.sendUifReminder).toBe("function");
    expect(typeof emailService.sendCcmaReminder).toBe("function");
    expect(typeof emailService.sendPaymentConfirmation).toBe("function");
    expect(typeof emailService.sendWelcomeEmail).toBe("function");
    expect(typeof emailService.sendSubscriptionRenewalReminder).toBe("function");
  });
});
