# 创作中心图片通道实施计划

目标：默认使用 GPT Image 2，支持显式配置 Grok，完成 fal.ai 替换及一次真实图片编辑验收。

架构：创作中心 HTTP 客户端处理配置、提交和查询；任务编排使用可注入的持久化步骤；Inngest 接续 R2、审核、预算与结算。命令行验收复用相同客户端并保存任务状态。

## 执行顺序

- [x] 新增 `src/lib/ai/creative-center.test.ts` 与 `image-job.test.ts`：验证配置缺失、不可用模型、单次提交、结果查询、提交不确定恢复、明确失败和轮询异常恢复。先执行 `npm test -- src/lib/ai/creative-center.test.ts src/lib/ai/image-job.test.ts`，确认因模块缺失失败。
- [x] 实现 `creative-center.ts`、`image-job.ts`、`makeup.ts`，使用 `/config`、`/images`、`/images/{task_id}` 和有界历史查询。生成请求固定 `n=1`，轮询不重新提交。
- [x] 更新 `src/inngest/functions.ts`，把预检、预算预留、提交和轮询拆成独立持久化步骤；提供价目表金额给 `reserveDailyAiSpend`，并用测试验证动态估算。
- [x] 删除 `fal.ts` 与对应旧测试，卸载 `@fal-ai/client` 和直接 ZIP 依赖 `fflate`；更新 `.env.example`、上线说明和开发说明。
- [x] 新增 `scripts/check-image-generation.ts`，以 `tsx` 执行。脚本保存提交前快照、提交结果、原任务编号和下载结果；已有状态文件时只恢复，不重发 POST。只在带 `--submit` 且没有状态文件时创建一次任务。
- [x] 配置本地创作中心凭证；以仓库内 AI 虚拟人物提交一张 `gpt-image-2` / `1k` 图片，保留任务编号、提示词、模型、质量及输出。检查实际图片。
- [x] 运行 `npm test`、`npm run lint`、`npm run typecheck` 和构建检查；检查 Git 差异中没有凭证或生成缓存，并记录完整业务联调限制。

## 实施补充

- 使用 `generations.error` 保存 `creative_submission_pending` / `creative_result_pending` 内部标记，原子争用提交权限；同一生成编号的队列调用串行执行，无需新增数据库迁移。
- 每轮最多 60 次查询，未结束则发送包含原提交信息和任务编号的继续事件；继续事件不重复审核、预算预留或图片提交。
- PNG/JPEG/WebP 输出按真实媒体类型存入 R2；明确供应商失败才退款，结果未知或图片存储中断时保留原任务待恢复。
- 一次真实 GPT 1k 验收已完成，任务号 `img_task_4f0c615a506f41f9ab2b9d5f8c7c2125`。再次运行验收脚本确认只恢复已有结果，没有重发生成请求。
