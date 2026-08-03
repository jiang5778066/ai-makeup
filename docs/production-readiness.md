# 生产上线准备清单

## 环境配置

预览、测试和生产环境必须配置相同的必填变量名。测试环境使用各服务商的沙箱密钥，只有生产环境可以使用正式密钥。

生产环境必填：

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FAL_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_ORIGINALS`
- `R2_BUCKET_RESULTS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`
- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_PRODUCT_CREDITS_100`
- `DAILY_AI_SPEND_CAP_CENTS`（付费 Beta 初始设置为 `2000`，即每天 20 美元）
- `AI_GENERATION_ESTIMATE_CENTS`（初始设置为 `7`；GPT Image 2 中等质量的常见尺寸目前每次约 4.3～6.1 美分）
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`
- `DMCA_EMAIL`

可选：

- `R2_PUBLIC_BASE_URL`：通过独立公共 CDN 提供结果文件时配置。
- `CREEM_API_BASE`：仅用于 Creem 测试接口，生产环境不要配置。
- `RESEND_API_KEY` 和 `EMAIL_FROM`：启用事务邮件时配置。

部署前，加载准备发布的生产环境变量并运行：

```bash
npm run launch:check
```

该命令只报告缺失或仍使用占位值的变量名，不会打印密钥内容。

## 紧急开关

- `DISABLE_CHECKOUT=1`：关闭支付入口，结账接口返回 `checkout_disabled`。
- `DISABLE_GENERATION=1`：关闭图片生成，生成接口返回 `generation_disabled`。
- `DAILY_AI_SPEND_CAP_CENTS`：生成任务启动前，以原子方式检查并占用当日 AI 预算。
- `AI_GENERATION_ESTIMATE_CENTS`：每次生成任务从当日预算中预留的金额。

## 文件保留策略

需要在应用之外配置 Cloudflare R2 生命周期规则：

- 原图桶：对象保存 1 天后自动删除。
- 结果图桶：Beta 阶段对象保存 30 天后自动删除；用户提前导出或删除的情况除外。

## 上线验收项

- 使用完整、真实的生产环境变量运行 `npm run launch:check`，要求退出码为 0。
- 开放支付前执行 `drizzle/0001_production_readiness.sql` 数据库迁移。
- Creem 只创建一个产品：一次性支付 8 美元购买 100 credits，并将产品 ID 配置到 `CREEM_PRODUCT_CREDITS_100`。
- 在 Creem 测试环境完成一次支付，确认只发放一次 100 credits；重复投递同一个 webhook 也不能重复发放。
- 验证 Creem 退款或争议事件可以找到原订单，并且只有完整的 100 credits 额度包尚未使用时才自动扣回；其他情况进入人工审核。
- 验证 AI 生成任务失败后自动退回 1 credit。
- 使用上传的自拍真实调用一次 `openai/gpt-image-2/edit`，确认人物身份保持、结果可下载，并根据实际账单更新 `AI_GENERATION_ESTIMATE_CENTS`。
- 开放公共支付前，根据最新 Creem 手续费和 fal 账单确认 8 美元套餐的利润。按当前公开价格估算，Creem 扣费后净收入约 7.29 美元；100 次中等质量 GPT Image 2 生成成本约 4.30～6.10 美元，尚未计算重试和基础设施成本。
- 开放公共流量前，发送一次 Inngest 失败告警测试。
- 验证超过配置的每日 AI 预算后，数据库会拒绝新的生成任务。
- 在 Supabase 回调地址中配置生产域名，并确保 `NEXT_PUBLIC_SITE_URL` 使用相同的 HTTPS 源。
- 确认客服、隐私和 DMCA 邮箱都能正常收信。
