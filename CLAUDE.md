# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

- `npm run dev` — 启动 Next.js 开发服务器
- `npm run build` — 生产构建（同时执行 TypeScript 类型检查，因为 `tsconfig.json` 已设置 `strict: true` 且 `noEmit: true`）
- `npm run start` — 运行已构建的产物
- `npm run lint` — `next lint`（继承 `next/core-web-vitals`）
- `npm run test` — `vitest run`，执行一次性测试
- `npm run test:watch` — Vitest watch 模式
- 跑单个测试文件：`npx vitest run src/app/api/makeup/generate/route.test.ts`
- 按测试名过滤：`npx vitest run -t "rejects missing images"`

测试环境为 jsdom（见 `vitest.config.ts`），`globals: true`，setup 文件加载 `@testing-library/jest-dom/vitest`。路径别名 `@/*` → `src/*`，在 `tsconfig.json` 与 `vitest.config.ts` 中都已配置，新增测试时直接用 `@/lib/...` 即可。

## 架构总览

这是一个 **Next.js 16 App Router + React 19 + TypeScript 6 (strict)** 项目，定位为「AI 妆容生成 / 虚拟试妆」营销+产品站点。**未引入任何 UI 框架，也不使用 Tailwind**——全部样式集中在 `src/app/globals.css`（约 700 行），这是设计系统约束，详见下文。

### 双语 i18n 通过路由分流，不走中间件

- 英文（默认 locale）走根路径：`/`、`/[...slug]`（catch-all marketing 路由）
- 简体中文走 `/zh-CN`、`/zh-CN/[...slug]`，两套页面是物理上独立的目录，内容来自同一份 `getLandingPage(slug, locale)`
- locale 判定与切换逻辑统一在 `src/lib/i18n.ts`：`localizePath`、`alternateLanguagesForPath`、`getLocaleFromSegments`
- 新增 locale 时需要同时新增对应的 `src/app/<locale>/` 目录，以及在 `locales` 元组和 `src/lib/content.ts` 的 `pagesByLocale` 中补齐数据

### 内容驱动的落地页系统

所有 SEO 落地页（home / ai-makeup / pricing / virtual-makeup-try-on 等）都不是手写页面，而是：

1. `src/lib/content.ts` 用 `LandingSlug` 联合类型枚举所有合法 slug，并为每个 slug × locale 提供完整的 `LandingPage`（h1、描述、CTA、SEO 标题/描述、关键词、FAQ 等）
2. `src/app/(marketing)/[...slug]/page.tsx` 与 `src/app/zh-CN/[...slug]/page.tsx` 是 catch-all：从 URL 还原 slug → 调 `slugFromPath` → 调 `getLandingPage` → 渲染共享的 `<LandingPage>` 组件
3. SEO metadata 与 JSON-LD（SoftwareApplication / FAQPage / HowTo / BreadcrumbList）由 `src/lib/seo.ts` 的 `metadataForPage` 与 `pageSchemas` 统一生成
4. `src/app/sitemap.ts` 也是从 `landingSlugs × locales` 笛卡尔积自动生成的，**新增落地页只需改 `content.ts`，sitemap / catch-all 路由会自动覆盖**

`src/lib/seo.ts` 顶部的 `siteUrl = "https://example.com"` 是占位值；部署到真实域名前需要替换（`src/app/layout.tsx` 中的 `metadataBase` 和 `robots.ts`、`sitemap.ts` 都依赖它）。

### API 路由全部是 mock

`src/app/api/**` 下的所有 route handler 当前都返回静态/打桩数据（包括 `/api/makeup/generate`、`/api/billing/checkout`、`/api/webhooks/stripe` 等）。`MakeupTool` 是唯一的 `"use client"` 组件，会 POST 到 `/api/makeup/generate`，依赖 `image` 字段非空（缺省时返回 400 + `code: "missing_image"`，已有测试覆盖）。接入真实模型/支付时，请保持响应 schema 兼容现有前端消费方。

### 组件分层

- `src/components/site-shell.tsx` — 全站布局（左侧栏 + 顶部语言/登录按钮 + footer），负责按 locale 切换文案与语言互链
- `src/components/landing-page.tsx` — 落地页 hero / 风格库 / pricing / FAQ 等所有 section 拼装
- `src/components/makeup-tool.tsx` — 唯一的客户端交互组件，负责风格选择、强度调节、调用生成 API
- `src/app/dashboard/page.tsx` 与 `src/app/login/page.tsx` 是独立页面，不走 `SiteShell`，直接复用 `globals.css` 中的类（`.dashboard-layout`、`.sidebar-nav`、`.tool-card` 等）

图标统一来自 `lucide-react`。

## 设计系统约束（来自 `.superdesign/`）

`.superdesign/design-system.md` 与 `blank-slate-brief.md` 是设计契约，做 UI 改动前必读。要点：

- **不要引入 Tailwind 或任何 UI 框架**——这是显式约束（`design-system.md` 第 53 行）。所有样式写到 `src/app/globals.css`
- 视觉风格是 "Beauty Counter OS"：象牙白 / 漆黑 / 樱桃红 / 灰褐 高对比配色，禁止紫蓝 AI 渐变、glassy SaaS 卡片、发光球体
- 调色板 token 在 `globals.css` 顶部以 CSS 变量定义（`--ivory`、`--lacquer`、`--cherry` 等）
- 字体使用系统 sans + PingFang SC / 微软雅黑 中文回退；字距 0
- 保留现有的路由、SEO、i18n、API 与测试结构不变（`design-system.md` 第 52 行）