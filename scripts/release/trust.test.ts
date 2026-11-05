// @vitest-environment node
import { afterEach, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { command } from "./command";
import { trustSource } from "./trust";
import { REPOSITORY_ROOT } from "./paths";
const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });
const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), "release-sha-")); roots.push(root);
  const git = (...args: string[]) => command("git", args, process.env, root);
  await git("init", "-b", "main"); await git("config", "user.email", "fixture@invalid.test"); await git("config", "user.name", "fixture");
  await writeFile(join(root, "package.json"), "{}"); await writeFile(join(root, ".gitignore"), "node_modules\n.next\n.env*\n");
  await git("add", "."); await git("commit", "-m", "fixture"); const sha = await git("rev-parse", "HEAD"); await git("update-ref", "refs/remotes/origin/main", sha);
  return { root, sha, git };
};
it("从指定仓库根接受干净完整SHA", async () => { const f = await fixture(); await expect(trustSource(f.sha, f.root)).resolves.toBeUndefined(); });
it.each(["page.tsx", "vercel.json", ".env.local"])("合法生成输出旁的未跟踪%s仍阻塞", async name => {
  const f = await fixture(); await mkdir(join(f.root, ".next")); await writeFile(join(f.root, ".next/cache"), "generated"); await writeFile(join(f.root, name), "unreviewed");
  expect(await command("git", ["status", "--porcelain", "--untracked-files=no"], process.env, f.root)).toBe("");
  await expect(trustSource(f.sha, f.root)).rejects.toThrow();
});
it("只允许明确生成目录", async () => { const f = await fixture(); await mkdir(join(f.root, "release-result")); await writeFile(join(f.root, "release-result/result.json"), "{}"); await expect(trustSource(f.sha, f.root)).resolves.toBeUndefined(); });
it("SHA必须等于HEAD且属于受信main", async () => { const f = await fixture(); await expect(trustSource("b".repeat(40), f.root)).rejects.toThrow(); await f.git("update-ref", "-d", "refs/remotes/origin/main"); await expect(trustSource(f.sha, f.root)).rejects.toThrow(); });

it("仓库外调用默认迁移预检仍读取固定历史，不在调用cwd找SQL", async () => {
  const f = await fixture();
  const code = `const { migrationOnClient } = require(${JSON.stringify(join(REPOSITORY_ROOT, "scripts/db/migration.ts"))});
    const sql = async parts => { const query = parts.join("?");
      if (query.includes("to_regclass('auth.users')")) return [{name:"auth.users"}];
      if (query.includes("to_regclass('drizzle.__drizzle_migrations')")) return [{name:null}];
      return []; };
    sql.begin = async (mode, fn) => { if(mode !== "read only") throw Error("write"); return fn(sql); };
    migrationOnClient(sql, "status").then(value => console.log(JSON.stringify(value))).catch(() => process.exitCode=1);`;
  const out = await command(process.execPath, [join(REPOSITORY_ROOT, "node_modules/tsx/dist/cli.mjs"), "-e", code], process.env, f.root);
  expect(JSON.parse(out)).toEqual({ applied: [], pending: ["0001_production_readiness"] });
});
