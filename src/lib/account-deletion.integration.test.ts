// @vitest-environment node
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  user: null as string | null,
  remove: vi.fn<(bucket: string, key: string) => Promise<void>>(),
  exists: vi.fn<(key: string, signal: AbortSignal) => Promise<boolean>>(),
  dispatch: vi.fn(async () => ({ ids: ["fixture-queued"] })),
  sign: vi.fn(async () => "https://fixture.invalid/read")
}));
vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: async () => fixture.user && { id: fixture.user }
}));
vi.mock("@/lib/storage", async (original) => ({
  ...await original<typeof import("@/lib/storage")>(),
  deleteObject: fixture.remove,
  legacyUploadExists: fixture.exists,
  isStorageConfigured: () => true,
  presignGetUrl: fixture.sign
}));
vi.mock("@/inngest/client", () => ({ inngest: { send: fixture.dispatch } }));
vi.mock("@/db/client", async (original) => {
  const { default: makeClient } = await import("postgres");
  globalThis.__pgClient = makeClient(process.env.DATABASE_URL!, { prepare: false, max: 4 });
  return original();
});

const url = process.env.ACCOUNT_CLEANUP_TEST_DATABASE_URL;
const restrictedApp = process.env.ACCOUNT_CLEANUP_TEST_RESTRICTED_APP === "1";
let legacyOnly = false;
if (url) {
  const target = new URL(url);
  if (target.protocol !== "postgresql:" || target.hostname !== "127.0.0.1" || !["/f7_cleanup", "/f7_cleanup_legacy"].includes(target.pathname) || !target.port || target.search || target.hash) {
    throw new Error("只允许本机隔离账户清理夹具库");
  }
  legacyOnly = target.pathname === "/f7_cleanup_legacy";
  if (restrictedApp) {
    target.username = "fixture_generation";
    target.password = "fixture_generation_only";
  }
  process.env.DATABASE_URL = target.href;
}
const sql = url ? postgres(url, { max: 4 }) : undefined;
const sha = "a".repeat(64);
const originalBucket = "makeup-originals";
const resultBucket = "makeup-results";
const objects = new Set<string>();
function store(bucket: string, key: string) {
  objects.add(`${bucket}:${key}`);
  return key;
}

function pending() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

async function account() {
  const id = randomUUID();
  await sql!`INSERT INTO auth.users (id) VALUES (${id})`;
  return id;
}

async function generation(user: string, options: { status?: string; result?: string; upload?: string; error?: string } = {}) {
  const id = randomUUID();
  const upload = options.upload ?? store(originalBucket, `${user}/old-original-${id}.jpg`);
  const rendered = store(originalBucket, `${user}/old-rendered-${id}.png`);
  const result = options.result ?? store(resultBucket, `${id}.png`);
  await sql!`INSERT INTO generations (id, user_id, upload_key, rendered_upload_key, result_key, style_id, mode, status, error)
    VALUES (${id}, ${user}, ${upload}, ${rendered}, ${result}, 'synthetic', 'virtual_try_on', ${options.status ?? 'done'}, ${options.error ?? null})`;
  return { id, upload, rendered, result };
}

async function media(user: string, options: { active?: boolean; fresh?: boolean; staging?: string; withInput?: boolean } = {}) {
  const input = options.withInput === false ? null : randomUUID();
  const id = randomUUID();
  const staging = input && (options.staging ?? store(originalBucket, `media/staging/${user}/${input}`));
  const sealed = input && store(originalBucket, `media/inputs/${user}/${input}/${sha}/${randomUUID()}.png`);
  const result = !options.active ? store(resultBucket, `media/results/${user}/${id}/${sha}.png`) : null;
  if (input) {
    await sql!`INSERT INTO media_inputs (id, user_id, staging_key, sealed_key, status, expected_mime, expected_bytes, expected_sha256,
      expires_at, verified_mime, verified_bytes, verified_sha256, sealed_at)
      VALUES (${input}, ${user}, ${staging}, ${sealed}, 'ready', 'image/png', 8, ${sha},
        now() + ${options.fresh ? '1 hour' : '-3 hours'}::interval, 'image/png', 8, ${sha}, now() - interval '4 hours')`;
  }
  await sql!`INSERT INTO media_tasks (id, user_id, input_id, media_type, provider_account_ref, model, mode, request, request_hash,
      client_intent_id, client_idempotency_key, quote, credits_quoted, provider_upper_cents, status, credit_state,
      result_key, result_mime, result_bytes, result_sha256)
    VALUES (${id}, ${user}, ${input}, 'image', 'fixture', 'gpt-image-2', ${input ? 'image_to_image' : 'text_to_image'}, '{}', ${sha},
      ${randomUUID()}, ${randomUUID()}, '{}', 1, 2, ${options.active ? 'reconciling' : 'done'}, ${options.active ? 'reserved' : 'settled'},
      ${result}, ${result ? 'image/png' : null}, ${result ? 8 : null}, ${result ? sha : null})`;
  await sql!`INSERT INTO media_task_events (task_id, user_id, operation_id, event_type, state_version, payload_identity)
    VALUES (${id}, ${user}, ${randomUUID()}, 'synthetic', 0, 'fixture')`;
  return { id, input, staging, sealed, result };
}

async function remove(user: string | null) {
  fixture.user = user;
  const { POST } = await import("@/app/api/account/delete-data/route");
  const response = await POST();
  return { status: response.status, body: await response.json() };
}

async function submit(user: string, uploadKey: string, renderedUploadKey?: string) {
  fixture.user = user;
  const { POST } = await import("@/app/api/makeup/generate/route");
  const response = await POST(new Request("https://fixture.invalid/api/makeup/generate", {
    method: "POST",
    body: JSON.stringify({
      uploadKey, consent: true, styleId: "natural",
      ...(renderedUploadKey && { renderedUploadKey, mode: "virtual_try_on", makeupConfig: { lipstick: { enabled: true, presetId: "classic-red", color: "#C93445", intensity: 75 } } })
    })
  }));
  return { status: response.status, body: await response.json() };
}

async function fund(user: string) {
  await sql!`INSERT INTO credit_balances (user_id,balance) VALUES (${user},3)`;
  await sql!`INSERT INTO credit_grants (user_id,source_type,source_id,initial_amount,remaining) VALUES (${user},'fixture',${randomUUID()},3,3)`;
}

async function accountState(user: string) {
  return (await sql!`SELECT (SELECT balance FROM credit_balances WHERE user_id=${user}) AS balance,
    (SELECT count(*)::int FROM generations WHERE user_id=${user}) AS tasks,
    (SELECT coalesce(sum(delta),0)::int FROM credits_ledger WHERE user_id=${user}) AS delta`)[0];
}

async function waitForAccountLock(count = 1) {
  return expect.poll(async () => (await sql!`SELECT pid, wait_event, query FROM pg_stat_activity
    WHERE datname=current_database() AND wait_event_type='Lock'
      AND (query ILIKE 'insert into%generations%' OR query ILIKE '%pg_advisory_xact_lock%' OR query ILIKE 'select%auth%users%for update')`).length).toBe(count);
}

beforeEach(() => {
  vi.stubEnv("ENABLE_GENERATION", "1");
  vi.stubEnv("DISABLE_GENERATION", "0");
  vi.stubEnv("MEDIA_RUNTIME_CONFIG", JSON.stringify({ storageBackend: "r2", storageApprovalRef: "fixture" }));
  vi.stubEnv("CREATIONS_VISIBILITY_V1", "1");
  fixture.remove.mockReset().mockImplementation(async (bucket, key) => { objects.delete(`${bucket}:${key}`); });
  fixture.exists.mockReset().mockImplementation(async (key) => objects.has(`${originalBucket}:${key}`));
  fixture.dispatch.mockClear();
  fixture.sign.mockClear();
  objects.clear();
});
afterAll(async () => {
  await globalThis.__pgClient?.end();
  await sql?.end();
  vi.unstubAllEnvs();
});

describe.skipIf(!sql || legacyOnly || restrictedApp)("隔离 PostgreSQL 账户数据清理", () => {

  it("保留身份、账务和另一账号，清理本人软移除作品、两类任务及所有已登记对象", async () => {
    const owner = await account();
    const other = await account();
    const old = await generation(owner);
    const external = await generation(owner, { result: "https://fixture.invalid/external.png" });
    const generic = await media(owner);
    await generation(other);
    await media(other);
    const [project] = await sql!`INSERT INTO projects (user_id, name) VALUES (${owner}, 'fixture') RETURNING id`;
    await sql!`INSERT INTO projects (user_id, name) VALUES (${other}, 'fixture')`;
    await sql!`UPDATE generations SET deleted_at=now(), project_id=${project.id} WHERE id=${old.id}`;
    await sql!`UPDATE media_tasks SET deleted_at=now() WHERE id=${generic.id}`;
    await sql!`INSERT INTO credit_balances (user_id,balance) VALUES (${owner},3)`;
    await sql!`INSERT INTO credits_ledger (user_id,delta,reason,ref_type,ref_id) VALUES (${owner},-1,'generation','media_task',${generic.id})`;

    expect((await remove(null)).status).toBe(401);
    const { GET } = await import("@/app/api/generations/[id]/route");
    const get = async (user: string, id: string) => {
      fixture.user = user;
      return GET(new Request("https://fixture.invalid"), { params: Promise.resolve({ id }) });
    };
    expect((await get(other, old.id)).status).toBe(404);
    expect((await get(owner, old.id)).status).toBe(404);
    expect(fixture.sign).not.toHaveBeenCalled();
    expect(await remove(owner)).toEqual({ status: 200, body: {
      deleted: true, deletedGenerations: 2, deletedProjects: 1, deletedMediaTasks: 1, deletedMediaInputs: 1
    } });
    expect((await get(owner, external.id)).status).toBe(404);
    expect([...objects]).toHaveLength(6);
    expect([...objects].every((name) => !name.includes(owner) && !name.includes(old.id))).toBe(true);
    expect(fixture.remove.mock.calls).not.toContainEqual([resultBucket, external.result]);
    expect(await sql!`SELECT task_id FROM media_task_events WHERE user_id=${owner}`).toEqual([]);
    expect(await sql!`SELECT id FROM auth.users WHERE id=${owner}`).toEqual([{ id: owner }]);
    expect(await sql!`SELECT balance FROM credit_balances WHERE user_id=${owner}`).toEqual([{ balance: 3 }]);
    expect(await sql!`SELECT ref_id FROM credits_ledger WHERE user_id=${owner}`).toEqual([{ ref_id: generic.id }]);
    expect(await sql!`SELECT user_id FROM generations WHERE user_id=${other}`).toHaveLength(1);
    expect(await sql!`SELECT user_id FROM projects WHERE user_id=${other}`).toHaveLength(1);
    expect(await sql!`SELECT user_id FROM media_inputs WHERE user_id=${other}`).toHaveLength(1);
    expect(await sql!`SELECT user_id FROM media_tasks WHERE user_id=${other}`).toHaveLength(1);
    expect(await sql!`SELECT user_id FROM media_task_events WHERE user_id=${other}`).toHaveLength(1);
  });

  it("原图删除失败后保留引用并报告部分完成，可重放已删除对象", async () => {
    const owner = await account();
    const old = await generation(owner);
    await media(owner);
    await sql!`INSERT INTO projects (user_id, name) VALUES (${owner}, 'fixture')`;
    fixture.remove.mockImplementation(async (bucket, key) => {
      if (key === old.upload) throw new Error("合成错误，不应进入响应");
      objects.delete(`${bucket}:${key}`);
    });
    const failed = await remove(owner);
    expect(failed).toMatchObject({ status: 503, body: {
      deleted: false, code: "account_data_cleanup_incomplete", deletedGenerations: 0,
      deletedProjects: 0, deletedMediaTasks: 1, deletedMediaInputs: 1
    } });
    expect(JSON.stringify(failed)).not.toContain(old.upload);
    expect(await sql!`SELECT upload_key, rendered_upload_key, result_key FROM generations WHERE id=${old.id}`).toEqual([
      { upload_key: old.upload, rendered_upload_key: old.rendered, result_key: old.result }
    ]);
    expect([...objects]).toEqual([`${originalBucket}:${old.upload}`]);

    fixture.remove.mockImplementation(async (bucket, key) => { objects.delete(`${bucket}:${key}`); });
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deleted: true, deletedGenerations: 1, deletedProjects: 1 } });
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deleted: true, deletedGenerations: 0, deletedMediaTasks: 0 } });
    expect(objects.size).toBe(0);
  });

  it("通用媒体存储失败时保留事件、任务和输入，重试后按外键顺序清理", async () => {
    const owner = await account();
    const task = await media(owner);
    fixture.remove.mockImplementation(async (bucket, key) => {
      if (key === task.sealed) throw new Error("合成失败");
      objects.delete(`${bucket}:${key}`);
    });
    expect(await remove(owner)).toMatchObject({ status: 503, body: { deleted: false, deletedMediaTasks: 0, deletedMediaInputs: 0 } });
    expect(await sql!`SELECT sealed_key FROM media_inputs WHERE id=${task.input}`).toEqual([{ sealed_key: task.sealed }]);
    expect(await sql!`SELECT result_key FROM media_tasks WHERE id=${task.id}`).toEqual([{ result_key: task.result }]);
    expect(await sql!`SELECT task_id FROM media_task_events WHERE task_id=${task.id}`).toHaveLength(1);
    fixture.remove.mockImplementation(async (bucket, key) => { objects.delete(`${bucket}:${key}`); });
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedMediaTasks: 1, deletedMediaInputs: 1 } });
    expect(objects.size).toBe(0);
  });

  it("旧任务和媒体任务尚待生成或核对时整个账户返回冲突，即使已软移除", async () => {
    const owner = await account();
    const old = await generation(owner, { status: "running", error: "creative_result_pending" });
    const task = await media(owner, { active: true });
    await sql!`UPDATE generations SET deleted_at=now() WHERE id=${old.id}`;
    await sql!`UPDATE media_tasks SET deleted_at=now() WHERE id=${task.id}`;
    expect(await remove(owner)).toMatchObject({ status: 409, body: { deleted: false, code: "account_generation_in_progress" } });
    await sql!`UPDATE generations SET status='done', error=NULL WHERE id=${old.id}`;
    expect(await remove(owner)).toMatchObject({ status: 409, body: { deleted: false, code: "account_generation_in_progress" } });
    expect(fixture.remove).not.toHaveBeenCalled();
    await sql!`UPDATE media_tasks SET status='refunded', credit_state='refunded' WHERE id=${task.id}`;
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedGenerations: 1, deletedMediaTasks: 1 } });
  });

  it("暂存授权仍可能有效时保留媒体链，按过期窗口重试", async () => {
    const owner = await account();
    await generation(owner);
    const task = await media(owner, { fresh: true });
    expect(await remove(owner)).toMatchObject({ status: 409, body: {
      code: "account_media_upload_in_progress", deleted: false, deletedGenerations: 1, deletedMediaInputs: 0
    } });
    expect(fixture.remove.mock.calls.some(([, key]) => key.startsWith("media/"))).toBe(false);
    await sql!`UPDATE media_inputs SET expires_at=now() - interval '1 hour' WHERE id=${task.input}`;
    expect(await remove(owner)).toMatchObject({ status: 409, body: { code: "account_media_upload_in_progress" } });
    await sql!`UPDATE media_inputs SET expires_at=now() - interval '3 hours' WHERE id=${task.input}`;
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedMediaTasks: 1, deletedMediaInputs: 1 } });
    expect(objects.size).toBe(0);
  });

  it("清理没有封存或生成任务的旧暂存对象", async () => {
    const owner = await account();
    const input = randomUUID();
    const staging = store(originalBucket, `media/staging/${owner}/${input}`);
    await sql!`INSERT INTO media_inputs (id, user_id, staging_key, expected_mime, expected_bytes, expected_sha256, expires_at)
      VALUES (${input}, ${owner}, ${staging}, 'image/png', 8, ${sha}, now() - interval '3 hours')`;
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deleted: true, deletedMediaTasks: 0, deletedMediaInputs: 1 } });
    expect(fixture.remove.mock.calls).toEqual([[originalBucket, staging]]);
    expect(await sql!`SELECT id FROM media_inputs WHERE id=${input}`).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("旧版已登记的上传授权过期后才删除对象，避免有效 PUT 在清理后重建旧文件", async () => {
    const owner = await account();
    const upload = store(originalBucket, `${owner}/${Date.now()}-fixture.jpg`);
    const old = await generation(owner, { upload });
    expect(await remove(owner)).toMatchObject({ status: 409, body: { code: "account_legacy_upload_in_progress", deleted: false } });
    expect(fixture.remove).not.toHaveBeenCalled();
    vi.setSystemTime(Date.now() + 360_001);
    try {
      expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedGenerations: 1 } });
    } finally {
      vi.useRealTimers();
    }
    expect(await sql!`SELECT id FROM generations WHERE id=${old.id}`).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("并发删除串行，同一上传键只提交一次，随后重复请求为空操作", async () => {
    const owner = await account();
    const old = await generation(owner);
    await generation(owner, { upload: old.upload });
    const firstObject = pending();
    const release = pending();
    fixture.remove.mockImplementation(async (bucket, key) => {
      firstObject.release();
      await release.promise;
      objects.delete(`${bucket}:${key}`);
    });
    const first = remove(owner);
    await firstObject.promise;
    const second = remove(owner);
    release.release();
    const results = await Promise.all([first, second]);
    expect(results.map(({ status, body }) => [status, body.deletedGenerations])).toEqual([[200, 2], [200, 0]]);
    expect(fixture.remove.mock.calls.filter(([, key]) => key === old.upload)).toHaveLength(1);
    expect(objects.size).toBe(0);
  });

  it("拒绝异账号和错误记录的键，保留无法确认的归属引用", async () => {
    const owner = await account();
    const other = await account();
    const foreign = await generation(other);
    const old = await generation(owner, { upload: foreign.upload, result: foreign.result });
    const task = await media(owner, { staging: `media/staging/${other}/${randomUUID()}` });
    expect(await remove(owner)).toMatchObject({ status: 409, body: { deleted: false, code: "account_data_cleanup_blocked" } });
    expect(fixture.remove).not.toHaveBeenCalled();
    expect(await sql!`SELECT id FROM generations WHERE id IN (${old.id}, ${foreign.id})`).toHaveLength(2);
    expect(await sql!`SELECT id FROM media_tasks WHERE id=${task.id}`).toHaveLength(1);
  });

  it("项目存在异账号旧引用时保留关系，避免外键级联修改另一账号", async () => {
    const owner = await account();
    const other = await account();
    const foreign = await generation(other);
    const [project] = await sql!`INSERT INTO projects (user_id, name) VALUES (${owner}, 'fixture') RETURNING id`;
    await sql!`UPDATE generations SET project_id=${project.id} WHERE id=${foreign.id}`;
    expect(await remove(owner)).toMatchObject({ status: 409, body: { deleted: false, code: "account_data_cleanup_blocked" } });
    expect(await sql!`SELECT project_id FROM generations WHERE id=${foreign.id}`).toEqual([{ project_id: project.id }]);
    expect(fixture.remove).not.toHaveBeenCalled();
  });

  it("缺少通用媒体后端时保留终态任务，可在恢复配置后重试", async () => {
    const owner = await account();
    const task = await media(owner, { withInput: false });
    vi.stubEnv("MEDIA_RUNTIME_CONFIG", "{}");
    expect(await remove(owner)).toMatchObject({ status: 503, body: { deleted: false, deletedMediaTasks: 0 } });
    expect(await sql!`SELECT result_key FROM media_tasks WHERE id=${task.id}`).toEqual([{ result_key: task.result }]);
    expect(fixture.remove).not.toHaveBeenCalled();
    vi.stubEnv("MEDIA_RUNTIME_CONFIG", JSON.stringify({ storageBackend: "r2", storageApprovalRef: "fixture" }));
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedMediaTasks: 1 } });
  });

  it("独立数据库连接写入同账户的新任务需等待删除事务释放外键锁", async () => {
    const owner = await account();
    await generation(owner);
    const cleanupStarted = pending();
    const release = pending();
    fixture.remove.mockImplementation(async (bucket, key) => {
      cleanupStarted.release();
      await release.promise;
      objects.delete(`${bucket}:${key}`);
    });
    const deletion = remove(owner);
    await cleanupStarted.promise;
    const write = generation(owner, { status: "queued" });
    try {
      await expect.poll(async () => (await sql!`SELECT 1 FROM pg_stat_activity
        WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'INSERT INTO generations%'`).length).toBe(1);
    } finally {
      release.release();
    }
    expect(await deletion).toMatchObject({ status: 200, body: { deletedGenerations: 1 } });
    const newRow = await write;
    expect(await sql!`SELECT status FROM generations WHERE id=${newRow.id}`).toEqual([{ status: "queued" }]);
  });

  it("仍能读取并清理未迁移作品软移除与通用媒体的旧库", async () => {
    const owner = await account();
    const old = await generation(owner);
    await sql!.begin(async (tx) => {
      await tx`ALTER TABLE generations RENAME COLUMN deleted_at TO fixture_deleted_at`;
      await tx`ALTER TABLE media_tasks RENAME TO fixture_media_tasks`;
      await tx`ALTER TABLE media_inputs RENAME TO fixture_media_inputs`;
      await tx`ALTER TABLE media_task_events RENAME TO fixture_media_task_events`;
    });
    try {
      fixture.user = owner;
      const { GET } = await import("@/app/api/generations/[id]/route");
      const response = await GET(new Request("https://fixture.invalid"), { params: Promise.resolve({ id: old.id }) });
      expect(response.status).toBe(200);
      expect(fixture.sign).toHaveBeenCalledTimes(2);
      expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedGenerations: 1, deletedMediaTasks: 0 } });
    } finally {
      await sql!.begin(async (tx) => {
        await tx`ALTER TABLE generations RENAME COLUMN fixture_deleted_at TO deleted_at`;
        await tx`ALTER TABLE fixture_media_tasks RENAME TO media_tasks`;
        await tx`ALTER TABLE fixture_media_inputs RENAME TO media_inputs`;
        await tx`ALTER TABLE fixture_media_task_events RENAME TO media_task_events`;
      });
    }
  });
});

describe.skipIf(!sql || restrictedApp)("真实旧生成入口与账户清理的并发", () => {
  it.each(["original", "rendered"])("清理先删除 %s，等待中的生成无新任务、扣分或投递", async (kind) => {
    const owner = await account();
    const old = await generation(owner);
    await fund(owner);
    const cleanupStarted = pending(), release = pending();
    fixture.remove.mockImplementation(async (bucket, key) => {
      cleanupStarted.release();
      await release.promise;
      objects.delete(`${bucket}:${key}`);
    });
    const cleanup = remove(owner);
    await cleanupStarted.promise;
    const input = kind === "original" ? old.upload : store(originalBucket, `${owner}/fresh-${randomUUID()}.jpg`);
    const generationRequest = submit(owner, input, kind === "rendered" ? old.rendered : undefined);
    let checkedWhileCleaning: number;
    try {
      await waitForAccountLock();
      checkedWhileCleaning = fixture.exists.mock.calls.length;
    } finally {
      release.release();
    }
    const cleanupResponse = await cleanup;
    const response = await generationRequest;
    const state = await accountState(owner);
    const dispatched = fixture.dispatch.mock.calls.length;
    console.log("清理先取锁", { kind, cleanup: cleanupResponse.status, generation: response.status, checkedWhileCleaning, dispatched, ...state });
    expect(cleanupResponse).toMatchObject({ status: 200, body: { deletedGenerations: 1 } });
    expect(checkedWhileCleaning).toBe(0);
    expect(response).toMatchObject({ status: 404, body: { code: kind === "original" ? "upload_not_found" : "rendered_upload_not_found" } });
    expect(state).toEqual({ balance: 3, tasks: 0, delta: 0 });
    expect(dispatched).toBe(0);
    expect((await submit(owner, store(originalBucket, `${owner}/new-${randomUUID()}.jpg`))).status).toBe(202);
    expect(await accountState(owner)).toEqual({ balance: 3, tasks: 1, delta: 0 });
    expect(fixture.dispatch).toHaveBeenCalledOnce();
  });

  it("试妆先完成两图核验及写入，同账户清理返回 409，其他账户仍可清理", async () => {
    const owner = await account(), other = await account();
    const old = await generation(owner);
    await generation(other);
    await fund(owner);
    const headStarted = pending(), release = pending();
    fixture.exists.mockImplementation(async (key) => {
      headStarted.release();
      await release.promise;
      return objects.has(`${originalBucket}:${key}`);
    });
    const request = submit(owner, old.upload, old.rendered);
    const checkpoint = await Promise.race([headStarted.promise.then(() => "checked"), request.then(() => "submitted")]);
    if (checkpoint !== "checked") throw new Error("生成在查询对象前就进入队列");
    const cleanup = remove(owner);
    try {
      await waitForAccountLock();
      expect(await remove(other)).toMatchObject({ status: 200, body: { deletedGenerations: 1 } });
      expect(fixture.remove.mock.calls.some(([, key]) => [old.upload, old.rendered].includes(key))).toBe(false);
      await sql!.begin(async (tx) => {
        // 两张图核验后暂停实际 INSERT，核对同账户清理仍在等待。
        await tx`LOCK TABLE generations IN SHARE MODE`;
        release.release();
        await waitForAccountLock(2);
        const waits = await tx`SELECT wait_event FROM pg_stat_activity WHERE datname=current_database()
          AND wait_event_type='Lock' ORDER BY wait_event`;
        expect(waits).toEqual([{ wait_event: "advisory" }, { wait_event: "relation" }]);
        console.log("两图核验完成，写入与清理分别等待", waits);
      });
    } finally {
      release.release();
    }
    expect(await request).toMatchObject({ status: 202, body: { status: "queued" } });
    expect(await cleanup).toMatchObject({ status: 409, body: { code: "account_generation_in_progress" } });
    expect(await accountState(owner)).toEqual({ balance: 3, tasks: 2, delta: 0 });
    expect(fixture.dispatch).toHaveBeenCalledOnce();
    expect(fixture.exists.mock.calls.map(([key]) => key).sort()).toEqual([old.upload, old.rendered].sort());
    expect(await sql!`SELECT mode,upload_key,rendered_upload_key FROM generations WHERE user_id=${owner} AND status='queued'`)
      .toEqual([{ mode: "virtual_try_on", upload_key: old.upload, rendered_upload_key: old.rendered }]);
  });

  it.each(["cleanup", "worker"])("审核后扣分与账户清理用同一账户锁（%s 先取锁）", async (first) => {
    const owner = await account();
    await fund(owner);
    const key = store(originalBucket, `${owner}/approved-${randomUUID()}.jpg`);
    expect((await submit(owner, key)).status).toBe(202);
    const [task] = await sql!`UPDATE generations SET status='moderating' WHERE user_id=${owner} RETURNING id`;
    const { reserveApprovedMakeup } = await import("@/lib/makeup-accounting");
    let cleaning!: ReturnType<typeof remove>;
    let reserving!: ReturnType<typeof reserveApprovedMakeup>;
    await sql!.begin(async tx => {
      const [{ pid }] = await tx`SELECT pg_backend_pid() AS pid`;
      const waitForBlockedTransaction = () => expect.poll(async () => (await sql!`
        SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND ${pid} = ANY(pg_blocking_pids(pid))
      `).length).toBe(1);
      if (first === "cleanup") {
        await tx`LOCK TABLE generations IN ACCESS EXCLUSIVE MODE`;
        cleaning = remove(owner);
        await waitForBlockedTransaction();
        reserving = reserveApprovedMakeup(task.id, owner);
      } else {
        await tx`SELECT user_id FROM credit_balances WHERE user_id=${owner} FOR UPDATE`;
        reserving = reserveApprovedMakeup(task.id, owner);
        await waitForBlockedTransaction();
        cleaning = remove(owner);
      }
      await waitForAccountLock();
    });
    expect(await reserving).toBe("running");
    expect(await cleaning).toMatchObject({ status: 409, body: { code: "account_generation_in_progress" } });
    expect(await accountState(owner)).toEqual({ balance: 2, tasks: 1, delta: -1 });
    expect(fixture.remove).not.toHaveBeenCalled();
    console.info("审核扣分与账户清理", { first, status: "running", cleanup: 409, balance: 2 });
  });

  it("另一账号的图拒绝查询，存储故障拒绝受理且恢复后可提交", async () => {
    const owner = await account(), other = await account();
    const old = await generation(other);
    const fresh = store(originalBucket, `${owner}/new-${randomUUID()}.jpg`);
    await fund(owner);
    expect(await submit(owner, fresh, old.rendered)).toMatchObject({ status: 400, body: { code: "invalid_rendered_upload" } });
    expect(fixture.exists).not.toHaveBeenCalled();
    fixture.exists.mockRejectedValueOnce(new Error("合成存储不可用"));
    expect(await submit(owner, fresh)).toMatchObject({ status: 503, body: { code: "upload_storage_unavailable" } });
    expect(await accountState(owner)).toEqual({ balance: 3, tasks: 0, delta: 0 });
    expect(fixture.dispatch).not.toHaveBeenCalled();
    expect((await submit(owner, fresh)).status).toBe(202);
    expect(await accountState(owner)).toEqual({ balance: 3, tasks: 1, delta: 0 });
  });

  it("存储超时后结束查询并释放锁，旧任务可清理", async () => {
    const owner = await account();
    const old = await generation(owner);
    await fund(owner);
    fixture.exists.mockImplementationOnce(async (_, signal) => {
      await new Promise<void>((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
      return true;
    });
    expect(await submit(owner, old.upload)).toMatchObject({ status: 503, body: { code: "upload_storage_unavailable" } });
    expect(fixture.exists.mock.calls[0][1].aborted).toBe(true);
    expect(await accountState(owner)).toEqual({ balance: 3, tasks: 1, delta: 0 });
    expect(fixture.dispatch).not.toHaveBeenCalled();
    expect(await remove(owner)).toMatchObject({ status: 200, body: { deletedGenerations: 1 } });
  });
});

it.runIf(Boolean(sql) && restrictedApp)("旧生成以无权访问 auth.users 的业务角色核验并正常受理", async () => {
  const owner = await account();
  await fund(owner);
  const fresh = store(originalBucket, `${owner}/restricted-${randomUUID()}.jpg`);
  const response = await submit(owner, fresh);
  expect(await globalThis.__pgClient!`SELECT current_user AS role, has_schema_privilege(current_user,'auth','USAGE') AS auth_access`)
    .toEqual([{ role: "fixture_generation", auth_access: false }]);
  expect(response.status).toBe(202);
  expect(await accountState(owner)).toEqual({ balance: 3, tasks: 1, delta: 0 });
  expect(fixture.dispatch).toHaveBeenCalledOnce();
});
