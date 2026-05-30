import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, InsertSubscription, Subscription, aiConversations, documents, paymentTransactions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "businessName", "businessAddress", "businessPhone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle enum fields
    if (user.businessType !== undefined) {
      values.businessType = user.businessType;
      updateSet.businessType = user.businessType;
    }

    if (user.preferredLanguage !== undefined) {
      values.preferredLanguage = user.preferredLanguage;
      updateSet.preferredLanguage = user.preferredLanguage;
    }

    if (user.taxNumber !== undefined) {
      values.taxNumber = user.taxNumber;
      updateSet.taxNumber = user.taxNumber;
    }

    if (user.uifNumber !== undefined) {
      values.uifNumber = user.uifNumber;
      updateSet.uifNumber = user.uifNumber;
    }

    if (user.businessRegistration !== undefined) {
      values.businessRegistration = user.businessRegistration;
      updateSet.businessRegistration = user.businessRegistration;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, profile: Partial<InsertUser>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    const updateSet: Record<string, unknown> = {};

    const textFields = ["businessName", "businessAddress", "businessPhone", "taxNumber", "uifNumber", "businessRegistration"] as const;
    textFields.forEach(field => {
      if (profile[field] !== undefined) {
        updateSet[field] = profile[field];
      }
    });

    if (profile.businessType !== undefined) {
      updateSet.businessType = profile.businessType;
    }

    if (profile.preferredLanguage !== undefined) {
      updateSet.preferredLanguage = profile.preferredLanguage;
    }

    if (Object.keys(updateSet).length === 0) {
      return;
    }

    await db.update(users).set(updateSet).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    throw error;
  }
}

export async function getOrCreateSubscription(userId: number): Promise<Subscription> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new free subscription
  const newSubscription: InsertSubscription = {
    userId,
    tier: 'free',
    status: 'active',
    monthlyQuota: 10,
    queriesUsedThisMonth: 0,
  };

  await db.insert(subscriptions).values(newSubscription);

  const created = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to create subscription");
  }

  return created[0];
}

export async function getSubscription(userId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscription: database not available");
    return undefined;
  }

  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementQueryUsage(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment query usage: database not available");
    return;
  }

  try {
    const subscription = await getSubscription(userId);
    if (!subscription) {
      return;
    }

    await db.update(subscriptions)
      .set({ queriesUsedThisMonth: (subscription.queriesUsedThisMonth ?? 0) + 1 })
      .where(eq(subscriptions.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to increment query usage:", error);
  }
}

export async function resetMonthlyQuota(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reset quota: database not available");
    return;
  }

  try {
    await db.update(subscriptions)
      .set({ queriesUsedThisMonth: 0 })
      .where(eq(subscriptions.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to reset monthly quota:", error);
  }
}

/**
 * Save AI conversation to database
 */
export async function saveConversation(
  userId: number,
  language: string,
  topic: string,
  messages: any[],
  summary: string
) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(aiConversations).values({
      userId,
      language: language as any,
      topic: topic as any,
      messages,
      summary,
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to save conversation:', error);
    return undefined;
  }
}

/**
 * Get user conversations
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId));
    return result;
  } catch (error) {
    console.error('[Database] Failed to get conversations:', error);
    return [];
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to cancel subscription:', error);
    return false;
  }
}

/**
 * Save generated document
 */
export async function saveDocument(
  userId: number,
  documentType: string,
  title: string,
  storageKey: string,
  storageUrl: string,
  metadata: any
) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(documents).values({
      userId,
      documentType: documentType as any,
      title,
      storageKey,
      storageUrl,
      metadata,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to save document:', error);
    return undefined;
  }
}

/**
 * Get user documents
 */
export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy((t) => t.createdAt);
    return result;
  } catch (error) {
    console.error('[Database] Failed to get documents:', error);
    return [];
  }
}

/**
 * Log payment transaction
 */
export async function logPaymentTransaction(
  userId: number,
  subscriptionId: number,
  payFastTransactionId: string,
  amount: number,
  status: string,
  transactionType: string
) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(paymentTransactions).values({
      userId,
      subscriptionId,
      payFastTransactionId,
      amount: amount as any,
      status: status as any,
      transactionType: transactionType as any,
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to log payment transaction:', error);
    return undefined;
  }
}

// TODO: Add more feature queries as your schema grows
