# PictoWink 第一批品牌与 SEO 实施计划

> 执行方式：本会话按 executing-plans 逐项实施；用户已要求先给方案排期然后执行，不再重复索取同范围许可。

目标：在生产提交2ceb的独立工作树完成品牌、自然文案与SEO基础调整，交付通过验证的可审查版本。
架构：复用现有Next App Router、双语路由和组件；集中品牌与站点URL定义，保留现有工具URL与功能开关。暂定域名只作品牌规划，不提前作为canonical。
技术：Next16、React19、TypeScript、Vitest、SVG。

## 排期与工作边界

预计1—2工作日，四阶段串行，本轮开始实施并尽量连续完成本地验证。不承诺当天Google收录或排名变化。

- [x] 阶段1：创建品牌配置与画框眨眼SVG，替换可见旧身份；输出favicon、Apple图标、分享封面。沿用原布局，避免重新设计全部页面。
- [x] 阶段2：首页以“Your ideas. A wink away.”为品牌语，明确图片/视频用途和生成未开放状态；核心图片/视频页使用自然说明，不虚构效果、价格或用户。
- [x] 阶段3：先补有意义SEO回归测试，验证核心路由canonical/hreflang、待绑定域名不提前使用、工作台noindex、无旧套餐schema。统一站点URL默认值为当前正式地址并尊重环境配置；修正SEO品牌/OG locale、sitemap核心路径与真实更新时间策略。
- [x] 阶段4：跑相关测试、源码类型、变动lint及本地Next构建，检查实际HTML、品牌图标、分享卡与双语页面。失败先定位，不跳过检查。

主要文件：src/lib/brand.ts、src/components/platform-brand.tsx、src/app/layout.tsx、src/app/icon.tsx、src/app/apple-icon.tsx、src/app/opengraph-image.tsx、src/lib/seo.ts、src/lib/platform-homepage-seo.ts、src/components/platform-route-page.tsx、src/components/platform-landing-page.tsx、src/lib/platform-homepage-copy.ts、src/app/sitemap.ts、src/app/robots.ts，以及现有明确旧品牌展示和相关测试。

域名DNS/注册、Search Console所有权、生产发布、统计Cookie及付费模型/收费开关不在本批代码修改中；交付其接入清单，不擅自读取密钥或改线上配置。生产发布可在本批验证后单独沿既有已授权交付流程接续，不把本地完成写成线上已更新。

验收命令：定向vitest；tsc --noEmit --incremental false；变动文件eslint；npm run build。网页检查覆盖/、/zh-CN、/ai-image-generator、/ai-video-generator、/tools/image-to-image-ai及/home noindex。保留原tests语义，旧品牌断言只改身份，不删功能断言。

交付：代码分支、品牌SVG和分享图、中文实施结果、后续4周SEO内容排期与域名/Search Console操作清单。未开放生成页不以SEO名义伪装可用；资源和内容来源说明保留。
