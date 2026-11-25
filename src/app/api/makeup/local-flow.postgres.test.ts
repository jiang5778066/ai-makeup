// @vitest-environment node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Readable } from "node:stream";
import postgres from "postgres";
import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageJobResume, ImageJobSteps } from "@/lib/ai/image-job";

type GenerationEvent = {
  name: "makeup/generate.requested";
  data: { generationId: string; imageResume?: ImageJobResume };
  id?: string;
};
type Steps = ImageJobSteps & { sendEvent: (name: string, event: GenerationEvent) => Promise<void> };
type Worker = (context: { event: GenerationEvent; runId: string; step: Steps }) => Promise<unknown>;
type Failure = (context: { event: { data: { run_id: string; event: GenerationEvent; error: { message: string } } }; step: Steps }) => Promise<unknown>;
type Scan = (context: { step: Steps }) => Promise<unknown>;

const boundaries = vi.hoisted(() => ({
  user: vi.fn(),
  send: vi.fn(),
  store: vi.fn(),
  examine: vi.fn(),
  sign: vi.fn(),
  worker: undefined as Worker | undefined,
  failure: undefined as Failure | undefined,
  scan: undefined as Scan | undefined
}));

vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: boundaries.user }));
vi.mock("@/db/client", async (original) => {
  globalThis.__pgClient = postgres(process.env.DATABASE_URL!, { max: 4, prepare: false });
  return original();
});
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: boundaries.send,
    createFunction: ({ id, onFailure }: { id: string; onFailure?: Failure }, worker: Worker | Scan) => {
      if (id === "makeup-generate") {
        boundaries.worker = worker as Worker;
        boundaries.failure = onFailure;
      }
      if (id === "makeup-initial-dispatch-scan") boundaries.scan = worker as Scan;
      return {};
    }
  }
}));
vi.mock("@aws-sdk/client-s3", async (original) => ({
  ...await original<typeof import("@aws-sdk/client-s3")>(),
  S3Client: class { send = boundaries.store; }
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: boundaries.sign }));
vi.mock("@aws-sdk/client-rekognition", async (original) => ({
  ...await original<typeof import("@aws-sdk/client-rekognition")>(),
  RekognitionClient: class { send = boundaries.examine; }
}));

const fixtureUrl = process.env.F7_MAKEUP_DATABASE_URL;
if (fixtureUrl) {
  const url = new URL(fixtureUrl);
  if (
    url.protocol !== "postgres:" || url.hostname !== "127.0.0.1" || !url.port ||
    url.username !== "postgres" || url.password !== "fixture_only" ||
    url.pathname !== "/postgres" || url.search || url.hash
  ) throw new Error("美妆集成验收只允许本机专用 PostgreSQL fixture");
}

const fixture = fixtureUrl ? postgres(fixtureUrl, { max: 1, prepare: false }) : null;
let userId: string;
const otherUserId = randomUUID();
const objects = new Map<string, Buffer>();
const providerCalls: string[] = [];
const queued: GenerationEvent[] = [];
let server: Server;
let origin: string;
let providerReady = false;
let dispatchMode: "ok" | "rejected" | "ack_lost" = "ok";
let moderationMode: "ok" | "minor" | "rendered_minor" | "unavailable" = "ok";
let providerMode: "ok" | "ack_lost" = "ok";
let recoverProviderTask = false;
let providerPrompt = "";
let resultReady = true;
const deliveryIds = new Set<string>();
let image: Buffer;
let renderedImage: Buffer;
const tryOnConfig = { lipstick: { enabled: true, presetId: "classic-red", color: "#c93445", intensity: 70 } };

function request(path: string, body?: unknown) {
  return new Request(new URL(path, origin), body === undefined ? undefined : {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
  });
}

async function upload(bytes = image) {
  const { POST } = await import("@/app/api/uploads/sign/route");
  const response = await POST(request("/api/uploads/sign", {
    contentType: "image/png", contentLength: bytes.length
  }));
  expect(response.status).toBe(200);
  const { uploadUrl, uploadKey } = await response.json();
  expect(new URL(uploadUrl).origin).toBe(origin);
  expect((await fetch(uploadUrl, { method: "PUT", body: new Uint8Array(bytes) })).status).toBe(204);
  expect(uploadKey).toMatch(new RegExp(`^${userId}/`));
  return uploadKey as string;
}

async function readGeneration(id: string, owner = userId) {
  boundaries.user.mockResolvedValueOnce({ id: owner });
  const { GET } = await import("@/app/api/generations/[id]/route");
  const response = await GET(request(`/api/generations/${id}`), { params: Promise.resolve({ id }) });
  return { status: response.status, body: await response.json() };
}

function steps(): Steps {
  const completed = new Map<string, unknown>();
  return {
    run: async <T>(name: string, callback: () => Promise<T>) => {
      if (!completed.has(name)) completed.set(name, await callback());
      return completed.get(name) as T;
    },
    sleep: async () => {},
    sendEvent: async (_name, nextEvent) => { queued.push(nextEvent); }
  };
}

async function processEvent(event: GenerationEvent, runId = randomUUID(), step = steps()) {
  await import("@/inngest/functions");
  return boundaries.worker!({ event, runId, step });
}

function nextEvent() {
  const event = queued.shift();
  if (!event) throw new Error("缺少合成待处理事件");
  return event;
}

async function processNext() {
  return processEvent(nextEvent());
}

async function failRun(event: GenerationEvent, runId: string, message: string) {
  return boundaries.failure!({ event: { data: { run_id: runId, event, error: { message } } }, step: steps() });
}

async function expediteDispatch(generationId: string) {
  await fixture!`UPDATE generations SET dispatch_due_at=now()-interval '1 second'
    WHERE id=${generationId} AND dispatch_due_at IS NOT NULL`;
}

async function accounting(generationId: string) {
  const [row] = await fixture!`SELECT status, error, (dispatch_due_at IS NOT NULL) AS pending, initial_run_id AS run,
      (SELECT coalesce(sum(delta), 0)::int FROM credits_ledger WHERE ref_type='generation' AND ref_id=g.id::text) AS delta,
      (SELECT count(*)::int FROM credit_consumptions WHERE ref_type='generation' AND ref_id=g.id::text) AS consumed,
      (SELECT count(*)::int FROM credit_consumptions WHERE ref_type='generation' AND ref_id=g.id::text AND refunded_at IS NOT NULL) AS refunded
    FROM generations AS g WHERE g.id=${generationId}`;
  return row;
}

async function submit(uploadKey: string, body: Record<string, unknown> = {}) {
  const { POST } = await import("./generate/route");
  return POST(request("/api/makeup/generate", { uploadKey, styleId: "natural", consent: true, ...body }));
}

async function acceptedId(response: Response) {
  expect(response.status).toBe(202);
  const body = await response.json();
  expect(body).toMatchObject({ generationId: expect.any(String), status: "queued" });
  return body.generationId as string;
}

const scanAfterRestart = () => promisify(execFile)(process.execPath, ["--import", "tsx", "-e",
  'const main = async () => { const { claimDueMakeupDispatches, sendInitialMakeupEvents } = await import("./src/lib/makeup-dispatch.ts").then(m => m.default ?? m); const due = await claimDueMakeupDispatches(); await sendInitialMakeupEvents(due); console.log(JSON.stringify(due)); await globalThis.__pgClient?.end({ timeout: 0 }); }; main().catch((error) => { console.error(error); process.exitCode=1; });'
], {
  env: { NODE_ENV: "test", PATH: process.env.PATH, DATABASE_URL: fixtureUrl, INNGEST_DEV: "1",
    INNGEST_EVENT_KEY: "synthetic-event-key", INNGEST_EVENT_API_BASE_URL: origin },
  timeout: 10_000
});

describe.skipIf(!fixtureUrl)("隔离 PostgreSQL 美妆任务本地链路", () => {
  beforeAll(async () => {
    image = await sharp({ create: { width: 32, height: 32, channels: 3, background: "#edc6b2" } }).png().toBuffer();
    renderedImage = await sharp({ create: { width: 32, height: 32, channels: 3, background: "#b85a65" } }).png().toBuffer();
    server = createServer(async (req, res) => {
      const path = req.url ?? "";
      if (path.startsWith("/objects/")) {
        if (req.method === "PUT") {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          objects.set(path, Buffer.concat(chunks));
          res.writeHead(204).end();
        } else {
          const bytes = objects.get(path);
          if (bytes) res.writeHead(200, { "content-type": "image/png" }).end(bytes);
          else res.writeHead(404).end();
        }
        return;
      }
      if (path === "/result.png") {
        if (resultReady) res.writeHead(200, { "content-type": "image/png" }).end(image);
        else res.writeHead(503).end();
        return;
      }
      if (path === "/e/synthetic-event-key") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const events = JSON.parse(Buffer.concat(chunks).toString()) as GenerationEvent[];
        if (dispatchMode === "rejected") {
          res.writeHead(503).end(JSON.stringify({ status: 503, error: "synthetic_queue_unavailable" }));
          return;
        }
        for (const event of events) {
          expect(event.name).toBe("makeup/generate.requested");
          expect(event.id).toContain(event.data.generationId);
          expect(Object.keys(event.data)).toEqual(["generationId"]);
          if (!deliveryIds.has(event.id!)) queued.push(event);
          deliveryIds.add(event.id!);
        }
        if (dispatchMode === "ack_lost") { req.socket.destroy(); return; }
        res.end(JSON.stringify({ status: 200, ids: events.map(event => event.id) }));
        return;
      }
      if (path === "/moderation") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const { rendered, labels } = JSON.parse(Buffer.concat(chunks).toString());
        const minor = moderationMode === "minor" || moderationMode === "rendered_minor" && rendered;
        if (moderationMode === "unavailable") res.writeHead(503).end();
        else res.end(JSON.stringify(labels ? { ModerationLabels: [] } :
          { FaceDetails: [{ AgeRange: minor ? { Low: 8, High: 12 } : { Low: 25, High: 35 } }] }));
        return;
      }
      providerCalls.push(`${req.method} ${path}`);
      res.setHeader("content-type", "application/json");
      if (path === "/config") res.end(JSON.stringify({ imagePricing: { "gpt-image-2": { qualityPrices: { "1k": 0.06 } } } }));
      else if (path.startsWith("/history?")) res.end(JSON.stringify({ records: recoverProviderTask ? [{ id: "fixture-history" }] : [] }));
      else if (path === "/history/fixture-history") res.end(JSON.stringify({
        model: "gpt-image-2", prompt: providerPrompt, task_id: "synthetic-provider-task"
      }));
      else if (path === "/images" && req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const reference = new URL(body.image_urls[0]);
        if (reference.origin !== origin || !objects.get(reference.pathname)?.equals(image)) {
          res.writeHead(400).end("{}");
        } else {
          if (providerMode === "ack_lost") { providerPrompt = body.prompt; req.socket.destroy(); }
          else res.end(JSON.stringify({ task_id: "synthetic-provider-task" }));
        }
      } else if (path === "/images/synthetic-provider-task") {
        res.end(JSON.stringify(providerReady ? { status: "completed", result_urls: [`${origin}/result.png`] } : { status: "pending" }));
      } else res.writeHead(404).end("{}");
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    for (const [key, value] of Object.entries({
      DATABASE_URL: fixtureUrl!, ENABLE_GENERATION: "1", DISABLE_GENERATION: "0",
      R2_ACCOUNT_ID: "synthetic", R2_ACCESS_KEY_ID: "synthetic", R2_SECRET_ACCESS_KEY: "synthetic",
      R2_BUCKET_ORIGINALS: "synthetic-originals", R2_BUCKET_RESULTS: "synthetic-results",
      AWS_ACCESS_KEY_ID: "synthetic", AWS_SECRET_ACCESS_KEY: "synthetic", AWS_REGION: "us-east-1",
      ROUTER_CREATIVE_API_KEY: "synthetic", ROUTER_CREATIVE_BASE_URL: origin,
      AI_IMAGE_MODEL: "gpt-image-2", AI_IMAGE_QUALITY: "1k",
      DAILY_AI_SPEND_CAP_CENTS: "2000", AI_GENERATION_ESTIMATE_CENTS: "10"
    })) vi.stubEnv(key, value);
    await fixture!`INSERT INTO auth.users (id) VALUES (${otherUserId})`;
    boundaries.send.mockImplementation(async (event: GenerationEvent | GenerationEvent[]) => {
      const response = await fetch(`${origin}/e/synthetic-event-key`, {
        method: "POST", body: JSON.stringify(Array.isArray(event) ? event : [event])
      });
      if (!response.ok) throw new Error("synthetic_queue_unavailable");
      return response.json();
    });
    boundaries.sign.mockImplementation(async (_client, command) => `${origin}/objects/${command.input.Bucket}/${command.input.Key}`);
    boundaries.store.mockImplementation(async (command) => {
      const path = `/objects/${command.input.Bucket}/${command.input.Key}`;
      if (command.constructor.name === "GetObjectCommand") {
        const bytes = objects.get(path);
        if (!bytes) {
          throw Object.assign(new Error("NoSuchKey"), {
            name: "NoSuchKey", $metadata: { httpStatusCode: 404 }
          });
        }
        if (command.input.Range !== undefined) {
          expect(command.input.Range).toBe("bytes=0-0");
          const firstByte = bytes.subarray(0, 1);
          return { Body: Readable.from([firstByte]), ContentLength: firstByte.length };
        }
        return { Body: { transformToByteArray: async () => bytes } };
      }
      objects.set(path, Buffer.from(command.input.Body));
      return {};
    });
    boundaries.examine.mockImplementation(async (command) => {
      const bytes = Buffer.from(command.input.Image.Bytes);
      expect(bytes.equals(image) || bytes.equals(renderedImage)).toBe(true);
      const response = await fetch(`${origin}/moderation`, { method: "POST", body: JSON.stringify({
        rendered: bytes.equals(renderedImage), labels: command.constructor.name === "DetectModerationLabelsCommand"
      }) });
      if (!response.ok) throw new Error("synthetic_moderation_unavailable");
      return response.json();
    });
  });

  beforeEach(async () => {
    userId = randomUUID();
    await fixture!`INSERT INTO auth.users (id) VALUES (${userId})`;
    const { addCredits } = await import("@/lib/credits");
    await addCredits(userId, 3, "admin_adjust");
    boundaries.user.mockReset().mockResolvedValue({ id: userId, email: "synthetic@example.invalid" });
    boundaries.examine.mockClear();
    queued.length = 0;
    providerCalls.length = 0;
    moderationMode = "ok";
    dispatchMode = "ok";
    providerMode = "ok";
    providerReady = true;
    recoverProviderTask = false;
    resultReady = true;
    vi.stubEnv("ENABLE_GENERATION", "1");
    vi.stubEnv("DISABLE_GENERATION", "0");
  });

  afterAll(async () => {
    try {
      await globalThis.__pgClient?.end({ timeout: 0 });
      if (fixture) await fixture.end();
    } finally {
      if (server?.listening) await new Promise<void>((resolve) => server.close(() => resolve()));
      vi.unstubAllEnvs();
    }
  });

  it("审核后各扣一次，关停中续查全脸任务并保存试妆结果", async () => {
    const { getBalance } = await import("@/lib/credits");
    providerReady = false;
    const uploadKey = await upload();
    expect((await submit(uploadKey, { consent: false })).status).toBe(400);
    expect(queued).toHaveLength(0);

    const generationId = await acceptedId(await submit(uploadKey));
    expect(boundaries.store.mock.calls.some(([command]) =>
      command.input.Key === uploadKey && command.input.Range === "bytes=0-0"
    )).toBe(true);
    expect(await getBalance(userId)).toBe(3);
    expect(await accounting(generationId)).toMatchObject({ status: "queued", pending: true, delta: 0, consumed: 0 });
    expect(boundaries.examine).not.toHaveBeenCalled();
    expect((await readGeneration(generationId)).body.status).toBe("queued");
    const initial = nextEvent();
    expect(await processEvent(initial)).toMatchObject({ status: "awaiting_provider", taskId: "synthetic-provider-task" });
    expect(await accounting(generationId)).toMatchObject({ status: "running", pending: false, delta: -1, consumed: 1 });
    expect(await processEvent(initial)).toMatchObject({ status: "awaiting_original_execution" });
    expect(await boundaries.scan!({ step: steps() })).toEqual({ scheduled: 0 });

    vi.stubEnv("ENABLE_GENERATION", undefined);
    vi.stubEnv("DISABLE_GENERATION", undefined);
    const closed = await submit(uploadKey);
    expect(closed.status).toBe(503);
    expect(await closed.json()).toEqual({ code: "generation_disabled" });
    expect((await readGeneration(generationId)).body.status).toBe("running");
    providerReady = true;
    expect(await processNext()).toMatchObject({ status: "done" });
    const result = await readGeneration(generationId);
    expect(result.body).toMatchObject({ id: generationId, status: "done" });
    expect(new URL(result.body.resultUrl).origin).toBe(origin);
    expect(Buffer.from(await (await fetch(result.body.resultUrl)).arrayBuffer())).toEqual(image);
    expect((await readGeneration(generationId, otherUserId)).status).toBe(404);
    expect(providerCalls.filter(path => path === "POST /images")).toHaveLength(1);

    vi.stubEnv("ENABLE_GENERATION", "1");
    const renderedUploadKey = await upload(renderedImage);
    const tryOnId = await acceptedId(await submit(uploadKey, {
      mode: "virtual_try_on", sourceMode: "camera", renderedUploadKey,
      makeupConfig: tryOnConfig
    }));
    expect(await accounting(tryOnId)).toMatchObject({ status: "queued", delta: 0, consumed: 0 });
    expect(await getBalance(userId)).toBe(2);
    const providerCount = providerCalls.length;
    const moderationCount = boundaries.examine.mock.calls.length;
    expect(await processNext()).toMatchObject({ status: "done" });
    expect(boundaries.examine.mock.calls).toHaveLength(moderationCount + 4);
    expect(providerCalls).toHaveLength(providerCount);
    const tryOnResult = (await readGeneration(tryOnId)).body;
    expect(tryOnResult).toMatchObject({ mode: "virtual_try_on", sourceMode: "camera", status: "done" });
    expect(Buffer.from(await (await fetch(tryOnResult.resultUrl)).arrayBuffer())).toEqual(renderedImage);
    expect(await getBalance(userId)).toBe(1);
  });

  it("拒绝原图或渲染图及审核服务故障均无扣分或退款流水", async () => {
    const uploadKey = await upload();
    const renderedUploadKey = await upload(renderedImage);
    const providerCount = providerCalls.length;
    try {
      for (const mode of ["minor", "rendered_minor"] as const) {
        moderationMode = mode;
        const generationId = await acceptedId(await submit(uploadKey, mode === "minor" ? {} : {
          mode: "virtual_try_on", renderedUploadKey, makeupConfig: tryOnConfig
        }));
        expect(await processNext()).toEqual({ status: "failed", reason: "minor" });
        expect(await accounting(generationId)).toMatchObject({
          status: "failed", error: "moderation:minor", delta: 0, consumed: 0, refunded: 0
        });
        expect((await readGeneration(generationId)).body.status).toBe("failed");
      }
      moderationMode = "unavailable";
      const generationId = await acceptedId(await submit(uploadKey));
      const event = nextEvent(), runId = randomUUID(), step = steps();
      await expect(processEvent(event, runId, step)).rejects.toThrow("synthetic_moderation_unavailable");
      expect(await accounting(generationId)).toMatchObject({ status: "moderating", pending: false, delta: 0, consumed: 0 });
      expect(await processEvent(event)).toEqual({ status: "another_initial_run_owns_task" });
      expect(await failRun(event, randomUUID(), "synthetic_duplicate_run_failure")).toBe("already_settled");
      await expect(processEvent(event, runId, step)).rejects.toThrow("synthetic_moderation_unavailable");
      expect(await failRun(event, runId, "synthetic_moderation_unavailable")).toBe("failed");
      expect(await failRun(event, runId, "synthetic_moderation_unavailable")).toBe("already_settled");
      expect(await accounting(generationId)).toMatchObject({ status: "failed", delta: 0, consumed: 0, refunded: 0 });
      expect(await boundaries.scan!({ step: steps() })).toEqual({ scheduled: 0 });
      expect(providerCalls).toHaveLength(providerCount);
    } finally {
      moderationMode = "ok";
    }
  });

  it("审核故障恢复、扣分事务回滚和成功回执重放都沿用原任务", async () => {
    const { getBalance } = await import("@/lib/credits");
    const uploadKey = await upload();
    const renderedUploadKey = await upload(renderedImage);
    const generationId = await acceptedId(await submit(uploadKey, {
      mode: "virtual_try_on", renderedUploadKey, makeupConfig: tryOnConfig
    }));
    const event = nextEvent(), runId = randomUUID(), step = steps();
    moderationMode = "unavailable";
    await expect(processEvent(event, runId, step)).rejects.toThrow("synthetic_moderation_unavailable");
    expect(await getBalance(userId)).toBe(3);

    // 模拟写任务状态失败，数据库必须同时撤销余额、消费批次和流水。
    await fixture!.unsafe(`
      CREATE FUNCTION fixture_fail_running() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.status = 'running' THEN RAISE EXCEPTION 'synthetic_status_write_failure'; END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER fixture_fail_running BEFORE UPDATE ON generations
        FOR EACH ROW EXECUTE FUNCTION fixture_fail_running();
    `);
    moderationMode = "ok";
    try {
      await expect(processEvent(event, runId, step)).rejects.toThrow();
      expect(await accounting(generationId)).toMatchObject({ status: "moderating", pending: false, delta: 0, consumed: 0 });
      expect(await getBalance(userId)).toBe(3);
      expect(await fixture!`SELECT remaining FROM credit_grants WHERE user_id=${userId}`).toEqual([{ remaining: 3 }]);
    } finally {
      await fixture!.unsafe("DROP TRIGGER fixture_fail_running ON generations; DROP FUNCTION fixture_fail_running()");
    }

    // 只丢掉扣分步骤的成功回执。原运行再次调用同一步骤时，以原消费为准。
    let suppressReceipt = true;
    const originalRun = step.run;
    step.run = async (name, callback) => {
      if (name === "reserve-approved-makeup" && suppressReceipt) {
        suppressReceipt = false;
        await callback();
        throw new Error("synthetic_credit_commit_ack_lost");
      }
      return originalRun(name, callback);
    };
    await expect(processEvent(event, runId, step)).rejects.toThrow("synthetic_credit_commit_ack_lost");
    expect(await accounting(generationId)).toMatchObject({ status: "running", delta: -1, consumed: 1 });
    expect(await processEvent(event)).toMatchObject({ status: "another_initial_run_owns_task" });
    expect(await processEvent(event, runId, step)).toMatchObject({ status: "done" });
    expect(await accounting(generationId)).toMatchObject({ status: "done", delta: -1, consumed: 1 });
    expect(await getBalance(userId)).toBe(2);
  });

  it("明确未收件和已收件丢回执均回复 202，重启扫描只派发原任务", async () => {
    const { getBalance } = await import("@/lib/credits");
    const previousBalance = await getBalance(userId);
    const uploadKey = await upload();
    const renderedUploadKey = await upload(renderedImage);
    try {
      for (const mode of ["rejected", "ack_lost"] as const) {
        vi.stubEnv("ENABLE_GENERATION", "1");
        dispatchMode = mode;
        const generationId = await acceptedId(await submit(uploadKey, {
          mode: "virtual_try_on", renderedUploadKey, makeupConfig: tryOnConfig
        }));
        expect(queued).toHaveLength(mode === "ack_lost" ? 1 : 0);
        expect(await accounting(generationId)).toMatchObject({ status: "queued", pending: true, delta: 0, consumed: 0 });
        expect((await readGeneration(generationId)).body.status).toBe("queued");
        vi.stubEnv("ENABLE_GENERATION", undefined);
        dispatchMode = "ok";
        await expediteDispatch(generationId);
        // 新 Node 进程使用真实 Inngest SDK 将领取结果传给回环事件 API。
        const restart = await scanAfterRestart();
        expect(restart.stderr).toBe("");
        const recovered = JSON.parse(restart.stdout.trim());
        expect(recovered).toEqual([{ generationId, attempt: expect.stringMatching(/^\d+$/) }]);
        expect(queued).toHaveLength(mode === "ack_lost" ? 2 : 1);
        const recoveredEvent = queued.pop()!;
        expect(recoveredEvent.id).toBe(`makeup-initial-${generationId}-${recovered[0].attempt}`);
        const runId = randomUUID();
        expect(await processEvent(recoveredEvent, runId)).toMatchObject({ status: "done" });
        if (mode === "ack_lost") {
          const original = nextEvent();
          expect(original.id).toBe(`makeup-initial-${generationId}`);
          expect(await processEvent(original)).toEqual({ status: "done" });
        }
        expect(await accounting(generationId)).toMatchObject({ status: "done", pending: false, run: runId, delta: -1, consumed: 1 });
        expect(await boundaries.scan!({ step: steps() })).toEqual({ scheduled: 0 });
        console.info("首次投递恢复", { mode, generationId, recoveredEventId: recoveredEvent.id, finalStatus: "done" });
      }
      expect(await getBalance(userId)).toBe(previousBalance - 2);
    } finally {
      dispatchMode = "ok";
      vi.stubEnv("ENABLE_GENERATION", "1");
    }
  }, 25_000);

  it("两个获准任务争最后一分，只有一次扣分和一次写结果", async () => {
    const { deductCredits, getBalance } = await import("@/lib/credits");
    await deductCredits(userId, 2, "admin_adjust");
    expect(await getBalance(userId)).toBe(1);
    const uploadKey = await upload();
    const renderedUploadKey = await upload(renderedImage);
    const ids = await Promise.all(Array.from({ length: 2 }, async () => acceptedId(await submit(uploadKey, {
      mode: "virtual_try_on", renderedUploadKey, makeupConfig: tryOnConfig
    }))));
    const events = [nextEvent(), nextEvent()];
    const storeCount = objects.size;
    const completed = await Promise.all(events.map(event => processEvent(event)));
    expect(completed).toEqual(expect.arrayContaining([{ status: "failed" }, expect.objectContaining({ status: "done" })]));
    const rows = await Promise.all(ids.map(accounting));
    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: "failed", error: "insufficient_credits", delta: 0, consumed: 0 }),
      expect.objectContaining({ status: "done", delta: -1, consumed: 1 })
    ]));
    expect(await getBalance(userId)).toBe(0);
    expect(objects.size - storeCount).toBe(1);
    expect((await submit(uploadKey)).status).toBe(402);
    const [lots] = await fixture!`SELECT SUM(initial_amount)::int AS issued, SUM(remaining)::int AS remaining FROM credit_grants WHERE user_id=${userId}`;
    expect(lots).toEqual({ issued: 3, remaining: 0 });
    console.info("最后一分", { rows, lots });
  });

  it("原扣分的旧任务继续或退款，退款只恢复原批次且重放无二次退款", async () => {
    const { deductCredits, getBalance } = await import("@/lib/credits");
    const uploadKey = await upload();
    const renderedUploadKey = await upload(renderedImage);
    for (const reject of [false, true]) {
      const previousBalance = await getBalance(userId);
      const [legacy] = await fixture!`INSERT INTO generations (user_id, upload_key, style_id, mode, rendered_upload_key)
        VALUES (${userId}, ${uploadKey}, 'virtual-custom', 'virtual_try_on', ${renderedUploadKey}) RETURNING id`;
      await deductCredits(userId, 1, "generation", { type: "generation", id: legacy.id });
      const [original] = await fixture!`SELECT grant_id, remaining FROM credit_consumptions
        JOIN credit_grants ON credit_grants.id = grant_id WHERE ref_id=${legacy.id}`;
      moderationMode = reject ? "minor" : "ok";
      vi.stubEnv("DISABLE_GENERATION", "1");
      const event = { name: "makeup/generate.requested", data: { generationId: legacy.id } } as const;
      expect(await processEvent(event)).toMatchObject({ status: reject ? "refunded" : "done" });
      expect(await processEvent(event)).toMatchObject({ status: reject ? "refunded" : "done" });
      expect(await accounting(legacy.id)).toMatchObject({
        status: reject ? "refunded" : "done", delta: reject ? 0 : -1, consumed: 1, refunded: reject ? 1 : 0
      });
      expect(await getBalance(userId)).toBe(previousBalance - Number(!reject));
      expect(await fixture!`SELECT remaining FROM credit_grants WHERE id=${original.grant_id}`).toEqual([{ remaining: original.remaining + Number(reject) }]);
      console.info("历史扣分", { reject, generationId: legacy.id, grantId: original.grant_id, balance: await getBalance(userId) });
    }
    moderationMode = "ok";
    vi.stubEnv("DISABLE_GENERATION", "0");
  });

  it("供应商提交回执丢失与结果存储失败各保留原运行及原消费", async () => {
    const uploadKey = await upload();
    const generationId = await acceptedId(await submit(uploadKey));
    const count = providerCalls.filter(path => path === "POST /images").length;
    providerMode = "ack_lost";
    const initial = nextEvent(), initialRun = randomUUID();
    expect(await processEvent(initial, initialRun)).toMatchObject({ status: "awaiting_provider" });
    expect(await accounting(generationId)).toMatchObject({
      status: "running", error: "creative_submission_pending", pending: false, delta: -1, consumed: 1
    });
    expect(await failRun(initial, initialRun, "synthetic_submission_ack_lost")).toBe("awaiting_provider_reconciliation");
    expect(await boundaries.scan!({ step: steps() })).toEqual({ scheduled: 0 });

    const continuation = nextEvent();
    expect(continuation.data.imageResume?.taskId).toBeUndefined();
    recoverProviderTask = true;
    providerMode = "ok";
    resultReady = false;
    const step = steps(), run = randomUUID();
    await expect(processEvent(continuation, run, step)).rejects.toThrow("fetch_result_failed:503");
    expect(await failRun(continuation, run, "fetch_result_failed:503")).toBe("awaiting_result_storage");
    expect(await accounting(generationId)).toMatchObject({
      status: "running", error: "creative_result_pending", pending: false, delta: -1, consumed: 1
    });
    expect(await boundaries.scan!({ step: steps() })).toEqual({ scheduled: 0 });
    resultReady = true;
    expect(await processEvent(continuation, run, step)).toMatchObject({ status: "done" });
    expect(await accounting(generationId)).toMatchObject({ status: "done", delta: -1, consumed: 1, refunded: 0 });
    expect(providerCalls.filter(path => path === "POST /images")).toHaveLength(count + 1);
    const result = (await readGeneration(generationId)).body;
    expect(Buffer.from(await (await fetch(result.resultUrl)).arrayBuffer())).toEqual(image);
  });
});
