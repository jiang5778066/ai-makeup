import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { TOOL_DIRECTORY } from "./paths";
import { TARGET } from "./preflight";
import { ApiFailure } from "./previous";
export class NativeGateFailure extends Error {
  constructor(readonly code: string, message: string) { super(message); }
}
export const API_LIMITS = { timeoutMs: 20_000, maxOutputBytes: 2_000_000 };
export const assertOfficialCli = async () => {
  const pkg = JSON.parse(await readFile(resolve(TOOL_DIRECTORY, "node_modules/vercel/package.json"), "utf8"));
  if (pkg.name !== "vercel" || pkg.version !== "65.11.0" || process.versions.node.split(".")[0] !== "24") throw new Error("需要Node24及固定官方Vercel CLI65.11.0");
};
export const apiPath = (path: string) => {
  const permitted = [
    `/v9/projects/${TARGET.project}`, `/v4/aliases/${TARGET.domain}`,
    `/v3/env/pull/${TARGET.project}/production?source=vercel-cli:pull`,
    `/v10/projects/${TARGET.project}/env?decrypt=false`
  ];
  const envRecord = new RegExp(`^/v1/projects/${TARGET.project}/env/[A-Za-z0-9_-]+\\?decrypt=true$`);
  const deployment = /^\/v13\/deployments\/(?:dpl_[a-zA-Z0-9]+|[a-z0-9-]+\.vercel\.app)$/;
  if (!permitted.includes(path) && !envRecord.test(path) && !deployment.test(path)) throw new Error("Vercel API路径不在固定允许范围");
  return `${path}${path.includes("?") ? "&" : "?"}teamId=${TARGET.team}`;
};
const json = <T>(body: string): T => {
  try {
    const value = JSON.parse(body);
    if (!value || typeof value !== "object" || value.error) throw new Error();
    return value as T;
  } catch { throw new Error("Vercel响应不是有效成功JSON"); }
};
export const parseNativeResponse = <T>(output: string): T => {
  if (Buffer.byteLength(output) > API_LIMITS.maxOutputBytes) throw new Error("Vercel响应超过上限");
  const match = /^HTTP (\d{3}) [^\r\n]*\r?\n([\s\S]*?)\r?\n\r?\n([\s\S]*)$/.exec(output);
  if (!match) throw new Error("原生API的HTTP状态未知");
  const status = Number(match[1]);
  if (status < 200 || status >= 300) throw new ApiFailure(status);
  if (!/^content-type:\s*application\/json(?:\s*;[^\r\n]*)?\s*$/im.test(match[2])) throw new Error("Vercel响应不是JSON类型");
  return json<T>(match[3]);
};
export const tokenResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new ApiFailure(response.status);
  if (!/^application\/json(?:\s*;.*)?$/i.test(response.headers.get("content-type") ?? "")) throw new Error("Vercel响应不是JSON类型");
  const reader = response.body?.getReader(); if (!reader) throw new Error("Vercel响应为空");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > API_LIMITS.maxOutputBytes) throw new Error("Vercel响应超过上限"); chunks.push(value); }
    return json<T>(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
  } finally { await reader.cancel().catch(() => {}); }
};
