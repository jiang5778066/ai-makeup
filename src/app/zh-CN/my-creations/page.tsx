import type { Metadata } from "next";
import { PlatformCreationsPage } from "@/components/platform-creations-page";
export const metadata: Metadata = { title: "我的作品", description: "查看本人美妆作品、任务状态与已保存的结果。", robots: { index: false, follow: true }, alternates: { canonical: "/zh-CN/my-creations", languages: { en: "/my-creations", "zh-CN": "/zh-CN/my-creations" } } };
export default async function Page({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { return <PlatformCreationsPage locale="zh-CN" filter={(await searchParams).filter}/>; }
