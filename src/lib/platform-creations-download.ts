import type { CreationDTO } from "./platform-creations-types";
export const saveCreationBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export const downloadCreation = async (id: string, read: (id: string, signal: AbortSignal) => Promise<CreationDTO>, signal: AbortSignal, save = saveCreationBlob, fetcher = fetch) => {
  const item = await read(id, signal);
  if (signal.aborted || item.status !== "done" || !item.result || !item.result.mimeType.startsWith(`${item.mediaType}/`)) throw new Error("result_unavailable");
  const response = await fetcher(item.result.url, { method: "GET", signal, credentials: "omit", cache: "no-store" });
  if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== item.result.mimeType) throw new Error("download_failed");
  const blob = await response.blob();
  if (signal.aborted || !blob.size) throw new Error("download_failed");
  const extension = ({ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string, string>)[item.result.mimeType];
  if (!extension) throw new Error("unsupported_media");
  save(blob, `${id.replace(/[^\w-]/g, "-")}.${extension}`);
};
