import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockDeductCredits = vi.fn();
const mockInngestSend = vi.fn();
const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn();
const mockUpdate = vi.fn();

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
  deductCredits: (...args: unknown[]) => mockDeductCredits(...args)
}));

vi.mock("@/inngest/client", () => ({
  inngest: { send: (...args: unknown[]) => mockInngestSend(...args) }
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: () => ({
      values: (...args: unknown[]) => {
        mockInsertValues(...args);
        return { returning: () => mockInsertReturning() };
      }
    }),
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

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockDeductCredits.mockReset();
  mockInngestSend.mockReset();
  mockInsertReturning.mockReset();
  mockInsertValues.mockReset();
  mockUpdate.mockReset();
  mockInsertReturning.mockResolvedValue([{ id: "gen_test" }]);
});

afterEach(() => {
  vi.resetModules();
});

describe("POST /api/makeup/generate", () => {
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
    const { InsufficientCreditsError } = await import("@/lib/credits");
    mockDeductCredits.mockRejectedValue(new InsufficientCreditsError());
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ uploadKey: "user_test/x.jpg", consent: true, styleId: "natural" })
    );
    const payload = await response.json();

    expect(response.status).toBe(402);
    expect(payload.code).toBe("insufficient_credits");
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  it("queues a generation and returns 202 on the happy path", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    mockDeductCredits.mockResolvedValue(undefined);
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
    expect(mockInngestSend).toHaveBeenCalledWith({
      name: "makeup/generate.requested",
      data: { generationId: "gen_test" }
    });
  });

  it("stores a normalized camera virtual try-on configuration", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
    mockDeductCredits.mockResolvedValue(undefined);
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
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "virtual_try_on",
        sourceMode: "camera",
        styleId: "virtual-custom",
        renderedUploadKey: "user_test/camera-rendered.png",
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
