import { notFound, redirect } from "next/navigation";
import { slugFromPath } from "@/lib/content";
import { resolveHomepageRoute } from "@/lib/platform-homepage";
import { localizePath } from "@/lib/i18n";
type PageProps = { params: Promise<{ slug?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function ChineseCompatibilityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const path = slug?.length ? `/${slug.join("/")}` : "/";
  const selection = await searchParams;
  if (!resolveHomepageRoute(path, selection) && !slugFromPath(path)) notFound();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(selection)) {
    for (const item of typeof value === "string" ? [value] : value ?? []) query.append(key, item);
  }
  // 浏览器在跳转目标未指定片段时保留原锚点；查询参数包含重复值。
  redirect(`${localizePath(path, "zh-CN")}${query.size ? `?${query}` : ""}`);
}
