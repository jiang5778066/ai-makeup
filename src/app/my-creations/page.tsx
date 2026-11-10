import type { Metadata } from "next";
import { PlatformCreationsPage } from "@/components/platform-creations-page";
export const metadata: Metadata = { title: "My Creations", description: "View your private makeup creations, task status and saved results.", robots: { index: false, follow: true }, alternates: { canonical: "/my-creations", languages: { en: "/my-creations", "zh-CN": "/zh-CN/my-creations" } } };
export default async function Page({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { return <PlatformCreationsPage locale="en" filter={(await searchParams).filter}/>; }
