import { spawn } from "node:child_process";
import { REPOSITORY_ROOT } from "./paths";
export type CommandRunner = (binary: string, args: string[], env: NodeJS.ProcessEnv, cwd: string) => Promise<string>;
export const command = (binary: string, args: string[], env = process.env, cwd = REPOSITORY_ROOT): Promise<string> => new Promise((resolve, reject) => {
  const child = spawn(binary, args, { env, cwd, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); if (output.length > 10_000_000) child.kill(); });
  // CLI 原始输出可能包含秘密，绝不转发至 Actions 或结果文件。
  child.stderr.resume();
  child.on("error", () => reject(new Error("子命令启动失败")));
  child.on("close", (code) => code === 0 ? resolve(output.trim()) : reject(new Error("子命令失败")));
});
