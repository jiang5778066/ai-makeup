# 生产发布操作手册

发布采用 GitHub Actions、Vercel Production 候选及原生 Drizzle 迁移。用户已在本次交付记录中明确授权“上线”；协调者仍须把最终已评审的完整 SHA 与该授权绑定，并在全部门禁通过后触发。实现、评审或本地验证本身不构成云端执行权限；实现阶段不执行真实发布或迁移；允许按当前授权进行只读元数据与结构核对。用户最新决定是先走通上线流程、后续修复依赖：high/critical 漏洞暂作为告警，不再作为发布阻断；漏洞本身尚未修复。来源、配置、数据库迁移与健康检查等门禁继续执行。

## 目标、环境与凭据

固定 GitHub `jiang5778066/ai-makeup` 的 main；Vercel 项目 `prj_R5qo7SxNBBU9DAFuGnvivXasvTZj`、团队 `team_5KcXe4uGdZkKT9wgSugRSBly`；域名 `ai-makeup-rosy.vercel.app`；Supabase ref `svlhstoiirtsutmmanrn`。Node 为 24.x，当前适配器要求仓库根项目，不接受云端另设 rootDirectory。

协调者已核实 Production Environment 精确只允许 main 分支，且下列四项非秘密目标 Variables 已配置。工作流仍在 source job 用 `GITHUB_TOKEN` 与 `actions: read` 读取环境和分支策略，并核对运行仓库、main ref、workflowRef、完整 SHA 和 main 祖先关系；未知/403/网络异常停止。源码必须先受到 main 的评审及写入权限保护，不能只靠可被改写的工作流检查隔离恶意 ref。

| 位置 | 名称 | 准确含义 |
| --- | --- | --- |
| Production Variables | VERCEL_PROJECT_ID、VERCEL_ORG_ID | 固定项目、团队ID |
| Production Variables | RELEASE_DOMAIN、SUPABASE_PROJECT_REF | 固定正式域名（不含协议）、Supabase ref |
| Production Secrets | VERCEL_TOKEN | CI机器凭据，可读取本目标生产配置/敏感值、部署Production候选及promote；权限不足停止，不改用本机账户 |
| Production Secrets | MIGRATION_DATABASE_URL | 迁移专用直连或session池；postgres库、批准角色、5432、严格TLS；不允许事务池 |
| Production Secrets | VERCEL_AUTOMATION_BYPASS_SECRET | Deployment Protection开启时用于健康请求的自动化bypass；不能关闭保护或跳过检查 |
| Vercel Production | DATABASE_URL | 应用运行连接，与迁移凭据分开；允许批准的direct/session/transaction模型 |
| Vercel Production | NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY | 目标公开URL和anon key，不是service role |
| Vercel Production | NEXT_PUBLIC_SITE_URL | `https://ai-makeup-rosy.vercel.app` |
| Vercel Production | R2_ACCOUNT_ID、R2_ACCESS_KEY_ID、R2_SECRET_ACCESS_KEY、R2_BUCKET_ORIGINALS、R2_BUCKET_RESULTS | 业务存储 |
| Vercel Production | AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、AWS_REGION | 内容审核 |
| Vercel Production | ROUTER_CREATIVE_API_KEY | 创作中心机器凭据 |
| Vercel Production | INNGEST_EVENT_KEY、INNGEST_SIGNING_KEY | 任务发送/签名 |
| Vercel Production | CREEM_API_KEY、CREEM_WEBHOOK_SECRET、CREEM_PRODUCT_CREDITS_100 | 支付、回调签名及产品 |

本机CLI登录与CI Secrets不同。禁止读取本机账户缓存/钥匙串或复制令牌。负责人通过受控界面配置，报告只记录名称和完成状态。必需变量存在不代表存储、支付、AI、邮件或任务链可用，须独立验收，避免实际收费或副作用。

已知 Supabase 曾处于 INACTIVE，真实schema尚未核验，不可当空库。协调者须恢复并核实实际状态。最新Production部署ERROR不能证明正式alias或历史不存在READY。Vercel Git自动生产发布也须由协调者核实并关闭绕过本入口的自动切换；新增workflow_dispatch不改变Git集成设置。本worker未核查或修改上述云端状态。

## 连接、结构契约与首次基线

生产入口和独立 `db:status` / `db:migrate` 共用连接规范化。只允许Postgres协议，必须用户名和密码、`postgres`库及**唯一**参数 `sslmode=verify-full`；拒绝重复、其他查询参数和片段，不让驱动再次解析可覆盖核心配置的URL。

- direct：`db.<目标ref>.supabase.co:5432`，角色`postgres`。
- session池：`<区域>.pooler.supabase.com:5432`，用户名`postgres.<目标ref>`。
- 仅runtime允许同类池主机端口6543的transaction模型；迁移不允许。

当前批准角色只包含上述模型。若要采用自定义最小权限应用角色，须明确登记角色、池用户名及只读身份预检规则后另行评审，不能把任意用户名当目标身份。密码只在受控环境保存。迁移客户端显式固定host/port/database/user/password、证书验证和主机名校验，覆盖PG环境冲突；runtime原URL同样先严格检查。运行数据库还在inspect、candidate前和promote前进行只读事务探测，验证数据库/角色和可达性。版本health不代表数据库可用。

`drizzle/0001_production_readiness.sql`逐字保留。journal补充其固定序号与时间戳，Drizzle原生migrator负责事务及`drizzle.__drizzle_migrations`；不存在第二套迁移引擎或自动基线标记。

`scripts/db/structure-contract.json`来自本任务专用Postgres17执行原SQL后的catalog，绑定该SQL的SHA256。参考生成工具仅接受本机专用fixture端口和固定测试身份，要求空public/drizzle，并模拟最小`auth.users`外部依赖；不能用于线上生成“期望”。契约核对public关系集合双向一致、列类型/非空/默认/排序/生成属性、CHECK/FK/PK/唯一约束、索引（含部分谓词及有效状态）、RLS、策略及用户触发器。读取在只读事务中固定search_path，无OID和业务数据。auth.users只检查存在，不创建或修改。

1. 首次接入先核实真实目标、Postgres版本、托管auth.users、完整结构及Drizzle历史。
2. 没有历史且public确实为空时允许pending；不因线上未知就进入此分支。
3. 没有历史但有任意public业务关系，明确阻塞。已有历史须为仓库批准哈希/时间戳的有序前缀，并与对应结构契约相等；缺表/列/约束/索引、RLS漂移或额外表一律停。
4. 不自动补表、修漂移、reset/drop、插入成功历史或“标为已应用”。已有未跟踪业务结构需要独立人工基线方案，保留数据并审核。
5. 任何未来迁移都须追加兼容性白名单和对应前缀契约，并独立评审；不能只加哈希。旧生产在迁移期间仍运行，破坏式变更必须停止自动上线，按扩展再收缩方案另行批准。

`npm run db:status`为只读预检，`npm run db:migrate`为写操作，均从`MIGRATION_DATABASE_URL`读取严格生产连接，不提供本机URL/环境开关绕过。测试通过独立fixture客户端调用迁移核心；测试适配不进入生产入口。禁止将托管auth.users加入应用DDL。当前schema.ts未完整表达手写历史，不能直接db:push/db:generate到生产，也不伪造snapshot替代历史。

## Orca交接、只读验证与首次上线

1. 协调者取得已评审、已提交main的完整小写SHA及本轮证据；不纳入原仓库未提交UI。
2. 先从main执行无生产秘密验证：`gh workflow run release.yml --repo jiang5778066/ai-makeup --ref main -f sha=<完整SHA> -f mode=readonly -f bootstrap=false`。此模式只运行source，不绑定Production、不读取生产Secrets、不访问Vercel/Supabase；记录run ID、实际GITHUB_TOKEN API结果。actionlint只能证明静态语法，本worker未dispatch，不能声称实际权限已通过。
3. 正式模式必须先通过source并完成独立应用/工具审计，再进入Production环境。核对基线、运行配置、保护bypass、Git自动生产发布和用户已记录的上线授权；有效审计报告中的漏洞按告警继续；无法完成审计或证据写入失败仍停止。
4. 正常已有READY执行`-f mode=release -f bootstrap=false`。首次模式明确使用`-f mode=release -f bootstrap=true`，不会自动启用，也不绕过任何门禁。
5. bootstrap仅在目标项目已核、正式alias明确404，或alias归属已核且部署ERROR，并完整分页检查全部Production部署都无READY/未完成状态后才允许`previous=null`。403、网络、字段缺失、详情404或未知状态一律停；任何现有READY都记录ID、URL、完整旧提交，不能用bootstrap掩盖。结果写`rollbackUnavailable=true`，说明首次没有可回退目标。
6. CI渠道跟进run到summary/result；本机仅能使用下文显式原生入口及等效来源门禁。串行且`cancel-in-progress=false`，禁止取消进行中的迁移或盲目重跑非幂等阶段。

顺序为预检/完整SHA信任 → 双审计（漏洞告警） → 项目/上一部署/运行配置/数据库只读核验 → 测试/typecheck/lint → Production构建 → Production候选且skip-domain → 原生兼容迁移 → 候选健康 → promote → 正式域名健康。候选不是preview。

入口从固定仓库根检查HEAD及main祖先关系，并拒绝已跟踪改动、未跟踪或ignore隐藏的源码/配置。只放行明确生成目录（node_modules、.next、coverage、.vercel、release-result）及tsbuildinfo。当前未提交开发工作树不能发布；不能在仓库外执行以绕过检查。

完整生产配置从锁内CLI相同的JSON拉取接口取得，校验后固定三项版本变量和NODE_ENV。清空dotenv文件，构建子进程仅继承受控操作系统变量，并覆盖父进程同名冲突；候选通过权限0600的JSON local-config传递同一快照，不把秘密逐项放到argv。部署前重读云端配置，值或键发生变化即停止，重新构建验证。CLI/API实际解密权限与云端行为仍需协调者受控验证；无法取得敏感值时停止。

Vercel须向函数暴露VERCEL_URL。`/api/health`仅返回版本和部署身份，验收还核对API归属、production、READY、releaseSha和可信vercel.app域名，拒绝重定向/HTML保护登录页/错误身份。需要bypass则配置，不关闭保护。此检查不代表所有业务依赖就绪。

## 失败、证据与受控应用回退

| 结果 | 必须处置 |
| --- | --- |
| trust/inspect/validate/build失败，或audit无法完成 | 未由本入口创建候选或执行迁移，修复后重新验收 |
| candidate失败 | 远端可能已创建候选但响应丢失，先查部署，不能盲目重试 |
| migrate失败 | 不promote；核对原生事务、历史和结构后再恢复 |
| candidate-health失败 | 不promote；迁移可能已完成，旧生产仍运行 |
| promotionAttempted=true、promoted=false | 可能已切换但响应丢失/域名核验失败，先核对alias，不能说生产未变 |
| promoted=true后失败 | 已确认切换，明确生产验收或证据失败，核对alias/健康后决定回退 |
| previous=null、rollbackUnavailable=true | 首次无上一READY，不存在本记录可用回退目标；修复当前应用并重新受控发布 |

安全检查点在阶段前后原子写result。证据写失败会停止下一远端动作；promote完成后即刻保留内存事实，后续写失败不改写为“未切换”。result仅含commit、阶段、候选、上一部署/提交、迁移、审计策略/计数/包信息/锁摘要和状态；不保存.env/.vercel/原始CLI输出或数据库栈。入口finally尝试清理整个本地.vercel，即使summary/result写失败也清理；清理失败记录reportErrors并使入口失败，不覆盖真实发布状态。强制kill无法保证finally执行，runner丢失/artifact缺失时也不得推断未发生；协调者应核对远端后清理受控临时文件。

受控应用回退采用**锁定独立CLI的官方rollback**，不自动执行。协调者须取得回退授权，确认套餐支持Instant Rollback、目标属于固定项目/团队、READY且曾实际服务Production、旧版兼容已迁移结构，并核实保护设置。只有`previous`经核实可用才选择它；历史READY但从未正式服务的候选不能凭状态当回退目标。

以下命令在已核准的干净仓库根由协调者执行；凭据通过受控环境管理，不将令牌或输出粘贴到报告。独立全新CLI配置目录用于隔离本机账户，示例中的目录由协调者设置并保护。

```sh
node scripts/release/tools/node_modules/vercel/dist/vc.js rollback <已核上一部署ID或URL> --scope team_5KcXe4uGdZkKT9wgSugRSBly --global-config <受控CLI配置目录> --yes --timeout 3m
node scripts/release/tools/node_modules/vercel/dist/vc.js rollback status <已核项目名称> --scope team_5KcXe4uGdZkKT9wgSugRSBly --global-config <受控CLI配置目录>
```

固定`VERCEL_CLI_USE_NATIVE_BINARY=0`、`NO_UPDATE_NOTIFIER=1`及`VERCEL_TELEMETRY_DISABLED=1`，使用Node24和安装锁中的65.11.0。先读锁内help核对语法；status仅说明待处理回退，不能代替最终成功核实。执行后重新查询正式alias及部署归属/旧提交，再验证正式域名health确实为旧版本和对应部署；若旧部署没有版本health或套餐拒绝，停止并报告，不能宣称已回退。不能自动回滚数据库，不用db:push修复，也不把promote作为曾正式服务版本的唯一恢复机制。本worker只离线核对help，未实际rollback/status或访问账户。

## 锁定安装、审计与本地验证

根锁保持应用基线；CLI固定65.11.0，独立位于`scripts/release/tools/package.json`及锁。应用`npm ci`，工具`npm ci --prefix scripts/release/tools`，禁止未锁定npx或全局CLI替代。适配器以`process.execPath`启动绝对`<仓库>/scripts/release/tools/node_modules/vercel/dist/index.js`，cwd/--cwd均为仓库根；缺失或安装失败即停止。

CI与发布分别对两棵完整树执行`npm audit --audit-level=high --include=dev --registry=https://registry.npmjs.org --json`，保留dev扫描和high阈值。按用户最新决定，策略固定为`warn`：有效报告中的high/critical漏洞不会阻断CI或发布，不能据此称审计通过或漏洞已修复。安装失败、启动/网络异常、无效JSON、报告与退出码不一致及证据写失败仍停止。此调整只改变项目发布政策，不解决依赖漏洞，也不放宽其他发布检查。

`npm run release:audit`在无生产Secrets的dependencies job中完成双审计；可加`-- application`或`-- tools`用于CI单范围扫描。安全报告写入`release-result/audit-*.json`并上传artifact，包含实际锁SHA256、npm原退出码、漏洞计数及包名/严重度/是否有修复；summary明确记录告警。发布入口在读取Vercel生产配置前再次双审计，将报告写入阶段检查点及最终result，部署成功与依赖告警分别说明。

此前绑定锁的证据为应用44（15high、1critical）、工具38（22high、1critical），均exit1；这些数字不是未来registry结果。依赖声明和锁未因政策调整改变。后续修复须升级到实际修复版本并验证兼容性：Next/React与对应lint联动，Inngest的嵌套Zod及Vercel固定构建器依赖需要上游修复或经验证的替换方案，不能靠根版本覆盖、盲目降级或`audit fix --force`声称解决。详细候选与风险见交付记录中的`dependency-remediation-plan.md`。后续可将`warn`恢复为漏洞阻断策略，但不应删去扫描或历史告警证据。

本地应运行锁定安装、`release:verify`、完整`test`、`typecheck`、`lint`、`build`、actionlint及diff --check。锁内CLI解析行为测试也要求先安装tools。真实迁移测试仅用专门新建Postgres17、本机回环随机端口；TEST_DATABASE_URL具有清理schema的破坏行为，绝不能指向既有用户容器/真实服务。fixture最小auth.users只是托管依赖模拟，不代表Supabase集成。没有TEST_DATABASE_URL时明确跳过集成测试；CI migration job必须提供专用隔离服务。

## 首次网站与数据库上线

用户已决定首次上线只覆盖网站和数据库，生产配置使用 `RELEASE_PROFILE=website-db`。该模式仍要求数据库、Supabase公开客户端配置及正式网站地址；未开通的R2、AWS Rekognition、Inngest和Creem保持空缺，相应业务功能尚不可用。配置齐全后改为 `full`，恢复所有业务服务配置检查。依赖审计仍按告警策略记录，技术失败停止。

Supabase使用官方Root 2021 CA验证证书链和主机名，不关闭TLS验证。迁移在同一物理会话和事务内持锁，连接中断整体回滚。

仓库 `vercel.json` 关闭Git自动部署，避免推送main绕过候选验收直接切换生产域名；正式发布由手动触发的工作流或本机同一入口完成。

## 2026-11-10 当前完整候选的审验与执行边界

本轮候选将 MAIN 的 1184 项已审清单与 418 已上线发布能力合并。产品页面、素材、schema 和 sharp 0.34.5 来自准确 MAIN；health、两份工作流、严格 TLS、同物理会话迁移与固定发布工具锁继续保留。实现阶段只生成候选和证据，不提交、推送、迁移、部署或推广；随后由独立 Reviewer、Validator/ReleaseExecutor 推进既有授权。

迁移顺序固定为 `0001_production_readiness` → `0002_d1_creation_visibility` → `0002_d2_checkout_attempts` → `0003_e1_media_tasks`，两个 0002 均保留。原生 journal 的首条时间和 SQL 哈希不变，后三条使用严格递增时间。结构合同包含四个准确前缀，表数分别为 9、9、10、13；线上任何未跟踪对象、历史或约束/RLS漂移均停止，禁止补假历史、清库或自动建立基线。数据库变更均为兼容增量；回退旧应用时保留新增列、表、任务和审计，不执行逆向 SQL。

普通 `npm test` 不依赖历史 decoder 报告或系统 FFmpeg。所有原真实视频断言保留在 `media-video-decoder.integration.test.ts`；只有显式传入 `TEST_VIDEO_DECODER_CONFIG` 的已批准绝对路径、版本及哈希时运行，无配置则明确跳过真实集成套件。普通 decoder 单元测试仍覆盖身份、容器、帧数、参数、busy、abort、timeout、close 与恢复；runtime 单测使用注入 decoder，在显式本机配置下同套断言再走真实 decoder。本机 8.1 证据不批准 Linux 安装、生产 binary 或 RSS 上限。

现有 `website-db` 范围必须保持 `MEDIA_CREATE_ENABLED` 与 `ENABLE_CHECKOUT` 非 1，`DISABLE_CHECKOUT=1`、`DISABLE_GENERATION=1`。发布适配器在读取快照时强制核对；D1 作品仍须兼容迁移、权限与独立验收，不能通过设置开关替代。完整代码发布不表示真实生成、收费或全部业务已经可用。

审验执行命令（Node 24、两个固定锁、不升级依赖）：

```sh
npm ci
npm run release:tools:install
npm run release:verify
npm test
npm run typecheck
npm run lint
npm run release:audit
npm run build
node node_modules/tsx/dist/cli.mjs scripts/release/readonly-schema.ts
```

`readonly-schema.ts` 通过固定工具锁内的 Vercel CLI 使用既有登录，只读取指定项目的生产 DATABASE_URL，在内存中交给原有严格 TLS 连接工厂和只读 migration/status/catalog 工具，不打印或保存连接串，不访问业务行。其成功输出含结构、原生历史与只读身份；失败正文隐藏数据库异常。它不是迁移入口。

最终经过审验的源码 SHA 在 main 可达且全部配置/凭据/健康门禁满足后，ReleaseExecutor 才能触发既有流水线：

```sh
gh workflow run release.yml --repo jiang5778066/ai-makeup --ref main -f sha=<最终已审完整SHA> -f mode=readonly -f bootstrap=false
gh workflow run release.yml --repo jiang5778066/ai-makeup --ref main -f sha=<最终已审完整SHA> -f mode=release -f bootstrap=false
```

本次只读元数据查询尚未列出 Production 的 `VERCEL_TOKEN`，仓库级 secret 列表也为空；须由 ReleaseExecutor 核实既有 CI 凭据权限或按既有授权采用原生 CLI 登录渠道，不得把本机 OAuth 凭据导出拼入报告/argv或复制到 CI。现有工作流在凭据不齐时停止，不因此绕过身份、TLS、迁移或健康门禁。旧域名的本会话直接健康请求存在网络/DNS失败，不能将部署 READY 元数据当作健康通过；正式发布前须重新得到可信 200 和完整身份匹配。

可回退的原部署为 `dpl_DQiBgLMWNBxCcfsUen6WFAzL8Z74` / `ai-makeup-pb2se2fgv-leiths-projects-c9172274.vercel.app`，SHA `41849574f4905694880d3f3b95daa6d07038eeb1`。在授权执行阶段按现有恢复手册复核其身份后，才可通过原生 `vercel promote dpl_DQiBgLMWNBxCcfsUen6WFAzL8Z74 --scope team_5KcXe4uGdZkKT9wgSugRSBly --yes` 回退域名；迁移增量保留。此次实现尚未触发上述命令。


## 显式原生认证与本地来源渠道

`npm run release`仍默认CI token渠道：必须提供真实workflow来源、既有`VERCEL_TOKEN`和`MIGRATION_DATABASE_URL`。token仅传给固定官方CLI的受控`VERCEL_TOKEN`子进程环境，不进argv或结果；该渠道仍隔离CLI配置。`npm run release:local`明确选择`native-cli`及本地来源，拒绝token、任何非空`GITHUB_*`及冲突模式，不读取或复制OAuth缓存，不自动回退CI。原生CLI复用正常默认登录；固定Node24、官方65.11.0和两份锁，不使用全局CLI或未锁定npx。

本地正式入口须先有准确完整候选提交，HEAD必须等于GitHub真实远端main的40位SHA，origin必须是`jiang5778066/ai-makeup`，源码必须干净且已提交，不能以assume-unchanged/skip-worktree隐藏改动。实时核GitHub main、该SHA最新CI成功、Production唯一main分支策略，并排除release工作流queued/in_progress/waiting/pending/requested状态；读失败或未知即停。取得来源后，在candidate和promote前再次核验，审验记录、CI或Production保护规则变化均停止。

两份独立审验绑定记录必须由协调者取得实际独立审查/验收结果后提供，不能由实现者自签。每份JSON含`repository`、`project`、`team`、`sha`、`sourceTree`（该提交`git rev-parse HEAD^{tree}`）、`reviewer`；审查记录还须`sourceReviewPassed=true`，验收记录须`acceptancePassed=true`，两者reviewer不同。记录应放在干净发布checkout以外，通过下列路径和准确SHA256绑定，版本或字节变化拒绝；既有未提交产品的通过结论须先由独立人员绑定最终实际提交，不能直接把旧418当完整候选。

```sh
# 所有值均为独立审验后取得的真实数据；本段不创建通过记录。
RELEASE_SHA="$APPROVED_RELEASE_SHA" \
RELEASE_MIGRATION_SOURCE=vercel-production-session \
RELEASE_REVIEW_RECORD="$APPROVED_REVIEW_RECORD" \
RELEASE_REVIEW_SHA256="$APPROVED_REVIEW_SHA256" \
RELEASE_ACCEPTANCE_RECORD="$APPROVED_ACCEPTANCE_RECORD" \
RELEASE_ACCEPTANCE_SHA256="$APPROVED_ACCEPTANCE_SHA256" \
npm run release:local
```

本地目标排他锁固定为`/tmp/ai-makeup-production-prj_R5qo7SxNBBU9DAFuGnvivXasvTZj.lock`，不随TMPDIR变化。本轮创建0700目录、0600随机所有者记录，失败/异常finally仅删除自身准确文件和空目录；已有锁或所有权变化停止，绝不删除其它任务锁或终止其它任务。进程被强杀/宿主崩溃可能留下锁，须由协调者核远端和原所有者后单独处置，工具不自动抢占。GitHub托管release保留原并发配置；本机在写阶段前反复排除在途任务，不创建自托管runner或后台调度。

原生迁移配置必须显式选`RELEASE_MIGRATION_SOURCE=vercel-production`、`vercel-production-session`或`environment`。`vercel-production`仅由正常CLI在内存读取固定项目production唯一DATABASE_URL，拒绝混入本机迁移URL，沿用原`purpose=migration`验证项目、角色、5432端口、verify-full、CA及主机名，并用真实只读身份探测和status准入；不能用runtime目的替代，也不改URL。`environment`要求受控环境中已有明确`MIGRATION_DATABASE_URL`，仍走同样迁移合同。GitHub secret不能读回本机，不能声称已有值；只读成功也不证明DDL/迁移写权限。

单独只读诊断入口如下，不执行正式来源审验、不生成正式发布通过结果、不迁移或部署；这里的SHA仅为诊断身份参数：

```sh
RELEASE_SHA="$DIAGNOSTIC_SHA" RELEASE_MIGRATION_SOURCE=vercel-production npm run release:native-status
```

2026-11-10原`vercel-production`真实诊断从正确目标取值，但DATABASE_URL为6543事务池，在连接前被migration合同正确拒绝，该历史保持。后续明确批准的同项目同实际主机/凭据session5432一次严格只读核实成功，PG17.6、read_only=on、0001已应用且后三份pending；此事实不证明DDL/迁移写权限。

显式`vercel-production-session`只接受固定项目production唯一DATABASE_URL中的官方共享池transaction6543原配置；验证`aws-[INDEX]-[REGION].pooler.supabase.com`实际主机、项目postgres用户、postgres库、协议和严格TLS后，仅替换端口为5432，其余原始字节（含编码密码/query）不变。立即复用原migration严格校验及真实只读status，失败停止，不猜其它主机/端口，也不在`vercel-production`失败后自动切换。原值与派生值仅保存在内存；首次完整runtime快照须与原值一致，candidate/promote前重核完整runtime键值及本轮派生结果，不能把5432与6543直接比较或省略快照。

原生API固定官方origin、team、project和允许GET路径；20秒、2MB上限，必须有明确2xx HTTP头及成功JSON。非零、401/403/404/429/5xx、超时、非JSON、乱码、输出超限均停止；不从not found文案推断404，原生bootstrap固定false，未知previous不发布。旁路变量只由同项目API在内存取值，并在写阶段前比较；响应、连接串和原始stderr不写报告。

完整生产JSON快照仍在内存保留，含多行值，构建和部署前验证原有运行配置/关闭开关，candidate与promote前重核云端键和值。原生pull通过固定官方CLI运行，dotenv输出路径为本轮自有`.vercel/.env.production.local`到`/dev/null`的符号链接，正常pull结果直接丢弃，不chmod目标设备；构建仅经受控env取得完整快照。原生local-config文件仅含公开RELEASE_SHA/RELEASE_PROJECT_ID；Production服务使用同一固定项目的production配置，文件、argv和报告中不复制生产秘密。CI token模式沿用既有0600完整快照文件与finally清理。

正式执行继续唯一`release()`/`finishRelease()`，保preflight→trust→audit→inspect/status→validate→build→candidate→原生迁移→candidate-health→promote→production-health、检查点、结果脱敏和错误清理。原生入口拒绝已有`.vercel`目录，只清理本轮产物；不变更SQL、journal、迁移器、TLS、业务开关或付费许可。此适配完成仍须独立审查工具delta和必要验收，不能把渠道自检当生产更新。

初次来源核验仍拒绝任何已跟踪缓存脏状态。只有本轮严格入场及全部真实来源门禁通过后，正式validate/build均成功，candidate/promote前guard才可精确允许根`tsconfig.tsbuildinfo`的内容变化；基线index原字节、缓存普通文件类型和模式必须不变。staged/index、隐藏标志、任何其它源码/配置/锁或嵌套近似路径变化一律拒绝，不reset缓存、不改索引、不关闭增量来掩盖行为。

开发树中的未跟踪交付报告仍会阻塞正式来源门禁，这是预期行为。正式ReleaseExecutor须由Orca另行准备最终已审commit的干净独立执行工作树；审查/验收记录用绝对外部文件引用，交付报告保存于执行树外。不要将docs目录加入忽略或来源放行范围来迁就报告。
