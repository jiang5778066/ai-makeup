import { TARGET } from "./preflight";
export const trustedHost = (host: string) => {
  if (!/^[a-z0-9][a-z0-9-]*\.vercel\.app$/.test(host)) throw new Error("部署域名不受信");
  return host;
};
export const checkHealth = async (host: string, expected: { sha: string; project: string; deployment: string }, request: typeof fetch = fetch, bypass?: string) => {
  trustedHost(host); trustedHost(expected.deployment);
  if (expected.project !== TARGET.project) throw new Error("项目身份不匹配");
  const response = await request(`https://${host}/api/health`, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(15000), headers: bypass ? { "x-vercel-protection-bypass": bypass } : {} });
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("application/json")) throw new Error("健康响应无效");
  const body = await response.json();
  if (body.status !== "ready" || body.sha !== expected.sha || body.project !== expected.project || body.deployment !== expected.deployment) throw new Error("部署身份或就绪状态不匹配");
};
