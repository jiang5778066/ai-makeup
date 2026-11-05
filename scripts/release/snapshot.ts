import { TARGET, validateRuntime } from "./preflight";
import { stable } from "../db/catalog";
export type RuntimeSnapshot = Readonly<Record<string, string>>;
export const snapshotRuntime = (input: unknown, sha: string): RuntimeSnapshot => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("未取得完整生产JSON配置");
  const entries = Object.entries(input);
  if (entries.some(([k, v]) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) || typeof v !== "string" || v.includes("\0") || /VERCEL_SENSITIVE_ENV_VALUE|sensitive_env_value_placeholder|\[SENSITIVE\]/i.test(v))) throw new Error("生产快照存在无效或不可读取配置");
  const runtime = { ...Object.fromEntries(entries) as Record<string, string>, NODE_ENV: "production", RELEASE_SHA: sha, RELEASE_PROJECT_ID: TARGET.project, VERCEL_GIT_COMMIT_SHA: sha };
  validateRuntime(runtime);
  return Object.freeze(runtime);
};
export const buildEnvironment = (runtime: RuntimeSnapshot = {}, parent: Record<string, string | undefined> = process.env): NodeJS.ProcessEnv => ({
  ...Object.fromEntries(["PATH", "HOME", "TMPDIR", "TEMP", "TMP", "SystemRoot", "SHELL", "LANG"].filter(key => parent[key] !== undefined).map(key => [key, parent[key]])),
  ...runtime,
  NODE_ENV: "production", CI: "1", VERCEL_ORG_ID: TARGET.team, VERCEL_PROJECT_ID: TARGET.project,
  VERCEL_TELEMETRY_DISABLED: "1", VERCEL_CLI_USE_NATIVE_BINARY: "0", NO_UPDATE_NOTIFIER: "1"
});
export const assertSameSnapshot = (first: RuntimeSnapshot, second: RuntimeSnapshot) => {
  if (stable(first) !== stable(second)) throw new Error("生产配置在构建后变化，停止并重新验证");
};
