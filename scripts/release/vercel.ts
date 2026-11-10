import { readFile, writeFile, mkdir, chmod, symlink, readlink, lstat } from "node:fs/promises";
import { resolve } from "node:path";
import { command, type CommandRunner } from "./command";
import { REPOSITORY_ROOT, VERCEL_ENTRY } from "./paths";
import { TARGET, type ReleaseConfig } from "./preflight";
import { trustedHost } from "./health";
import { ApiFailure, previousProduction } from "./previous";
import { snapshotRuntime, buildEnvironment, assertSameSnapshot, type RuntimeSnapshot } from "./snapshot";
import { normalizeDatabase, probeRuntimeDatabase } from "../db/connection";
import type { Deployment } from "./pipeline";
import { apiPath, API_LIMITS, NativeGateFailure, assertOfficialCli, parseNativeResponse, tokenResponse } from "./native-auth";
export type DeploymentDetails = { id: string; url: string; projectId: string; ownerId: string; target: string; readyState: string; meta?: Record<string, string> };
export class Vercel {
  protected runtime?: RuntimeSnapshot;
  private migrationOriginal?: string;
  private migrationSelected?: string;
  constructor(private config: ReleaseConfig, private run: CommandRunner = command, private root = REPOSITORY_ROOT) {}
  async api<T>(path: string): Promise<T> {
    const scoped = apiPath(path);
    if (this.config.authMode === "native-cli") {
      return parseNativeResponse<T>(await this.cli(["api", scoped, "--method", "GET", "--raw", "--include"]));
    }
    if (!this.config.token?.trim()) throw new Error("缺少token认证");
    try {
      const response = await fetch(`https://api.vercel.com${scoped}`, { headers: { Authorization: `Bearer ${this.config.token}` }, redirect: "error", signal: AbortSignal.timeout(API_LIMITS.timeoutMs) });
      return await tokenResponse<T>(response);
    } catch (error) { if (error instanceof ApiFailure) throw error; throw new Error("Vercel只读API失败，原始响应已隐藏"); }
  }
  async cli(args: string[], extra: Record<string, string> = {}) {
    await assertOfficialCli();
    const native = this.config.authMode === "native-cli";
    if (native ? !!this.config.token : !this.config.token?.trim()) throw new Error("认证模式混合或缺身份");
    const api = args[0] === "api" || args[0] === "whoami";
    const env = buildEnvironment(api ? {} : { ...this.runtime, ...extra });
    if (!native) env.VERCEL_TOKEN = this.config.token;
    return this.run(process.execPath, [VERCEL_ENTRY, ...args, "--scope", TARGET.team, "--cwd", this.root, ...(native ? [] : ["--global-config", resolve(this.root, ".vercel/cli-config")])], env, this.root, api ? API_LIMITS : undefined);
  }
  async deployment(id: string, sha?: string): Promise<DeploymentDetails> {
    if (!/^(dpl_[a-zA-Z0-9]+|[a-z0-9-]+\.vercel\.app)$/.test(id)) throw new Error("部署标识无效");
    const value = await this.api<DeploymentDetails>(`/v13/deployments/${id}`);
    if (!/^dpl_[a-zA-Z0-9]+$/.test(value.id) || value.projectId !== TARGET.project || value.ownerId !== TARGET.team || value.target !== "production" || value.readyState !== "READY" || (sha && value.meta?.releaseSha !== sha)) throw new Error("部署目标或状态不匹配");
    trustedHost(value.url); return value;
  }
  protected async readRuntime() {
    // 与锁内CLI pullEnvRecords使用同一JSON接口，保留共享/多行环境值，拒绝无法解密项。
    const value = await this.api<{ env: unknown }>(`/v3/env/pull/${TARGET.project}/production?source=vercel-cli:pull`);
    return snapshotRuntime(value.env, this.config.sha);
  }
  async productionValue(key: "DATABASE_URL" | "VERCEL_AUTOMATION_BYPASS_SECRET", optional = false) {
    const list = await this.api<{ envs: { id: string; key: string; target: string[] }[] }>(`/v10/projects/${TARGET.project}/env?decrypt=false`);
    if (!Array.isArray(list.envs) || list.envs.some(item => !item || typeof item.key !== "string" || typeof item.id !== "string" || !Array.isArray(item.target) || item.target.some(target => typeof target !== "string"))) throw new Error("生产变量元数据未知");
    const entries = list.envs.filter(item => item.key === key && Array.isArray(item.target) && item.target.includes("production"));
    if (!entries.length && optional) return undefined;
    if (entries.length !== 1 || !/^[A-Za-z0-9_-]+$/.test(entries[0].id)) throw new Error("未取得唯一生产变量");
    const entry = entries[0];
    const record = await this.api<{ id: string; key: string; target: string[]; value: string }>(`/v1/projects/${TARGET.project}/env/${entry.id}?decrypt=true`);
    if (record.id !== entry.id || record.key !== key || !Array.isArray(record.target) || !record.target.includes("production") || typeof record.value !== "string" || !record.value.trim() || /VERCEL_SENSITIVE_ENV_VALUE|sensitive_env_value_placeholder|\[SENSITIVE\]/i.test(record.value)) throw new Error("准确生产变量不可读取，需要既有项目的对应解密权限");
    return record.value;
  }
  private selectMigration(value: string) {
    if (this.config.migrationSource !== "vercel-production-session") return value;
    try {
      const source = new URL(value);
      if (source.port !== "6543" || !/^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(source.hostname)) throw new Error();
      // 明确选择官方session模式，只替换原端口字节，其余配置交原migration合同校验。
      const end = value.indexOf("/", value.indexOf("://") + 3);
      const authority = value.slice(0, end);
      if (end < 0 || !authority.endsWith(":6543")) throw new Error();
      const selected = authority.slice(0, -5) + ":5432" + value.slice(end);
      const normalized = normalizeDatabase(selected, "migration");
      if (normalized.host !== source.hostname || normalized.user !== `postgres.${TARGET.supabaseRef}`) throw new Error();
      return selected;
    } catch { throw new NativeGateFailure("migration-session-policy", "显式session来源须为同项目官方共享池6543原配置，仅选择5432且保持严格TLS、角色、库和凭据；不尝试其它连接"); }
  }
  async migrationConfiguration() {
    if (this.config.authMode !== "native-cli" || !this.config.migrationSource) throw new Error("原生迁移来源未经显式选择");
    if (this.config.migrationSource === "environment") {
      normalizeDatabase(this.config.migrationUrl, "migration"); return this.config.migrationUrl;
    }
    if (!["vercel-production", "vercel-production-session"].includes(this.config.migrationSource) || this.config.migrationUrl) throw new Error("迁移来源混合或无效");
    const project = await this.api<{ id: string; accountId: string; nodeVersion: string }>(`/v9/projects/${TARGET.project}`);
    if (project.id !== TARGET.project || project.accountId !== TARGET.team || project.nodeVersion !== "24.x") throw new Error("迁移配置项目身份错误");
    const value = (await this.productionValue("DATABASE_URL"))!;
    const selected = this.selectMigration(value);
    // 原vercel-production仍原样验证；显式session派生后也严格使用migration目的。
    try { normalizeDatabase(selected, "migration"); }
    catch {
      let transactionPool = false;
      try { transactionPool = new URL(value).port === "6543"; } catch {}
      throw new NativeGateFailure(transactionPool ? "migration-transaction-pool" : "migration-connection-policy", transactionPool ? "生产DATABASE_URL使用6543事务池，不能迁移；需要同项目批准角色的5432会话池或直连，保持verify-full及既有CA/主机名校验" : "生产DATABASE_URL不符合migration连接合同；需要同项目批准角色/5432端口及verify-full，不自动改写配置");
    }
    if (this.migrationOriginal !== undefined && (this.migrationOriginal !== value || this.migrationSelected !== selected)) throw new Error("迁移配置发生变化");
    this.migrationOriginal = value; this.migrationSelected = selected;
    return selected;
  }
  async inspect() {
    const project = await this.api<{ id: string; accountId: string; nodeVersion: string; rootDirectory?: string | null }>(`/v9/projects/${TARGET.project}`);
    if (project.id !== TARGET.project || project.accountId !== TARGET.team || project.nodeVersion !== "24.x" || !!project.rootDirectory) throw new Error("项目身份或 Node 版本不匹配");
    const previous = await previousProduction(this.api.bind(this), this.config.bootstrap);
    await mkdir(resolve(this.root, ".vercel"), { recursive: true, mode: 0o700 });
    await chmod(resolve(this.root, ".vercel"), 0o700);
    await writeFile(resolve(this.root, ".vercel/project.json"), JSON.stringify({ projectId: TARGET.project, orgId: TARGET.team }), { mode: 0o600 });
    const native = this.config.authMode === "native-cli";
    const envPath = resolve(this.root, ".vercel/.env.production.local");
    if (native) {
      // 固定官方pull仍正常运行，dotenv输出直接丢弃；不复制认证缓存或明文生产配置。
      try { await lstat(envPath); throw new Error("原生pull输出路径已存在"); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      await symlink("/dev/null", envPath);
    }
    await this.cli(["pull", "--yes", "--environment=production"]);
    if (native && await readlink(envPath) !== "/dev/null") throw new Error("原生pull内存边界变化");
    const link = JSON.parse(await readFile(resolve(this.root, ".vercel/project.json"), "utf8"));
    if (link.projectId !== TARGET.project || link.orgId !== TARGET.team) throw new Error("本地项目链接不匹配");
    this.runtime = await this.readRuntime();
    // dotenv4不支持任意值往返；清空拉取文件，完整已验证值直接传入构建进程。
    if (!native) { await writeFile(envPath, "", { mode: 0o600 }); await chmod(envPath, 0o600); }
    let base: Record<string, unknown> = {};
    try { base = JSON.parse(await readFile(resolve(this.root, "vercel.json"), "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const file = resolve(this.root, ".vercel/release-runtime.json");
    const build = base.build && typeof base.build === "object" ? base.build : {};
    // 原生构建由受控子进程env取得完整快照；生产部署使用同一项目配置，文件仅含公开发布身份。
    const fileEnv = native ? { RELEASE_SHA: this.config.sha, RELEASE_PROJECT_ID: TARGET.project } : this.runtime;
    await writeFile(file, JSON.stringify({ ...base, env: fileEnv, build: { ...build, env: fileEnv } }), { mode: 0o600 });
    await chmod(file, 0o600);
    await this.databaseReady();
    return previous;
  }
  async assertMigrationSnapshot(url: string) {
    if (!this.runtime) throw new Error("迁移来源与生产快照不一致");
    if (this.config.migrationSource === "vercel-production-session") {
      if (!this.migrationOriginal || this.runtime.DATABASE_URL !== this.migrationOriginal || url !== this.migrationSelected || this.selectMigration(this.runtime.DATABASE_URL) !== url) throw new Error("session迁移来源与原生产快照不一致");
    } else if (this.runtime.DATABASE_URL !== url) throw new Error("迁移来源与生产快照不一致");
  }
  async assertBypassSnapshot() {
    if (this.config.authMode === "native-cli" && await this.productionValue("VERCEL_AUTOMATION_BYPASS_SECRET", true) !== this.config.bypass) throw new Error("旁路配置发生变化");
  }
  async databaseReady() {
    if (!this.runtime) throw new Error("缺少已验证环境快照");
    await probeRuntimeDatabase(this.runtime.DATABASE_URL);
  }
  async build() {
    if (!this.runtime) throw new Error("缺少已验证环境快照");
    await this.cli(["build", "--prod", "--yes", "--local-config", resolve(this.root, ".vercel/release-runtime.json")]);
  }
  async candidate(): Promise<Deployment> {
    if (!this.runtime) throw new Error("缺少已验证环境快照");
    assertSameSnapshot(this.runtime, await this.readRuntime());
    if (this.config.migrationSource === "vercel-production" || this.config.migrationSource === "vercel-production-session") await this.assertMigrationSnapshot(this.config.migrationUrl);
    await this.databaseReady();
    const output = await this.cli(["deploy", "--prebuilt", "--prod", "--skip-domain", "--yes", "--local-config", resolve(this.root, ".vercel/release-runtime.json"), "--meta", `releaseSha=${this.config.sha}`]);
    const match = output.match(/https:\/\/([a-z0-9-]+\.vercel\.app)\s*$/);
    if (!match) throw new Error("未取得可信候选 URL");
    const deployment = await this.deployment(match[1], this.config.sha);
    return { id: deployment.id, url: deployment.url };
  }
  async promote(deployment: Deployment) {
    await this.deployment(deployment.id, this.config.sha);
    if (!this.runtime) throw new Error("缺少已验证环境快照");
    assertSameSnapshot(this.runtime, await this.readRuntime());
    if (this.config.migrationSource === "vercel-production" || this.config.migrationSource === "vercel-production-session") await this.assertMigrationSnapshot(this.config.migrationUrl);
    await this.databaseReady();
    await this.cli(["promote", deployment.id, "--yes"]);
    const alias = await this.api<{ deploymentId: string }>(`/v4/aliases/${TARGET.domain}`);
    if (alias.deploymentId !== deployment.id) throw new Error("正式域名未指向候选");
  }
}
export const prepareResultDirectory = async () => { await mkdir(resolve(REPOSITORY_ROOT, "release-result"), { recursive: true }); };
