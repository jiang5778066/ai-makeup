import type { ReleaseResult } from "./pipeline";
type Recovery = { write(result: ReleaseResult): Promise<void>; summary(result: ReleaseResult): Promise<void>; cleanup(): Promise<void> };
export const finishRelease = async (run: () => Promise<ReleaseResult>, io: Recovery): Promise<ReleaseResult> => {
  let result: ReleaseResult | undefined;
  const failure = (name: string) => { if (result) { result.ok = false; if (!result.reportErrors?.includes(name)) (result.reportErrors ??= []).push(name); } };
  try {
    result = await run();
  } finally {
    // 清理和持久化完成后再输出摘要，保留真实切换事实及原始入口异常。
    try { await io.cleanup(); } catch { failure("cleanup"); }
    if (result) {
      try { await io.write(result); } catch { failure("write"); }
      try { await io.summary(result); } catch {
        failure("summary");
        try { await io.write(result); } catch { failure("write"); }
      }
    }
  }
  return result;
};
