import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";

export async function readOwnBillingOrder(userId: string, providerOrderId: string) {
  const [order] = await db.select({ status: orders.status, credits: orders.creditsAwarded })
    .from(orders).where(and(eq(orders.userId, userId), eq(orders.provider, "creem"), eq(orders.providerOrderId, providerOrderId))).limit(1);
  return order ?? null;
}
