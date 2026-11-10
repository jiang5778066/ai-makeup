import { loginHref } from "@/lib/auth-return";

export function trustedCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      ["https://www.creem.io", "https://creem.io", "https://checkout.creem.io"].includes(url.origin);
  } catch { return false; }
}

export function safeBillingPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value) || /%5c|%0[ad]|%2f/i.test(value.split(/[?#]/)[0])) return "/pricing";
  try {
    const url = new URL(value, "https://local.invalid");
    return url.origin === "https://local.invalid" ? `${url.pathname}${url.search}${url.hash}` : "/pricing";
  } catch { return "/pricing"; }
}

export function billingLoginUrl(path: string, _locale?: string): string {
  return loginHref(safeBillingPath(path));
}

export async function boundedBody(request: Request, limit: number): Promise<string> {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("body_too_large");
  const reader = request.body?.getReader();
  if (!reader) return "";
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("body_too_large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}
