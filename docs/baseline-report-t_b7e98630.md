# AI Makeup 可运行基线与真实链路差距报告

-任务：`t_b7e98630`
- 核验范围：现有依赖、运行方式、lint/typecheck/test/build，以及上传、鉴权、R2、Inngest、fal.ai、生成状态、结果下载/删除链路。
- 核验环境：独立 worktree `/Users/jiangliulei/Documents/leith/ai-makeup/.worktrees/t_b7e98630`；使用 Hermes Node `26.7.0`（`/Users/jiangliulei/.hermes/tools/node-26.7.0-darwin-arm64/bin`）。未读取或记录任何密钥值，未部署，未接入新付费服务。
-证据目录：`/Users/jiangliulei/.hermes/workspaces/ai-makeup/`。
-依据：`docs/production-readiness.md`；仓库中未找到 `LAUNCH-PLAN.md`（按文件检索结果记录为缺失，不以推测替代）。

## 命令基线

以下退出码来自工程师在 Hermes Node26.7.0 环境中的真实执行复核；日志文件本身不含 shell退出码，因此退出码不从日志臆测。

- `npm run lint` — **PASS / exit0**。真实输出为 `ai-makeup@0.1.0 lint`、`eslint .`，无 lint 错误。
- `npm run typecheck` — **PASS / exit0**。真实输出为 `ai-makeup@0.1.0 typecheck`、`tsc --noEmit`。
- `npm test` — **PASS / exit0**。`Test Files26 passed (26)`、`Tests51 passed (51)`；耗时约2.44s。该结果仅说明现有自动化测试通过，不等于外部服务 E2E 成功。
- `npm run build` — **FAIL / exit1**。Next.js16.2.9 已完成编译和 TypeScript 阶段，但在收集 `/api/credits/balance` 页面数据时失败：`DATABASE_URL is not set. Add it to .env.local (see .env.example).`。

原始证据日志：

- `/Users/jiangliulei/.hermes/workspaces/ai-makeup/t_b7e98630-lint.log`
- `/Users/jiangliulei/.hermes/workspaces/ai-makeup/t_b7e98630-typecheck.log`
- `/Users/jiangliulei/.hermes/workspaces/ai-makeup/t_b7e98630-test.log`
- `/Users/jiangliulei/.hermes/workspaces/ai-makeup/t_b7e98630-build.log`

##真实实现/未完成/mock/待凭证逐项核对

| 链路 |代码证据 | 状态 |结论与限制 |
|---|---|---|---|
| Supabase 鉴权 | `src/lib/supabase/server.ts`、`src/app/api/uploads/sign/route.ts:19-23`、`src/app/api/makeup/generate/route.ts:38-41`、`src/app/api/generations/[id]/route.ts:15-18` |真实实现，待凭证/服务验证 | API 在服务端调用当前用户并对未登录返回401；本次未使用 Supabase 凭证做 E2E，不能宣称登录成功。 |
| R2 上传签名 | `src/app/api/uploads/sign/route.ts:25-62`、`src/lib/storage.ts:38-50` |真实实现，待凭证/服务验证 | 校验 MIME、大小、用户身份并生成 PutObject presigned URL；本次未向 R2 上传或验证 URL。 |
| R2结果读取 | `src/app/api/generations/[id]/route.ts:35-52`、`src/lib/storage.ts:53-60` |真实实现，待凭证/服务验证 |结果完成后生成 GetObject presigned URL；本次未验证对象存在、URL 可访问或过期行为。 |
| R2结果删除 | `src/lib/storage.ts:62-64`、`src/app/api/account/delete-data/route.ts` |代码存在，待凭证/服务验证 | 删除能力通过 DeleteObject SDK 存在；本次未执行删除，未验证权限、对象清理和数据库一致性。 |
| Inngest 入队 | `src/app/api/makeup/generate/route.ts:142-147`、`src/inngest/client.ts` |真实实现，待凭证/服务验证 |生成记录入库、扣除 credit 后发送 `makeup/generate.requested`；本次未向 Inngest发送真实事件。 |
| Inngest 状态流 | `src/inngest/functions.ts:80-205` |真实实现，待凭证/服务验证 | 覆盖 queued→moderating→running→done，以及失败退款、重试和每日预算限制；本次未运行 worker 或真实队列。 |
| fal.ai PhotoMaker | `src/lib/ai/fal.ts` |真实 SDK 接入，待凭证/服务验证 |代码调用 fal.ai 模型；本次未提交真实图片/请求，不能将 SDK 存在写成模型生成成功。 |
|生成状态查询 | `src/app/api/generations/[id]/route.ts:11-84` |真实实现，待数据库/服务验证 |仅返回当前用户自己的记录，并为原图和完成结果签名；build 被缺少 `DATABASE_URL` 阻塞，未做运行时查询。 |
|结果下载 | `src/app/api/generations/[id]/route.ts:44-52` |真实实现，待凭证/服务验证 | 返回 presigned result URL；未用真实对象验证下载链路。 |
|业务删除/账户清理 | `src/app/api/account/delete-data/route.ts`、`src/app/api/projects/[id]/route.ts` |代码存在，待凭证/服务验证 | 本次未执行有破坏性的删除操作，不能宣称数据删除成功。 |
| API mock | 当前目标链路不再按“全部 API mock”处理 |不是 mock 基线 |以源码核验为准：目标链路包含真实 SDK/数据库调用；自动化测试中的 mock/stub只证明测试隔离行为，不证明供应商可用。 |

## 阻塞清单

1. **生产构建阻塞：缺少 `DATABASE_URL`。** `npm run build` exit1，失败发生在 `/api/credits/balance` 页面数据收集阶段。需要在受控 preview/staging 环境提供非生产数据库配置后重跑；本次不读取或写入任何密钥。
2. **外部凭证和服务可用性未验证。** Supabase、R2、fal.ai、Inngest 均需要受控凭证、sandbox/测试资源和最小 E2E计划；本次没有凭证，因此状态统一为“待凭证/服务验证”。
3. **生产必需变量仍需按 `docs/production-readiness.md:7-33` 配置。** 报告不复制任何值；仅列出配置责任，不代表已配置。
4. **生产 launch gates 尚未执行。** 包括数据库迁移、失败退款、Inngest failure alert、每日 AI spend cap、Supabase redirect URL 和邮箱接收验证等，均不能以静态代码或自动化测试代替。
5. **工作树存在非业务生成物。** `tsconfig.tsbuildinfo` 已修改；`node-runtime.tar.gz` 和 `node-v22.20.0-darwin-arm64/` 未跟踪。它们不是业务改动，未在本次范围内删除；交付时需由维护者决定清理或加入忽略规则。
6. **`LAUNCH-PLAN.md` 缺失。** 已按仓库范围检索，未找到该文件；本报告仅使用实际存在的 `docs/production-readiness.md` 与代码证据。

##变更说明与可追溯性

- 本次仅新增本报告：`docs/baseline-report-t_b7e98630.md`。
- 未修改业务代码、依赖、环境文件或数据库迁移。
-既有证据日志保留在 `/Users/jiangliulei/.hermes/workspaces/ai-makeup/`；报告副本也保存到该目录，便于归档。
- 当前未提交 Git commit；工作树差异应通过 `git diff` 和 `git status`复核。

## 验收结论

自动化基线 lint、typecheck、test 已真实通过；生产 build 未通过且阻塞原因明确。目标外部链路的 SDK/数据库实现可在源码中定位，但 Supabase/R2/fal.ai/Inngest 和下载/删除链路尚未做真实服务 E2E，因此整体状态为“可继续实施，但未达到可发布验证完成”。
