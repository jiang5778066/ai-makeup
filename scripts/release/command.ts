import { spawn } from "node:child_process";
import { REPOSITORY_ROOT } from "./paths";
export type CommandLimits = { timeoutMs?: number; maxOutputBytes?: number };
export type CommandRunner = (binary: string, args: string[], env: NodeJS.ProcessEnv, cwd: string, limits?: CommandLimits) => Promise<string>;
export const command = (binary: string, args: string[], env: NodeJS.ProcessEnv = process.env, cwd = REPOSITORY_ROOT, limits: CommandLimits = {}): Promise<string> => new Promise((resolve, reject) => {
  const child = spawn(binary, args, { env, cwd, stdio: ["ignore", "pipe", "pipe"] });
  const chunks: Buffer[] = []; let bytes = 0; let failure: Error | undefined;
  const stop = (message: string) => { failure ??= new Error(message); child.kill("SIGKILL"); };
  const timer = setTimeout(() => stop("子命令超时，已停止本轮子进程"), limits.timeoutMs ?? 30 * 60_000);
  const consume = (chunk: Buffer, keep: boolean) => {
    bytes += chunk.length;
    if (bytes > (limits.maxOutputBytes ?? 10_000_000)) stop("子命令输出超过上限");
    else if (keep && !failure) chunks.push(chunk);
  };
  child.stdout.on("data", chunk => consume(chunk, true));
  // 原始stderr可能包含秘密，只计量不转发或持久化。
  child.stderr.on("data", chunk => consume(chunk, false));
  child.on("error", () => { clearTimeout(timer); reject(new Error("子命令启动失败")); });
  child.on("close", code => { clearTimeout(timer); if (failure) reject(failure); else if (code !== 0) reject(new Error("子命令失败")); else { try { resolve(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)).trim()); } catch { reject(new Error("子命令输出不是有效UTF-8")); } } });
});
