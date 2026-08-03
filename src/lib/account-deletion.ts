import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { generations } from "@/db/schema";
import { deleteObject, R2_BUCKET_ORIGINALS, R2_BUCKET_RESULTS } from "@/lib/storage";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type GenerationObjects = {
  uploadKey: string;
  renderedUploadKey: string | null;
  resultKey: string | null;
};

function generationObjectJobs(rows: GenerationObjects[]) {
  const objects = new Map<string, { bucket: string; key: string }>();
  for (const row of rows) {
    objects.set(`${R2_BUCKET_ORIGINALS}:${row.uploadKey}`, {
      bucket: R2_BUCKET_ORIGINALS,
      key: row.uploadKey
    });
    if (row.renderedUploadKey) {
      objects.set(`${R2_BUCKET_ORIGINALS}:${row.renderedUploadKey}`, {
        bucket: R2_BUCKET_ORIGINALS,
        key: row.renderedUploadKey
      });
    }
    if (row.resultKey && !row.resultKey.startsWith("http")) {
      objects.set(`${R2_BUCKET_RESULTS}:${row.resultKey}`, {
        bucket: R2_BUCKET_RESULTS,
        key: row.resultKey
      });
    }
  }
  return Array.from(objects.values());
}

export async function deleteUserData(userId: string) {
  const rows = await db
    .select({
      uploadKey: generations.uploadKey,
      renderedUploadKey: generations.renderedUploadKey,
      resultKey: generations.resultKey
    })
    .from(generations)
    .where(eq(generations.userId, userId));

  const objects = generationObjectJobs(rows);
  await Promise.all(objects.map((object) => deleteObject(object.bucket, object.key)));

  const { error } = await getSupabaseAdminClient().auth.admin.deleteUser(userId);
  if (error) throw new Error("account_auth_delete_failed");

  return { deletedGenerations: rows.length, deletedObjects: objects.length };
}
