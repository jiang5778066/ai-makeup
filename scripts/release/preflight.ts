import { normalizeDatabase } from "../db/connection";
export const TARGET = {
  repository: "jiang5778066/ai-makeup", project: "prj_R5qo7SxNBBU9DAFuGnvivXasvTZj",
  team: "team_5KcXe4uGdZkKT9wgSugRSBly", domain: "ai-makeup-rosy.vercel.app", supabaseRef: "svlhstoiirtsutmmanrn"
} as const;
export type ReleaseConfig = { sha: string; repository: string; ref: string; workflowRef: string; project: string; team: string; domain: string; supabaseRef: string; token: string; migrationUrl: string; bootstrap?: boolean; bypass?: string };
export const preflight = (c: ReleaseConfig) => {
  if (!/^[a-f0-9]{40}$/.test(c.sha)) throw new Error("需要完整小写提交 SHA");
  if (c.repository !== TARGET.repository || c.ref !== "refs/heads/main" || c.workflowRef !== `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`) throw new Error("运行来源不受信");
  for (const key of ["project", "team", "domain", "supabaseRef"] as const) if (c[key] !== TARGET[key]) throw new Error("目标配置不匹配");
  if (!c.token?.trim() || !c.migrationUrl?.trim()) throw new Error("缺少发布配置");
  normalizeDatabase(c.migrationUrl, "migration");
};
export const runtimeRequired = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SITE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_ORIGINALS", "R2_BUCKET_RESULTS", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "ROUTER_CREATIVE_API_KEY", "INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY", "CREEM_API_KEY", "CREEM_WEBHOOK_SECRET", "CREEM_PRODUCT_CREDITS_100"] as const;
export const validateRuntime = (env: Record<string, string | undefined>) => {
  if (env.RELEASE_PROFILE && !["full", "website-db"].includes(env.RELEASE_PROFILE)) throw new Error("发布范围无效");
  const required = env.RELEASE_PROFILE === "website-db" ? runtimeRequired.slice(0, 4) : runtimeRequired;
  for (const key of required) if (!env[key]?.trim() || /placeholder|your[_-]|example\./i.test(env[key]!)) throw new Error(`运行环境缺少有效配置：${key}`);
  if (env.NEXT_PUBLIC_SUPABASE_URL !== `https://${TARGET.supabaseRef}.supabase.co` || env.NEXT_PUBLIC_SITE_URL !== `https://${TARGET.domain}`) throw new Error("运行环境目标不匹配");
  normalizeDatabase(env.DATABASE_URL!, "runtime");
};
