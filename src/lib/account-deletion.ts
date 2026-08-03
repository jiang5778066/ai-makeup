import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { generations, projects } from "@/db/schema";
import { deleteObject, R2_BUCKET_ORIGINALS, R2_BUCKET_RESULTS } from "@/lib/storage";

async function deleteGenerationObjects(rows: Array<{ uploadKey: string; resultKey: string | null }>) {
  await Promise.allSettled(
    rows.flatMap((row) => {
      const jobs = [deleteObject(R2_BUCKET_ORIGINALS, row.uploadKey)];
      if (row.resultKey && !row.resultKey.startsWith("http")) {
        jobs.push(deleteObject(R2_BUCKET_RESULTS, row.resultKey));
      }
      return jobs;
    })
  );
}

export async function deleteUserData(userId: string) {
  const rows = await db
    .select({
      id: generations.id,
      uploadKey: generations.uploadKey,
      resultKey: generations.resultKey
    })
    .from(generations)
    .where(eq(generations.userId, userId));

  await deleteGenerationObjects(rows);

  const generationIds = rows.map((row) => row.id);
  if (generationIds.length > 0) {
    await db.delete(generations).where(and(eq(generations.userId, userId), inArray(generations.id, generationIds)));
  }
  await db.delete(projects).where(eq(projects.userId, userId));

  return { deletedGenerations: rows.length };
}
