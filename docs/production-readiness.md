# Production Readiness

## Environments

Preview, staging, and production must define the same required variable names, with provider sandbox keys in staging and live keys only in production.

Required for production:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ROUTER_CREATIVE_API_KEY`
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
- `DAILY_AI_SPEND_CAP_CENTS` (start the paid beta at `2000`, USD $20/day)
- `AI_GENERATION_ESTIMATE_CENTS` (start at `10` until real provider cost data replaces the estimate)
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`
- `DMCA_EMAIL`

Optional:

- `R2_PUBLIC_BASE_URL` when result files are exposed through a dedicated public CDN.
- `CREEM_API_BASE` only for a Creem test endpoint; omit it in production.
- `RESEND_API_KEY` and `EMAIL_FROM` when transactional email is enabled.

## Kill Switches

- `DISABLE_CHECKOUT=1` returns `checkout_disabled` from checkout.
- `DISABLE_GENERATION=1` returns `generation_disabled` from generation.
- `DAILY_AI_SPEND_CAP_CENTS` is enforced atomically before a generation job starts.
- 每次生成按 `AI_GENERATION_ESTIMATE_CENTS` 和创作中心实时模型价格的较大值预留预算。

## Storage Retention

Configure Cloudflare R2 lifecycle rules outside the app:

- Originals bucket: expire objects after 1 day.
- Results bucket: expire objects after 30 days for beta unless the user exports or deletes earlier.

## Launch Gates

- Apply `drizzle/0001_production_readiness.sql` before enabling checkout.
- Create exactly one Creem product: USD $8 one-time payment for 100 credits, then set `CREEM_PRODUCT_CREDITS_100`.
- Verify Creem test checkout success grants the correct 100-credit lot exactly once, including duplicate webhook delivery.
- Verify a Creem refund or dispute locates the original order and reverses it only while the complete purchased lot remains unused.
- Verify failed AI jobs refund one credit.
- Send a test Inngest failure alert before public traffic.
- Confirm the database daily AI spend cap rejects work after the configured limit.
- Configure the production domain in Supabase redirect URLs and set `NEXT_PUBLIC_SITE_URL` to the same HTTPS origin.
- Confirm support/privacy/DMCA inboxes receive mail.

## 图片模型迁移（2026-11-03）

当前通过 Hermes 同款创作中心公共接口生成图片，已移除 fal.ai。默认 `AI_IMAGE_MODEL=gpt-image-2`、`AI_IMAGE_QUALITY=1k`；可显式改为 `grok-imagine-image-2.0`，不自动切换模型。生产环境只读取标准环境变量，不依赖本机 Hermes。接口默认地址为 `https://api.router.team/api/public/creative-center`，可通过 `ROUTER_CREATIVE_BASE_URL` 覆盖。

上传的原人像作为单张参考图传给创作中心；提示词要求只调整妆容并保留身份。签名链接有效一小时，供应商会接收原图，隐私披露中已更新处理方。单次费用以 `/config` 为准；本次预检 GPT 1k 为 0.05 美元、Grok 1k 为 0.15 美元，不把此价格视为永久报价。

提交前保存历史快照和唯一提示词；通过数据库原子提交标记防止步骤重放重复 POST。提交响应不确定时只查历史恢复原任务；有编号后只查原任务。每轮最多 60 次查询，再发继续查询事件，避免单次 Inngest 执行耗尽步骤上限。明确失败才退款；若队列永久异常且数据库保留 `creative_submission_pending`，保持待核对，不自动退款或重新生成。已出图但下载或 R2 存储失败时使用 `creative_result_pending`，重放原调用只重试结果存储，不重生图片。提交标记与外部接口无法构成原子事务：在登记意图后、实际 POST 前中断时，可能需要人工核对并处理停留任务。

模型侧独立验收：`npm run check:image -- --submit`，首次提交前将状态保存到 `output/imagegen/smoke/state.json`，之后运行 `npm run check:image` 只恢复或查询同一任务。脚本使用仓库内 AI 虚拟人物，不依赖 R2；不能据此声明登录、数据库、审核、R2 或支付全链路通过。
