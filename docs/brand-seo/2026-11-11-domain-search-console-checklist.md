# 域名切换与 Google Search Console 清单

暂定主域：pictowink.com。本批没有购买域名、核验所有权、改 DNS 或登录 Google 账号。源码默认规范地址仍是 https://ai-makeup-rosy.vercel.app，避免搜索引擎收到尚不可用的地址。

## 域名与正式配置

1. 确认注册权和续费归属，在现有 Vercel 项目添加域名；DNS 按项目面板实际返回配置，不凭空写死 IP。
2. 验证根域和 www 的 DNS、证书及 HTTPS；确定根域为主域，www 仅单跳永久跳转至同路径根域。
3. 将 NEXT_PUBLIC_SITE_URL 改成 https://pictowink.com 后构建并部署。它会统一 metadataBase、canonical、OG、schema 和 sitemap 地址；不能只改页面文字。
4. 核 Supabase 的站点地址及登录回跳白名单，以及实际使用的邮件链接、支付回跳和 webhook。按各合同处理，不因换域重新打开支付或生成。
5. 旧 vercel.app 的公开网页按同路径永久跳转，保留必要参数，确认无循环或多跳。API、OAuth、webhook、health 逐项核调用方，不能套用整站重定向导致方法/认证异常。
6. 对首页、英文/中文核心工具逐一核 HTTP 状态、title、canonical、hreflang、OG、sitemap；验证登录与退出回跳，再验新旧域。

自定义域名可能改善访问，但服务仍由 Vercel 提供；仅绑定域名不能保证中国大陆所有网络均可直连。应在移动、电信、联通的真实网络实测首页、素材和登录依赖，按结果决定托管与加速方案。

## Search Console

1. 使用实际拥有的 Google 账号创建 pictowink.com 的“网域资源”，按账号显示的 TXT 记录验证。DNS TXT 不包含访问令牌，不把账号密码放到仓库。
2. 如采用“网址前缀资源”的 HTML 标签验证，源码已预留 GOOGLE_SITE_VERIFICATION 环境变量，仅填标签 content 值并部署；未填时不输出验证标签。此步骤不是分析埋点。
3. 新域 HTTPS 和主域就绪后提交 https://pictowink.com/sitemap.xml。检查报告中抓取的地址没有混用旧域，也没有工作台/登录/私有作品。
4. 用 URL 检查抽查首页、两个生成器和图生图正文。请求索引不等于保证收录，不连续重复提交同一网址。
5. 原域若已有可验证资源和历史搜索数据，按 Google 当时提供的迁移工具与要求办理；不假设 vercel.app 子域一定能使用地址更改功能。保留旧域重定向并持续监测。
6. 每周记录时间范围、国家、设备、页面、查询、曝光、点击、CTR、平均排名与索引异常。避免把 API 请求、自己验收或爬虫当作真实访客。

## 访客和点击的后续统计

本批没有接入 GA4、Vercel Analytics 或新的 Cookie。Search Console 只能回答 Google 搜索曝光与点击，不能代表全站访客。后续另列事件表：工具入口点击、登录成功、文件预览、提交任务、生成成功、下载、结账成功；只在对应功能真实开放时采集，失败与成功分开。不上报照片、完整提示词、邮箱或敏感 URL 参数；上线前核隐私说明和所需同意机制。
