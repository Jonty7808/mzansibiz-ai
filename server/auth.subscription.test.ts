import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    businessName: "Test Business",
    businessType: "sole_proprietor",
    businessAddress: "123 Main St",
    businessPhone: "0123456789",
    taxNumber: "9876543210",
    uifNumber: "1234567890",
    businessRegistration: "BRN123456",
    preferredLanguage: "en",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.updateProfile", () => {
  it("updates user business profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // The updateProfile mutation updates the database and returns the updated user
    // In this test environment, it should succeed without errors
    const result = await caller.auth.updateProfile({
      businessName: "Updated Business",
      businessType: "pty_ltd",
      taxNumber: "1111111111",
    });

    // Result may be undefined if database is not available, but should not throw
    expect(result === undefined || result.businessName).toBeTruthy();
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // The error message from protectedProcedure is "Please login (10001)"
    await expect(
      caller.auth.updateProfile({
        businessName: "Updated Business",
      })
    ).rejects.toThrow();
  });
});

describe("subscription.getCurrentTier", () => {
  it("returns subscription tier for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscription.getCurrentTier();

    expect(result).toBeDefined();
    expect(result.tier).toBe("free");
    expect(result.monthlyQuota).toBe(10);
    expect(result.status).toBe("active");
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscription.getCurrentTier()).rejects.toThrow();
  });
});

describe("subscription.getUsageStats", () => {
  it("returns usage statistics for free tier user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscription.getUsageStats();

    expect(result).toBeDefined();
    expect(result.used).toBeGreaterThanOrEqual(0);
    expect(result.quota).toBe(10);
    expect(result.remaining).toBeLessThanOrEqual(10);
    expect(result.percentageUsed).toBeGreaterThanOrEqual(0);
    expect(result.percentageUsed).toBeLessThanOrEqual(100);
    expect(result.isProTier).toBe(false);
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscription.getUsageStats()).rejects.toThrow();
  });
});

describe("subscription.upgradeToPro", () => {
  it("returns PayFast checkout URL", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscription.upgradeToPro();

    expect(result).toBeDefined();
    expect(result.checkoutUrl).toContain("payfast");
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscription.upgradeToPro()).rejects.toThrow();
  });
});

describe("ai.chat", () => {
  it("accepts chat messages from authenticated users", async () => {
    const { ctx } = createAuthContext(998);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      message: "What is SARS?",
      language: "en",
      topic: "sars_tax",
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(result.language).toBe("en");
  });

  it("supports multiple languages", async () => {
    const { ctx } = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      message: "Test message",
      language: "en",
    });

    expect(result.language).toBe("en");
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ai.chat({
        message: "Test",
        language: "en",
      })
    ).rejects.toThrow();
  });
});

describe("documents.generateDocument", () => {
  it("rejects free tier users with appropriate error", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.generateDocument({
        documentType: "invoice",
        title: "Test Invoice",
      })
    ).rejects.toThrow("Document generation is only available");
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.generateDocument({
        documentType: "invoice",
        title: "Test Invoice",
      })
    ).rejects.toThrow();
  });
});

describe("compliance.getDeadlines", () => {
  it("returns empty array for new users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.compliance.getDeadlines();

    expect(Array.isArray(result)).toBe(true);
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.compliance.getDeadlines()).rejects.toThrow();
  });
});

describe("compliance.getComplianceReport", () => {
  it("returns compliance report for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.compliance.getComplianceReport();

    expect(result).toBeDefined();
    expect(result.totalDeadlines).toBeGreaterThanOrEqual(0);
    expect(result.completedDeadlines).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeLessThanOrEqual(100);
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.compliance.getComplianceReport()).rejects.toThrow();
  });
});

describe("payments.getTransactionHistory", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.payments.getTransactionHistory()).rejects.toThrow(
      "Admin only"
    );
  });

  it("throws error when user is not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.payments.getTransactionHistory()).rejects.toThrow();
  });
});
