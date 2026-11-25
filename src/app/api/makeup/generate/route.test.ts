import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const mockGetCurrentUser = vi.fn();
const mockDeductCredits = vi.fn();
const mockBalance = vi.fn();
const mockInngestSend = vi.fn();
const mockExecute = vi.fn();
const mockUpdate = vi.fn();
const mockUploadExists = vi.fn();

vi.mock("@/lib/account-data-lock", () => ({ lockAccountData: vi.fn() }));
vi.mock("@/lib/storage", async (original) => ({
  ...await original<typeof import("@/lib/storage")>(),
  legacyUploadExists: (...args: unknown[]) => mockUploadExists(...args)
}));

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/credits", () => ({
  InsufficientCreditsError: class InsufficientCreditsError extends Error {
    constructor() {
      super("insufficient_credits");
      this.name = "InsufficientCreditsError";
    }
  },
  deductCredits: (...args: unknown[]) => mockDeductCredits(...args),
  getBalance: (...args: unknown[]) => mockBalance(...args)
}));

vi.mock("@/inngest/client", () => ({
  inngest: { send: (...args: unknown[]) => mockInngestSend(...args) }
}));

vi.mock("@/db/client", () => ({
  db: {
    transaction: (operation: (tx: { execute: typeof mockExecute }) => unknown) => operation({ execute: mockExecute }),
    update: () => ({ set: () => ({ where: () => mockUpdate() }) })
  }
}));

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/makeup/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
}

function insertedValues() {
  expect(mockExecute).toHaveBeenCalledTimes(2);
  expect(new PgDialect().sqlToQuery(mockExecute.mock.calls[1][0]).sql).toContain("UPDATE generations SET dispatch_due_at");
  // 编译真实helper交给数据库的SQL，按列与占位符对应关系核验绑定值。
  const query = new PgDialect().sqlToQuery(mockExecute.mock.calls[0][0]);
  expect(query.sql).not.toContain("deleted_at");
  const insert = /^insert into "generations" \((.+)\) values \((.+)\) returning "generations"\."id"$/.exec(query.sql);
  expect(insert).not.toBeNull();
  const columns = insert![1].split(", ").map(name => name.replaceAll('"', ""));
  const placeholders = insert![2].split(", ");
  expect(placeholders).toEqual(query.params.map((_, index) => `$${index + 1}`));
  expect(columns).toHaveLength(query.params.length);
  expect(query.sql).not.toContain("'");
  return Object.fromEntries(columns.map((column, index) => [column, query.params[index]]));
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockDeductCredits.mockReset();
  mockBalance.mockReset().mockResolvedValue(3);
  mockInngestSend.mockReset();
  mockExecute.mockReset();
  mockUpdate.mockReset();
  mockUploadExists.mockReset().mockResolvedValue(true);
  mockExecute.mockResolvedValue([{ id: "gen_test" }]);
  vi.stubEnv("ENABLE_GENERATION", "1");
  vi.stubEnv("DISABLE_GENERATION", "0");
});

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("POST /api/makeup/generate", () => {
  it.each([[undefined, undefined], ["1", "1"]])("未启用生成时在读取账号或存储前拒绝新任务（%s / %s）", async (enable, disable) => {
    vi.stubEnv("ENABLE_GENERATION", enable);
    vi.stubEnv("DISABLE_GENERATION", disable);
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ uploadKey: "user_test/x.jpg", consent: true, styleId: "natural" })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.code).toBe("generation_disabled");
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockDeductCredits).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ uploadKey: "u/x.jpg", consent: true, styleId: "natural" })
    );

    expect(response.status).toBe(401);
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  it("rejects when uploadKey is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ consent: true, styleId: "natural" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("missing_upload");
  });

  it("rejects when consent flag is not set", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ uploadKey: "user_test/x.jpg", styleId: "natural" })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("consent_required");
  });

  it("returns 402 when credits are insufficient", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    mockBalance.mockResolvedValue(0);
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ uploadKey: "user_test/x.jpg", consent: true, styleId: "natural" })
    );
    const payload = await response.json();

    expect(response.status).toBe(402);
    expect(payload.code).toBe("insufficient_credits");
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  it("首次投递失败时仍用 202 返回已持久化的原任务", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    mockInngestSend.mockRejectedValueOnce(new Error("synthetic_enqueue_failure"));
    const { POST } = await import("./route");
    const response = await POST(jsonRequest({ uploadKey: "user_test/x.jpg", consent: true }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ generationId: "gen_test", status: "queued" });
    expect(mockDeductCredits).not.toHaveBeenCalled();
  });

  it("queues a generation and returns 202 on the happy path", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({
        uploadKey: "user_test/x.jpg",
        consent: true,
        styleId: "douyin",
        intensity: 72,
        locale: "zh-CN"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.generationId).toBe("gen_test");
    expect(payload.status).toBe("queued");
    expect(insertedValues()).toMatchObject({
      user_id: "user_test", upload_key: "user_test/x.jpg", style_id: "douyin",
      intensity: 72, locale: "zh-CN", status: "queued"
    });
    expect(mockInngestSend).toHaveBeenCalledWith({
      id: "makeup-initial-gen_test",
      name: "makeup/generate.requested",
      data: { generationId: "gen_test" }
    });
  });

  it("stores a normalized camera virtual try-on configuration", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({
        uploadKey: "user_test/camera.jpg",
        renderedUploadKey: "user_test/camera-rendered.png",
        consent: true,
        mode: "virtual_try_on",
        sourceMode: "camera",
        makeupConfig: {
          lipstick: {
            enabled: true,
            presetId: "classic-red",
            color: "#C93445",
            intensity: 75
          }
        }
      })
    );

    expect(response.status).toBe(202);
    const values = insertedValues();
    expect(values).toMatchObject({
      mode: "virtual_try_on",
      source_mode: "camera",
      style_id: "virtual-custom",
      rendered_upload_key: "user_test/camera-rendered.png"
    });
    expect(JSON.parse(values.makeup_config as string)).toEqual({
      lipstick: {
        enabled: true,
        presetId: "classic-red",
        color: "#c93445",
        intensity: 75
      }
    });
  });

  it("rejects a virtual export without a rendered upload", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({
        uploadKey: "user_test/camera.jpg",
        consent: true,
        mode: "virtual_try_on",
        makeupConfig: {
          lipstick: {
            enabled: true,
            presetId: "classic-red",
            color: "#c93445",
            intensity: 75
          }
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("missing_rendered_upload");
    expect(mockDeductCredits).not.toHaveBeenCalled();
  });
});
