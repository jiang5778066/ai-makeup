// @vitest-environment node
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import type { S3ClientConfig } from "@aws-sdk/client-s3";

const fixture = vi.hoisted(() => ({ endpoint: "" }));
vi.mock("@aws-sdk/client-s3", async (load) => {
  const sdk = await load<typeof import("@aws-sdk/client-s3")>();
  return {
    ...sdk,
    S3Client: class extends sdk.S3Client {
      constructor(config: S3ClientConfig) {
        super({ ...config, endpoint: fixture.endpoint, forcePathStyle: true });
      }
    }
  };
});

import { legacyUploadExists, R2_BUCKET_ORIGINALS } from "./storage";

const requests: string[] = [];
const server = createServer((request, response) => {
  const path = new URL(request.url!, "http://127.0.0.1").pathname;
  requests.push(`${request.method} ${path} ${request.headers.range}`);
  const object = path.split("/").at(-1);
  if (object === "present") {
    response.writeHead(206, { "Content-Range": "bytes 0-0/8", "Content-Length": "1" }).end("x");
  } else if (object === "missing" || object === "bucket") {
    response.writeHead(404, { "Content-Type": "application/xml" }).end(`<Error><Code>${object === "missing" ? "NoSuchKey" : "NoSuchBucket"}</Code></Error>`);
  } else if (object === "plain404") {
    response.writeHead(404).end();
  } else if (object === "forbidden") {
    response.writeHead(403).end();
  } else if (object === "unavailable") {
    response.writeHead(503, { "Retry-After": "120" }).end();
  } else if (object === "stalled-body") {
    response.writeHead(206, { "Content-Range": "bytes 0-0/8", "Content-Length": "1" }).flushHeaders();
  } else if (object === "ignored-range") {
    response.writeHead(200, { "Content-Length": "8" }).flushHeaders();
  }
});

beforeAll(async () => {
  vi.stubEnv("R2_ACCOUNT_ID", "fixture");
  vi.stubEnv("R2_ACCESS_KEY_ID", "fixture");
  vi.stubEnv("R2_SECRET_ACCESS_KEY", "fixture");
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  fixture.endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.close();
  server.closeAllConnections();
  await once(server, "close");
  vi.unstubAllEnvs();
});

it("原生 R2 查询只读取原图首字节，并区分对象缺失、桶不存在和服务错误", async () => {
  const deadline = AbortSignal.timeout(1500);
  await expect(legacyUploadExists("owner/present", deadline)).resolves.toBe(true);
  await expect(legacyUploadExists("owner/missing", deadline)).resolves.toBe(false);
  await expect(legacyUploadExists("owner/bucket", deadline)).rejects.toMatchObject({ name: "NoSuchBucket", $metadata: { httpStatusCode: 404 } });
  await expect(legacyUploadExists("owner/plain404", deadline)).rejects.toMatchObject({ $metadata: { httpStatusCode: 404 } });
  await expect(legacyUploadExists("owner/forbidden", deadline)).rejects.toMatchObject({ $metadata: { httpStatusCode: 403 } });
  await expect(legacyUploadExists("owner/unavailable", deadline)).rejects.toMatchObject({ $metadata: { httpStatusCode: 503, attempts: 1 } });
  expect(requests).toEqual(["present", "missing", "bucket", "plain404", "forbidden", "unavailable"].map((key) => `GET /${R2_BUCKET_ORIGINALS}/owner/${key} bytes=0-0`));
});

it("本地对象服务不响应时，原生 SDK 取消请求", async () => {
  const deadline = AbortSignal.timeout(300);
  await expect(legacyUploadExists("owner/timeout", deadline)).rejects.toMatchObject({ name: "AbortError" });
  expect(deadline.aborted).toBe(true);
  expect(requests.filter((request) => request.includes("/timeout "))).toHaveLength(1);
});

it("响应体超时会取消读取，忽略 Range 的响应会立即关闭", async () => {
  const deadline = AbortSignal.timeout(300);
  await expect(legacyUploadExists("owner/stalled-body", deadline)).rejects.toThrow();
  expect(deadline.aborted).toBe(true);
  expect(requests.filter((request) => request.includes("/stalled-body "))).toHaveLength(1);

  const rangeDeadline = AbortSignal.timeout(1500);
  await expect(legacyUploadExists("owner/ignored-range", rangeDeadline)).rejects.toThrow("legacy_upload_read_failed");
  expect(rangeDeadline.aborted).toBe(false);
});
