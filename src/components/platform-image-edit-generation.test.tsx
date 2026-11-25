import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PlatformImageEditWorkspace } from "./platform-image-edit-workspace";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const inputId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const uploadHost = "fixtures.invalid";
const objectKey = `media/staging/${userId}/${inputId}`;
const uploadUrl = `https://${uploadHost}/${objectKey}?X-Amz-Expires=60`;

vi.mock("@/lib/platform-account-session", () => ({
  usePlatformAccount: () => ({ status: "signed_in", epoch: 1, user: { id: userId, email: null } }),
  getPlatformAccountEpoch: () => 1,
  expirePlatformAccount: vi.fn(),
}));
vi.mock("./use-platform-url", async () => {
  const { useSyncExternalStore } = await import("react");
  const subscribe = (listener: () => void) => {
    window.addEventListener("platform:navigation", listener);
    return () => window.removeEventListener("platform:navigation", listener);
  };
  return {
    usePlatformUrl: (serverPath: string) => useSyncExternalStore(subscribe,
      () => window.location.pathname + window.location.search + window.location.hash, () => serverPath),
  };
});
vi.mock("@/lib/platform-generator-upload", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/platform-generator-upload")>(),
  decodeLocalPreview: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  sessionStorage.clear();
  vi.stubEnv("NEXT_PUBLIC_MEDIA_UPLOAD_HOST", uploadHost);
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = (file: File) => `blob:${file.name}`;
    static revokeObjectURL = vi.fn();
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each([
  ["/image-style-converter", /Pixel art/, /crisp pixel clusters/, /Clay model/, /sculpted clay forms/],
  ["/image-effects/old-photo-restoration", /Recover faded tones/, /faded contrast/, /Colorize a black-and-white photo/, /restrained colors/],
  ["/image-effects/ai-age-progression", /Child \(around 10\)/, /age-related appearance.*Child/, /Advanced age/, /age-related appearance.*Advanced age/],
  ["/image-effects/ai-hair-color-changer", /Rose pink/, /only the hair color.*Rose pink/, /Copper red/, /only the hair color.*Copper red/],
  ["/image-effects/ai-hair-style-changer", /Chin-length bob/, /only the hairstyle.*Chin-length bob/, /Long waves/, /only the hairstyle.*Long waves/],
] as const)("%s 重选后重新同意并报价，确认只提交新选项一次", async (path, firstOption, firstPrompt, secondOption, secondPrompt) => {
  const requests: { path: string; method?: string; body?: RequestInit["body"]; headers?: HeadersInit }[] = [];
  const searchParams = new URLSearchParams("tag=a&tag=b");
  const response = (body: unknown) => new Response(JSON.stringify(body));
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    requests.push({ path, method: init?.method, body: init?.body, headers: init?.headers });
    switch (path) {
      case "/api/media/capabilities":
        return response({ capabilities: [{ model: "gpt-image-2", mode: "image_to_image", enabled: true, parameters: { quality: ["1k"], size: ["2:3"], n: [1] } }] });
      case "/api/media/inputs/sign":
        return response({ version: 2, backend: "r2", method: "PUT", uploadUrl, requiredHeaders: { "Content-Type": "image/png" },
          expiresAt: new Date(Date.now() + 60000).toISOString(), inputId, maxBytes: 8388608, objectKey });
      case uploadUrl:
        return response({});
      case `/api/media/inputs/${inputId}/complete`:
        return response({ inputId, status: "ready" });
      case "/api/media/quotes":
        return response({ quoteToken: "fixture-quote", credits: 3, expiresAt: new Date(Date.now() + 60000).toISOString() });
      case "/api/media/tasks":
        return response({ taskId: userId, status: "done", creditState: "settled" });
      default:
        throw new Error(`非预期的本地替身调用 ${path}`);
    }
  }));
  window.history.replaceState(null, "", path + "?" + searchParams);
  render(<PlatformImageEditWorkspace path={path} locale="en" initialQuery={searchParams.toString()}/>);
  fireEvent.click(screen.getByRole("radio", { name: firstOption }));
  const file = new File(["synthetic image"], "fixture.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Image file"), { target: { files: [file] } });
  await screen.findByAltText("fixture.png");
  expect(requests.every(request => request.path === "/api/media/capabilities")).toBe(true);

  async function requestQuote() {
    fireEvent.click(screen.getByRole("button", { name: "Use these site settings" }));
    fireEvent.click(screen.getByRole("checkbox"));
    const quote = screen.getByRole("button", { name: "Get quote" });
    await waitFor(() => expect(quote).toBeEnabled());
    fireEvent.click(quote);
    return screen.findByRole("button", { name: "Confirm 3 credits" });
  }

  await requestQuote();
  expect(requests.at(-1)?.path).toBe("/api/media/quotes");
  const firstRequest = JSON.parse(String(requests.at(-1)?.body));
  expect(firstRequest.prompt).toMatch(firstPrompt);
  fireEvent.click(screen.getByRole("radio", { name: secondOption }));
  expect(screen.queryByRole("button", { name: "Confirm 3 credits" })).not.toBeInTheDocument();
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.getByRole("button", { name: "Use these site settings" })).toBeInTheDocument();
  const confirm = await requestQuote();
  const quoteRequest = JSON.parse(String(requests.at(-1)?.body));
  expect(quoteRequest).toMatchObject({ model: "gpt-image-2", mode: "image_to_image", inputIds: [inputId],
    parameters: { quality: "1k", size: "2:3", n: 1 }, prompt: screen.getByLabelText("Edit instructions for this request").textContent });
  expect(quoteRequest.prompt).toMatch(secondPrompt);
  expect(requests.filter(request => request.method !== "GET").map(request => request.path)).toEqual(
    Array.from({ length: 2 }).flatMap(() => ["/api/media/inputs/sign", uploadUrl, `/api/media/inputs/${inputId}/complete`, "/api/media/quotes"]),
  );
  fireEvent.click(confirm);
  await screen.findByText("Image complete.");
  const tasks = requests.filter(request => request.path === "/api/media/tasks");
  expect(tasks).toHaveLength(1);
  expect(new Headers(tasks[0].headers).get("Idempotency-Key")).toMatch(/^[0-9a-f-]+$/);
  expect(JSON.parse(String(tasks[0].body))).toEqual({ ...quoteRequest, quoteToken: "fixture-quote" });
});
