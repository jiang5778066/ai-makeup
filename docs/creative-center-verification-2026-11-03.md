# 创作中心图片通道验收记录

2026-11-03，已用 Hermes 的 `router-creative-image` 协议替换 fal.ai PhotoMaker，默认模型为 `gpt-image-2`，支持通过 `AI_IMAGE_MODEL` 显式选择 `grok-imagine-image-2.0`。本次实际出图只验证 GPT，未提交 Grok 任务；视频技能只作为接口参考，没有新增视频业务。

## 真实单图结果

- 接口：`https://api.router.team/api/public/creative-center/images`。
- 模型 / 清晰度 / 比例 / 数量：`gpt-image-2` / `1k` / `2:3` / 1 张。
- 任务：`img_task_4f0c615a506f41f9ab2b9d5f8c7c2125`。
- 唯一请求：`makeup-smoke-100126dd-76e1-48cb-b140-6a08c74cabbd`。
- 提交意图时间：`2026-11-03T03:35:07.939Z`（北京时间 11:35:07）。
- 参考图：`public/images/makeup-demo/natural.webp`，仓库已有 AI 虚拟人物。
- 原图 SHA-256：`6c8d5d2e87f13105bea808b4796de24123ef300eecf9b299a8f692b7c83c1afe`。
- 提示词：只编辑妆容；玫瑰日常妆、55% 强度，保留人物身份、五官、肤色、表情、姿势、发型、衣着、构图、光线和背景，不增加文字。完整提示词保存在本地状态文件。
- 状态：`completed`；结果已下载，图片为 1024 × 1536 PNG，约 2 MB。
- 本地结果：`output/imagegen/smoke/result.png`。
- 原始结果：[妆容示意图](https://img.cxlsky.cn/image-results/446/2026/11/03/20261103113533-3562e27310ae4c049c3244230fb21b83.png)。
- `/config` 提交前报价为 5 美分；这是接口报价，未独立核对账单。

已目视对照原图：输出显示玫瑰粉色唇妆、柔和腮红和眼妆，人物、发型、黑色衣着及灰色背景基本保留。该图是 AI 虚拟人物的妆容示意，存在生成式细节变化，不能作为真实用户或特定化妆品的效果承诺。

再次运行 `npm run check:image`，直接恢复上述任务和本地结果，未重发付费请求。验收脚本在提交前独占保存意图，提交结果不确定时只核对历史；有任务编号后只查询原任务，下载失败只恢复下载。状态与图片文件均被 Git 忽略，密钥只保存在权限 0600 的 `.env.local`，生产实现不读取 Hermes 路径。

## 自动化验证

- `npm test`：29 个文件、88 项测试全部通过。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过，22 个静态页面生成完成。数据库与 Supabase 使用 CI 同款进程级占位变量，仅证明可构建；未把占位变量写入项目环境文件，未连接真实业务数据库。
- `git diff --check`：通过；本次凭证在 Git 跟踪及未忽略文件中均未检出。
- `npm audit --audit-level=high --registry=https://registry.npmjs.org`：未通过，现有依赖树报告 51 项漏洞（35 moderate、15 high、1 critical），涉及 Next.js、Inngest 及其传递依赖等；本次没有扩大到全仓依赖升级。默认 npm 镜像不提供审计端点，因此使用官方注册表核验。
- 已移除 `@fal-ai/client`、`fflate` 直接依赖与旧图片 ZIP 适配器。

测试覆盖了参考图提交、模型和清晰度检查、动态价格预算、提交不确定恢复、历史分页与歧义、原任务轮询、步骤重放、轮询上限后的继续事件、明确失败退款、不确定任务保留额度，以及 PNG/JPEG/WebP 结果格式处理。

## 验收边界与恢复

这次验证了真实模型侧参考图编辑。完整的登录、数据库、审核、R2、Inngest 托管执行与支付链路尚未真实联调，不能据此认定服务已达到生产可发布状态。

队列通过现有数据库字段保存提交意图，同一生成编号串行执行；供应商任务未确定时保留 `creative_submission_pending`，图片已完成但下载或存储失败时保留 `creative_result_pending`。两类任务都不能自动退款后重生，应恢复原 Inngest 调用或核对原任务。标记落库后、实际 POST 前中断时可能没有供应商任务，此时需要人工核对；不通过自动补发规避这一不确定性。
