const required = [
  "NEXT_PUBLIC_SITE_URL",
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "FAL_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_ORIGINALS",
  "R2_BUCKET_RESULTS",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "CREEM_API_KEY",
  "CREEM_WEBHOOK_SECRET",
  "CREEM_PRODUCT_CREDITS_100",
  "DAILY_AI_SPEND_CAP_CENTS",
  "AI_GENERATION_ESTIMATE_CENTS",
  "SUPPORT_EMAIL",
  "PRIVACY_EMAIL",
  "DMCA_EMAIL"
];

const placeholderPattern = /YOUR_|yourdomain|example\.com|example\.supabase|placeholder|\[PASSWORD\]|localhost/i;
const issues = [];

for (const name of required) {
  const value = process.env[name]?.trim();
  if (!value) {
    issues.push(`${name}：未配置`);
  } else if (placeholderPattern.test(value)) {
    issues.push(`${name}：仍在使用占位值`);
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (siteUrl && !siteUrl.startsWith("https://")) {
  issues.push("NEXT_PUBLIC_SITE_URL：生产环境必须使用 https://");
}

for (const name of ["DAILY_AI_SPEND_CAP_CENTS", "AI_GENERATION_ESTIMATE_CENTS"]) {
  if (!process.env[name]?.trim()) continue;
  const value = Number(process.env[name]);
  if (!Number.isInteger(value) || value <= 0) {
    issues.push(`${name}：必须是正整数`);
  }
}

if (issues.length > 0) {
  console.error("付费 Beta 上线配置尚未就绪：");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`付费 Beta 上线配置检查通过（共 ${required.length} 个必填变量）。`);
}
