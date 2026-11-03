export type ImageSubmission = {
  requestId: string;
  model: string;
  quality: string;
  size: string;
  prompt: string;
  costCents: number;
  baselineIds: (number | string)[];
};

export type SubmitResult =
  | { status: "submitted"; taskId: string }
  | { status: "submission_unknown" }
  | { status: "failed"; error: string };
export type QueryResult =
  | { status: "completed"; resultImageUrl: string }
  | { status: "pending" }
  | { status: "failed"; error: string };

type HistoryRecord = { id: number | string; model?: string; prompt?: string; taskId?: string; task_id?: string };

async function request(path: string, body?: unknown): Promise<Response> {
  const key = process.env.ROUTER_CREATIVE_API_KEY;
  if (!key) throw new Error("ai_unconfigured");
  const base = (process.env.ROUTER_CREATIVE_BASE_URL || "https://api.router.team/api/public/creative-center").replace(/\/$/, "");
  return fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
    redirect: "error"
  });
}

async function read<T>(path: string): Promise<T> {
  const response = await request(path);
  if (!response.ok) throw new Error(`creative_http_${response.status}`);
  return response.json() as Promise<T>;
}

export async function prepareImageSubmission(input: { prompt: string; requestId: string }): Promise<ImageSubmission> {
  const model = process.env.AI_IMAGE_MODEL || "gpt-image-2";
  const quality = process.env.AI_IMAGE_QUALITY || "1k";
  const config = await read<{ imagePricing?: Record<string, { supportedQualities?: string[]; qualityPrices?: Record<string, number> }> }>("/config");
  const pricing = config.imagePricing?.[model];
  if (!pricing) throw new Error("ai_model_unavailable");
  const price = pricing.qualityPrices?.[quality];
  if ((pricing.supportedQualities && !pricing.supportedQualities.includes(quality)) || typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new Error("ai_quality_unavailable");
  }
  const prompt = `${input.prompt}\n请求编号：${input.requestId}（仅用于任务关联，不要在图片中绘制文字）。`;
  if (prompt.length > 4000) throw new Error("ai_prompt_too_long");
  const history = await read<{ records: HistoryRecord[] }>("/history?type=IMAGE&size=50");
  if (!Array.isArray(history.records)) throw new Error("creative_invalid_history");
  return { requestId: input.requestId, model, quality, size: "2:3", prompt, costCents: Math.ceil(price * 100), baselineIds: history.records.map((item) => item.id) };
}

export async function submitImageTask(submission: ImageSubmission, referenceImageUrl: string): Promise<SubmitResult> {
  try {
    const response = await request("/images", {
      model: submission.model, prompt: submission.prompt, quality: submission.quality,
      size: submission.size, n: 1, image_urls: [referenceImageUrl]
    });
    // 超时或服务端异常可能发生在任务已经受理之后，禁止自动重发。
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500 && ![408, 409, 425, 429].includes(response.status)) {
        return { status: "failed", error: `creative_http_${response.status}` };
      }
      return { status: "submission_unknown" };
    }
    const data = await response.json() as { task_id?: string; taskId?: string };
    const taskId = data.task_id || data.taskId;
    return typeof taskId === "string" && taskId ? { status: "submitted", taskId } : { status: "submission_unknown" };
  } catch {
    return { status: "submission_unknown" };
  }
}

export async function recoverImageTask(submission: ImageSubmission): Promise<string | null> {
  const baseline = new Set(submission.baselineIds.map(String));
  const matches = new Set<string>();
  // 最多检查五页；找不到原任务时保持待核对，绝不补发生成请求。
  for (let page = 1; page <= 5; page++) {
    const history = await read<{ records: HistoryRecord[]; pages?: number }>(`/history?type=IMAGE&size=50${page === 1 ? "" : `&page=${page}`}`);
    for (const record of history.records) {
      if (baseline.has(String(record.id)) || (record.model && record.model !== submission.model)) continue;
      const detail = await read<HistoryRecord>(`/history/${encodeURIComponent(record.id)}`);
      const taskId = detail.taskId || detail.task_id;
      if (detail.model === submission.model && detail.prompt === submission.prompt && taskId) matches.add(taskId);
    }
    if (!history.pages || page >= history.pages) break;
  }
  return matches.size === 1 ? [...matches][0] : null;
}

export async function queryImageTask(taskId: string): Promise<QueryResult> {
  try {
    const data = await read<{
      status: string; result_urls?: string[]; data?: { url?: string }[]; cover_url?: string;
    }>(`/images/${encodeURIComponent(taskId)}`);
    if (data.status === "failed") return { status: "failed", error: "creative_task_failed" };
    if (data.status === "completed") {
      const url = data.result_urls?.[0] || data.data?.[0]?.url || data.cover_url;
      if (typeof url === "string" && /^https?:\/\//.test(url)) return { status: "completed", resultImageUrl: url };
    }
  } catch {
    // 查询暂时失败不能判定生成失败。
  }
  return { status: "pending" };
}
