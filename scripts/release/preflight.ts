import {validateMediaGenerationProfile} from './media-profile';
import { normalizeDatabase } from "../db/connection";
export const TARGET = {
  repository: "jiang5778066/ai-makeup", project: "prj_R5qo7SxNBBU9DAFuGnvivXasvTZj",
  team: "team_5KcXe4uGdZkKT9wgSugRSBly", domain: "www.framekoi.com", supabaseRef: "svlhstoiirtsutmmanrn"
} as const;
export type ReleaseConfig = { sha: string; repository: string; ref: string; workflowRef: string; project: string; team: string; domain: string; supabaseRef: string; token: string; migrationUrl: string; authMode?: "token" | "native-cli"; source?: "ci" | "local"; migrationSource?: "environment" | "vercel-production" | "vercel-production-session"; bootstrap?: boolean; bypass?: string };
export const preflight = (c: ReleaseConfig) => {
  if (!/^[a-f0-9]{40}$/.test(c.sha)) throw new Error("需要完整小写提交 SHA");
  const native = c.authMode === "native-cli";
  if (c.authMode !== undefined && !["token", "native-cli"].includes(c.authMode)) throw new Error("认证模式无效");
  if (c.source !== undefined && !["ci", "local"].includes(c.source)) throw new Error("来源模式无效");
  if (native ? c.source !== "local" || !!c.workflowRef || !!c.token : c.source === "local" || !c.token?.trim()) throw new Error("认证与来源模式混合或缺身份");
  if (c.repository !== TARGET.repository || c.ref !== "refs/heads/main" || (!native && c.workflowRef !== `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`)) throw new Error("运行来源不受信");
  if (native && !c.migrationSource) throw new Error("原生渠道必须显式选择迁移来源");
  if (native && c.bootstrap) throw new Error("原生渠道禁止首次模式");
  for (const key of ["project", "team", "domain", "supabaseRef"] as const) if (c[key] !== TARGET[key]) throw new Error("目标配置不匹配");
  if (c.migrationSource !== undefined && !["environment", "vercel-production", "vercel-production-session"].includes(c.migrationSource)) throw new Error("迁移配置来源无效");
  if (c.migrationSource === "vercel-production" || c.migrationSource === "vercel-production-session") {
    if (!native || c.migrationUrl) throw new Error("迁移来源混合或未经显式原生选择");
  } else {
    if (!c.migrationUrl?.trim()) throw new Error("缺少发布配置");
    normalizeDatabase(c.migrationUrl, "migration");
  }
};
export const runtimeRequired = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SITE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_ORIGINALS", "R2_BUCKET_RESULTS", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "ROUTER_CREATIVE_API_KEY", "INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY", "CREEM_API_KEY", "CREEM_WEBHOOK_SECRET", "CREEM_PRODUCT_CREDITS_100"] as const;
export const validateRuntime = (env: Record<string, string | undefined>) => {
  if (env.RELEASE_PROFILE && !["full", "website-db", "media-generation"].includes(env.RELEASE_PROFILE)) throw new Error("发布范围无效");
  if (env.RELEASE_PROFILE === "website-db" && (
    env.MEDIA_CREATE_ENABLED === "1" ||
    env.ENABLE_GENERATION === "1" ||
    env.ENABLE_CHECKOUT === "1" ||
    env.DISABLE_CHECKOUT !== "1" ||
    env.DISABLE_GENERATION !== "1"
  )) throw new Error("网站数据库发布必须保持生成与收费关闭");
  const required = ["website-db", "media-generation"].includes(env.RELEASE_PROFILE??"") ? runtimeRequired.slice(0, 4) : runtimeRequired;
  for (const key of required) if (!env[key]?.trim() || /placeholder|your[_-]|example\./i.test(env[key]!)) throw new Error(`运行环境缺少有效配置：${key}`);
  if (env.NEXT_PUBLIC_SUPABASE_URL !== `https://${TARGET.supabaseRef}.supabase.co` || env.NEXT_PUBLIC_SITE_URL !== `https://${TARGET.domain}`) throw new Error("运行环境目标不匹配");
  normalizeDatabase(env.DATABASE_URL!, "runtime");
  // 公开host会被客户端构建内联，不能等部署后才发现参考输入无法上传。
  if(env.MEDIA_CREATE_ENABLED === '1'){
    let media: {creationEnabled?:unknown;storageBackend?:unknown;modes?:Record<string,unknown>};
    try{media=JSON.parse(env.MEDIA_RUNTIME_CONFIG??'{}')}catch{throw new Error('媒体运行配置无效')}
    if(media?.creationEnabled===true&&media.storageBackend==='r2'&&(media.modes?.image_to_image||media.modes?.image_to_video)){
      const account=env.R2_ACCOUNT_ID??'',bucket=env.R2_BUCKET_ORIGINALS??'';
      // 此处仅接收R2规范bucket名；真实SDK对这类bucket采用准确的虚拟主机地址。
      if(!/^[a-f0-9]{32}$/.test(account)||!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)||env.NEXT_PUBLIC_MEDIA_UPLOAD_HOST!==`${bucket}.${account}.r2.cloudflarestorage.com`)throw new Error('R2上传host缺失或与准确账号及原图bucket不匹配');
    }
  }
  if(env.RELEASE_PROFILE === "media-generation")validateMediaGenerationProfile(env,TARGET);
};
