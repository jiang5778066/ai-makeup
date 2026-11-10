import { expect, it, vi } from "vitest";
import { downloadCreation } from "./platform-creations-download";
import type { CreationDTO } from "./platform-creations-types";
it("下载失败仅重取原作品链接；第二次真实Blob交给保存器，不提交生成", async () => {
  const item = { id: "makeup:original", mediaType: "image", status: "done", result: { url: "https://storage.invalid/a.png", mimeType: "image/png", expiresAt: null } } as CreationDTO;
  const read = vi.fn().mockResolvedValue(item); const save = vi.fn(); const fetcher = vi.fn().mockResolvedValueOnce(new Response("expired", { status: 403 })).mockResolvedValueOnce(new Response(new Blob(["fixture"], { type: "image/png" }), { headers: { "content-type": "image/png" } }));
  const signal = new AbortController().signal;
  await expect(downloadCreation(item.id, read, signal, save, fetcher)).rejects.toThrow(); await downloadCreation(item.id, read, signal, save, fetcher);
  expect(read.mock.calls.map(call => call[0])).toEqual([item.id, item.id]); expect(fetcher.mock.calls.every(call => call[1].method === "GET")).toBe(true); expect(save.mock.calls[0][0].type).toBe("image/png"); expect(save.mock.calls[0][0].size).toBeGreaterThan(0); expect(save.mock.calls[0][1]).toBe("makeup-original.png");
});
