export const privateJson = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } });
export const sameOrigin = (request: Request) => request.headers.get("origin") === new URL(request.url).origin && !["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "");
export const accountConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
