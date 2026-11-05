import { readFile, writeFile, mkdir, chmod } from "node:fs/promises";
import { resolve } from "node:path";
import { command, type CommandRunner } from "./command";
import { REPOSITORY_ROOT, VERCEL_ENTRY } from "./paths";
import { TARGET, type ReleaseConfig } from "./preflight";
import { trustedHost } from "./health";
import { ApiFailure, previousProduction } from "./previous";
import { snapshotRuntime, buildEnvironment, assertSameSnapshot, type RuntimeSnapshot } from "./snapshot";
import { probeRuntimeDatabase } from "../db/connection";
import type { Deployment } from "./pipeline";
export type DeploymentDetails = { id: string; url: string; projectId: string; ownerId: string; target: string; readyState: string; meta?: Record<string, string> };
export class Vercel {
  protected runtime?: RuntimeSnapshot;
  constructor(private config: ReleaseConfig, private run: CommandRunner = command, private root = REPOSITORY_ROOT) {}
  async api<T>(path: string): Promise<T> {
    const response = await fetch(`https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}teamId=${TARGET.team}`, { headers: { Authorization: `Bearer ${this.config.token}` }, redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new ApiFailure(response.status);
    return response.json() as Promise<T>;
  }
  async cli(args: string[], extra: Record<string, string> = {}) {
    return this.run(process.execPath, [VERCEL_ENTRY, ...args, "--token", this.config.token, "--scope", TARGET.team, "--cwd", this.root, "--global-config", resolve(this.root, ".vercel/cli-config")], buildEnvironment({ ...this.runtime, ...extra }), this.root);
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
  async inspect() {
    const project = await this.api<{ id: string; accountId: string; nodeVersion: string; rootDirectory?: string | null }>(`/v9/projects/${TARGET.project}`);
    if (project.id !== TARGET.project || project.accountId !== TARGET.team || project.nodeVersion !== "24.x" || !!project.rootDirectory) throw new Error("项目身份或 Node 版本不匹配");
    const previous = await previousProduction(this.api.bind(this), this.config.bootstrap);
    await mkdir(resolve(this.root, ".vercel"), { recursive: true, mode: 0o700 });
    await chmod(resolve(this.root, ".vercel"), 0o700);
    await writeFile(resolve(this.root, ".vercel/project.json"), JSON.stringify({ projectId: TARGET.project, orgId: TARGET.team }), { mode: 0o600 });
    await this.cli(["pull", "--yes", "--environment=production"]);
    const link = JSON.parse(await readFile(resolve(this.root, ".vercel/project.json"), "utf8"));
    if (link.projectId !== TARGET.project || link.orgId !== TARGET.team) throw new Error("本地项目链接不匹配");
    this.runtime = await this.readRuntime();
    // dotenv4不支持任意值往返；清空拉取文件，完整已验证值直接传入构建进程。
    const envPath = resolve(this.root, ".vercel/.env.production.local");
    await writeFile(envPath, "", { mode: 0o600 }); await chmod(envPath, 0o600);
    let base: Record<string, unknown> = {};
    try { base = JSON.parse(await readFile(resolve(this.root, "vercel.json"), "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const file = resolve(this.root, ".vercel/release-runtime.json");
    const build = base.build && typeof base.build === "object" ? base.build : {};
    await writeFile(file, JSON.stringify({ ...base, env: this.runtime, build: { ...build, env: this.runtime } }), { mode: 0o600 });
    await chmod(file, 0o600);
    await this.databaseReady();
    return previous;
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
    await this.databaseReady();
    const output = await this.cli(["deploy", "--prebuilt", "--prod", "--skip-domain", "--yes", "--local-config", resolve(this.root, ".vercel/release-runtime.json"), "--meta", `releaseSha=${this.config.sha}`]);
    const match = output.match(/https:\/\/([a-z0-9-]+\.vercel\.app)\s*$/);
    if (!match) throw new Error("未取得可信候选 URL");
    const deployment = await this.deployment(match[1], this.config.sha);
    return { id: deployment.id, url: deployment.url };
  }
  async promote(deployment: Deployment) {
    await this.deployment(deployment.id, this.config.sha);
    await this.databaseReady();
    await this.cli(["promote", deployment.id, "--yes"]);
    const alias = await this.api<{ deploymentId: string }>(`/v4/aliases/${TARGET.domain}`);
    if (alias.deploymentId !== deployment.id) throw new Error("正式域名未指向候选");
  }
}
export const prepareResultDirectory = async () => { await mkdir(resolve(REPOSITORY_ROOT, "release-result"), { recursive: true }); };
