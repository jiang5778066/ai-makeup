import { mkdir, writeFile, readFile, lstat, unlink, rmdir } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { TARGET } from "./preflight";
export const PRODUCTION_LOCK = resolve("/tmp", `ai-makeup-production-${TARGET.project}.lock`);
export const withProductionLock = async <T>(work: () => Promise<T>, path = PRODUCTION_LOCK): Promise<T> => {
  try { await mkdir(path, { mode: 0o700 }); } catch { throw new Error("生产排他锁已存在或不可取得，禁止接管未知所有者"); }
  const identity = await lstat(path);
  const owner = JSON.stringify({ nonce: randomUUID(), pid: process.pid, project: TARGET.project, team: TARGET.team });
  let written = false;
  try {
    await writeFile(resolve(path, "owner.json"), owner, { mode: 0o600, flag: "wx" }); written = true;
    return await work();
  } finally {
    const current = await lstat(path);
    if (current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino || (written && await readFile(resolve(path, "owner.json"), "utf8") !== owner)) throw new Error("生产锁所有权变化，保留现场并停止");
    if (written) await unlink(resolve(path, "owner.json"));
    // 只移除本轮准确锁文件与空目录，不递归删除未知内容。
    await rmdir(path);
  }
};
