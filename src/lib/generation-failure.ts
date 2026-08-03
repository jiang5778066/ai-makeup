import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { generations } from "@/db/schema";
import { refundGenerationCredits } from "@/lib/credits";

export async function failAndRefundGeneration(
  generationId: string,
  reason: string
): Promise<"refunded" | "already_settled" | "not_found"> {
  const [generation] = await db
    .select({ id: generations.id, userId: generations.userId, status: generations.status })
    .from(generations)
    .where(eq(generations.id, generationId));
  if (!generation) return "not_found";
  if (generation.status === "done" || generation.status === "refunded") {
    return "already_settled";
  }

  await refundGenerationCredits(generation.userId, generationId);
  await db
    .update(generations)
    .set({
      status: "refunded",
      error: reason.slice(0, 500),
      creditsRefundedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(generations.id, generationId));
  return "refunded";
}
