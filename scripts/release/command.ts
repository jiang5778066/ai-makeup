import { spawn } from "node:child_process";
import { REPOSITORY_ROOT } from "./paths";
export type CommandLimits = { timeoutMs?: number; maxOutputBytes?: number };
export type CommandRunner = (binary: string, args: string[], env: NodeJS.ProcessEnv, cwd: string, limits?: CommandLimits) => Promise<string>;
export const command = (binary: string, args: string[], env: NodeJS.ProcessEnv = process.env, cwd = REPOSITORY_ROOT, limits: CommandLimits = {}): Promise<string> => new Promise((resolve, reject) => {
  const child = spawn(binary, args, { env, cwd, stdio: ["ignore", "pipe", "pipe"] });
  const chunks: Buffer[] = []; let bytes = 0; let failure: Error | undefined;
  const classifyVercel = /[\\/]vercel[\\/]dist[\\/]index\.js$/.test(args[0] ?? "");
  let diagnostic = "";
  const stop = (message: string) => { failure ??= new Error(message); child.kill("SIGKILL"); };
  const timer = setTimeout(() => stop("子命令超时，已停止本轮子进程"), limits.timeoutMs ?? 30 * 60_000);
  const consume = (chunk: Buffer, keep: boolean) => {
    bytes += chunk.length;
    if (bytes > (limits.maxOutputBytes ?? 10_000_000)) stop("子命令输出超过上限");
    else if (keep && !failure) chunks.push(chunk);
  };
  child.stdout.on("data", chunk => consume(chunk, true));
  // 原始stderr可能包含秘密，只计量不转发或持久化。
  child.stderr.on("data", (chunk: Buffer) => {
    consume(chunk, false);
    if (classifyVercel) diagnostic = (diagnostic + chunk.toString("utf8")).slice(-8192);
  });
  child.on("error", () => { clearTimeout(timer); reject(new Error("子命令启动失败")); });
  child.on("close", code => {
    clearTimeout(timer);
    if (failure) return reject(failure);
    if (code !== 0) {
      if (classifyVercel) {
        const output = (diagnostic + "\n" + Buffer.concat(chunks).toString("utf8").slice(-8192)).replace(/\x1b\[[0-9;]*m/g, "");
        const categories = [
          [/invalid.token|token.*expired|token.*not valid|No existing credentials|invalid credentials/i, "凭据无效"],
          [/scope-not-accessible|not able to load teams|access to the specified team|team.*not found/i, "团队权限"],
          [/not able to load user|access to the specified account|loading user|\/v2\/user/i, "CLI 用户身份"],
          [/not authorized|unauthorized|forbidden|permission|403/i, "接口权限"],
          [/environment variables|env.*pull|sensitive/i, "环境配置读取"],
          [/project.*not found|could not retrieve project|not linked/i, "项目链接"],
          [/fetch failed|ECONN|ENOTFOUND|ETIMEDOUT|network/i, "网络请求"],
          [/ENOENT|EACCES|EPERM|ENOTDIR/i, "本地配置路径"],
          [/unknown option|unknown or unexpected option|invalid option/i, "CLI 参数"],
          [/git.*not found|git.*not installed|git repository/i, "Git 工作目录"],
          [/unexpected error|unhandled|uncaught/i, "CLI 内部异常"],
        ] as const;
        const matches = categories.filter(([pattern]) => pattern.test(output)).map(([, category]) => category);
        console.error(`Vercel CLI 退出码 ${code ?? "未知"}，诊断 ${matches.join("、") || "未匹配"}，标准错误长度 ${diagnostic.length}、标准输出段数 ${chunks.length}`);
      }
      return reject(new Error("子命令失败"));
    }
    try { resolve(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)).trim()); }
    catch { reject(new Error("子命令输出不是有效UTF-8")); }
  });
});
