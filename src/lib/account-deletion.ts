import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { authUsers, generations, mediaInputs, mediaTaskEvents, mediaTasks, projects } from "@/db/schema";
import { lockAccountData } from "@/lib/account-data-lock";
import { getConfiguredMediaObjectStorage } from "@/lib/media-runtime";
import { parseMediaObjectKey } from "@/lib/media-storage";
import { deleteObject, isOwnedLegacyUploadKey, R2_BUCKET_ORIGINALS, R2_BUCKET_RESULTS } from "@/lib/storage";

const terminalStatuses = new Set(["done", "failed", "refunded"]);
const pendingLegacyErrors = new Set(["creative_submission_pending", "creative_result_pending"]);
const emptyCounts = { deletedGenerations: 0, deletedProjects: 0, deletedMediaTasks: 0, deletedMediaInputs: 0 };
const incomplete = "account_data_cleanup_incomplete";
const blocked = "account_data_cleanup_blocked";
const uploading = "account_media_upload_in_progress";
const legacyUploading = "account_legacy_upload_in_progress";
type CleanupIssue = typeof incomplete | typeof blocked | typeof uploading | typeof legacyUploading;
type LegacyRow = Pick<typeof generations.$inferSelect, "id" | "uploadKey" | "renderedUploadKey" | "resultKey">;
type MediaResultRow = Pick<typeof mediaTasks.$inferSelect, "id" | "resultKey">;
type InputRow = Pick<typeof mediaInputs.$inferSelect, "id" | "stagingKey" | "sealedKey">;

function legacyKeys(userId: string, rows: LegacyRow[]) {
  const originals = new Set<string>();
  const results = new Set<string>();
  for (const row of rows) {
    for (const key of [row.uploadKey, row.renderedUploadKey]) {
      if (key === null) continue;
      if (!isOwnedLegacyUploadKey(userId, key)) return;
      originals.add(key);
    }
    if (row.resultKey === null) continue;
    // 历史外部 URL 只删除库内引用，始终按对象键归属校验 R2 删除目标。
    if (/^https?:\/\//i.test(row.resultKey) && URL.canParse(row.resultKey)) continue;
    const extension = row.resultKey.slice(row.id.length + 1);
    if (!row.resultKey.startsWith(`${row.id}.`) || !["png", "jpg", "jpeg", "webp"].includes(extension)) return;
    results.add(row.resultKey);
  }
  return { originals, results };
}

function hasLiveLegacyUpload(keys: Set<string>) {
  const now = Date.now();
  for (const key of keys) {
    // 旧签名入口使用 buildUploadKey 的毫秒时间戳和五分钟授权，额外留一分钟时钟容差。
    const match = /\/(\d{13})-[a-z0-9]{0,8}\.[a-z0-9]+$/.exec(key);
    const signedAt = Number(match?.[1]);
    if (signedAt <= now + 60_000 && signedAt + 360_000 > now) return true;
  }
  return false;
}

function mediaKeys(userId: string, tasks: MediaResultRow[], inputs: InputRow[]) {
  const keys = new Set<string>();
  const add = (key: string | null, kind: "staging" | "inputs" | "results", id: string) => {
    if (key === null) return true;
    const parsed = parseMediaObjectKey(key);
    if (parsed.kind !== kind || parsed.owner !== userId || parsed.recordId !== id) return false;
    keys.add(key);
    return true;
  };
  try {
    if (tasks.every((task) => add(task.resultKey, "results", task.id)) &&
        inputs.every((input) => add(input.stagingKey, "staging", input.id) && add(input.sealedKey, "inputs", input.id))) return keys;
  } catch {
    // 归属不明的引用留在原记录供核对。
  }
}

async function removeObjects(jobs: Array<() => Promise<void>>) {
  let complete = true;
  for (let offset = 0; offset < jobs.length; offset += 8) {
    const results = await Promise.allSettled(jobs.slice(offset, offset + 8).map(async (job) => job()));
    if (results.some((result) => result.status === "rejected")) complete = false;
  }
  return complete;
}

export async function deleteUserData(userId: string) {
  return db.transaction(async (tx) => {
    const counts = { ...emptyCounts };
    await lockAccountData(tx, userId);
    // 保留身份行锁，让未参与账户事务锁且依赖该外键的新记录等到本次清理结束。
    const [owner] = await tx.select({ id: authUsers.id }).from(authUsers).where(eq(authUsers.id, userId)).for("update");
    if (!owner) return { httpStatus: 401, body: { code: "unauthorized" } };

    const oldRows = await tx.select({
      id: generations.id, uploadKey: generations.uploadKey, renderedUploadKey: generations.renderedUploadKey,
      resultKey: generations.resultKey, status: generations.status, error: generations.error
    }).from(generations).where(eq(generations.userId, userId)).for("update");
    const [schema] = await tx.execute<{ tasks: boolean; inputs: boolean; events: boolean }>(sql`
      SELECT to_regclass('public.media_tasks') IS NOT NULL AS tasks,
        to_regclass('public.media_inputs') IS NOT NULL AS inputs,
        to_regclass('public.media_task_events') IS NOT NULL AS events
    `);
    const mediaReady = schema.tasks && schema.inputs && schema.events;
    const tasks = schema.tasks ? await tx.select({
      id: mediaTasks.id, resultKey: mediaTasks.resultKey, status: mediaTasks.status, creditState: mediaTasks.creditState,
      leased: sql<boolean>`coalesce(${mediaTasks.leaseExpiresAt} > clock_timestamp(), false)`
    }).from(mediaTasks).where(eq(mediaTasks.userId, userId)).for("update") : [];

    if (oldRows.some((row) => !terminalStatuses.has(row.status) ||
        (row.status !== "done" && pendingLegacyErrors.has(row.error ?? ""))) ||
        tasks.some((row) => !terminalStatuses.has(row.status) || row.creditState === "reserved" || row.leased)) {
      return { httpStatus: 409, body: { deleted: false, code: "account_generation_in_progress", ...counts } };
    }

    const projectRows = await tx.select({ id: projects.id }).from(projects).where(eq(projects.userId, userId)).for("update");
    const foreignProjects = projectRows.length > 0 && (await tx.select({ id: generations.id }).from(generations)
      .innerJoin(projects, eq(generations.projectId, projects.id))
      .where(and(eq(projects.userId, userId), ne(generations.userId, userId))).limit(1)).length > 0;
    const legacy = legacyKeys(userId, oldRows);
    const issues = new Set<CleanupIssue>();
    if (!legacy || foreignProjects) {
      issues.add(blocked);
    } else if (hasLiveLegacyUpload(legacy.originals)) {
      issues.add(legacyUploading);
    } else if (await removeObjects([
      ...Array.from(legacy.originals, (key) => () => deleteObject(R2_BUCKET_ORIGINALS, key)),
      ...Array.from(legacy.results, (key) => () => deleteObject(R2_BUCKET_RESULTS, key))
    ])) {
      if (oldRows.length) counts.deletedGenerations = (await tx.delete(generations).where(eq(generations.userId, userId)).returning({ id: generations.id })).length;
      if (projectRows.length) counts.deletedProjects = (await tx.delete(projects).where(eq(projects.userId, userId)).returning({ id: projects.id })).length;
    } else {
      issues.add(incomplete);
    }

    if (mediaReady) {
      const inputs = await tx.select({
        id: mediaInputs.id, stagingKey: mediaInputs.stagingKey, sealedKey: mediaInputs.sealedKey,
        // 可在输入过期前重签。Supabase 上传授权最长两小时，保留生成签名请求的超时和时钟容差。
        mayUpload: sql<boolean>`${mediaInputs.expiresAt} + interval '2 hours 1 minute' > clock_timestamp()`
      }).from(mediaInputs).where(eq(mediaInputs.userId, userId)).for("update");
      const keys = mediaKeys(userId, tasks, inputs);
      if (!keys) {
        issues.add(blocked);
      } else if (inputs.some((input) => input.mayUpload)) {
        issues.add(uploading);
      } else {
        const objects = keys.size ? getConfiguredMediaObjectStorage() : undefined;
        if (keys.size && (!objects || !await removeObjects(Array.from(keys, (key) => () => objects.remove(key))))) {
          issues.add(incomplete);
        } else {
          if (tasks.length) {
            await tx.delete(mediaTaskEvents).where(eq(mediaTaskEvents.userId, userId));
            counts.deletedMediaTasks = (await tx.delete(mediaTasks).where(eq(mediaTasks.userId, userId)).returning({ id: mediaTasks.id })).length;
          }
          if (inputs.length) counts.deletedMediaInputs = (await tx.delete(mediaInputs).where(eq(mediaInputs.userId, userId)).returning({ id: mediaInputs.id })).length;
        }
      }
    } else if (schema.tasks || schema.inputs || schema.events) {
      issues.add(incomplete);
    }

    const code = ([incomplete, blocked, uploading, legacyUploading] as const).find((issue) => issues.has(issue));
    if (code) return { httpStatus: code === incomplete ? 503 : 409, body: { deleted: false, code, issues: [...issues], ...counts } };
    return { httpStatus: 200, body: { deleted: true, ...counts } };
  });
}
